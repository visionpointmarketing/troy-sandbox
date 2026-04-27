# Design Rules — Engine Coverage

**Canonical source:** [`reskin-docs/TROY Web Reskin CSS Ruleset.md`](../../troy-vp-reskin-v2/reskin-docs/TROY%20Web%20Reskin%20CSS%20Ruleset.md) in the `troy-vp-reskin-v2` repo, currently version **v2.4** (April 16, 2026).

**Engine:** [`js/design-rules.js`](../js/design-rules.js) — exports `RULESET_VERSION` so the implemented version is discoverable at runtime.

This document tracks **which rules the sandbox's validation engine enforces today**, **which it defers**, and **how to update both when the canonical ruleset changes**.

---

## What this engine enforces today (v2.4 alignment)

The engine evaluates a page's section list and surfaces soft warnings in the toolbar. It does not block the user — the canonical ruleset treats most rules as soft guidance, and the canvas-builder UX matches that.

### Background discipline (Section 5 of the ruleset)

Two kinds of checks: **hard rules** that always fire when violated (warning severity) and **distribution guidance** that fires only when the page is significantly outside the v2.4 ideal target (info severity).

| Rule (ruleset §) | What we check | Severity |
|---|---|---|
| 5.8 Visual rhythm | No more than 2 consecutive sections of the same visual weight, where weight ∈ { cardinal, black, sand, light } | warning |
| 5.4 Cardinal sections | Two consecutive cardinal sections are not permitted | warning |
| 5.4b Black sections | Two consecutive black sections are not permitted | warning |
| 5.3 Sand sections | Two consecutive sand sections are not permitted | warning |
| 5.4c Combined emphasis | Cardinal → Black or Black → Cardinal is **allowed** (distinct weights); no more than 2 emphasis sections in a row | warning |
| 5.6 Halftone count | Maximum one halftone-textured zone per page | warning |
| 5.4c Combined emphasis distribution | Ideal: 25–35% emphasis. Info fires only when below 15% (page may feel flat) or above 50% (page feels emphasis-heavy) | info |
| 5.3 Sand distribution | Ideal: ≤35% sand. Info fires only when sand exceeds 50% (sand truly dominating) | info |
| 5.2 White presence | Ideal: 25–35% white. Info fires only when below 15% (white too sparse) | info |

**Why the firing thresholds are wider than the ideal targets:** the v2.4 doc describes 25–35% as "should comprise roughly" — a guideline target. For typical 10–12 section pages this maps to "3–4 emphasis sections total," but on shorter pages a strict percentage interpretation is punitive (a 7-section page with 3 emphasis is 43%, which is normal and intentional). The engine surfaces the ideal target as guidance in the count popover but only alerts when the page falls clearly outside it. Hard rules are unaffected.

`TARGETS` in `js/design-rules.js` exposes both sets:
- `idealEmphasisMin` / `idealEmphasisMax` (0.25 / 0.35) — shown in popover
- `emphasisMin` / `emphasisMax` (0.15 / 0.50) — when info actually fires

The four visual weight categories (`cardinal`, `black`, `sand`, `light`) are computed per section via `classifySection()` in [`js/design-rules.js`](../js/design-rules.js). For sections that expose the color picker, the user's `colors.background` choice is used. For fixed-context sections that don't expose a picker — `hero`, `final-cta`, `brand-story` — the engine uses an intrinsic weight that reflects the section's actual visual character (image-based hero with dark overlay reads as "black" weight, brand-story with cardinal overlay reads as "cardinal", etc.). This prevents the rules engine from misclassifying visually-dark sections as "light" just because their underlying `colors.background` defaults to white.

Intrinsic-weight mapping (in `js/design-rules.js` `INTRINSIC_WEIGHTS`):

| Section type | Visual weight | Why |
|---|---|---|
| `hero` | `black` | Full-width image with dark gradient overlay |
| `final-cta` | `black` | `bg-black` content block on dark image |
| `brand-story` | `cardinal` (default) or `black` | Determined by `content.overlayColor` field |

`COLOR_FAMILIES` in `js/color-config.js` still declares which color keys belong to each family, used by the family-membership helpers (`isCardinalFamily`, `isBlackFamily`, etc.) for the picker-enabled sections.

### Color tokens (Brand Standards page 13 + Ruleset v2.4)

| Token | Hex | Where defined |
|---|---|---|
| Trojan Cardinal | `#910039` | `BRAND_COLORS.cardinal.DEFAULT` |
| Dark Cardinal | `#720724` | `BRAND_COLORS.cardinal.dark` |
| Sand | `#f1efe3` | `BRAND_COLORS.sand` |
| Wheat | `#efd19f` | `BRAND_COLORS.wheat` (used as accent only — not a section background) |
| Black (brand) | `#231F20` | `BRAND_COLORS.black` |
| Grey | `#999999` | `BRAND_COLORS.grey` |
| White | `#FFFFFF` | Tailwind built-in |

Single source of truth: [`js/color-tokens.js`](../js/color-tokens.js). The inline Tailwind config in `index.html` mirrors these values; `assertTailwindMirrorsBrandColors()` runs at boot and logs a console error if drift is detected.

### Section-background options (color picker)

The 8 options exposed in the picker are derived from the brand palette plus halftone overlays:

| Key | Visual | Family |
|---|---|---|
| `white` | White | light |
| `sand` | Sand | sand |
| `sand-halftone` | Sand + light halftone | sand |
| `cardinal` | Cardinal | cardinal |
| `cardinal-dark` | Dark Cardinal | cardinal |
| `black` | Brand black (#231F20) | black |
| `cardinal-halftone` | Cardinal + dark halftone | cardinal |
| `cardinal-wheat-halftone` | Cardinal + wheat-on-cardinal halftone | cardinal |

Removed in v2.4 cleanup (auto-migrated on load via `migrateColorTokens`):
- `sand-300` ("Sand Dark", `#e8e6da`) — explicitly removed in ruleset v2.4 changelog
- `cardinal-900` (renamed to `cardinal-dark`)
- `cardinal-800` (renamed to `cardinal` — same hex)

---

## What this engine does NOT enforce yet (deferred)

These rules are part of v2.4 but require deeper integration than a counting/rhythm engine. They're tracked here so they aren't lost.

### Section 5.6 — halftone-behind-text readability

> *"Halftone texture must never appear directly behind any text smaller than H2 (28px). If halftone is used in a section that contains text, the text must sit on a solid-color band or card that visually masks the texture beneath it."*

**Status:** not implemented. Each section template that uses halftone backgrounds renders content directly over the texture. To enforce this, sections would need to wrap text-bearing regions in solid-color containers and the engine would need to inspect rendered DOM (or each section module would need to declare which fields sit on a masking surface).

**Where it would land:** in each `js/sections/*.js` template's `render()` and `toMarkup()`, plus a static check in `js/design-rules.js` against a section-level "has-text-on-halftone" flag.

### Section 6 — button hierarchy

> *"Each page may include multiple CTAs, but only one visual primary."*
> *"No adjacent filled buttons."*

**Status:** not implemented. Button styling is currently hand-rolled inside section templates. To enforce, sections would need to declare which fields are CTAs and which use the canonical Troy button classes (`tw-troy-btn-cardinal`, `tw-troy-btn-white`, etc. — see `Component-Pattern-Library.md`).

### Section 5.1 — VP utility classes for exported markup

> *"Dark sections must use the VP utility classes listed above — not raw Tailwind classes like `tw-bg-dark-er` or `tw-bg-cardinal`. Using raw Tailwind bypasses the ruleset's background discipline system and makes compliance unenforceable."*

**Status:** not implemented in the export. The canvas renders raw Tailwind for the live preview (which is fine), but `toMarkup()` on each section module also emits raw Tailwind. To produce reskin-compliant exports, `toMarkup()` should emit `vp-bg-sand`, `vp-cardinal-section`, `vp-black-section` etc., plus `tw-troy-btn-*` button classes. Big architectural change — every section module is touched.

### Component-Pattern-Library v2.4 — Helpful Links blocks

> *"The helpful-links-block container always uses `tw-bg-white`, regardless of the parent section's background."*

**Status:** **implemented** in `js/sections/content-spotlight.js`. The Helpful Links blocks use a transparent fill with a border-only outline (border darkens on light sections, lightens on dark sections), so they read as clean outlined cards on any section background. This is a slight extension of the canonical rule (which calls for `bg-white`) — transparent achieves the same goal of "nested elements don't carry section colors" while reading correctly across all eight section background options.

### Asset-Background-Conflict-Rules.md

When a user changes a section's background, embedded assets (white-fill SVG icons, dark-only graphics) may become invisible or lose contrast. The rules doc proposes a pre-flight asset audit before background changes.

**Status:** not implemented. The color picker has no awareness of asset compatibility.

---

## How to update when the canonical ruleset changes

When `reskin-docs/TROY Web Reskin CSS Ruleset.md` is bumped (e.g., to v2.5):

1. **Read the changelog** at the bottom of that file. Note any added/removed/renamed concepts.
2. **Update color tokens first** if the brand palette changed:
   - Edit `js/color-tokens.js` (`BRAND_COLORS`).
   - Mirror the new values into the inline Tailwind config in `index.html`.
   - The boot-time `assertTailwindMirrorsBrandColors()` check will confirm the mirror is correct.
   - If a token was renamed/removed, add an entry to `DEPRECATED_COLOR_KEYS` in `js/color-config.js` so saved templates auto-migrate.
3. **Update `COLOR_FAMILIES` and `COLORS`** in `js/color-config.js` if section-background options changed.
4. **Update `js/design-rules.js`:**
   - Bump `RULESET_VERSION`.
   - Adjust validation rules and `TARGETS` to reflect the new ruleset.
   - Update warning messages to use the new vocabulary.
5. **Update `js/ui.js`** `updateDesignStatus()` if the count/percentage display needs new categories.
6. **Update this doc** — refresh the coverage table above to reflect the new version.
7. **Update user-facing docs** — `docs/USER-GUIDE.md`, `SECTIONS.md`, `README.md`.
8. **Test the migration shim** — load an older saved template and confirm the toast appears and rewrites work.

The runtime version is exposed at `import { RULESET_VERSION } from './design-rules.js'` so future tooling (CI checks, in-app version badge, etc.) can detect drift between the engine and the canonical doc.

---

## Test suite

`tests/index.html` is a browser-runnable test harness for the rules engine. It covers every hard rule, every distribution-target threshold, both ideal-vs-firing values, the migration shim, brand-token integrity, intrinsic-weight classification for fixed-context sections (hero, brand-story, final-cta), and full preset-template traces.

Run with `python3 -m http.server 8000` from the project root, then open `http://localhost:8000/tests/index.html`. All preset templates are asserted to produce 0 warnings of any severity — if a future template change pushes outside the targets, the suite catches it at load with the exact violations listed.

---

## Related documents

- [Troy Brand Standards FINAL.pdf](../../) — color palette (page 13), accessibility matrix (page 14), typography (page 15)
- [`reskin-docs/TROY Web Reskin CSS Ruleset.md`](../../troy-vp-reskin-v2/reskin-docs/TROY%20Web%20Reskin%20CSS%20Ruleset.md) — canonical rule set
- [`reskin-docs/Component-Pattern-Library.md`](../../troy-vp-reskin-v2/reskin-docs/Component-Pattern-Library.md) — button variants, section classes, link blocks
- [`reskin-docs/Asset-Background-Conflict-Rules.md`](../../troy-vp-reskin-v2/reskin-docs/Asset-Background-Conflict-Rules.md) — asset/background interaction rules
- [`reskin-docs/Page-Reskin-Checklist.md`](../../troy-vp-reskin-v2/reskin-docs/Page-Reskin-Checklist.md) — implementation workflow
- [`reskin-docs/Asset-Inventory.md`](../../troy-vp-reskin-v2/reskin-docs/Asset-Inventory.md) — asset catalog
