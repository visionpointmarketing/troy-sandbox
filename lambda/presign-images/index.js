/**
 * TROY Sandbox — presignImageUploads Lambda
 *
 * Returns short-lived presigned S3 PUT URLs for client-direct image uploads.
 * Bytes never travel through Lambda (Lambda has a 6MB request size cap and
 * egress costs money) — the client PUTs directly to S3.
 *
 * Endpoint: POST /
 * Headers:
 *   X-Sandbox-Key: <api key>
 * Body:
 *   {
 *     sandboxId:  "troy",
 *     templateId: "tpl_xxxxxxxx",
 *     images: [
 *       { imageId: "img_xxx", contentType: "image/png", size: 12345 },
 *       ...
 *     ]
 *   }
 * Returns:
 *   [
 *     { imageId, uploadUrl, cdnUrl, key },
 *     ...
 *   ]
 *
 * Limits:
 *   - Up to 50 images per request
 *   - Each image ≤ 10 MB (size param checked; bucket policy enforces independently)
 *   - Presigned URLs expire in 5 minutes
 *
 * See docs/CLOUD-IMPLEMENTATION.md for design rationale.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const IMAGES_BUCKET = process.env.IMAGES_BUCKET;
const SANDBOX_KEY = process.env.SANDBOX_KEY;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://visionpointmarketing.github.io';
const REGION = process.env.AWS_REGION || 'us-east-1';
const PRESIGN_EXPIRES_SECONDS = 300;
const MAX_IMAGES_PER_REQUEST = 50;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

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

const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;
const TEMPLATE_ID_RE = /^tpl_[A-Za-z0-9]{6,32}$/;

const ALLOWED_CONTENT_TYPES = new Set([
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
    'image/svg+xml',
]);

function extensionFor(contentType) {
    return {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
    }[contentType] || 'bin';
}

// ----- handler -----

export const handler = async (event) => {
    try {
        if (event.requestContext?.http?.method === 'OPTIONS') {
            return { statusCode: 204, headers: corsHeaders(), body: '' };
        }

        if (!requireKey(event)) return unauth();

        let body;
        try {
            body = JSON.parse(event.body || '{}');
        } catch {
            return bad('Body is not valid JSON');
        }

        const { sandboxId, templateId, images } = body;

        if (!sandboxId || typeof sandboxId !== 'string') return bad('sandboxId is required');
        if (!templateId || !TEMPLATE_ID_RE.test(templateId)) return bad('templateId is required and must match /^tpl_[A-Za-z0-9]{6,32}$/');
        if (!Array.isArray(images)) return bad('images must be an array');
        if (images.length === 0) return bad('images must contain at least one entry');
        if (images.length > MAX_IMAGES_PER_REQUEST) {
            return bad(`Too many images in one request (max ${MAX_IMAGES_PER_REQUEST})`);
        }

        // Validate each image entry
        for (const img of images) {
            if (!img.imageId || !ID_RE.test(img.imageId)) {
                return bad('Each image must have an imageId of 1-64 chars [A-Za-z0-9_-]');
            }
            if (!ALLOWED_CONTENT_TYPES.has(img.contentType)) {
                return bad(`contentType ${img.contentType} is not allowed`);
            }
            if (typeof img.size !== 'number' || img.size <= 0 || img.size > MAX_IMAGE_SIZE_BYTES) {
                return bad(`size must be a positive number ≤ ${MAX_IMAGE_SIZE_BYTES} bytes`);
            }
        }

        // Build presigned URLs in parallel
        const results = await Promise.all(images.map(async (img) => {
            const ext = extensionFor(img.contentType);
            const key = `sandboxes/${sandboxId}/templates/${templateId}/images/${img.imageId}.${ext}`;

            const command = new PutObjectCommand({
                Bucket: IMAGES_BUCKET,
                Key: key,
                ContentType: img.contentType,
                ContentLength: img.size,
            });

            const uploadUrl = await getSignedUrl(s3, command, { expiresIn: PRESIGN_EXPIRES_SECONDS });
            // PATH-STYLE URL (bucket name comes AFTER s3.<region>.amazonaws.com).
            // Virtual-hosted style (bucket-name.s3.<region>.amazonaws.com) fails
            // for buckets whose names contain periods because the S3 wildcard
            // TLS certificate (*.s3.<region>.amazonaws.com) only matches a
            // single subdomain label. Our bucket is named
            // "troy-sandbox-images.vpmdevtech.com" (dotted, by VP convention)
            // so virtual-hosted URLs trigger a browser cert error and the
            // image never loads. Path-style works for any bucket name.
            const cdnUrl = `https://s3.${REGION}.amazonaws.com/${IMAGES_BUCKET}/${key}`;

            return {
                imageId: img.imageId,
                key,
                uploadUrl,
                cdnUrl,
            };
        }));

        return ok(results);
    } catch (err) {
        console.error('presignImageUploads error', err);
        return serverError(err.message);
    }
};
