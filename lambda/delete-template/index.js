/**
 * TROY Sandbox — deleteTemplate Lambda
 *
 * Hard-deletes a template from DynamoDB and all images for that template
 * from S3 (under prefix sandboxes/{sandboxId}/templates/{templateId}/).
 *
 * Endpoint: DELETE /?sandboxId=troy&templateId=tpl_xxx
 * Headers:
 *   X-Sandbox-Key: <api key>
 * Returns: { ok: true, imagesDeleted: N }
 *
 * Behavior notes:
 *   - Idempotent: deleting a non-existent template returns ok:true with imagesDeleted:0.
 *   - S3 cleanup is best-effort; failures are logged but do not fail the delete.
 *
 * See docs/CLOUD-IMPLEMENTATION.md for design rationale.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const TEMPLATES_TABLE = process.env.TEMPLATES_TABLE;
const IMAGES_BUCKET = process.env.IMAGES_BUCKET;
const SANDBOX_KEY = process.env.SANDBOX_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://visionpointmarketing.github.io';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

// ----- helpers (kept inline; duplicated across all Lambda handlers by design) -----

// Function URL CORS config (configured separately on the Lambda) handles
// Access-Control-* headers automatically. Returning them from the handler
// duplicates them, which browsers reject. We only set Content-Type here.
function corsHeaders() {
    return {
        'Content-Type': 'application/json',
    };
}

function response(statusCode, body) {
    return { statusCode, headers: corsHeaders(), body: JSON.stringify(body) };
}

function ok(body) { return response(200, body); }
function bad(message) { return response(400, { error: { code: 'bad_request', message } }); }
function unauth() { return response(401, { error: { code: 'unauthorized', message: 'Invalid or missing X-Sandbox-Key' } }); }
function serverError(message) { return response(500, { error: { code: 'internal', message: message || 'Internal server error' } }); }

function getHeader(event, name) {
    const h = event.headers || {};
    return h[name] || h[name.toLowerCase()] || null;
}

function requireKey(event) {
    if (!SANDBOX_KEY) throw new Error('SANDBOX_KEY env var not configured on this function');
    const provided = getHeader(event, 'X-Sandbox-Key');
    return provided === SANDBOX_KEY;
}

/**
 * Delete every S3 object under the given prefix. Returns the count deleted.
 * Best-effort: errors are logged but not thrown.
 */
async function deleteS3Prefix(prefix) {
    let totalDeleted = 0;
    let continuationToken;

    try {
        do {
            const list = await s3.send(new ListObjectsV2Command({
                Bucket: IMAGES_BUCKET,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            }));

            const objects = list.Contents || [];
            if (objects.length > 0) {
                await s3.send(new DeleteObjectsCommand({
                    Bucket: IMAGES_BUCKET,
                    Delete: {
                        Objects: objects.map(o => ({ Key: o.Key })),
                        Quiet: true,
                    },
                }));
                totalDeleted += objects.length;
            }

            continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
        } while (continuationToken);
    } catch (err) {
        console.error(`S3 cleanup failed for prefix ${prefix}:`, err);
        // Swallow — the template record is the source of truth; orphan S3 objects are tolerable.
    }

    return totalDeleted;
}

// ----- handler -----

export const handler = async (event) => {
    try {
        if (event.requestContext?.http?.method === 'OPTIONS') {
            return { statusCode: 204, headers: corsHeaders(), body: '' };
        }

        if (!requireKey(event)) return unauth();

        const { sandboxId, templateId } = event.queryStringParameters || {};
        if (!sandboxId) return bad('sandboxId query parameter is required');
        if (!templateId) return bad('templateId query parameter is required');

        // Delete DynamoDB row first (source of truth)
        await ddb.send(new DeleteCommand({
            TableName: TEMPLATES_TABLE,
            Key: { sandboxId, templateId },
        }));

        // Best-effort clean S3 images for this template
        const prefix = `sandboxes/${sandboxId}/templates/${templateId}/`;
        const imagesDeleted = await deleteS3Prefix(prefix);

        return ok({ ok: true, imagesDeleted });
    } catch (err) {
        console.error('deleteTemplate error', err);
        return serverError(err.message);
    }
};
