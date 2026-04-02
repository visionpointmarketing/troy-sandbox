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
- **Background color picker** with 14+ color options per section
- **Design rules validation** for brand compliance (Troy VP Reskin V2)
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
| `js/color-config.js` | Color definitions, contrast logic, halftone classes |
| `js/design-rules.js` | Design rule validation engine (Troy VP Reskin V2) |
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

Using CDN with Troy color extensions:
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                troy: {
                    maroon: '#8B1F32',
                    gold: '#C9A227',
                    cream: '#F5F0E6'
                }
            }
        }
    }
}
```

When Troy provides their full `tailwind.config.js`, switch to build process.

## State Structure

```javascript
{
    sections: [
        {
            id: 'unique-id',
            type: 'hero',
            content: { /* field values */ },
            visibility: { /* field visibility flags */ }
        }
    ],
    history: [],
    historyIndex: -1
}
```

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
