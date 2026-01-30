# CLAUDE.md — TROY Sandbox Project Context

## What This Is

A browser-based visual landing page builder specifically for Troy University. Uses Troy's Tailwind-based design system with 6 pre-built section types. Vanilla JavaScript ES modules, no build step required (Tailwind via CDN), open `index.html` to run.

This is a **standalone project** — not a fork of the wireframe-builder, but a purpose-built tool using similar architectural patterns.

## Architecture

- **ES modules** loaded from `index.html → js/app.js`
- **Section registry pattern**: each section in `js/sections/` exports `type`, `name`, `category`, `defaults`, `fields`, `render()`, and `toMarkup()`
- **`js/sections/index.js`** imports all section modules and exports the registry
- **`wrapSection()`** in `js/utils.js` adds drag handles and controls (duplicate/delete/visibility) around every section's rendered HTML
- **Sidebar** auto-generated from registry (no hardcoded section list)
- **Static header/footer** frame the editable sections (not editable, not draggable)
- **Tailwind CSS** via CDN with Troy color extensions

## Key Files

| File | Role |
|------|------|
| `index.html` | Entry point, Tailwind CDN config, HTML shell |
| `js/app.js` | Bootstrap — loads state, initializes UI and canvas |
| `js/state.js` | State object, section array, history stack, undo/redo |
| `js/canvas.js` | Canvas rendering, inline editing, event delegation, drag-and-drop |
| `js/ui.js` | Sidebar generation, export/import buttons |
| `js/utils.js` | `escapeHtml`, `renderIfVisible`, `wrapSection` |
| `js/image-store.js` | IndexedDB image storage |
| `js/image-upload-modal.js` | Image upload modal component |
| `js/markup-exporter.js` | Future: clean HTML export |
| `js/sections/index.js` | Registry — imports all sections, exports `sectionTemplates` |
| `js/sections/*.js` | Individual section templates (6 total) |
| `styles/editor.css` | Editor UI styles (controls, handles, canvas chrome) |
| `assets/header.html` | Static Troy header markup |
| `assets/footer.html` | Static Troy footer markup |

## Section Types (6 total)

1. **Hero** — Full-width photo background, headline, 2 CTAs
2. **Statistics** — Cream background, 4 stat cards with numbers
3. **Academic Excellence** — 2-column with featured program + 3 program cards
4. **Latest Stories** — 3 story cards with images
5. **Brand Story** — Maroon background, quote, image
6. **Final CTA** — Dark photo background, centered content, 2 CTAs

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
- No background color picker
- No theme toggle (light/dark)
- No Google Docs export
- No PNG export (initially)
- No lead form builder
- No writing guidelines panel

## Testing Checklist

- [ ] All 6 section types render correctly
- [ ] Inline editing works for all text fields
- [ ] Image upload works in sections with image slots
- [ ] Visibility toggle hides/shows fields
- [ ] Duplicate/delete buttons work
- [ ] Drag-and-drop reordering works
- [ ] Undo/redo (Ctrl/Cmd+Z, Ctrl/Cmd+Y)
- [ ] JSON export downloads valid file
- [ ] JSON import restores all sections with content
- [ ] Static header/footer display correctly
- [ ] No console errors on load

## Development Notes

- Keep it simple — vanilla JS, no framework, no build step required
- Tailwind handles all section styling
- Editor UI uses separate CSS (`styles/editor.css`)
- Images stored in IndexedDB for persistence
- Future: `toMarkup()` methods enable clean HTML export
