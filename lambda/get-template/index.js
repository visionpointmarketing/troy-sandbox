/**
 * TROY Sandbox — getTemplate Lambda
 *
 * Returns one full template (including sections array). For metadata-only
 * listings, use listTemplates instead.
 *
 * Endpoint: GET /?sandboxId=troy&templateId=tpl_xxx
 * Headers:
 *   X-Sandbox-Key: <api key>
 * Returns: full template record
 *
 * See docs/CLOUD-IMPLEMENTATION.md for design rationale.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const TEMPLATES_TABLE = process.env.TEMPLATES_TABLE;
const SANDBOX_KEY = process.env.SANDBOX_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://visionpointmarketing.github.io';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

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
function notFound() { return response(404, { error: { code: 'not_found', message: 'Template not found' } }); }
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

        const result = await ddb.send(new GetCommand({
            TableName: TEMPLATES_TABLE,
            Key: { sandboxId, templateId },
        }));

        if (!result.Item) return notFound();

        return ok(result.Item);
    } catch (err) {
        console.error('getTemplate error', err);
        return serverError(err.message);
    }
};
