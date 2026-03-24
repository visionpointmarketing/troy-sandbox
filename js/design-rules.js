/**
 * TROY Sandbox — Design Rules Validation
 * Validates page layouts against Troy VP Reskin V2 design rules
 * Returns soft warnings (allows but warns) rather than hard blocks
 */

import { COLORS, COLOR_FAMILIES, isSandFamily, isDarkFamily, isHalftone } from './color-config.js';

// Design rule limits per Troy VP Reskin V2
const RULES = {
    maxSandSections: 2,        // Max sand-family backgrounds per page
    maxDarkSections: 1,        // Max cardinal/black backgrounds (excluding hero)
    maxHalftoneSections: 1,    // Max halftone textures per page
    heroExemptFromDarkCount: true  // Hero sections don't count toward dark limit
};

/**
 * Validate sections against design rules
 * @param {Array} sections - Array of section objects from state
 * @returns {Object} Validation result with warnings array
 */
export function validateDesignRules(sections) {
    const warnings = [];

    if (!sections || sections.length === 0) {
        return { valid: true, warnings: [] };
    }

    // Count backgrounds by family
    const counts = {
        sand: 0,
        dark: 0,
        halftone: 0
    };

    // Track consecutive sand sections
    let consecutiveSand = 0;
    let maxConsecutiveSand = 0;
    let lastWasSand = false;

    sections.forEach((section, index) => {
        const bgColor = section.colors?.background || 'white';
        const isHeroSection = section.type === 'hero';

        // Count sand family
        if (isSandFamily(bgColor)) {
            counts.sand++;
            consecutiveSand = lastWasSand ? consecutiveSand + 1 : 1;
            maxConsecutiveSand = Math.max(maxConsecutiveSand, consecutiveSand);
            lastWasSand = true;
        } else {
            lastWasSand = false;
            consecutiveSand = 0;
        }

        // Count dark family (hero exempt)
        if (isDarkFamily(bgColor)) {
            if (!isHeroSection || !RULES.heroExemptFromDarkCount) {
                counts.dark++;
            }
        }

        // Count halftone
        if (isHalftone(bgColor)) {
            counts.halftone++;
        }
    });

    // Check sand limit
    if (counts.sand > RULES.maxSandSections) {
        warnings.push({
            type: 'sand-limit',
            severity: 'warning',
            message: `${counts.sand} sand backgrounds used (max ${RULES.maxSandSections} recommended)`,
            count: counts.sand,
            limit: RULES.maxSandSections
        });
    }

    // Check dark/emphasis limit
    if (counts.dark > RULES.maxDarkSections) {
        warnings.push({
            type: 'dark-limit',
            severity: 'warning',
            message: `${counts.dark} dark emphasis section${counts.dark > 1 ? 's' : ''} used (max ${RULES.maxDarkSections} recommended, hero exempt)`,
            count: counts.dark,
            limit: RULES.maxDarkSections
        });
    }

    // Check halftone limit
    if (counts.halftone > RULES.maxHalftoneSections) {
        warnings.push({
            type: 'halftone-limit',
            severity: 'warning',
            message: `${counts.halftone} halftone textures used (max ${RULES.maxHalftoneSections} recommended)`,
            count: counts.halftone,
            limit: RULES.maxHalftoneSections
        });
    }

    // Check consecutive sand sections
    if (maxConsecutiveSand > 1) {
        warnings.push({
            type: 'consecutive-sand',
            severity: 'info',
            message: `${maxConsecutiveSand} consecutive sand sections (consider varying backgrounds)`,
            count: maxConsecutiveSand
        });
    }

    return {
        valid: warnings.length === 0,
        warnings,
        counts
    };
}

/**
 * Get a summary status message
 * @param {Object} validationResult - Result from validateDesignRules
 * @returns {Object} Status object with type and message
 */
export function getStatusMessage(validationResult) {
    if (validationResult.valid) {
        return {
            type: 'success',
            message: 'Design rules: OK',
            icon: 'check'
        };
    }

    const warningCount = validationResult.warnings.length;
    const messages = validationResult.warnings.map(w => w.message);

    return {
        type: 'warning',
        message: `${warningCount} design rule warning${warningCount > 1 ? 's' : ''}`,
        details: messages,
        icon: 'alert'
    };
}

/**
 * Check if adding a section would violate any rules
 * @param {Array} currentSections - Current sections array
 * @param {string} newSectionType - Type of section being added
 * @param {string} newBackgroundColor - Background color being set
 * @returns {Object} Preview of validation after adding
 */
export function previewAddSection(currentSections, newSectionType, newBackgroundColor = 'white') {
    const preview = [...currentSections, {
        type: newSectionType,
        colors: { background: newBackgroundColor }
    }];
    return validateDesignRules(preview);
}

export default {
    validateDesignRules,
    getStatusMessage,
    previewAddSection,
    RULES
};
