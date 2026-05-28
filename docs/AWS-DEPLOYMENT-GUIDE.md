# AWS Deployment Guide — TROY Sandbox Cloud Save

**Audience:** the person deploying this feature for the first time.
**Time required:** ~90 minutes for a careful first deployment.
**Authoritative reference:** [`CLOUD-IMPLEMENTATION.md`](./CLOUD-IMPLEMENTATION.md)

> **Read before starting:** every step in this guide creates **new** AWS
> resources prefixed with `troy-sandbox`, `troySandbox`, or `TroySandbox`.
> Nothing existing in the VisionPoint AWS account is modified. If a step
> asks you to edit an existing resource, **stop and re-read** — that would
> be a mistake.

---

## Pre-deployment checklist

Before opening the AWS Console, verify:

- [ ] You are signed into the **VisionPoint AWS account** (Account ID `831326375124`, alias `breon`) as a user with admin privileges.
- [ ] The region selector (top right of the console) is set to **US East (N. Virginia) / us-east-1**.
- [ ] **MFA is enabled on your IAM user.** If you're not sure, check IAM → Users → your user → Security credentials. Enable it before proceeding.
- [ ] You have a way to generate a long random string (1Password, a CLI like `openssl rand -hex 32`, or any password generator producing 32+ random characters).
- [ ] The TROY Sandbox repo is checked out locally so you can edit `js/cloud-config.js` once Function URLs are created.

---

## Overview of what we're about to create

| Service | Resource | Name |
|---|---|---|
| Budget | Cost alert | `Troy Sandbox Budget` ($25/month) |
| DynamoDB | Table | `TroySandbox_Templates` |
| S3 | Bucket | `troy-sandbox-images.vpmdevtech.com` |
| IAM | Execution roles (×5) | `troy-sandbox-lambda-<functionShort>` |
| Lambda | Functions (×5) | `troySandboxSaveTemplate`, `troySandboxListTemplates`, `troySandboxGetTemplate`, `troySandboxDeleteTemplate`, `troySandboxPresignImages` |

Total cost expectation: **$1–10/month** based on plan estimates.

---

## Step 0 — Generate the sandbox API key

This is the single API key team members will use to access the cloud library.
Generate it now; you'll paste it into each Lambda's environment variables
later.

**Recommended:** a 32-character random hex string. Examples of how to
generate one:

```bash
# Terminal (Mac / Linux):
openssl rand -hex 32

# Or via 1Password / Bitwarden: generate a 32-character password,
# uppercase + lowercase + digits, no symbols (to keep header-safe).
```

**Save the key somewhere safe immediately** (e.g., a shared 1Password vault
labelled "TROY Sandbox API key"). You will need it:
- Pasted into 5 Lambda env vars (Step 6)
- Distributed to anyone who should be able to use cloud save
- Held by you for future rotation

> The key must NEVER be committed to the repo or written to a public
> document.

---

## Step 1 — Create the $25/month budget alert

This protects against unexpected costs. Doing this first ensures alerts are
in place before any chargeable resources exist.

1. Console search bar → **Budgets** → **Create budget**
2. Select **Customize (advanced)** → Budget type: **Cost budget**
3. **Budget name:** `Troy Sandbox Budget`
4. **Period:** Monthly · **Recurring**
5. **Budget amount:** `$25` (fixed)
6. **Scoping:** **Filter** → **Tag** → key `Project`, value `troy-sandbox`
   *(this filter only matches when resources are tagged — tags get applied as we create them)*
7. **Alerts:**
   - Threshold 1: 50% of budgeted (forecast → ignore), email: your address
   - Threshold 2: 100% of actual, email: your address
8. **Create budget**

---

## Step 2 — Create the DynamoDB table

1. Console search bar → **DynamoDB** → **Tables** → **Create table**
2. **Table name:** `TroySandbox_Templates`
3. **Partition key:** `sandboxId` · type `String`
4. **Sort key:** `templateId` · type `String`
5. **Table settings:** Customize settings
6. **Read/write capacity:** **On-demand**
7. **Encryption:** Owned by Amazon DynamoDB (default)
8. **Point-in-time recovery:** **Off** (MVP — re-evaluate if data volume grows)
9. **Deletion protection:** **On** ← important; this protects against accidental table delete
10. Expand **Tags** → add:
    - `Project` : `troy-sandbox`
    - `Phase` : `1`
11. **Create table**. Wait until status is **Active** (~30 seconds).

---

## Step 3 — Create the S3 bucket

1. Console search bar → **S3** → **Create bucket**
2. **Bucket name:** `troy-sandbox-images.vpmdevtech.com`
   *(matches existing VP `*.vpmdevtech.com` convention)*
3. **AWS Region:** US East (N. Virginia) us-east-1
4. **Object Ownership:** **ACLs disabled (recommended)** — BucketOwnerEnforced
5. **Block Public Access settings:** Uncheck **Block all public access**
   - Acknowledge the warning. Reason: image URLs in templates must be
     publicly viewable so saved landing pages can render in any browser.
     Each individual key gets public-read via bucket policy below.
6. **Bucket Versioning:** **Disable**
7. **Default encryption:** SSE-S3 (default)
8. **Tags:** add `Project=troy-sandbox` and `Phase=1`
9. **Create bucket**

After creation, configure CORS:

10. Open the new bucket → **Permissions** tab → **Cross-origin resource sharing (CORS)** → **Edit**
11. Paste:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "HEAD"],
        "AllowedOrigins": ["https://visionpointmarketing.github.io"],
        "ExposeHeaders": [],
        "MaxAgeSeconds": 3600
    }
]
```

12. **Save changes**

Configure the bucket policy for public-read of image keys:

13. **Permissions** tab → **Bucket policy** → **Edit**
14. Paste (substitute nothing — bucket name is in the resource ARN):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadImageObjects",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::troy-sandbox-images.vpmdevtech.com/sandboxes/*/templates/*/images/*"
        }
    ]
}
```

15. **Save changes**

> This policy grants **read** access only to objects under the
> `sandboxes/*/templates/*/images/` prefix. Anything else in the bucket
> remains private. We don't put anything else in this bucket.

---

## Step 4 — Create the 5 IAM execution roles

Each Lambda gets its own role with least-privilege scope. Yes, this is 5
similar setups. Doing them as separate roles instead of one shared role is
deliberate — a misconfigured handler can only touch its own resources.

For **each** of the 5 functions below, create a role with the corresponding
policy.

| Lambda short name | Role name | Inline policy file |
|---|---|---|
| saveTemplate | `troy-sandbox-lambda-saveTemplate` | `lambda/save-template/policy.json` |
| listTemplates | `troy-sandbox-lambda-listTemplates` | `lambda/list-templates/policy.json` |
| getTemplate | `troy-sandbox-lambda-getTemplate` | `lambda/get-template/policy.json` |
| deleteTemplate | `troy-sandbox-lambda-deleteTemplate` | `lambda/delete-template/policy.json` |
| presignImages | `troy-sandbox-lambda-presignImages` | `lambda/presign-images/policy.json` |

For each row:

1. Console search bar → **IAM** → **Roles** → **Create role**
2. **Trusted entity type:** AWS service · **Use case:** Lambda · **Next**
3. **Permissions policies:** skip — leave nothing selected, click **Next**
4. **Role name:** `troy-sandbox-lambda-<short>` from the table above
5. **Description:** "Execution role for the corresponding Lambda; least-privilege scope to TROY Sandbox resources only."
6. **Tags:** add `Project=troy-sandbox`, `Phase=1`
7. **Create role**
8. Open the just-created role → **Permissions** tab → **Add permissions** → **Create inline policy**
9. Click the **JSON** tab → paste the contents of the corresponding `lambda/<dir>/policy.json` file from the repo
10. **Review** → **Policy name:** `<role-name>-policy` (e.g., `troy-sandbox-lambda-saveTemplate-policy`) → **Create policy**

Repeat 1–10 for each of the 5 roles.

---

## Step 5 — Create the 5 Lambda functions

For **each** of the 5 functions, repeat steps 1–11 below. Function-specific
values are in each `lambda/<dir>/config.json`.

| Lambda | Source code | Config |
|---|---|---|
| `troySandboxSaveTemplate` | `lambda/save-template/index.js` | `lambda/save-template/config.json` |
| `troySandboxListTemplates` | `lambda/list-templates/index.js` | `lambda/list-templates/config.json` |
| `troySandboxGetTemplate` | `lambda/get-template/index.js` | `lambda/get-template/config.json` |
| `troySandboxDeleteTemplate` | `lambda/delete-template/index.js` | `lambda/delete-template/config.json` |
| `troySandboxPresignImages` | `lambda/presign-images/index.js` | `lambda/presign-images/config.json` |

For each function:

1. Console search bar → **Lambda** → **Functions** → **Create function**
2. **Author from scratch**
3. **Function name:** from the table above (e.g., `troySandboxSaveTemplate`)
4. **Runtime:** **Node.js 22.x**
5. **Architecture:** x86_64
6. **Permissions:** expand **Change default execution role** → **Use an existing role** → select the matching `troy-sandbox-lambda-<short>` role from Step 4
7. **Create function**
8. Once the function loads, in the **Code** tab:
   - The console shows a default `index.mjs` file (Node.js 22.x defaults to ES Modules — no rename needed)
   - Open `index.mjs`, select all (`Cmd/Ctrl+A`), delete, then paste the **full contents** of `lambda/<dir>/index.js` from the repo
   - Click **Deploy** (top right of the code area). Wait for "Changes deployed" confirmation
   - The handler stays as `index.handler` (the default)
9. Configuration → **General configuration** → **Edit**:
   - **Memory:** 256 MB (or per `config.json` → `memoryMB`)
   - **Timeout:** 10s (or 15s for `deleteTemplate` and `presignImages` per their `config.json`)
   - **Save**
10. Configuration → **Concurrency** → **Edit** → set **Reserved concurrency** to `10` (or `5` for `troySandboxDeleteTemplate` per its `config.json`) → **Save**
11. Configuration → **Environment variables** → **Edit** → add each variable from the function's `config.json` `environmentVariables` block:
    - For functions that have `SANDBOX_KEY` → paste the API key generated in Step 0 (NOT the placeholder text)
    - All other variables get the literal values shown in `config.json`
    - **Save**
12. Configuration → **Tags** → add `Project=troy-sandbox`, `Phase=1`

---

## Step 6 — Configure Function URLs

For **each** of the 5 functions, repeat:

1. Open the function → **Configuration** tab → **Function URL** → **Create function URL**
2. **Auth type:** **NONE** (per `config.json`)
3. Toggle **Configure cross-origin resource sharing (CORS)** → on. Set:
   - **Allow origin:** `https://visionpointmarketing.github.io`
   - **Allow headers:** `Content-Type, X-Sandbox-Key`
   - **Allow methods:** the value from `config.json` for this function (`GET`, `POST`, or `DELETE` — plus `OPTIONS`)
   - **Expose headers:** (leave empty)
   - **Max age:** `3600`
   - **Allow credentials:** off
4. **Save**
5. **Copy the Function URL** that appears at the top of the Function URL panel — it looks like `https://xxxxxxxx.lambda-url.us-east-1.on.aws/`
6. **Paste it into `js/cloud-config.js`** in your local checkout, replacing the corresponding `PASTE_FUNCTION_URL_HERE` placeholder. Mapping:

| `cloud-config.js` key | Paste the Function URL from |
|---|---|
| `saveTemplate` | `troySandboxSaveTemplate` |
| `listTemplates` | `troySandboxListTemplates` |
| `getTemplate` | `troySandboxGetTemplate` |
| `deleteTemplate` | `troySandboxDeleteTemplate` |
| `presignImages` | `troySandboxPresignImages` |

After all 5 are pasted, commit and push the updated `cloud-config.js`. The
GitHub Pages deploy picks it up automatically.

---

## Step 7 — Smoke test from the editor

1. Open the editor at `https://visionpointmarketing.github.io/troy-sandbox/`
   *(or your fork's GitHub Pages URL — but you'd need to update each Lambda's `ALLOWED_ORIGIN` env var and Function URL CORS to that origin)*
2. Open the **Templates** popover. You should see a new **Cloud Library** section with a "Connect this browser to the cloud library →" link
3. Click the link, paste the API key generated in Step 0, **Connect**
4. Toast: "Connected to cloud library."
5. Add at least one section to the canvas. Upload an image into it.
6. Click **Templates** → **Save Current Page**
7. Modal opens with a Cloud / Local toggle, defaulting to **Cloud library**
8. Enter a name like `Smoke Test 1` → **Save Template**
9. Spinner shows "Saving to cloud…", then a toast: "Saved Smoke Test 1 to cloud library."
10. Reopen the Templates popover → "Smoke Test 1" appears in the Cloud Library section
11. **Test cross-browser persistence:** open the same editor URL in an incognito window or another browser. Connect with the same key. The Cloud Library shows "Smoke Test 1". Click to load it. The image renders.

If anything fails, see `AWS-RUNBOOK.md` → "Debugging a failed save".

---

## Step 8 — Distribute the API key to the team

Out-of-band, securely. Examples:

- 1Password / Bitwarden shared vault entry
- Encrypted Slack DM to each team member
- In person

Tell them:
1. Open the editor URL
2. Open the **Templates** popover → click the "Connect this browser..." link
3. Paste the key from <wherever you stored it>
4. They're connected. Cloud features now work.

---

## Rollback plan

If anything goes wrong at any step, **stopping is safe** — every resource
created so far costs cents per month at most, and none of them affect any
existing VP resource because they're all new and tag-scoped.

To **fully tear down** what you've built so far, see
`AWS-RUNBOOK.md` → "Complete teardown".

---

## Verification checklist (run after deployment)

- [ ] $25 budget alert exists and is scoped to `Project=troy-sandbox` tag
- [ ] DynamoDB `TroySandbox_Templates` table is Active with PITR off and deletion protection on
- [ ] S3 bucket `troy-sandbox-images.vpmdevtech.com` exists, has CORS configured for the editor origin, and has the public-read bucket policy scoped to the images prefix only
- [ ] 5 IAM roles created, each with its inline policy applied; no `Resource: "*"` anywhere
- [ ] 5 Lambda functions created, runtime Node.js 22.x, with reserved concurrency, env vars set including `SANDBOX_KEY`, and `Project=troy-sandbox` tag
- [ ] 5 Function URLs created, AuthType NONE, CORS allow-origin matches editor URL
- [ ] `js/cloud-config.js` committed with the 5 real URLs (no `PASTE_FUNCTION_URL_HERE` left for Phase 1 endpoints)
- [ ] Smoke test passed end-to-end (save with image → reload in another browser → image renders)
- [ ] API key stored securely and distributed to team out-of-band
