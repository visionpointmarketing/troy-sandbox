/**
 * TROY Sandbox — listTemplates Lambda
 *
 * Returns a list of template metadata for the given sandbox. Does NOT return
 * the full sections payload — call getTemplate for that.
 *
 * Endpoint: GET /?sandboxId=troy
 * Headers:
 *   X-Sandbox-Key: <api key>
 * Returns: [{ templateId, name, sectionCount, createdAt, updatedAt, version }, ...]
 *
 * See docs/CLOUD-IMPLEMENTATION.md for design rationale.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const TEMPLATES_TABLE = process.env.TEMPLATES_TABLE;
const SANDBOX_KEY = process.env.SANDBOX_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://visionpointmarketing.github.io';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// ----- helpers (kept inline; duplicated across all Lambda handlers by design) -----

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,X-Sandbox-Key',
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

// ----- handler -----

export const handler = async (event) => {
    try {
        if (event.requestContext?.http?.method === 'OPTIONS') {
            return { statusCode: 204, headers: corsHeaders(), body: '' };
        }

        if (!requireKey(event)) return unauth();

        const sandboxId = event.queryStringParameters?.sandboxId;
        if (!sandboxId) return bad('sandboxId query parameter is required');

        const result = await ddb.send(new QueryCommand({
            TableName: TEMPLATES_TABLE,
            KeyConditionExpression: 'sandboxId = :s',
            ExpressionAttributeValues: { ':s': sandboxId },
            // Projection: only return metadata, not the full sections payload
            ProjectionExpression: 'templateId, #n, sectionCount, createdAt, updatedAt, version',
            ExpressionAttributeNames: { '#n': 'name' },
        }));

        // Sort by updatedAt descending (most recent first)
        const items = (result.Items || []).sort((a, b) => {
            return (b.updatedAt || '').localeCompare(a.updatedAt || '');
        });

        return ok(items);
    } catch (err) {
        console.error('listTemplates error', err);
        return serverError(err.message);
    }
};
