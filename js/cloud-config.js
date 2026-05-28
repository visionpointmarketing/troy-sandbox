/**
 * TROY Sandbox — Cloud Configuration
 *
 * Endpoint URLs for the AWS Lambda Function URLs that back the cloud-save
 * feature. **The URLs are not secret** — they're served as part of this
 * static JS bundle. The trust boundary is the sandbox API key, which is
 * NOT stored in this file. The user enters the key on first connect and
 * it is stored in their browser's localStorage.
 *
 * See docs/CLOUD-IMPLEMENTATION.md for the full design rationale.
 *
 * AFTER AWS DEPLOYMENT: paste each Function URL below in place of the
 * PASTE_FUNCTION_URL_HERE placeholders, then commit + push to deploy.
 *
 * To DISABLE the cloud features (e.g. for testing locally), leave the
 * placeholders in place. The app checks isCloudConfigured() and falls
 * back to localStorage-only when URLs aren't real.
 */

// ============================================================================
// PHASE 1 ENDPOINTS — paste Lambda Function URLs here after deployment
// ============================================================================
export const CLOUD_ENDPOINTS = {
    saveTemplate:    'https://sywxo3tpkdtw7qfnii7gpzg5vm0tfoub.lambda-url.us-east-1.on.aws/',
    listTemplates:   'https://wrsyho2oxybrnjouagayvrt6ie0bxaxl.lambda-url.us-east-1.on.aws/',
    getTemplate:     'https://e2qe5lldoc4bybxtmj6rjj4uua0fiiaj.lambda-url.us-east-1.on.aws/',
    deleteTemplate:  'https://pk6no7qshoboby2ttrk4uzjhuu0zquut.lambda-url.us-east-1.on.aws/',
    presignImages:   'https://fjudckm7x3zuek3yw7iwaqrxma0puafv.lambda-url.us-east-1.on.aws/',

    // Phase 2 endpoints — leave placeholders until Phase 2 is built
    createShare:        'PASTE_FUNCTION_URL_HERE',
    getSharedTemplate:  'PASTE_FUNCTION_URL_HERE',
    revokeShare:        'PASTE_FUNCTION_URL_HERE',
};

// ============================================================================
// Sandbox identity
// ============================================================================

/**
 * The sandbox we belong to. Sent on every API call so the backend can scope
 * data correctly. There is currently only one sandbox; this is here so
 * adding more later is a small edit, not a refactor.
 */
export const SANDBOX_ID = 'troy';

/**
 * S3 bucket the images live in. Used for sanity-checking returned URLs.
 * Must match the IMAGES_BUCKET env var on the Lambdas.
 */
export const IMAGES_BUCKET = 'troy-sandbox-images.vpmdevtech.com';

// ============================================================================
// Local storage keys
// ============================================================================

const KEY_STORAGE = 'troy-sandbox-cloud-key';

// ============================================================================
// Phase-1 configuration check
// ============================================================================

const PHASE_1_ENDPOINT_NAMES = [
    'saveTemplate',
    'listTemplates',
    'getTemplate',
    'deleteTemplate',
    'presignImages',
];

/**
 * True if every Phase 1 endpoint URL has been filled in (no placeholders).
 * When this returns false, the editor behaves exactly as it did before the
 * cloud feature was added — local-only.
 */
export function isCloudConfigured() {
    return PHASE_1_ENDPOINT_NAMES.every(name => {
        const url = CLOUD_ENDPOINTS[name];
        return typeof url === 'string'
            && url.startsWith('https://')
            && !url.includes('PASTE_FUNCTION_URL_HERE');
    });
}

/**
 * Returns the URL for a named endpoint. Throws if cloud isn't configured
 * (callers shouldn't reach this code path when isCloudConfigured() is false).
 */
export function endpoint(name) {
    if (!CLOUD_ENDPOINTS[name] || CLOUD_ENDPOINTS[name].includes('PASTE_FUNCTION_URL_HERE')) {
        throw new Error(`Cloud endpoint "${name}" is not configured. Edit js/cloud-config.js to set the URL.`);
    }
    return CLOUD_ENDPOINTS[name];
}

// ============================================================================
// Sandbox API key — stored per-browser in localStorage
// ============================================================================

/**
 * Returns the user's stored sandbox API key, or null if not set.
 * The key is per-browser; users enter it once on their device.
 */
export function getCloudKey() {
    try {
        return localStorage.getItem(KEY_STORAGE) || null;
    } catch {
        return null;
    }
}

/**
 * Stores the sandbox API key in localStorage for this browser.
 * Returns true on success, false if localStorage isn't writable.
 */
export function setCloudKey(key) {
    if (!key || typeof key !== 'string') return false;
    try {
        localStorage.setItem(KEY_STORAGE, key.trim());
        return true;
    } catch {
        return false;
    }
}

/**
 * Clears the stored sandbox API key (disconnect from cloud).
 */
export function clearCloudKey() {
    try {
        localStorage.removeItem(KEY_STORAGE);
        return true;
    } catch {
        return false;
    }
}

/**
 * True if cloud is configured AND the user has a key stored.
 * This is the gate the UI checks before showing cloud features.
 */
export function isCloudConnected() {
    return isCloudConfigured() && !!getCloudKey();
}

export default {
    CLOUD_ENDPOINTS,
    SANDBOX_ID,
    IMAGES_BUCKET,
    isCloudConfigured,
    isCloudConnected,
    endpoint,
    getCloudKey,
    setCloudKey,
    clearCloudKey,
};
