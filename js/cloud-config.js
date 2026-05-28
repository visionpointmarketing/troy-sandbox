/**
 * TROY Sandbox — Cloud Configuration
 *
 * Endpoint URLs and shared API key for the AWS Lambda Function URLs that
 * back the cloud-save feature.
 *
 * **TRUST MODEL — read this before changing anything:**
 *
 * Both the endpoint URLs AND the sandbox API key are committed in this file.
 * Anyone with the editor URL has cloud save working with zero setup.
 * Per Dave Olsen's planning review, this is a sandbox-scoped trust model:
 * anyone with the editor URL can save, list, and delete templates.
 *
 * Threat protection layers:
 *   1. Lambda Function URL CORS is locked to https://visionpointmarketing.github.io
 *      so browser-based calls from other origins are blocked.
 *   2. DynamoDB Point-in-Time Recovery is enabled on TroySandbox_Templates,
 *      giving a 35-day rollback window for abuse/accident recovery.
 *   3. The Sandbox API key gates writes server-side; rotation is a one-step
 *      Lambda env var change + this file update (see docs/AWS-RUNBOOK.md).
 *
 * To DISABLE the cloud features (e.g. for testing locally without AWS),
 * change CLOUD_ENDPOINTS values back to 'PASTE_FUNCTION_URL_HERE'. The
 * app checks isCloudConfigured() and falls back to local-only behavior.
 *
 * See docs/CLOUD-IMPLEMENTATION.md for the full design rationale.
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
// Sandbox API key — sent as X-Sandbox-Key on every request
// ============================================================================
//
// MUST MATCH the SANDBOX_KEY env var on every Lambda. To rotate:
//   1. (Optional but recommended) Set SANDBOX_KEY_PREV on each Lambda to this
//      value so the old key keeps working during the deploy window.
//      Requires the Lambda handler to accept either key — not yet implemented;
//      see docs/AWS-RUNBOOK.md "Migrating to dual-key rotation".
//   2. Generate a new key (`openssl rand -hex 32`).
//   3. Update SANDBOX_KEY env var on all 5 Lambdas (see runbook).
//   4. Update SANDBOX_API_KEY below, commit + push. GitHub Pages redeploys
//      in 30–90 seconds.
//   5. After ~1 hour, remove SANDBOX_KEY_PREV from Lambdas if used.
//
// Why committed instead of prompted? See docs/CLOUD-IMPLEMENTATION.md
// → "Design decision: key in deployed bundle".
export const SANDBOX_API_KEY = 'bafa15e3cc207754bb289cafaa467f5c7e2f35e0a6328aa2e5ed73cdf95a4c40';

// ============================================================================
// Local storage keys (legacy + dev override)
// ============================================================================

// Legacy: if a key was previously stored in localStorage from an older
// version of the editor, it takes precedence over SANDBOX_API_KEY. This
// also serves as a dev-override mechanism — set it manually in DevTools
// to test a different key without redeploying.
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
 * Returns the active sandbox API key.
 *
 * Resolution order:
 *   1. A key in localStorage under troy-sandbox-cloud-key (dev override —
 *      set manually in DevTools to test a different key without redeploying).
 *   2. The SANDBOX_API_KEY constant above (the normal path).
 *
 * Returns null only if both are missing (shouldn't happen in production).
 */
export function getCloudKey() {
    try {
        const override = localStorage.getItem(KEY_STORAGE);
        if (override) return override;
    } catch {
        // localStorage not available — fall through to embedded key
    }
    return SANDBOX_API_KEY || null;
}

/**
 * Manual override: stores a different key in localStorage for this browser.
 * Useful for testing alternate keys before deploying, or as an emergency
 * lever during a rotation if the embedded key is rejected.
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
 * Clears the manual key override. After clearing, the editor falls back
 * to the SANDBOX_API_KEY constant.
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
 * True if cloud is configured (endpoints set) AND a key is available.
 * Since the key is embedded in this file, this is effectively equivalent
 * to isCloudConfigured() in production.
 */
export function isCloudConnected() {
    return isCloudConfigured() && !!getCloudKey();
}

export default {
    CLOUD_ENDPOINTS,
    SANDBOX_ID,
    SANDBOX_API_KEY,
    IMAGES_BUCKET,
    isCloudConfigured,
    isCloudConnected,
    endpoint,
    getCloudKey,
    setCloudKey,
    clearCloudKey,
};
