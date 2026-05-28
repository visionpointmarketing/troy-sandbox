#!/bin/bash
# TROY Sandbox — Phase 1 AWS deployment script (AWS CLI, runs in CloudShell)
#
# This script is the CLI-based equivalent of the console steps documented in
# docs/AWS-DEPLOYMENT-GUIDE.md. It was used for the initial deployment on
# 2026-05-28. Safe to re-run: every step is idempotent or tolerant of
# already-existing resources.
#
# PREREQUISITES (do these via console FIRST, then run this script):
#   1. DynamoDB table TroySandbox_Templates exists (PK=sandboxId, SK=templateId)
#   2. S3 bucket troy-sandbox-images.vpmdevtech.com exists with:
#      - Block public access OFF
#      - CORS allowing https://visionpointmarketing.github.io for GET/PUT/HEAD
#      - Bucket policy granting public-read on sandboxes/*/templates/*/images/*
#   3. You have the SANDBOX_KEY value to paste into the variable below
#
# WHAT THIS SCRIPT CREATES:
#   - 5 IAM execution roles (troy-sandbox-lambda-<short>) with inline policies
#     loaded from each lambda/<dir>/policy.json file
#   - 5 Lambda functions (troySandbox<Function>) packaged from each
#     lambda/<dir>/index.js (renamed to index.mjs for Node.js 22 ESM)
#   - 5 Function URLs with CORS locked to the editor origin
#   - lambda:InvokeFunctionUrl permission for public principal on each
#
# AFTER RUNNING:
#   - Paste the 5 printed URLs into js/cloud-config.js, commit + push
#
# To deploy from CloudShell:
#   git clone https://github.com/visionpointmarketing/troy-sandbox.git
#   cd troy-sandbox/lambda
#   # Edit SANDBOX_KEY below if rotating, then:
#   bash deploy.sh

set -e
set -o pipefail

ACCOUNT_ID=831326375124
REGION=us-east-1
SANDBOX_KEY="${SANDBOX_KEY:-PASTE_SANDBOX_KEY_HERE}"
ALLOWED_ORIGIN="https://visionpointmarketing.github.io"

if [ "$SANDBOX_KEY" = "PASTE_SANDBOX_KEY_HERE" ]; then
    echo "ERROR: Set SANDBOX_KEY env var or edit this script before running" >&2
    exit 1
fi

# === Trust policy (same for all 5 Lambda roles) ===
cat > /tmp/troy-trust-policy.json <<'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {"Service": "lambda.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

declare -a FNS=(saveTemplate listTemplates getTemplate deleteTemplate presignImages)
declare -A DIRS=(
    [saveTemplate]=save-template [listTemplates]=list-templates
    [getTemplate]=get-template [deleteTemplate]=delete-template
    [presignImages]=presign-images
)
declare -A LAMBDAS=(
    [saveTemplate]=troySandboxSaveTemplate
    [listTemplates]=troySandboxListTemplates
    [getTemplate]=troySandboxGetTemplate
    [deleteTemplate]=troySandboxDeleteTemplate
    [presignImages]=troySandboxPresignImages
)
declare -A MEM=(
    [saveTemplate]=256 [listTemplates]=256 [getTemplate]=256
    [deleteTemplate]=256 [presignImages]=256
)
declare -A TIMEOUT=(
    [saveTemplate]=10 [listTemplates]=10 [getTemplate]=10
    [deleteTemplate]=15 [presignImages]=15
)
declare -A CONCURRENCY=(
    [saveTemplate]=10 [listTemplates]=10 [getTemplate]=10
    [deleteTemplate]=5 [presignImages]=10
)
declare -A METHOD=(
    [saveTemplate]=POST [listTemplates]=GET [getTemplate]=GET
    [deleteTemplate]=DELETE [presignImages]=POST
)
declare -A ENVVARS=(
    [saveTemplate]="TEMPLATES_TABLE=TroySandbox_Templates"
    [listTemplates]="TEMPLATES_TABLE=TroySandbox_Templates"
    [getTemplate]="TEMPLATES_TABLE=TroySandbox_Templates"
    [deleteTemplate]="TEMPLATES_TABLE=TroySandbox_Templates,IMAGES_BUCKET=troy-sandbox-images.vpmdevtech.com"
    [presignImages]="IMAGES_BUCKET=troy-sandbox-images.vpmdevtech.com"
)

# === Step 1: IAM roles + inline policies ===
for FN in "${FNS[@]}"; do
    ROLE_NAME="troy-sandbox-lambda-$FN"
    DIR="${DIRS[$FN]}"

    echo ">>> Role: $ROLE_NAME"
    aws iam create-role \
        --role-name "$ROLE_NAME" \
        --assume-role-policy-document file:///tmp/troy-trust-policy.json \
        --description "Execution role for ${LAMBDAS[$FN]} (TROY Sandbox)" \
        --tags Key=Project,Value=troy-sandbox Key=Phase,Value=1 \
        --no-cli-pager > /dev/null 2>&1 || echo "  (role already exists)"

    aws iam put-role-policy \
        --role-name "$ROLE_NAME" \
        --policy-name "${ROLE_NAME}-policy" \
        --policy-document "file://$DIR/policy.json" \
        --no-cli-pager
done

echo "Waiting 10s for IAM role propagation..."
sleep 10

# === Step 2: Lambda functions ===
for FN in "${FNS[@]}"; do
    LAMBDA_NAME="${LAMBDAS[$FN]}"
    ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/troy-sandbox-lambda-$FN"
    DIR="${DIRS[$FN]}"
    TMP_PKG="/tmp/$FN.zip"

    echo ">>> Lambda: $LAMBDA_NAME"

    rm -f "$TMP_PKG"
    # ES modules need .mjs in Node.js 22.x Lambda runtime
    cp "$DIR/index.js" /tmp/index.mjs
    (cd /tmp && zip -j "$TMP_PKG" index.mjs > /dev/null && rm index.mjs)

    # Build env vars JSON: KEY1=V1,KEY2=V2 -> {"Variables":{...}}
    ENV_KV="${ENVVARS[$FN]},SANDBOX_KEY=${SANDBOX_KEY},ALLOWED_ORIGIN=${ALLOWED_ORIGIN}"
    ENV_JSON=$(echo "$ENV_KV" | awk -F',' '{
        printf "{\"Variables\":{"
        for (i=1;i<=NF;i++) {
            split($i, kv, "=")
            printf "%s\"%s\":\"%s\"", (i>1?",":""), kv[1], kv[2]
        }
        printf "}}"
    }')

    aws lambda create-function \
        --function-name "$LAMBDA_NAME" \
        --runtime nodejs22.x \
        --role "$ROLE_ARN" \
        --handler index.handler \
        --zip-file "fileb://$TMP_PKG" \
        --memory-size "${MEM[$FN]}" \
        --timeout "${TIMEOUT[$FN]}" \
        --environment "$ENV_JSON" \
        --tags "Project=troy-sandbox,Phase=1" \
        --no-cli-pager > /dev/null || {
            # If create failed because function exists, update its code
            echo "  (function exists — updating code instead)"
            aws lambda update-function-code \
                --function-name "$LAMBDA_NAME" \
                --zip-file "fileb://$TMP_PKG" \
                --no-cli-pager > /dev/null
        }

    aws lambda put-function-concurrency \
        --function-name "$LAMBDA_NAME" \
        --reserved-concurrent-executions "${CONCURRENCY[$FN]}" \
        --no-cli-pager > /dev/null
done

echo "Waiting 5s before Function URL creation..."
sleep 5

# === Step 3: Function URLs + public-invoke permission ===
# Note: OPTIONS is NOT in AllowMethods — Lambda Function URL CORS auto-handles
# preflight requests, and the AllowMethods list has a max length-6 constraint
# per item which OPTIONS (7 chars) would violate.
declare -A URLS
for FN in "${FNS[@]}"; do
    LAMBDA_NAME="${LAMBDAS[$FN]}"
    M="${METHOD[$FN]}"

    cat > /tmp/cors.json <<JSON
{"AllowOrigins":["${ALLOWED_ORIGIN}"],"AllowMethods":["$M"],"AllowHeaders":["Content-Type","X-Sandbox-Key"],"MaxAge":3600}
JSON

    echo ">>> Function URL: $LAMBDA_NAME"
    URL=$(aws lambda create-function-url-config \
        --function-name "$LAMBDA_NAME" \
        --auth-type NONE \
        --cors file:///tmp/cors.json \
        --query FunctionUrl --output text --no-cli-pager 2>/dev/null) || URL=""

    if [ -z "$URL" ] || [ "$URL" = "None" ]; then
        # Already exists — fetch it
        URL=$(aws lambda get-function-url-config \
            --function-name "$LAMBDA_NAME" \
            --query FunctionUrl --output text --no-cli-pager)
    fi

    aws lambda add-permission \
        --function-name "$LAMBDA_NAME" \
        --statement-id FunctionURLAllowPublicAccess \
        --action lambda:InvokeFunctionUrl \
        --principal '*' \
        --function-url-auth-type NONE \
        --no-cli-pager > /dev/null 2>&1 || true

    URLS[$FN]="$URL"
done

echo ""
echo "================================================================"
echo "  TROY Sandbox — Phase 1 deployment complete"
echo "================================================================"
echo ""
echo "Paste these URLs into js/cloud-config.js, then commit + push:"
echo ""
for FN in "${FNS[@]}"; do
    printf "  %-16s : %s\n" "$FN" "${URLS[$FN]}"
done
echo ""
