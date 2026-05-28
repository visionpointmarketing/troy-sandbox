/**
 * TROY Sandbox — saveTemplate Lambda
 *
 * Creates or updates a template in DynamoDB. Sandbox-scoped (no per-user auth).
 * Authentication: X-Sandbox-Key header must match env var SANDBOX_KEY.
 *
 * Endpoint: POST /
 * Headers:
 *   X-Sandbox-Key: <api key>
 * Body:
 *   {
 *     sandboxId:   "troy",
 *     templateId:  "tpl_xxxxxxxx",     // client-generated; required (lets images upload first)
 *     name:        "My Landing Page",
 *     sectionCount: 5,
 *     sections:    [...]                // section objects with images as S3 URLs
 *   }
 * Returns: { templateId, updatedAt, version }
 *
 * See docs/CLOUD-IMPLEMENTATION.md for design rationale.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

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
    return {
        statusCode,
        headers: corsHeaders(),
        body: JSON.stringify(body),
    };
}

function ok(body) { return response(200, body); }
function bad(message) { return response(400, { error: { code: 'bad_request', message } }); }
function unauth() { return response(401, { error: { code: 'unauthorized', message: 'Invalid or missing X-Sandbox-Key' } }); }
function serverError(message) { return response(500, { error: { code: 'internal', message: message || 'Internal server error' } }); }

function getHeader(event, name) {
    // Lambda Function URL puts headers in event.headers, lowercased.
    const h = event.headers || {};
    return h[name] || h[name.toLowerCase()] || null;
}

function requireKey(event) {
    if (!SANDBOX_KEY) {
        throw new Error('SANDBOX_KEY env var not configured on this function');
    }
    const provided = getHeader(event, 'X-Sandbox-Key');
    return provided === SANDBOX_KEY;
}

// Minimal templateId format check: tpl_ + base62 chars
const TEMPLATE_ID_RE = /^tpl_[A-Za-z0-9]{6,32}$/;

// ----- handler -----

export const handler = async (event) => {
    try {
        // CORS preflight (Function URL CORS config also handles this, but doesn't hurt)
        if (event.requestContext?.http?.method === 'OPTIONS') {
            return { statusCode: 204, headers: corsHeaders(), body: '' };
        }

        if (!requireKey(event)) return unauth();

        // Parse body
        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return bad('Body is not valid JSON');
        }

        const { sandboxId, templateId, name, sectionCount, sections } = body;

        if (!sandboxId || typeof sandboxId !== 'string') return bad('sandboxId is required');
        if (!templateId || !TEMPLATE_ID_RE.test(templateId)) return bad('templateId is required and must match /^tpl_[A-Za-z0-9]{6,32}$/');
        if (!name || typeof name !== 'string' || name.trim().length === 0) return bad('name is required');
        if (name.length > 100) return bad('name must be 100 characters or fewer');
        if (!Array.isArray(sections)) return bad('sections must be an array');
        if (sections.length === 0) return bad('sections must not be empty');
        if (sections.length > 50) return bad('sections array exceeds maximum of 50 entries');

        const now = new Date().toISOString();

        // Read existing record (if any) to preserve createdAt and bump version
        const existing = await ddb.send(new GetCommand({
            TableName: TEMPLATES_TABLE,
            Key: { sandboxId, templateId },
        }));

        const createdAt = existing.Item?.createdAt || now;
        const version = (existing.Item?.version || 0) + 1;

        const item = {
            sandboxId,
            templateId,
            name: name.trim(),
            sectionCount: typeof sectionCount === 'number' ? sectionCount : sections.length,
            sections,
            createdAt,
            updatedAt: now,
            version,
        };

        await ddb.send(new PutCommand({
            TableName: TEMPLATES_TABLE,
            Item: item,
        }));

        return ok({
            templateId,
            updatedAt: now,
            version,
            created: !existing.Item,
        });
    } catch (err) {
        console.error('saveTemplate error', err);
        return serverError(err.message);
    }
};
