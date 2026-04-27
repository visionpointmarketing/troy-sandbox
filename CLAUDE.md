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

## What's NOT in This Project

- No brand presets/switching (Troy-only)
- No theme toggle (light/dark)
- No Google Docs export
- No PNG export
- No lead form builder
- No writing guidelines panel

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

## Development Notes

- Keep it simple — vanilla JS, no framework, no build step required
- Tailwind handles all section styling
- Editor UI uses separate CSS (`styles/editor.css`)
- Images stored in IndexedDB for persistence
- Future: `toMarkup()` methods enable clean HTML export
