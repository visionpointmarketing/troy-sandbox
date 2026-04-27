/**
 * TROY Sandbox — Rules Engine Test Suite
 *
 * Systematic browser-runnable tests for js/design-rules.js, the migration
 * shim in js/color-config.js, and brand-token integrity in js/color-tokens.js.
 *
 * Coverage map vs. reskin-docs/TROY Web Reskin CSS Ruleset.md (v2.4):
 *   - §5.8 Visual rhythm (4 weight categories, max 2 same-weight consecutive,
 *     light exception, 3+ flatness)
 *   - §5.4  Cardinal sections — no Cardinal→Cardinal
 *   - §5.4b Black sections — no Black→Black
 *   - §5.3  Sand sections — no Sand→Sand, ≤35% soft ceiling
 *   - §5.4c Combined emphasis — Cardinal↔Black allowed, max 2 in a row, 25–35% target
 *   - §5.6  Halftone — max 1 per page
 *   - §5.2  White — 25–35% target (lower bound)
 *   - Brand Standards page 13: canonical color hexes
 *   - Visual character of fixed-context sections (hero, brand-story, final-cta)
 *   - Migration shim: deprecated key rewrites
 *
 * To run:
 *   1. Start a local server in the project root: python -m http.server 8000
 *   2. Open http://localhost:8000/tests/index.html
 *
 * Adding a test: drop a new entry into the TESTS array below. Each entry runs
 * in a try/catch so one failure doesn't halt the suite.
 */

import {
    validateDesignRules,
    getStatusMessage,
    classifySection,
    previewAddSection,
    RULESET_VERSION,
    TARGETS,
} from '../js/design-rules.js';
import {
    migrateColorTokens,
    getVisualWeight,
    getDefaultColors,
    COLORS,
    COLOR_FAMILIES,
    isCardinalFamily,
    isBlackFamily,
    isSandFamily,
    isHalftone,
} from '../js/color-config.js';
import { BRAND_COLORS } from '../js/color-tokens.js';
import pageTemplates from '../js/page-templates.js';

// =============================================================================
// Test helpers
// =============================================================================

/** Build a section object with terse syntax. */
function sec(type, bg = null, content = {}) {
    const out = { type, content };
    if (bg !== null) out.colors = { background: bg };
    return out;
}

/** Hard assertion. */
function assert(cond, message = 'Assertion failed') {
    if (!cond) throw new Error(message);
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(
            `${message || 'assertEqual failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
        );
    }
}

function assertWarningType(result, type) {
    const found = result.warnings.some(w => w.type === type);
    if (!found) {
        const got = result.warnings.map(w => `${w.type}(${w.severity})`).join(', ') || '(none)';
        throw new Error(`expected warning type "${type}"; got: ${got}`);
    }
}

function assertNoWarningType(result, type) {
    if (result.warnings.some(w => w.type === type)) {
        throw new Error(`unexpected warning type "${type}" present`);
    }
}

function assertNoHardWarnings(result) {
    const hard = result.warnings.filter(w => w.severity === 'warning');
    if (hard.length > 0) {
        throw new Error(
            `expected no hard warnings; got: ${hard.map(w => w.type).join(', ')}`
        );
    }
}

function assertWarningCount(result, severity, count) {
    const filtered = result.warnings.filter(w => w.severity === severity);
    if (filtered.length !== count) {
        throw new Error(
            `expected ${count} ${severity} warning(s); got ${filtered.length}: ${filtered.map(w => w.type).join(', ')}`
        );
    }
}

// =============================================================================
// Test cases
// =============================================================================

const TESTS = [
    // -------------------------------------------------------------------------
    // GROUP: Brand-token integrity (Brand Standards page 13)
    // -------------------------------------------------------------------------
    { group: 'Brand tokens', name: 'Trojan Cardinal hex matches brand standards', run: () => {
        assertEqual(BRAND_COLORS.cardinal.DEFAULT, '#910039');
    }},
    { group: 'Brand tokens', name: 'Dark Cardinal hex matches brand standards', run: () => {
        assertEqual(BRAND_COLORS.cardinal.dark, '#720724');
    }},
    { group: 'Brand tokens', name: 'Sand hex matches brand standards', run: () => {
        assertEqual(BRAND_COLORS.sand, '#f1efe3');
    }},
    { group: 'Brand tokens', name: 'Wheat hex matches brand standards (Pantone 155C)', run: () => {
        assertEqual(BRAND_COLORS.wheat, '#efd19f');
    }},
    { group: 'Brand tokens', name: 'Brand black hex matches brand standards (NOT pure black)', run: () => {
        assertEqual(BRAND_COLORS.black, '#231F20');
    }},
    { group: 'Brand tokens', name: 'Grey hex matches brand standards (Pantone 877)', run: () => {
        assertEqual(BRAND_COLORS.grey, '#999999');
    }},
    { group: 'Brand tokens', name: 'No deprecated tokens leak into BRAND_COLORS', run: () => {
        // sand and wheat consolidated to flat hex strings (no variants).
        assertEqual(typeof BRAND_COLORS.sand, 'string', 'sand should be a flat hex string');
        assertEqual(typeof BRAND_COLORS.wheat, 'string', 'wheat should be a flat hex string');
        // black and grey are also flat strings.
        assertEqual(typeof BRAND_COLORS.black, 'string', 'black should be a flat hex string');
        assertEqual(typeof BRAND_COLORS.grey, 'string', 'grey should be a flat hex string');
        // cardinal is the only color with variants; it must have ONLY DEFAULT and dark.
        const cardinalKeys = Object.keys(BRAND_COLORS.cardinal).sort().join(',');
        assertEqual(cardinalKeys, 'DEFAULT,dark', 'cardinal should only have DEFAULT and dark');
    }},

    // -------------------------------------------------------------------------
    // GROUP: classifySection — picker-enabled sections
    // -------------------------------------------------------------------------
    { group: 'classifySection', name: 'sand → sand weight', run: () => {
        assertEqual(classifySection(sec('statistics', 'sand')), 'sand');
    }},
    { group: 'classifySection', name: 'sand-halftone → sand weight', run: () => {
        assertEqual(classifySection(sec('statistics', 'sand-halftone')), 'sand');
    }},
    { group: 'classifySection', name: 'white → light weight', run: () => {
        assertEqual(classifySection(sec('statistics', 'white')), 'light');
    }},
    { group: 'classifySection', name: 'cardinal → cardinal weight', run: () => {
        assertEqual(classifySection(sec('promo-carousel', 'cardinal')), 'cardinal');
    }},
    { group: 'classifySection', name: 'cardinal-dark → cardinal weight', run: () => {
        assertEqual(classifySection(sec('promo-carousel', 'cardinal-dark')), 'cardinal');
    }},
    { group: 'classifySection', name: 'cardinal-halftone → cardinal weight', run: () => {
        assertEqual(classifySection(sec('program-hero', 'cardinal-halftone')), 'cardinal');
    }},
    { group: 'classifySection', name: 'cardinal-wheat-halftone → cardinal weight', run: () => {
        assertEqual(classifySection(sec('program-hero', 'cardinal-wheat-halftone')), 'cardinal');
    }},
    { group: 'classifySection', name: 'black → black weight', run: () => {
        assertEqual(classifySection(sec('promo-carousel', 'black')), 'black');
    }},
    { group: 'classifySection', name: 'no colors → light fallback', run: () => {
        assertEqual(classifySection(sec('statistics')), 'light');
    }},
    { group: 'classifySection', name: 'null section → light (safe)', run: () => {
        assertEqual(classifySection(null), 'light');
    }},

    // -------------------------------------------------------------------------
    // GROUP: classifySection — fixed-context (intrinsic) sections
    // -------------------------------------------------------------------------
    { group: 'Intrinsic weights', name: 'hero → black (image with dark overlay)', run: () => {
        assertEqual(classifySection(sec('hero')), 'black');
    }},
    { group: 'Intrinsic weights', name: 'final-cta → black (bg-black content block)', run: () => {
        assertEqual(classifySection(sec('final-cta')), 'black');
    }},
    { group: 'Intrinsic weights', name: 'brand-story default → cardinal', run: () => {
        assertEqual(classifySection(sec('brand-story', null, {})), 'cardinal');
    }},
    { group: 'Intrinsic weights', name: 'brand-story overlayColor=cardinal → cardinal', run: () => {
        assertEqual(classifySection(sec('brand-story', null, { overlayColor: 'cardinal' })), 'cardinal');
    }},
    { group: 'Intrinsic weights', name: 'brand-story overlayColor=black → black', run: () => {
        assertEqual(classifySection(sec('brand-story', null, { overlayColor: 'black' })), 'black');
    }},
    { group: 'Intrinsic weights', name: 'hero ignores any user-set colors.background', run: () => {
        // Hero doesn't expose a picker, so its visual character is the source of truth
        assertEqual(classifySection(sec('hero', 'sand')), 'black');
    }},

    // -------------------------------------------------------------------------
    // GROUP: validateDesignRules — empty / minimal
    // -------------------------------------------------------------------------
    { group: 'Validate basics', name: 'Empty array → valid, no warnings', run: () => {
        const r = validateDesignRules([]);
        assertEqual(r.valid, true);
        assertEqual(r.warnings.length, 0);
    }},
    { group: 'Validate basics', name: 'null/undefined → valid, no warnings', run: () => {
        const r = validateDesignRules(null);
        assertEqual(r.valid, true);
        assertEqual(r.warnings.length, 0);
    }},
    { group: 'Validate basics', name: 'Single white section → valid, no warnings', run: () => {
        const r = validateDesignRules([sec('academic-excellence', 'white')]);
        assertEqual(r.valid, true);
        assertEqual(r.warnings.length, 0);
    }},
    { group: 'Validate basics', name: 'Single cardinal → valid (1 section is too small for any rules)', run: () => {
        const r = validateDesignRules([sec('promo-carousel', 'cardinal')]);
        assertEqual(r.valid, true);
        assertEqual(r.warnings.length, 0);
    }},

    // -------------------------------------------------------------------------
    // GROUP: Same-weight consecutive rules (§5.3, §5.4, §5.4b, §5.8)
    // -------------------------------------------------------------------------
    { group: 'Same-weight runs', name: 'Cardinal → Cardinal triggers consecutive-cardinal warning', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('promo-carousel', 'cardinal'),
        ]);
        assertWarningType(r, 'consecutive-cardinal');
    }},
    { group: 'Same-weight runs', name: 'Black → Black triggers consecutive-black warning', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'black'),
            sec('promo-carousel', 'black'),
        ]);
        assertWarningType(r, 'consecutive-black');
    }},
    { group: 'Same-weight runs', name: 'Sand → Sand triggers consecutive-sand warning', run: () => {
        const r = validateDesignRules([
            sec('statistics', 'sand'),
            sec('statistics', 'sand'),
        ]);
        assertWarningType(r, 'consecutive-sand');
    }},
    { group: 'Same-weight runs', name: 'Light → Light is allowed (2 whites in a row OK per §5.8)', run: () => {
        const r = validateDesignRules([
            sec('academic-excellence', 'white'),
            sec('academic-excellence', 'white'),
        ]);
        assertNoHardWarnings(r);
    }},
    { group: 'Same-weight runs', name: '3 consecutive whites trigger flatness warning', run: () => {
        const r = validateDesignRules([
            sec('academic-excellence', 'white'),
            sec('academic-excellence', 'white'),
            sec('academic-excellence', 'white'),
        ]);
        assertWarningType(r, 'consecutive-same-weight');
    }},
    { group: 'Same-weight runs', name: '3 consecutive cardinals trigger same-weight warning', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('promo-carousel', 'cardinal'),
            sec('promo-carousel', 'cardinal'),
        ]);
        assertWarningType(r, 'consecutive-same-weight');
    }},
    { group: 'Same-weight runs', name: 'Alternating sand/light pattern → no run warnings', run: () => {
        const r = validateDesignRules([
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
        ]);
        assertNoWarningType(r, 'consecutive-sand');
        assertNoWarningType(r, 'consecutive-same-weight');
    }},

    // -------------------------------------------------------------------------
    // GROUP: Cardinal/Black adjacency (§5.4c)
    // -------------------------------------------------------------------------
    { group: 'Emphasis adjacency', name: 'Cardinal → Black is allowed (distinct weights)', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('promo-carousel', 'black'),
        ]);
        assertNoHardWarnings(r);
    }},
    { group: 'Emphasis adjacency', name: 'Black → Cardinal is allowed (distinct weights)', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'black'),
            sec('promo-carousel', 'cardinal'),
        ]);
        assertNoHardWarnings(r);
    }},
    { group: 'Emphasis adjacency', name: 'Cardinal → Black → Cardinal triggers emphasis-run (3 in a row)', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('promo-carousel', 'black'),
            sec('promo-carousel', 'cardinal'),
        ]);
        assertWarningType(r, 'emphasis-run');
    }},
    { group: 'Emphasis adjacency', name: 'Cardinal → Sand → Cardinal is fine (sand breaks the run)', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('statistics', 'sand'),
            sec('promo-carousel', 'cardinal'),
        ]);
        assertNoWarningType(r, 'emphasis-run');
    }},
    { group: 'Emphasis adjacency', name: 'Cardinal → Black → White → Cardinal → Black is fine', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('promo-carousel', 'black'),
            sec('academic-excellence', 'white'),
            sec('promo-carousel', 'cardinal'),
            sec('promo-carousel', 'black'),
        ]);
        assertNoWarningType(r, 'emphasis-run');
    }},

    // -------------------------------------------------------------------------
    // GROUP: Halftone (§5.6)
    // -------------------------------------------------------------------------
    { group: 'Halftone', name: 'One halftone → no warning', run: () => {
        const r = validateDesignRules([
            sec('statistics', 'sand-halftone'),
        ]);
        assertNoWarningType(r, 'halftone-limit');
    }},
    { group: 'Halftone', name: 'Two halftones (different families) → halftone-limit warning', run: () => {
        const r = validateDesignRules([
            sec('statistics', 'sand-halftone'),
            sec('program-hero', 'cardinal-halftone'),
        ]);
        assertWarningType(r, 'halftone-limit');
    }},
    { group: 'Halftone', name: 'Three halftones → halftone-limit warning', run: () => {
        const r = validateDesignRules([
            sec('statistics', 'sand-halftone'),
            sec('program-hero', 'cardinal-halftone'),
            sec('program-hero', 'cardinal-wheat-halftone'),
        ]);
        assertWarningType(r, 'halftone-limit');
    }},
    { group: 'Halftone', name: 'cardinal-halftone counts as cardinal weight AND halftone', run: () => {
        const r = validateDesignRules([sec('program-hero', 'cardinal-halftone')]);
        assertEqual(r.counts.cardinal, 1);
        assertEqual(r.counts.halftone, 1);
    }},
    { group: 'Halftone', name: 'sand-halftone counts as sand weight AND halftone', run: () => {
        const r = validateDesignRules([sec('statistics', 'sand-halftone')]);
        assertEqual(r.counts.sand, 1);
        assertEqual(r.counts.halftone, 1);
    }},

    // -------------------------------------------------------------------------
    // GROUP: Distribution targets (§5.4c, §5.2, §5.3) — info-level
    // -------------------------------------------------------------------------
    { group: 'Distribution', name: 'All-white 7 sections → emphasis-low + flatness', run: () => {
        const r = validateDesignRules(Array(7).fill(0).map(() => sec('academic-excellence', 'white')));
        // Will trigger consecutive-same-weight (>2 lights) AND emphasis-distribution-low
        assertWarningType(r, 'emphasis-distribution-low');
    }},
    { group: 'Distribution', name: '3 emphasis in 7 sections (43%) → no warning (flexibility zone)', run: () => {
        // User adds a 3rd emphasis section to a 7-section page → 43% emphasis.
        // The v2.4 ideal is 25–35%, but 43% sits in the flexibility zone (≤ 50%)
        // so no info fires — the user can use cardinal/black liberally.
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('statistics', 'sand'),
            sec('promo-carousel', 'black'),
            sec('academic-excellence', 'white'),
            sec('promo-carousel', 'cardinal'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
        ]);
        assertNoWarningType(r, 'emphasis-distribution-high');
    }},
    { group: 'Distribution', name: '5 emphasis in 8 sections (62%) → emphasis-high info', run: () => {
        // 5 emphasis + 3 lights = 62.5% — clearly past the soft cap; info fires.
        // Sections alternate cardinal/black with light breaks to satisfy hard rules.
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('academic-excellence', 'white'),
            sec('promo-carousel', 'black'),
            sec('promo-carousel', 'cardinal'),  // cardinal→black is fine, this needs to be different from prev
            sec('academic-excellence', 'white'),
            sec('promo-carousel', 'black'),
            sec('promo-carousel', 'cardinal'),
            sec('academic-excellence', 'white'),
        ]);
        // Note: positions 2-3 are black→cardinal which is allowed; emphasisRun goes 1→2 then resets to 0 at light.
        assertWarningType(r, 'emphasis-distribution-high');
    }},
    { group: 'Distribution', name: 'Sand-heavy page (>50%) → sand-high info', run: () => {
        // 5 sand + 2 white + 1 cardinal = 5/8 = 62% sand. Avoid consecutive sand.
        const r = validateDesignRules([
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
            sec('promo-carousel', 'cardinal'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
            sec('content-spotlight', 'sand'),  // will hit consecutive-sand too, but main check is sand %
        ]);
        // Allow either sand-distribution-high or consecutive-sand (both valid signals)
        assert(
            r.warnings.some(w => w.type === 'sand-distribution-high'),
            'expected sand-distribution-high info'
        );
    }},
    { group: 'Distribution', name: 'Small page (3 sections) skips distribution info', run: () => {
        const r = validateDesignRules([
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
        ]);
        assertNoWarningType(r, 'emphasis-distribution-low');
        assertNoWarningType(r, 'sand-distribution-high');
    }},
    { group: 'Distribution', name: 'Page with 5 sections skips flatness/white-low (need >=6)', run: () => {
        // 5 sections, 4 white + 1 sand. Avoids sand-high noise so we only check the >=6 guards.
        // Layout: white, white (OK), sand, white, white (OK) — no 3+ consecutive light.
        const r = validateDesignRules([
            sec('academic-excellence', 'white'),
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('academic-excellence', 'white'),
        ]);
        // 0% emphasis at total=5 must NOT trigger emphasis-low (needs >= 6)
        assertNoWarningType(r, 'emphasis-distribution-low');
        // white-low only fires at < 25% white AND total >= 6 — neither condition met
        assertNoWarningType(r, 'white-distribution-low');
    }},
    { group: 'Distribution', name: 'Page with 6 sections at 0% emphasis triggers emphasis-low', run: () => {
        // Same shape as above but 6 sections — emphasis-low guard now releases.
        const r = validateDesignRules([
            sec('academic-excellence', 'white'),
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
        ]);
        assertWarningType(r, 'emphasis-distribution-low');
    }},

    // -------------------------------------------------------------------------
    // GROUP: Counts and percentages
    // -------------------------------------------------------------------------
    { group: 'Counts', name: 'Counts include cardinal, black, sand, light, halftone, total', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('promo-carousel', 'black'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('program-hero', 'cardinal-halftone'),
        ]);
        assertEqual(r.counts.cardinal, 2, 'cardinal count');
        assertEqual(r.counts.black, 1, 'black count');
        assertEqual(r.counts.sand, 1, 'sand count');
        assertEqual(r.counts.light, 1, 'light count');
        assertEqual(r.counts.halftone, 1, 'halftone count');
        assertEqual(r.counts.total, 5, 'total count');
    }},
    { group: 'Counts', name: 'Hero counts as black (intrinsic), not light', run: () => {
        const r = validateDesignRules([sec('hero')]);
        assertEqual(r.counts.black, 1);
        assertEqual(r.counts.light, 0);
    }},
    { group: 'Counts', name: 'final-cta counts as black (intrinsic)', run: () => {
        const r = validateDesignRules([sec('final-cta')]);
        assertEqual(r.counts.black, 1);
    }},
    { group: 'Counts', name: 'brand-story default counts as cardinal (intrinsic)', run: () => {
        const r = validateDesignRules([sec('brand-story', null, {})]);
        assertEqual(r.counts.cardinal, 1);
    }},
    { group: 'Counts', name: 'Percentages are computed correctly', run: () => {
        const r = validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('academic-excellence', 'white'),
        ]);
        // 1 cardinal + 0 black = 1 emphasis / 4 = 25%
        assert(Math.abs(r.percentages.emphasis - 0.25) < 0.001, 'emphasis pct');
        assert(Math.abs(r.percentages.sand - 0.25) < 0.001, 'sand pct');
        assert(Math.abs(r.percentages.white - 0.5) < 0.001, 'white pct');
    }},

    // -------------------------------------------------------------------------
    // GROUP: Status message
    // -------------------------------------------------------------------------
    { group: 'Status message', name: 'Empty page → success/OK', run: () => {
        const status = getStatusMessage(validateDesignRules([]));
        assertEqual(status.type, 'success');
    }},
    { group: 'Status message', name: 'Hard warning → type "warning"', run: () => {
        const status = getStatusMessage(validateDesignRules([
            sec('promo-carousel', 'cardinal'),
            sec('promo-carousel', 'cardinal'),
        ]));
        assertEqual(status.type, 'warning');
    }},
    { group: 'Status message', name: 'Info-only → type "info"', run: () => {
        // Heavy sand triggers sand-distribution-high (info), no hard warnings if non-consecutive
        const status = getStatusMessage(validateDesignRules([
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
            sec('statistics', 'sand'),
            sec('academic-excellence', 'white'),
        ]));
        assertEqual(status.type, 'info');
    }},

    // -------------------------------------------------------------------------
    // GROUP: previewAddSection
    // -------------------------------------------------------------------------
    { group: 'Preview', name: 'previewAddSection appends and re-validates', run: () => {
        const current = [sec('promo-carousel', 'cardinal')];
        const preview = previewAddSection(current, 'promo-carousel', 'cardinal');
        // Adding another cardinal makes it consecutive-cardinal
        assertWarningType(preview, 'consecutive-cardinal');
    }},
    { group: 'Preview', name: 'previewAddSection does not mutate input', run: () => {
        const current = [sec('promo-carousel', 'cardinal')];
        const before = JSON.stringify(current);
        previewAddSection(current, 'statistics', 'sand');
        assertEqual(JSON.stringify(current), before, 'input was mutated');
    }},

    // -------------------------------------------------------------------------
    // GROUP: Preset templates (sanity check the shipped layouts)
    // -------------------------------------------------------------------------
    { group: 'Presets', name: 'Prospective Students preset → 0 warnings', run: () => {
        const tpl = pageTemplates.find(t => t.id === 'prospective-students');
        assert(tpl, 'preset must exist');
        const r = validateDesignRules(tpl.sections);
        if (r.warnings.length !== 0) {
            const detail = r.warnings.map(w => `${w.severity}/${w.type}: ${w.message}`).join('\n  ');
            throw new Error(`expected 0 warnings; got ${r.warnings.length}:\n  ${detail}`);
        }
    }},
    { group: 'Presets', name: 'Academic Programs preset → 0 warnings', run: () => {
        const tpl = pageTemplates.find(t => t.id === 'academic-programs');
        assert(tpl, 'preset must exist');
        const r = validateDesignRules(tpl.sections);
        if (r.warnings.length !== 0) {
            const detail = r.warnings.map(w => `${w.severity}/${w.type}: ${w.message}`).join('\n  ');
            throw new Error(`expected 0 warnings; got ${r.warnings.length}:\n  ${detail}`);
        }
    }},
    { group: 'Presets', name: 'About Troy preset → 0 warnings (must load clean)', run: () => {
        const tpl = pageTemplates.find(t => t.id === 'about-troy');
        assert(tpl, 'preset must exist');
        const r = validateDesignRules(tpl.sections);
        if (r.warnings.length !== 0) {
            const detail = r.warnings.map(w => `${w.severity}/${w.type}: ${w.message}`).join('\n  ');
            throw new Error(`expected 0 warnings; got ${r.warnings.length}:\n  ${detail}`);
        }
    }},

    // -------------------------------------------------------------------------
    // GROUP: Migration shim
    // -------------------------------------------------------------------------
    { group: 'Migration', name: 'sand-300 → sand', run: () => {
        const sections = [{ type: 'statistics', colors: { background: 'sand-300' } }];
        const count = migrateColorTokens(sections);
        assertEqual(count, 1);
        assertEqual(sections[0].colors.background, 'sand');
    }},
    { group: 'Migration', name: 'cardinal-900 → cardinal-dark', run: () => {
        const sections = [{ type: 'promo-carousel', colors: { background: 'cardinal-900' } }];
        const count = migrateColorTokens(sections);
        assertEqual(count, 1);
        assertEqual(sections[0].colors.background, 'cardinal-dark');
    }},
    { group: 'Migration', name: 'cardinal-800 → cardinal', run: () => {
        const sections = [{ type: 'promo-carousel', colors: { background: 'cardinal-800' } }];
        const count = migrateColorTokens(sections);
        assertEqual(count, 1);
        assertEqual(sections[0].colors.background, 'cardinal');
    }},
    { group: 'Migration', name: 'No deprecated keys → 0 rewrites', run: () => {
        const sections = [{ type: 'statistics', colors: { background: 'sand' } }];
        const count = migrateColorTokens(sections);
        assertEqual(count, 0);
    }},
    { group: 'Migration', name: 'Idempotent: running twice on same data → 0 second time', run: () => {
        const sections = [{ type: 'statistics', colors: { background: 'sand-300' } }];
        const first = migrateColorTokens(sections);
        const second = migrateColorTokens(sections);
        assertEqual(first, 1);
        assertEqual(second, 0);
        assertEqual(sections[0].colors.background, 'sand');
    }},
    { group: 'Migration', name: 'Multiple sections: rewrites all and reports total', run: () => {
        const sections = [
            { type: 'statistics', colors: { background: 'sand-300' } },
            { type: 'promo-carousel', colors: { background: 'cardinal-900' } },
            { type: 'promo-carousel', colors: { background: 'cardinal' } }, // not deprecated
        ];
        const count = migrateColorTokens(sections);
        assertEqual(count, 2);
    }},
    { group: 'Migration', name: 'Sections without colors property are skipped safely', run: () => {
        const sections = [
            { type: 'hero', content: {} },
            { type: 'statistics', colors: { background: 'sand-300' } },
        ];
        const count = migrateColorTokens(sections);
        assertEqual(count, 1);
    }},
    { group: 'Migration', name: 'Null/undefined input → 0, no throw', run: () => {
        assertEqual(migrateColorTokens(null), 0);
        assertEqual(migrateColorTokens(undefined), 0);
    }},

    // -------------------------------------------------------------------------
    // GROUP: COLOR_FAMILIES + family helpers
    // -------------------------------------------------------------------------
    { group: 'Color families', name: 'cardinal family includes cardinal, cardinal-dark, halftones', run: () => {
        assert(isCardinalFamily('cardinal'));
        assert(isCardinalFamily('cardinal-dark'));
        assert(isCardinalFamily('cardinal-halftone'));
        assert(isCardinalFamily('cardinal-wheat-halftone'));
    }},
    { group: 'Color families', name: 'black family is just "black"', run: () => {
        assert(isBlackFamily('black'));
        assert(!isBlackFamily('cardinal'));
        assert(!isBlackFamily('cardinal-dark'));
    }},
    { group: 'Color families', name: 'sand family is sand + sand-halftone (no sand-300)', run: () => {
        assert(isSandFamily('sand'));
        assert(isSandFamily('sand-halftone'));
        assert(!isSandFamily('sand-300'), 'deprecated sand-300 must not be a member');
    }},
    { group: 'Color families', name: 'isHalftone correctly flags all halftone keys', run: () => {
        assert(isHalftone('sand-halftone'));
        assert(isHalftone('cardinal-halftone'));
        assert(isHalftone('cardinal-wheat-halftone'));
        assert(!isHalftone('sand'));
        assert(!isHalftone('cardinal'));
    }},

    // -------------------------------------------------------------------------
    // GROUP: COLORS map integrity
    // -------------------------------------------------------------------------
    { group: 'COLORS map', name: 'COLORS does not include sand-300', run: () => {
        assert(!('sand-300' in COLORS));
    }},
    { group: 'COLORS map', name: 'COLORS includes cardinal-dark (not cardinal-900)', run: () => {
        assert('cardinal-dark' in COLORS);
        assert(!('cardinal-900' in COLORS));
        assert(!('cardinal-800' in COLORS));
    }},
    { group: 'COLORS map', name: 'COLORS.black uses brand black (#231F20) and bg-black class', run: () => {
        assertEqual(COLORS.black.hex, '#231F20');
        assertEqual(COLORS.black.bgClass, 'bg-black');
    }},
    { group: 'COLORS map', name: 'COLORS.cardinal-dark uses dark cardinal hex', run: () => {
        assertEqual(COLORS['cardinal-dark'].hex, '#720724');
        assertEqual(COLORS['cardinal-dark'].bgClass, 'bg-cardinal-dark');
    }},
    { group: 'COLORS map', name: 'Picker exposes exactly 8 background options', run: () => {
        assertEqual(Object.keys(COLORS).length, 8);
    }},

    // -------------------------------------------------------------------------
    // GROUP: getDefaultColors
    // -------------------------------------------------------------------------
    { group: 'Defaults', name: 'statistics defaults to sand', run: () => {
        assertEqual(getDefaultColors('statistics').background, 'sand');
    }},
    { group: 'Defaults', name: 'program-hero defaults to cardinal-halftone', run: () => {
        assertEqual(getDefaultColors('program-hero').background, 'cardinal-halftone');
    }},
    { group: 'Defaults', name: 'Unknown section type defaults to white', run: () => {
        assertEqual(getDefaultColors('does-not-exist').background, 'white');
    }},

    // -------------------------------------------------------------------------
    // GROUP: TARGETS / RULESET_VERSION integrity
    // -------------------------------------------------------------------------
    { group: 'Engine metadata', name: 'RULESET_VERSION is a semantic-style string', run: () => {
        assert(typeof RULESET_VERSION === 'string');
        assert(/^\d+\.\d+/.test(RULESET_VERSION), 'should look like "2.4"');
    }},
    { group: 'Engine metadata', name: 'TARGETS are sane (min < max, etc.)', run: () => {
        assert(TARGETS.emphasisMin < TARGETS.emphasisMax, 'emphasis range');
        assert(TARGETS.whiteMin < TARGETS.whiteMax, 'white range');
        assert(TARGETS.maxConsecutiveSameWeight === 2);
        assert(TARGETS.maxHalftone === 1);
    }},

    // -------------------------------------------------------------------------
    // GROUP: Real-world scenarios (fuzz-like)
    // -------------------------------------------------------------------------
    { group: 'Scenarios', name: 'Hero (intrinsic black) followed by black section is a violation', run: () => {
        // hero → promo-carousel(black) is two black-weight sections in a row
        const r = validateDesignRules([sec('hero'), sec('promo-carousel', 'black')]);
        assertWarningType(r, 'consecutive-black');
    }},
    { group: 'Scenarios', name: 'Hero (intrinsic black) → sand → final-cta (intrinsic black) is fine', run: () => {
        const r = validateDesignRules([
            sec('hero'),
            sec('statistics', 'sand'),
            sec('final-cta'),
        ]);
        assertNoHardWarnings(r);
    }},
    { group: 'Scenarios', name: 'brand-story(cardinal) followed by hero(black) is allowed (cardinal→black)', run: () => {
        const r = validateDesignRules([
            sec('brand-story', null, {}),  // cardinal
            sec('hero'),                    // black
        ]);
        assertNoHardWarnings(r);
    }},
    { group: 'Scenarios', name: 'brand-story(black overlay) → hero(black) is a violation (consecutive-black)', run: () => {
        const r = validateDesignRules([
            sec('brand-story', null, { overlayColor: 'black' }),  // black
            sec('hero'),                                          // black
        ]);
        assertWarningType(r, 'consecutive-black');
    }},
];

// =============================================================================
// Runner + DOM rendering
// =============================================================================

function runAll() {
    const results = TESTS.map(t => {
        try {
            t.run();
            return { ...t, ok: true };
        } catch (err) {
            return { ...t, ok: false, error: err.message };
        }
    });
    return results;
}

function render(results, mountEl) {
    const passed = results.filter(r => r.ok).length;
    const failed = results.length - passed;
    const allPassed = failed === 0;

    // Group results
    const groups = {};
    results.forEach(r => {
        if (!groups[r.group]) groups[r.group] = [];
        groups[r.group].push(r);
    });

    // Summary
    const summary = `
        <div class="summary ${allPassed ? 'all-pass' : 'has-fail'}">
            <div class="summary-icon">${allPassed ? '✓' : '✗'}</div>
            <div class="summary-text">
                <div class="summary-headline">
                    ${passed}/${results.length} tests passed
                </div>
                <div class="summary-sub">
                    Ruleset version: ${RULESET_VERSION} ·
                    ${failed > 0 ? `${failed} failed` : 'all green'}
                </div>
            </div>
        </div>
    `;

    // Groups
    let groupsHtml = '';
    for (const [groupName, items] of Object.entries(groups)) {
        const groupPassed = items.filter(i => i.ok).length;
        const groupTotal = items.length;
        const groupAllPass = groupPassed === groupTotal;

        groupsHtml += `
            <details class="group ${groupAllPass ? 'group-pass' : 'group-fail'}" ${groupAllPass ? '' : 'open'}>
                <summary>
                    <span class="group-icon">${groupAllPass ? '✓' : '✗'}</span>
                    <span class="group-name">${escapeHtml(groupName)}</span>
                    <span class="group-counts">${groupPassed}/${groupTotal}</span>
                </summary>
                <ul class="tests">
                    ${items.map(i => `
                        <li class="test ${i.ok ? 'test-pass' : 'test-fail'}">
                            <span class="test-icon">${i.ok ? '✓' : '✗'}</span>
                            <span class="test-name">${escapeHtml(i.name)}</span>
                            ${i.error ? `<pre class="test-error">${escapeHtml(i.error)}</pre>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </details>
        `;
    }

    mountEl.innerHTML = summary + groupsHtml;
}

function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    const mount = document.getElementById('results');
    if (!mount) return;
    const results = runAll();
    render(results, mount);
});
