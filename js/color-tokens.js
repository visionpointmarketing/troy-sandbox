/**
 * TROY Sandbox — Brand Color Tokens
 *
 * Single source of truth for the Troy University brand palette as defined in
 * Troy_BrandStandards_FINAL.pdf (Color Palette, page 13).
 *
 * Two consumers also need these values:
 *   1. js/color-config.js                 — imports BRAND_COLORS directly
 *   2. js/preview-iframe.js               — imports BRAND_COLORS directly
 *   3. index.html (inline Tailwind config)— mirrors the same hex values
 *
 * Because index.html sets the Tailwind config inline before any ES module loads,
 * the index.html block must mirror these values. js/app.js performs a startup
 * assertion (assertTailwindMirrorsBrandColors) so any drift surfaces immediately
 * in the browser console.
 *
 * If the brand standards change, update this file FIRST, then mirror into
 * index.html's inline Tailwind config. The runtime assertion will alert you
 * if the mirror is missed.
 */

// Canonical brand palette (Troy Brand Standards, page 13)
export const BRAND_COLORS = Object.freeze({
    cardinal: Object.freeze({
        DEFAULT: '#910039',  // Trojan Cardinal — Pantone 202C/1807U
        dark: '#720724',     // Dark Cardinal
    }),
    sand: '#f1efe3',         // Sand — single brand-standard sand (per ruleset v2.4)
    wheat: '#efd19f',        // Wheat — Pantone 155C (single canonical wheat)
    black: '#231F20',        // Black (Troy brand black, NOT pure #000000)
    grey: '#999999',         // Grey — Pantone 877 Metallic
    // White (#ffffff) is Tailwind's built-in `white` and needs no override.
});

/**
 * Verify that the inline Tailwind config in index.html mirrors BRAND_COLORS.
 * Call this at app boot to detect drift. Prints a console.error if mismatched
 * but does not throw — the app should keep running.
 *
 * @param {object} tailwindColors - typically `tailwind.config.theme.extend.colors`
 * @returns {boolean} true if mirrored, false otherwise
 */
export function assertTailwindMirrorsBrandColors(tailwindColors) {
    if (!tailwindColors) {
        console.error('[color-tokens] Tailwind config not found at runtime.');
        return false;
    }

    const mismatches = [];
    const tw = tailwindColors;

    // Cardinal
    if (tw.cardinal?.DEFAULT !== BRAND_COLORS.cardinal.DEFAULT) {
        mismatches.push(`cardinal.DEFAULT: tailwind=${tw.cardinal?.DEFAULT} brand=${BRAND_COLORS.cardinal.DEFAULT}`);
    }
    if (tw.cardinal?.dark !== BRAND_COLORS.cardinal.dark) {
        mismatches.push(`cardinal.dark: tailwind=${tw.cardinal?.dark} brand=${BRAND_COLORS.cardinal.dark}`);
    }
    // Singular-value tokens
    for (const key of ['sand', 'wheat', 'black', 'grey']) {
        if (tw[key] !== BRAND_COLORS[key]) {
            mismatches.push(`${key}: tailwind=${tw[key]} brand=${BRAND_COLORS[key]}`);
        }
    }

    if (mismatches.length > 0) {
        console.error(
            '[color-tokens] Tailwind config has drifted from js/color-tokens.js BRAND_COLORS. ' +
            'Update index.html inline Tailwind config to match. Drifts:\n  ' +
            mismatches.join('\n  ')
        );
        return false;
    }
    return true;
}

export default BRAND_COLORS;
