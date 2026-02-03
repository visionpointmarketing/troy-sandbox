/**
 * TROY Sandbox — Color Configuration
 * Central color definitions and contrast logic for section backgrounds
 */

// Available background colors with their properties
export const COLORS = {
    // Light backgrounds (dark text)
    white: {
        hex: '#ffffff',
        bgClass: 'bg-white',
        isDark: false,
        hasHalftone: false,
        label: 'White'
    },
    sand: {
        hex: '#f1efe3',
        bgClass: 'bg-sand',
        isDark: false,
        hasHalftone: true,
        label: 'Sand'
    },
    'sand-300': {
        hex: '#e8e6da',
        bgClass: 'bg-sand-300',
        isDark: false,
        hasHalftone: false,
        label: 'Sand Dark'
    },
    wheat: {
        hex: '#efd19f',
        bgClass: 'bg-wheat',
        isDark: false,
        hasHalftone: false,
        label: 'Wheat'
    },

    // Dark backgrounds (light text)
    cardinal: {
        hex: '#910039',
        bgClass: 'bg-cardinal',
        isDark: true,
        hasHalftone: false,
        label: 'Cardinal'
    },
    'cardinal-900': {
        hex: '#720724',
        bgClass: 'bg-cardinal-900',
        isDark: true,
        hasHalftone: false,
        label: 'Cardinal Dark'
    },
    black: {
        hex: '#1a1a1a',
        bgClass: 'bg-[#1a1a1a]',
        isDark: true,
        hasHalftone: false,
        label: 'Black'
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
