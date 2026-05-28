/**
 * TROY Sandbox — Cloud Storage Client
 *
 * Talks to the AWS Lambda Function URLs configured in js/cloud-config.js.
 * Public API mirrors js/template-storage.js as closely as possible so the UI
 * code can call either one through a consistent surface.
 *
 * Image flow on save:
 *   1. Walk every section.content field looking for base64 image data URLs.
 *   2. For each, request a presigned S3 PUT URL from the backend.
 *   3. PUT the image bytes directly to S3 (bytes do not touch Lambda).
 *   4. Replace the section.content data URL with the returned S3 URL.
 *   5. POST the rewritten template JSON to saveTemplate.
 *
 * Image flow on load:
 *   - GET returns sections whose image fields are already S3 URLs. No
 *     transformation needed. The existing imageSlot() helper in utils.js
 *     renders them with <img src="..."> directly.
 *
 * See docs/CLOUD-IMPLEMENTATION.md for full design rationale.
 */

import {
    SANDBOX_ID,
    endpoint,
    getCloudKey,
    isCloudConnected,
} from './cloud-config.js';

// ============================================================================
// Errors
// ============================================================================

export class CloudError extends Error {
    constructor(message, code, status) {
        super(message);
        this.name = 'CloudError';
        this.code = code || 'unknown';
        this.status = status || 0;
    }
}

// ============================================================================
// Low-level fetch helper
// ============================================================================

/**
 * Wraps fetch with: the sandbox-key header, JSON body serialization,
 * structured error handling, and a default timeout.
 */
async function cloudFetch(url, { method = 'GET', body = null, query = null, timeoutMs = 20000 } = {}) {
    if (!isCloudConnected()) {
        throw new CloudError('Cloud is not connected (no API key stored on this device)', 'no_key', 0);
    }

    let finalUrl = url;
    if (query) {
        const qs = new URLSearchParams(query).toString();
        finalUrl += (url.includes('?') ? '&' : '?') + qs;
    }

    const headers = {
        'X-Sandbox-Key': getCloudKey(),
    };
    if (body !== null) {
        headers['Content-Type'] = 'application/json';
    }

    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), timeoutMs);

    let res;
    try {
        res = await fetch(finalUrl, {
            method,
            headers,
            body: body !== null ? JSON.stringify(body) : undefined,
            signal: ac.signal,
        });
    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            throw new CloudError('Request timed out', 'timeout', 0);
        }
        throw new CloudError(`Network error: ${err.message}`, 'network', 0);
    }
    clearTimeout(timer);

    let json = null;
    try {
        json = await res.json();
    } catch {
        // No JSON body — that's only OK for 2xx with empty body
        if (!res.ok) {
            throw new CloudError(`HTTP ${res.status} with no JSON body`, 'http', res.status);
        }
    }

    if (!res.ok) {
        const code = json?.error?.code || 'http';
        const message = json?.error?.message || `HTTP ${res.status}`;
        throw new CloudError(message, code, res.status);
    }

    return json;
}

// ============================================================================
// templateId generator (used by clients before save so images can upload first)
// ============================================================================

const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomBase62(len) {
    let out = '';
    const rand = crypto.getRandomValues(new Uint8Array(len));
    for (let i = 0; i < len; i++) {
        out += BASE62[rand[i] % BASE62.length];
    }
    return out;
}

/**
 * Generates a new client-side template ID.
 * Format: tpl_ + 12 random base62 characters (~71 bits of entropy).
 */
export function generateTemplateId() {
    return 'tpl_' + randomBase62(12);
}

/**
 * Generates an image ID for a given section field. Stable for a given
 * (sectionId, field) pair within a single save so concurrent uploads
 * for the same field land in the same S3 key.
 */
function generateImageId(sectionId, field) {
    // sectionId is already unique within a template; sanitize and combine
    const safeSection = String(sectionId).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 32);
    const safeField = String(field).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 24);
    return `img_${safeSection}_${safeField}_${randomBase62(6)}`;
}

// ============================================================================
// Image upload orchestration
// ============================================================================

/**
 * Walks sections looking for base64 data URLs in content fields.
 * Returns an array of { sectionId, field, dataUrl, contentType, size }.
 */
function findBase64Images(sections) {
    const out = [];
    for (const section of sections) {
        if (!section.content) continue;
        for (const [field, value] of Object.entries(section.content)) {
            if (typeof value === 'string' && value.startsWith('data:image/')) {
                const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
                if (!match) continue;
                const contentType = match[1];
                const binary = atob(match[2]);
                const size = binary.length;
                out.push({
                    sectionId: section.id,
                    field,
                    dataUrl: value,
                    contentType,
                    size,
                    binary,
                });
            }
        }
    }
    return out;
}

/**
 * Convert a binary string (atob output) to a Blob for fetch upload.
 */
function binaryToBlob(binary, contentType) {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: contentType });
}

/**
 * Upload base64 images to S3 via presigned URLs and return a map from
 * (sectionId|field) → S3 URL. Throws CloudError on any failure.
 */
async function uploadImagesAndGetUrls(templateId, sections) {
    const base64Images = findBase64Images(sections);
    if (base64Images.length === 0) return new Map();

    // Step 1: ask backend for presigned URLs
    const presignRequest = base64Images.map(img => ({
        imageId: generateImageId(img.sectionId, img.field),
        contentType: img.contentType,
        size: img.size,
    }));

    const presigned = await cloudFetch(endpoint('presignImages'), {
        method: 'POST',
        body: {
            sandboxId: SANDBOX_ID,
            templateId,
            images: presignRequest,
        },
    });

    if (!Array.isArray(presigned) || presigned.length !== base64Images.length) {
        throw new CloudError('Presign response shape unexpected', 'bad_response', 0);
    }

    // Step 2: PUT each image to S3 in parallel
    await Promise.all(presigned.map(async (p, i) => {
        const img = base64Images[i];
        const blob = binaryToBlob(img.binary, img.contentType);
        const res = await fetch(p.uploadUrl, {
            method: 'PUT',
            headers: { 'Content-Type': img.contentType },
            body: blob,
        });
        if (!res.ok) {
            throw new CloudError(`S3 upload failed (${res.status}) for image ${p.imageId}`, 's3_upload', res.status);
        }
    }));

    // Step 3: build the map for substitution
    const map = new Map();
    presigned.forEach((p, i) => {
        const img = base64Images[i];
        map.set(`${img.sectionId}|${img.field}`, p.cdnUrl);
    });
    return map;
}

/**
 * Returns a deep-cloned sections array with base64 image fields replaced
 * by S3 URLs from the map. Non-image fields and sections without images
 * are passed through unchanged.
 */
function rewriteImageFieldsToUrls(sections, urlMap) {
    return sections.map(section => {
        const newContent = {};
        for (const [field, value] of Object.entries(section.content || {})) {
            const key = `${section.id}|${field}`;
            if (urlMap.has(key)) {
                newContent[field] = urlMap.get(key);
            } else {
                newContent[field] = value;
            }
        }
        return {
            ...section,
            content: newContent,
        };
    });
}

// ============================================================================
// Public API — mirrors template-storage.js where possible
// ============================================================================

/**
 * List all templates in this sandbox (metadata only, no sections).
 * Returns an array sorted by updatedAt descending (most recent first).
 */
export async function getSavedTemplates() {
    return cloudFetch(endpoint('listTemplates'), {
        method: 'GET',
        query: { sandboxId: SANDBOX_ID },
    });
}

/**
 * Get a single template by ID, including full sections array.
 */
export async function getSavedTemplate(templateId) {
    return cloudFetch(endpoint('getTemplate'), {
        method: 'GET',
        query: { sandboxId: SANDBOX_ID, templateId },
    });
}

/**
 * Save (create or update) a template.
 *
 * - If templateId is omitted, a new one is generated client-side. Use the
 *   returned templateId for subsequent updates.
 * - Images embedded as base64 in section.content are uploaded to S3 first;
 *   the stored template references them as S3 URLs.
 *
 * Returns { templateId, updatedAt, version, created }.
 */
export async function saveTemplate(name, sections, templateId = null) {
    const trimmedName = (name || '').trim();
    if (!trimmedName) throw new CloudError('name is required', 'bad_request', 400);
    if (!Array.isArray(sections) || sections.length === 0) {
        throw new CloudError('sections must be a non-empty array', 'bad_request', 400);
    }

    const id = templateId || generateTemplateId();

    // Upload any base64 images first
    const urlMap = await uploadImagesAndGetUrls(id, sections);
    const cleanedSections = urlMap.size > 0
        ? rewriteImageFieldsToUrls(sections, urlMap)
        : sections;

    return cloudFetch(endpoint('saveTemplate'), {
        method: 'POST',
        body: {
            sandboxId: SANDBOX_ID,
            templateId: id,
            name: trimmedName,
            sectionCount: cleanedSections.length,
            sections: cleanedSections,
        },
    });
}

/**
 * Hard-delete a template and its associated S3 images.
 * Idempotent — deleting a missing template returns ok:true with imagesDeleted:0.
 */
export async function deleteTemplate(templateId) {
    return cloudFetch(endpoint('deleteTemplate'), {
        method: 'DELETE',
        query: { sandboxId: SANDBOX_ID, templateId },
    });
}

export default {
    generateTemplateId,
    getSavedTemplates,
    getSavedTemplate,
    saveTemplate,
    deleteTemplate,
    CloudError,
};
