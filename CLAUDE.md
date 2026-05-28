# CLAUDE.md — TROY Sandbox Project Context

## What This Is

A browser-based visual landing page builder specifically for Troy University. Uses Troy's Tailwind-based design system with 11 pre-built section types. Vanilla JavaScript ES modules, no build step required (Tailwind via CDN), open `index.html` to run.

This is a **standalone project** — not a fork of the wireframe-builder, but a purpose-built tool using similar architectural patterns.

## Architecture

- **ES modules** loaded from `index.html → js/app.js`
- **Section registry pattern**: each section in `js/sections/` exports `type`, `name`, `category`, `defaults`, `fields`, `render()`, and `toMarkup()`
- **`js/sections/index.js`** imports all section modules and exports the registry
- **`wrapSection()`** in `js/utils.js` adds drag handles and controls (duplicate/delete/visibility) around every section's rendered HTML
- **Sidebar** auto-generated from registry (no hardcoded section list)
- **Static header/footer** frame the editable sections (not editable, not draggable)
- **Tailwind CSS** via CDN with Troy color extensions
- **Background color picker** with 8 color options per section (white, sand, sand-halftone, cardinal, cardinal-dark, black, cardinal-halftone, cardinal+wheat halftone)
- **Design rules validation** aligned with `reskin-docs/TROY Web Reskin CSS Ruleset.md` (v2.4) and Troy Brand Standards
- **Page templates** system with preset and user-saved templates
- **Responsive preview** with desktop/tablet/mobile viewport toggle

## Key Files

| File | Role |
|------|------|
| `index.html` | Entry point, Tailwind CDN config, HTML shell |
| `js/app.js` | Bootstrap — loads state, initializes UI and canvas |
| `js/state.js` | State object, section array, history stack, undo/redo |
| `js/canvas.js` | Canvas rendering, inline editing, event delegation, drag-and-drop |
| `js/ui.js` | Sidebar generation, export/import buttons |
| `js/utils.js` | `escapeHtml`, `renderIfVisible`, `wrapSection`, `imageSlot` |
| `js/image-store.js` | IndexedDB image storage |
| `js/image-upload-modal.js` | Image upload modal component |
| `js/markup-exporter.js` | Clean HTML export functionality |
| `js/color-tokens.js` | Single source of truth for the Troy brand palette (mirrored by inline Tailwind config in index.html) |
| `js/color-config.js` | Section-background COLORS map, contrast logic, halftone classes, color-token migration shim |
| `js/design-rules.js` | Design rule validation engine — implements Troy Web Reskin CSS Ruleset v2.4 |
| `js/page-templates.js` | Preset page template library |
| `js/template-storage.js` | LocalStorage for user-saved templates |
| `js/save-template-modal.js` | Template saving modal component |
| `js/preview-iframe.js` | Responsive preview rendering |
| `js/sections/index.js` | Registry — imports all sections, exports `sectionTemplates` |
| `js/sections/*.js` | Individual section templates (11 total) |
| `js/cloud-config.js` | Cloud Lambda endpoint URLs + sandbox API key helpers. See "Cloud Save" below. |
| `js/cloud-storage.js` | API client for AWS-backed save. Mirrors `template-storage.js` public surface. |
| `js/cloud-key-modal.js` | Modal that prompts the user for the sandbox API key on first connect. |
| `lambda/` | AWS Lambda handlers, IAM policies, and config — one subdirectory per function. See `lambda/README.md` and `docs/CLOUD-IMPLEMENTATION.md`. |
| `styles/editor.css` | Editor UI styles (controls, handles, canvas chrome) |
| `static/base.css` | Base component styles (buttons, typography) |
| `assets/header.html` | Static Troy header markup |
| `assets/footer.html` | Static Troy footer markup |
| `assets/textures/` | Halftone texture files for section backgrounds |

## Section Types (11 total)

1. **Hero** — Full-width photo background, headline, 2 CTAs
2. **Program Hero** — Program landing page hero with info box and quick links
3. **Statistics** — Cream background, 4 stat cards with numbers
4. **Academic Excellence** — 2-column with featured program + 3 program cards
5. **Latest Stories** — 3 story cards with images
6. **Brand Story** — Maroon background, quote, image
7. **Final CTA** — Dark photo background, centered content, 2 CTAs
8. **Promo Carousel** — Full-width promotional banner with carousel styling (promo/news variants)
9. **Split Layout** — 50/50 content and image split with flexible positioning
10. **Content Spotlight** — 50/50 split with optional stats grid, FAQ accordions, and helpful links
11. **In-Page Navigation** — Horizontal navigation bar for anchor links within the page

## Adding or Modifying Sections

1. Create `js/sections/my-section.js` with standard exports
2. Import it in `js/sections/index.js` and add to the `templates` array
3. Everything else (sidebar, export, visibility) picks it up automatically

## Section Module Structure

```javascript
export default {
    type: 'section-type',      // Unique identifier
    name: 'Display Name',       // Shown in sidebar
    category: 'category',       // For grouping (if needed)

    defaults: {
        headline: 'Default Headline',
        body: 'Default body text...',
        // ... all editable fields
    },

    fields: [
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        // ... field definitions for visibility toggles
    ],

    render(content, visibility) {
        // Returns HTML for canvas editing
        // Uses contenteditable, data-field attributes
    },

    toMarkup(content) {
        // Returns clean Tailwind HTML for export
        // No editor artifacts
    }
};
```

## Tailwind Configuration

Tailwind is loaded via CDN (`https://cdn.tailwindcss.com`) with the Troy brand palette extended inline in `index.html`. The canonical palette lives in `js/color-tokens.js` (`BRAND_COLORS`); the inline Tailwind block mirrors those values. `js/app.js` runs `assertTailwindMirrorsBrandColors()` at boot and logs a console error if the two drift, so any mismatch surfaces immediately during development.

Current palette (from Troy Brand Standards, page 13):
```javascript
colors: {
    cardinal: {
        DEFAULT: '#910039',  // Trojan Cardinal — Pantone 202C/1807U
        dark: '#720724',     // Dark Cardinal
    },
    sand: '#f1efe3',         // Sand
    wheat: '#efd19f',        // Wheat — Pantone 155C
    black: '#231F20',        // Troy brand black (NOT pure #000000)
    grey: '#999999',         // Grey — Pantone 877 Metallic
}
```

When Troy provides their full `tailwind.config.js` (or when this project switches to the production reskin's `vp-styles` system), migrate to a build process and consume the visionpoint Tailwind config directly.

## State Structure

```javascript
{
    sections: [
        {
            id: 'unique-id',
            type: 'hero',
            content: { /* field values */ },
            visibility: { /* field visibility flags */ },
            colors: { background: 'sand' /* see js/color-config.js COLORS */ }
        }
    ],
    history: [],
    historyIndex: -1
}
```

### Color-token migration

When sections are loaded from any external source (saved templates, JSON imports, a previous session's saved state), `state.js` runs `migrateColorTokens()` from `js/color-config.js`. This rewrites deprecated color keys to their current equivalents — for example, the removed `sand-300` ("Sand Dark") becomes `sand`, and the renamed `cardinal-900` becomes `cardinal-dark`. A one-shot toast notifies the user when any rewrites occur. The migration is idempotent and safe to call multiple times.

## Cloud Save & Share

The editor has an optional **Cloud Library** feature that backs onto AWS
(DynamoDB + S3 + Lambda Function URLs in the existing VisionPoint AWS
account, `831326375124`, region `us-east-1`). It lets a team save templates
**with images** to a shared library accessible from any device.

**Authoritative source of truth:** [`docs/CLOUD-IMPLEMENTATION.md`](docs/CLOUD-IMPLEMENTATION.md).
Every architectural decision, naming convention, data model, and trade-off
is captured there. **Future Claude instances working on cloud-side issues
should read that document first.** It links to:

- [`docs/AWS-DEPLOYMENT-GUIDE.md`](docs/AWS-DEPLOYMENT-GUIDE.md) — step-by-step console deployment
- [`docs/AWS-RUNBOOK.md`](docs/AWS-RUNBOOK.md) — rotation, debugging, teardown procedures
- [`docs/CLOUD-STORAGE-PLAN.md`](docs/CLOUD-STORAGE-PLAN.md) — original planning doc (Dave-approved architecture)
- [`lambda/README.md`](lambda/README.md) — Lambda directory conventions

### How cloud features are gated

The feature is **fully optional and self-gating**. When `js/cloud-config.js`
still contains `PASTE_FUNCTION_URL_HERE` placeholders, the editor behaves
identically to its pre-cloud state — local-only saves, no Cloud Library UI,
no network calls. When real Lambda Function URLs are pasted in, the Cloud
Library section appears in the Templates popover and users can connect.

The trust model is a single shared API key (`X-Sandbox-Key` header,
sandbox-scoped, not per-user) per Dave Olsen's planning review. Users enter
the key once per browser; it's stored in `localStorage` under
`troy-sandbox-cloud-key`. The key is the trust boundary — see the
implementation doc for rationale.

### What's deployed vs. planned

- **Phase 1 (built, awaiting deploy):** save, list, get, delete, presign-images. Five Lambdas, one DynamoDB table (`TroySandbox_Templates`), one S3 bucket (`troy-sandbox-images.vpmdevtech.com`).
- **Phase 2 (not built):** share links. Endpoint placeholders exist in `cloud-config.js` but no Lambdas. See `CLOUD-IMPLEMENTATION.md` → "What's NOT implemented" for the build plan.
- **Phase 3 (not built):** folders, autosave, orphan-image cleanup, etc.

### Backend deployment characteristics

- **No CDK, no Lambda Layers, no build step.** Each Lambda is a single
  copy-paste-deployable `index.js` file. Helpers (CORS, key validation,
  response builders) are duplicated across all 5 handlers by design — see
  `CLOUD-IMPLEMENTATION.md` for the rationale. Do not introduce CDK or
  Layers without first reading that doc and confirming with the user.
- **Manual console deployment.** The existing VP AWS account has zero
  CloudFormation stacks; consistency with that pattern was deliberate.
- **Every resource is prefixed `TroySandbox`/`troy-sandbox`/`troySandbox`**
  for unambiguous identification and easy teardown.

## What's NOT in This Project

- No brand presets/switching (Troy-only)
- No theme toggle (light/dark)
- No Google Docs export
- No PNG export
- No lead form builder
- No writing guidelines panel
- No Phase 2/3 cloud features (see Cloud Save section above)

## Testing Checklist

- [ ] All 11 section types render correctly
- [ ] Inline editing works for all text fields
- [ ] Image upload works in sections with image slots
- [ ] Visibility toggle hides/shows fields
- [ ] Duplicate/delete buttons work
- [ ] Drag-and-drop reordering works
- [ ] Undo/redo (Ctrl/Cmd+Z, Ctrl/Cmd+Y)
- [ ] JSON export downloads valid file
- [ ] JSON import restores all sections with content
- [ ] Static header/footer display correctly
- [ ] Background color picker works for all sections
- [ ] Design rules validation displays correctly
- [ ] Preset templates load correctly
- [ ] User templates save and load correctly
- [ ] Responsive preview (desktop/tablet/mobile) works
- [ ] Layout variants (content-left/content-right) work
- [ ] No console errors on load

### Cloud Save testing (only after AWS deployment)

- [ ] With placeholders in `cloud-config.js`, app behaves identically to pre-cloud (Cloud Library section is hidden)
- [ ] With real Lambda URLs, Cloud Library section appears in Templates popover
- [ ] "Connect to cloud library" prompt opens the key modal
- [ ] After entering a valid key, toast confirms connection and library list loads
- [ ] Save Current Page modal shows Cloud/Local toggle when connected
- [ ] Saving to cloud uploads images and stores S3 URLs in section content
- [ ] Loading a cloud template renders images from S3 URLs (no IndexedDB)
- [ ] Saving the same cloud template again updates (no duplicate row); version increments
- [ ] Deleting a cloud template removes the row and its S3 images
- [ ] A second browser with the same key sees the same cloud library
- [ ] An invalid key produces "Cloud key was rejected" — not a generic error
- [ ] No regressions in localStorage save/load flow when cloud isn't connected

## Development Notes

- Keep it simple — vanilla JS, no framework, no build step required
- Tailwind handles all section styling
- Editor UI uses separate CSS (`styles/editor.css`)
- Images stored in IndexedDB for persistence
- Future: `toMarkup()` methods enable clean HTML export
