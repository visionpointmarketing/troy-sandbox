/**
 * TROY Sandbox — Design Rules Validation
 *
 * Implements the page-level background discipline rules from
 * `reskin-docs/TROY Web Reskin CSS Ruleset.md` (v2.4, April 16, 2026).
 *
 * Returns soft warnings (allows but warns) rather than hard blocks, matching
 * the canvas-builder UX expectation.
 *
 * Ruleset summary (v2.4):
 *  - 4 visual weight categories: Cardinal, Black, Sand, Light (white default)
 *  - No more than 2 consecutive sections of the same visual weight
 *  - Cardinal → Cardinal: NOT allowed
 *  - Black   → Black:    NOT allowed
 *  - Sand    → Sand:     NOT allowed (would create a sand "base")
 *  - Cardinal → Black or Black → Cardinal: ALLOWED (distinct weights)
 *  - No more than 2 emphasis (cardinal+black) sections in a row
 *  - Combined emphasis target ~25–35% of content sections
 *  - Sand has no hard cap; should not exceed ~35%
 *  - White target ~25–35%
 *  - Halftone: maximum 1 textured zone per page
 *
 * NOT yet enforced here (deferred to a later layer, see docs/DESIGN-RULES.md):
 *  - Halftone-behind-text-size readability check (Section 5.6)
 *  - Asset-background conflict detection (separate ruleset)
 *  - One-primary-CTA-per-page (Section 6)
 *  - Helpful Links block standardization (Section 2.5 of Component Library)
 */

import {
    getVisualWeight,
    isHalftone,
} from './color-config.js';

/** Canonical ruleset version this engine implements. */
export const RULESET_VERSION = '2.4';

/**
 * Distribution targets and firing thresholds.
 *
 * The v2.4 ruleset (§5.4c, §5.8, §10.3) describes its percentages as a
 * "guideline" — "should comprise roughly 25–35%". For typical 10–12 section
 * pages that maps cleanly to "3–4 emphasis sections total", but on shorter
 * pages a strict percentage interpretation becomes punitive (a 7-section page
 * with 3 emphasis = 43%, which is normal and intentional).
 *
 * We separate two concepts:
 *   - IDEAL — what the v2.4 doc recommends as the ideal target. Always shown
 *     in the toolbar count popover so the user sees the guideline.
 *   - THRESHOLDS — when the engine actually fires an info notice. These are
 *     wider than the ideal so the user has flexibility for 3–4 emphasis
 *     sections on shorter pages, more white-heavy pages, etc.
 *
 * Hard rules (consecutive same weight, max emphasis run, halftone cap) are
 * NOT distribution-based and are not affected by this — they fire as written
 * in the ruleset.
 */
export const TARGETS = Object.freeze({
    // Ideal targets per v2.4 ruleset — shown in the count popover.
    idealEmphasisMin: 0.25,
    idealEmphasisMax: 0.35,
    idealSandMax: 0.35,
    idealWhiteMin: 0.25,
    idealWhiteMax: 0.35,

    // Firing thresholds — info only fires when the page is significantly
    // outside the ideal range, leaving a generous flexibility zone.
    emphasisMin: 0.15,   // info fires below this (page feels flat)
    emphasisMax: 0.50,   // info fires above this (page feels emphasis-heavy)
    sandMax: 0.50,       // info fires when sand truly dominates
    whiteMin: 0.15,      // info fires when white is too sparse

    // Hard limits (unchanged — these come straight from v2.4).
    maxConsecutiveSameWeight: 2,
    maxConsecutiveEmphasis: 2,
    maxHalftone: 1,
});

/**
 * Visual weight for section types that don't expose the color picker but
 * have a fixed visual character (image-based hero/CTA, brand-story with
 * cardinal/black overlay, etc.).
 *
 * The rules engine consults this BEFORE falling back to colors.background,
 * so a Hero section with a dark image overlay is correctly classified as
 * "black" weight rather than "light" — which is what a viewer actually sees.
 *
 * Picker-enabled sections (statistics, academic-excellence, latest-stories,
 * promo-carousel, split-layout, content-spotlight, program-hero, in-page-nav)
 * are NOT in this map — they use the user's color choice.
 */
const INTRINSIC_WEIGHTS = Object.freeze({
    hero: 'black',         // Full-width image with dark gradient overlay
    'final-cta': 'black',  // bg-black content block on dark image
    // brand-story is classified dynamically below (depends on overlayColor field)
});

/**
 * Determine the visual weight category for a section.
 *
 * Order of precedence:
 *   1. brand-story: overlayColor field ('cardinal' default, or 'black')
 *   2. INTRINSIC_WEIGHTS map for fixed-context sections
 *   3. colors.background → getVisualWeight()
 *
 * @param {object} section - section object from state
 * @returns {'cardinal' | 'black' | 'sand' | 'light'}
 */
export function classifySection(section) {
    if (!section) return 'light';

    // brand-story: weight depends on the overlayColor field, not colors.background
    if (section.type === 'brand-story') {
        return section.content?.overlayColor === 'black' ? 'black' : 'cardinal';
    }

    if (INTRINSIC_WEIGHTS[section.type]) {
        return INTRINSIC_WEIGHTS[section.type];
    }

    return getVisualWeight(section?.colors?.background || 'white');
}

/**
 * Validate sections against the v2.4 ruleset.
 *
 * @param {Array} sections - Section objects with .type and .colors.background
 * @returns {{
 *   valid: boolean,
 *   warnings: Array<{ type: string, severity: 'warning'|'info', message: string }>,
 *   counts: { cardinal: number, black: number, sand: number, light: number, halftone: number, total: number },
 *   percentages: { emphasis: number, sand: number, white: number },
 * }}
 */
export function validateDesignRules(sections) {
    if (!sections || sections.length === 0) {
        return {
            valid: true,
            warnings: [],
            counts: { cardinal: 0, black: 0, sand: 0, light: 0, halftone: 0, total: 0 },
            percentages: { emphasis: 0, sand: 0, white: 0 },
        };
    }

    const warnings = [];
    const counts = { cardinal: 0, black: 0, sand: 0, light: 0, halftone: 0, total: sections.length };

    // Walk once: classify each section by weight, track consecutive runs
    const weights = [];
    let prevWeight = null;
    let sameRun = 1;
    let emphasisRun = 0;
    let maxEmphasisRun = 0;

    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const bg = section?.colors?.background || 'white';
        // classifySection handles fixed-context sections (hero/brand-story/final-cta)
        // by their visual character, not their (often unset) colors.background.
        const weight = classifySection(section);
        weights.push(weight);

        // Tally counts
        counts[weight] = (counts[weight] || 0) + 1;
        if (isHalftone(bg)) counts.halftone++;

        // Same-weight consecutive run
        if (prevWeight !== null && weight === prevWeight) {
            sameRun++;
            if (sameRun > TARGETS.maxConsecutiveSameWeight) {
                warnings.push({
                    type: 'consecutive-same-weight',
                    severity: 'warning',
                    message: `${sameRun} consecutive ${weight} sections (max ${TARGETS.maxConsecutiveSameWeight} allowed). Insert a different weight to break the run.`,
                    index: i,
                    weight,
                });
            } else if (sameRun === 2 && (weight === 'cardinal' || weight === 'black' || weight === 'sand')) {
                // Two-in-a-row of an emphasis or sand weight is the v2.4 hard cap.
                // Cardinal→Cardinal, Black→Black, Sand→Sand are not allowed.
                warnings.push({
                    type: `consecutive-${weight}`,
                    severity: 'warning',
                    message: weight === 'sand'
                        ? `Two consecutive sand sections (would read as a sand "base"). Separate them with a different weight.`
                        : `Two consecutive ${weight} sections (same-weight emphasis runs are not allowed). Separate them with a different weight.`,
                    index: i,
                    weight,
                });
            }
        } else {
            sameRun = 1;
        }

        // Emphasis run (cardinal + black combined)
        if (weight === 'cardinal' || weight === 'black') {
            emphasisRun++;
            maxEmphasisRun = Math.max(maxEmphasisRun, emphasisRun);
        } else {
            emphasisRun = 0;
        }

        prevWeight = weight;
    }

    // Distribution percentages
    const total = sections.length;
    const emphasisCount = counts.cardinal + counts.black;
    const emphasisPct = emphasisCount / total;
    const sandPct = counts.sand / total;
    const whitePct = counts.light / total;

    // Emphasis run length
    if (maxEmphasisRun > TARGETS.maxConsecutiveEmphasis) {
        warnings.push({
            type: 'emphasis-run',
            severity: 'warning',
            message: `${maxEmphasisRun} emphasis sections in a row (max ${TARGETS.maxConsecutiveEmphasis}). Cardinal→Black is fine, but Cardinal→Black→Cardinal needs a sand or white break.`,
            count: maxEmphasisRun,
        });
    }

    // Halftone cap (hard rule per Section 5.6)
    if (counts.halftone > TARGETS.maxHalftone) {
        warnings.push({
            type: 'halftone-limit',
            severity: 'warning',
            message: `${counts.halftone} halftone textures used (max ${TARGETS.maxHalftone} per page).`,
            count: counts.halftone,
            limit: TARGETS.maxHalftone,
        });
    }

    // Distribution guidance — only when there's enough content to evaluate.
    // Below 4 sections, percentage feedback is noisy.
    if (total >= 4) {
        if (emphasisPct > TARGETS.emphasisMax) {
            warnings.push({
                type: 'emphasis-distribution-high',
                severity: 'info',
                message: `${Math.round(emphasisPct * 100)}% emphasis sections (target 25–35%). Consider reducing cardinal/black sections.`,
            });
        } else if (emphasisPct < TARGETS.emphasisMin && total >= 6) {
            warnings.push({
                type: 'emphasis-distribution-low',
                severity: 'info',
                message: `${Math.round(emphasisPct * 100)}% emphasis sections (target 25–35%). Page may feel flat — consider adding a cardinal or black emphasis.`,
            });
        }

        if (sandPct > TARGETS.sandMax) {
            warnings.push({
                type: 'sand-distribution-high',
                severity: 'info',
                message: `${Math.round(sandPct * 100)}% sand sections (soft ceiling 35%). Sand should bridge rhythm, not become a base.`,
            });
        }

        if (whitePct < TARGETS.whiteMin && total >= 6) {
            warnings.push({
                type: 'white-distribution-low',
                severity: 'info',
                message: `${Math.round(whitePct * 100)}% white sections (target 25–35%). White should remain the page's base.`,
            });
        }
    }

    return {
        valid: warnings.filter(w => w.severity === 'warning').length === 0,
        warnings,
        counts,
        percentages: {
            emphasis: emphasisPct,
            sand: sandPct,
            white: whitePct,
        },
    };
}

/**
 * Get a summary status message for the toolbar pill.
 *
 * @param {object} validationResult - Result from validateDesignRules
 * @returns {{ type: 'success'|'warning'|'info', message: string, details?: string[], icon: string }}
 */
export function getStatusMessage(validationResult) {
    const warnings = validationResult.warnings;
    const hardWarnings = warnings.filter(w => w.severity === 'warning');
    const infos = warnings.filter(w => w.severity === 'info');

    if (warnings.length === 0) {
        return {
            type: 'success',
            message: 'Design rules: OK',
            icon: 'check',
        };
    }

    if (hardWarnings.length > 0) {
        return {
            type: 'warning',
            message: `${hardWarnings.length} design rule warning${hardWarnings.length > 1 ? 's' : ''}`,
            details: warnings.map(w => w.message),
            icon: 'alert',
        };
    }

    // Info-only
    return {
        type: 'info',
        message: `${infos.length} rhythm note${infos.length > 1 ? 's' : ''}`,
        details: warnings.map(w => w.message),
        icon: 'alert',
    };
}

/**
 * Preview validation as if a new section were appended.
 *
 * @param {Array} currentSections
 * @param {string} newSectionType
 * @param {string} [newBackgroundColor='white']
 * @returns {object} Validation preview
 */
export function previewAddSection(currentSections, newSectionType, newBackgroundColor = 'white') {
    const preview = [...currentSections, {
        type: newSectionType,
        colors: { background: newBackgroundColor },
    }];
    return validateDesignRules(preview);
}

export default {
    RULESET_VERSION,
    TARGETS,
    validateDesignRules,
    getStatusMessage,
    previewAddSection,
};
