/**
 * TROY Sandbox — Color Configuration
 *
 * Maps the canonical brand palette (js/color-tokens.js) onto the section
 * background options shown in the color picker, plus contrast-pairing logic.
 *
 * Aligned with:
 *   - Troy Brand Standards FINAL.pdf (Color Palette, page 13)
 *   - reskin-docs/TROY Web Reskin CSS Ruleset.md (v2.4)
 *
 * Key v2.4 alignment notes:
 *   - Sand has a single brand-standard variant (#f1efe3). The previous
 *     "Sand Dark" (#e8e6da) was explicitly removed in ruleset v2.4.
 *   - Cardinal and Black are distinct visual weights for rhythm purposes
 *     (see COLOR_FAMILIES below and js/design-rules.js).
 *   - Wheat is a single canonical color (#efd19f, Pantone 155C) used as
 *     ~10% of the canvas — never as a section-level background in this tool.
 *     It appears as accent on dark backgrounds via the contrast config.
 */

import { BRAND_COLORS } from './color-tokens.js';

/**
 * Color family groupings for design rule validation.
 *
 * The v2.4 ruleset treats Cardinal and Black as DISTINCT visual weights —
 * they may sit adjacent to each other (Cardinal → Black is allowed) but
 * neither may sit consecutively with itself. js/design-rules.js consumes
 * these groupings.
 */
export const COLOR_FAMILIES = {
    cardinal: ['cardinal', 'cardinal-dark', 'cardinal-halftone', 'cardinal-wheat-halftone'],
    black: ['black'],
    sand: ['sand', 'sand-halftone'],
    halftone: ['sand-halftone', 'cardinal-halftone', 'cardinal-wheat-halftone'],
};

/**
 * Available section background colors, with rendering metadata.
 *
 * `bgClass` is the Tailwind class applied to the section wrapper.
 * `halftoneClass` is the optional overlay class from static/base.css.
 * `colorFamily` is informational; rule validation uses COLOR_FAMILIES + helpers.
 */
export const COLORS = {
    // Light backgrounds (dark text)
    white: {
        hex: '#ffffff',
        bgClass: 'bg-white',
        isDark: false,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'light',
        label: 'White',
    },
    sand: {
        hex: BRAND_COLORS.sand,
        bgClass: 'bg-sand',
        isDark: false,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'sand',
        label: 'Sand',
    },
    'sand-halftone': {
        hex: BRAND_COLORS.sand,
        bgClass: 'bg-sand',
        isDark: false,
        hasHalftone: true,
        halftoneClass: 'vp-halftone-overlay vp-halftone-light',
        colorFamily: 'sand',
        label: 'Sand Halftone',
    },

    // Dark backgrounds (light text)
    cardinal: {
        hex: BRAND_COLORS.cardinal.DEFAULT,
        bgClass: 'bg-cardinal',
        isDark: true,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'cardinal',
        label: 'Cardinal',
    },
    'cardinal-dark': {
        hex: BRAND_COLORS.cardinal.dark,
        bgClass: 'bg-cardinal-dark',
        isDark: true,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'cardinal',
        label: 'Cardinal Dark',
    },
    black: {
        hex: BRAND_COLORS.black,
        bgClass: 'bg-black',
        isDark: true,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'black',
        label: 'Black',
    },
    'cardinal-halftone': {
        hex: BRAND_COLORS.cardinal.DEFAULT,
        bgClass: 'bg-cardinal',
        isDark: true,
        hasHalftone: true,
        halftoneClass: 'vp-halftone-overlay vp-halftone-dark',
        colorFamily: 'cardinal',
        label: 'Cardinal Halftone',
    },
    'cardinal-wheat-halftone': {
        hex: BRAND_COLORS.cardinal.DEFAULT,
        bgClass: 'bg-cardinal',
        isDark: true,
        hasHalftone: true,
        halftoneClass: 'vp-halftone-overlay vp-halftone-wheat-cardinal',
        colorFamily: 'cardinal',
        label: 'Cardinal + Wheat Halftone',
    },
};

/**
 * Get contrast-appropriate classes based on background color
 * @param {string} colorKey - The color key from COLORS
 * @param {number} _depth - Internal recursion guard
 * @returns {object} Object with text, badge, header accent classes
 */
export function getContrastConfig(colorKey, _depth = 0) {
    const color = COLORS[colorKey];

    if (!color) {
        // Prevent infinite recursion if 'sand' is somehow missing
        if (_depth > 0) {
            // Return safe defaults
            return {
                text: 'text-black',
                textMuted: 'text-black/80',
                badgeBg: 'bg-cardinal',
                badgeText: 'text-white',
                headerAccent: '',
                headerAccentCenter: '',
                categoryText: 'text-cardinal',
                showHalftone: false,
            };
        }
        // Default to light background config
        return getContrastConfig('sand', _depth + 1);
    }

    if (color.isDark) {
        // Dark background — use light text. Wheat reads well as accent on dark
        // per Brand Standards page 14 (Color Accessibility) — wheat text on
        // cardinal/black is compliant.
        return {
            text: 'text-white',
            textMuted: 'text-white/80',
            badgeBg: 'bg-wheat',
            badgeText: 'text-black',
            headerAccent: '',
            headerAccentCenter: '',
            categoryText: 'text-wheat',
            showHalftone: false,
        };
    } else {
        // Light background — use dark text with cardinal accent.
        return {
            text: 'text-black',
            textMuted: 'text-black/80',
            badgeBg: 'bg-cardinal',
            badgeText: 'text-white',
            headerAccent: '',
            headerAccentCenter: '',
            categoryText: 'text-cardinal',
            showHalftone: color.hasHalftone,
        };
    }
}

/**
 * Get available colors for section backgrounds
 * @returns {Array} Array of color objects with key and properties
 */
export function getSectionBackgroundColors() {
    return Object.entries(COLORS).map(([key, value]) => ({
        key,
        ...value,
    }));
}

/**
 * Get default colors for a section type
 * @param {string} sectionType - The section type
 * @returns {object} Default colors object
 */
export function getDefaultColors(sectionType) {
    const defaults = {
        'statistics': { background: 'sand' },
        'academic-excellence': { background: 'white' },
        'latest-stories': { background: 'sand' },
        'promo-carousel': { background: 'black' },
        'split-layout': { background: 'black' },
        'content-spotlight': { background: 'sand' },
        'program-hero': { background: 'cardinal-halftone' },
        'in-page-nav': { background: 'white' },
    };

    return defaults[sectionType] || { background: 'white' };
}

/**
 * Get inline background style for colors with background images
 * @param {string} colorKey - The color key from COLORS
 * @returns {string} Inline style string or empty string
 */
export function getBackgroundStyle(colorKey) {
    const color = COLORS[colorKey];
    if (!color) return '';
    // Halftone is handled via CSS classes; no inline style needed.
    return '';
}

/**
 * Get halftone classes for a color
 * @param {string} colorKey - The color key from COLORS
 * @returns {string} Halftone classes or empty string
 */
export function getHalftoneClasses(colorKey) {
    const color = COLORS[colorKey];
    if (!color) return '';
    return color.halftoneClass || '';
}

// --- Family membership helpers (used by design-rules.js) ---

/**
 * Check if a color is in the sand family
 * @param {string} colorKey
 * @returns {boolean}
 */
export function isSandFamily(colorKey) {
    return COLOR_FAMILIES.sand.includes(colorKey);
}

/**
 * Check if a color is in the cardinal family
 * @param {string} colorKey
 * @returns {boolean}
 */
export function isCardinalFamily(colorKey) {
    return COLOR_FAMILIES.cardinal.includes(colorKey);
}

/**
 * Check if a color is in the black family
 * @param {string} colorKey
 * @returns {boolean}
 */
export function isBlackFamily(colorKey) {
    return COLOR_FAMILIES.black.includes(colorKey);
}

/**
 * Combined emphasis check — cardinal OR black (for "dark emphasis" totals).
 * Kept for backwards compatibility with any external callers; new code
 * should prefer isCardinalFamily / isBlackFamily.
 * @param {string} colorKey
 * @returns {boolean}
 */
export function isDarkFamily(colorKey) {
    return isCardinalFamily(colorKey) || isBlackFamily(colorKey);
}

/**
 * Check if a color has halftone texture
 * @param {string} colorKey
 * @returns {boolean}
 */
export function isHalftone(colorKey) {
    return COLOR_FAMILIES.halftone.includes(colorKey);
}

/**
 * Determine the visual weight category (per ruleset v2.4) for a section's
 * background color. Returns one of: 'cardinal', 'black', 'sand', 'light'.
 * Used by the rules engine to validate rhythm.
 *
 * @param {string} colorKey
 * @returns {'cardinal' | 'black' | 'sand' | 'light'}
 */
export function getVisualWeight(colorKey) {
    if (isCardinalFamily(colorKey)) return 'cardinal';
    if (isBlackFamily(colorKey)) return 'black';
    if (isSandFamily(colorKey)) return 'sand';
    return 'light';
}

// --- Migration helpers ---

/**
 * Mapping from deprecated color keys to their replacements.
 * Used by migrateColorTokens() to upgrade saved templates and JSON imports
 * created before the brand-palette cleanup.
 */
const DEPRECATED_COLOR_KEYS = Object.freeze({
    'sand-300': 'sand',           // Removed in ruleset v2.4 (non-standard darker sand)
    'cardinal-900': 'cardinal-dark', // Renamed for brand alignment
    'cardinal-800': 'cardinal',      // Renamed for brand alignment
});

/**
 * Walk a sections array (in place) and rewrite any deprecated color keys to
 * their current equivalents. Returns the count of rewrites applied so callers
 * can decide whether to surface a one-shot toast.
 *
 * Safe to call multiple times — idempotent.
 *
 * @param {Array} sections - Array of section objects (mutated in place).
 * @returns {number} Number of color references rewritten.
 */
export function migrateColorTokens(sections) {
    if (!Array.isArray(sections)) return 0;
    let rewrites = 0;

    for (const section of sections) {
        if (!section || !section.colors) continue;
        for (const [field, value] of Object.entries(section.colors)) {
            if (typeof value === 'string' && DEPRECATED_COLOR_KEYS[value]) {
                section.colors[field] = DEPRECATED_COLOR_KEYS[value];
                rewrites++;
            }
        }
    }

    return rewrites;
}
