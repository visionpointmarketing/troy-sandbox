/**
 * TROY Sandbox — Color Configuration
 * Central color definitions and contrast logic for section backgrounds
 * Updated to align with Troy VP Reskin V2 design rules
 */

// Color family groupings for design rule validation
export const COLOR_FAMILIES = {
    sand: ['sand', 'sand-300', 'sand-halftone'],
    dark: ['cardinal', 'cardinal-900', 'black', 'cardinal-halftone', 'cardinal-wheat-halftone'],
    halftone: ['sand-halftone', 'cardinal-halftone', 'cardinal-wheat-halftone']
};

// Available background colors with their properties
export const COLORS = {
    // Light backgrounds (dark text)
    white: {
        hex: '#ffffff',
        bgClass: 'bg-white',
        isDark: false,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'neutral',
        label: 'White'
    },
    sand: {
        hex: '#f1efe3',
        bgClass: 'bg-sand',
        isDark: false,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'sand',
        label: 'Sand'
    },
    'sand-300': {
        hex: '#e8e6da',
        bgClass: 'bg-sand-300',
        isDark: false,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'sand',
        label: 'Sand Dark'
    },
    'sand-halftone': {
        hex: '#f1efe3',
        bgClass: 'bg-sand',
        isDark: false,
        hasHalftone: true,
        halftoneClass: 'vp-halftone-overlay vp-halftone-light',
        colorFamily: 'sand',
        label: 'Sand Halftone'
    },
    wheat: {
        hex: '#efd19f',
        bgClass: 'bg-wheat',
        isDark: false,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'neutral',
        label: 'Wheat'
    },

    // Dark backgrounds (light text)
    cardinal: {
        hex: '#910039',
        bgClass: 'bg-cardinal',
        isDark: true,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'dark',
        label: 'Cardinal'
    },
    'cardinal-900': {
        hex: '#720724',
        bgClass: 'bg-cardinal-900',
        isDark: true,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'dark',
        label: 'Cardinal Dark'
    },
    black: {
        hex: '#1a1a1a',
        bgClass: 'bg-[#1a1a1a]',
        isDark: true,
        hasHalftone: false,
        halftoneClass: null,
        colorFamily: 'dark',
        label: 'Black'
    },
    'cardinal-halftone': {
        hex: '#910039',
        bgClass: 'bg-cardinal',
        isDark: true,
        hasHalftone: true,
        halftoneClass: 'vp-halftone-overlay vp-halftone-dark',
        colorFamily: 'dark',
        label: 'Cardinal Halftone'
    },
    'cardinal-wheat-halftone': {
        hex: '#910039',
        bgClass: 'bg-cardinal',
        isDark: true,
        hasHalftone: true,
        halftoneClass: 'vp-halftone-overlay vp-halftone-wheat-cardinal',
        colorFamily: 'dark',
        label: 'Cardinal + Wheat Halftone'
    }
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
                badgeBg: 'bg-cardinal-800',
                badgeText: 'text-white',
                headerAccent: 'section-header section-header-black',
                headerAccentCenter: 'section-header-center section-header-black',
                categoryText: 'text-cardinal-800',
                showHalftone: false
            };
        }
        // Default to light background config
        return getContrastConfig('sand', _depth + 1);
    }

    if (color.isDark) {
        // Dark background - use light text
        return {
            text: 'text-white',
            textMuted: 'text-white/80',
            badgeBg: 'bg-wheat',
            badgeText: 'text-black',
            headerAccent: 'section-header section-header-light',
            headerAccentCenter: 'section-header-center-light',
            categoryText: 'text-wheat',
            showHalftone: false
        };
    } else {
        // Light background - use dark text
        return {
            text: 'text-black',
            textMuted: 'text-black/80',
            badgeBg: 'bg-cardinal-800',
            badgeText: 'text-white',
            headerAccent: 'section-header section-header-black',
            headerAccentCenter: 'section-header-center section-header-black',
            categoryText: 'text-cardinal-800',
            showHalftone: color.hasHalftone
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
        ...value
    }));
}

/**
 * Get available colors for card backgrounds (light colors only)
 * @returns {Array} Array of light color objects
 */
export function getCardBackgroundColors() {
    return Object.entries(COLORS)
        .filter(([_, value]) => !value.isDark)
        .map(([key, value]) => ({
            key,
            ...value
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
        'academic-excellence': { background: 'white', cardBackground: 'white' },
        'latest-stories': { background: 'sand', cardBackground: 'white' }
    };

    return defaults[sectionType] || { background: 'white' };
}

/**
 * Check if a section type has cards
 * @param {string} sectionType - The section type
 * @returns {boolean}
 */
export function sectionHasCards(sectionType) {
    const sectionsWithCards = ['academic-excellence', 'latest-stories'];
    return sectionsWithCards.includes(sectionType);
}

/**
 * Get inline background style for colors with background images
 * @param {string} colorKey - The color key from COLORS
 * @returns {string} Inline style string or empty string
 */
export function getBackgroundStyle(colorKey) {
    const color = COLORS[colorKey];
    if (!color) return '';

    // No longer using bgImage - halftone handled via CSS classes
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

/**
 * Check if a color is in the sand family
 * @param {string} colorKey - The color key from COLORS
 * @returns {boolean}
 */
export function isSandFamily(colorKey) {
    return COLOR_FAMILIES.sand.includes(colorKey);
}

/**
 * Check if a color is in the dark/emphasis family
 * @param {string} colorKey - The color key from COLORS
 * @returns {boolean}
 */
export function isDarkFamily(colorKey) {
    return COLOR_FAMILIES.dark.includes(colorKey);
}

/**
 * Check if a color has halftone texture
 * @param {string} colorKey - The color key from COLORS
 * @returns {boolean}
 */
export function isHalftone(colorKey) {
    return COLOR_FAMILIES.halftone.includes(colorKey);
}
