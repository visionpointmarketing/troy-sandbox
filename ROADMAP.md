# TROY Sandbox — Implementation Roadmap

## Overview

This document tracks implementation progress with detailed checkpoints and testing criteria for each phase.

---

## Phase 0: Documentation ✅
**Status:** Complete

- [x] Create folder at `/Users/breonwilliams/Sites/troy-sandbox`
- [x] Create `CLAUDE.md` - Project context and architecture
- [x] Create `ROADMAP.md` - This file
- [x] Create `SECTIONS.md` - Specification for all 6 sections

---

## Phase 1: Minimal Viable Shell ✅
**Status:** Complete

**Goal:** Get a working app shell that renders an empty canvas

### Tasks
- [x] Create `index.html` with Tailwind CDN and Troy color config
- [x] Create `js/app.js` (minimal bootstrap)
- [x] Create `js/state.js` (basic state structure)
- [x] Create `styles/editor.css` (basic layout)

### Test Criteria
```
✓ Page loads without console errors
✓ Canvas area visible (empty)
✓ Sidebar visible (empty)
✓ Tailwind classes work (test with bg-troy-maroon)
```

---

## Phase 2: State & Core Utils ✅
**Status:** Complete

**Goal:** Working state management with undo/redo

### Tasks
- [x] Complete `js/state.js` with history management
- [x] Create `js/utils.js` (escapeHtml, renderIfVisible, wrapSection)
- [x] Add undo/redo buttons to UI
- [x] Wire up keyboard shortcuts (Ctrl/Cmd+Z, Ctrl/Cmd+Y)

### Test Criteria
```
✓ state.addSection() creates section with ID
✓ state.updateSection() modifies content
✓ state.deleteSection() removes section
✓ state.undo() reverts last change
✓ state.redo() reapplies undone change
✓ Undo button disabled when nothing to undo
✓ Redo button disabled when nothing to redo
✓ Keyboard shortcuts work
```

---

## Phase 3: Section Registry & First Section ✅
**Status:** Complete

**Goal:** One working section to validate the pattern

### Tasks
- [x] Create `js/sections/index.js` (registry pattern)
- [x] Create `js/sections/hero.js` (first section)
- [x] Create `js/canvas.js` (render sections to canvas)
- [x] Create `js/ui.js` (sidebar with section buttons)

### Test Criteria
```
✓ Sidebar shows "Hero" button
✓ Clicking button adds Hero section to canvas
✓ Section renders with default content
✓ Text fields are contenteditable
✓ Clicking text field focuses for editing
✓ Editing text updates state
✓ Duplicate button creates copy of section
✓ Delete button removes section
✓ Controls appear on section hover
```

---

## Phase 4: Image Upload ✅
**Status:** Complete

**Goal:** Working image uploads for sections

### Tasks
- [x] Create `js/image-store.js` (IndexedDB storage)
- [x] Create `js/image-upload-modal.js` (upload modal)
- [x] Add image placeholder to Hero section
- [x] Wire up click handler for image upload

### Test Criteria
```
✓ Clicking image placeholder opens modal
✓ Can select image file from computer
✓ Image preview shows in modal
✓ Confirm uploads and displays image in section
✓ Cancel closes modal without changes
✓ Image persists after page refresh
✓ Image survives undo/redo cycle
✓ Large images are handled gracefully
```

---

## Phase 5: Remaining Sections ✅
**Status:** Complete

**Goal:** Complete all 6 section types

### Tasks
- [x] Create `js/sections/statistics.js`
- [x] Create `js/sections/academic-excellence.js`
- [x] Create `js/sections/latest-stories.js`
- [x] Create `js/sections/brand-story.js`
- [x] Create `js/sections/final-cta.js`
- [x] Add all sections to registry

### Test Criteria (per section)
```
Statistics:
✓ Renders 4 stat cards
✓ All stat numbers editable
✓ All stat labels editable
✓ All stat descriptions editable
✓ Eyebrow, headline, body editable

Academic Excellence:
✓ Featured program image uploads
✓ Featured program text editable
✓ 3 program cards render
✓ Program card text editable

Latest Stories:
✓ 3 story cards render
✓ Story images upload
✓ Category, title, description editable per card

Brand Story:
✓ Maroon background with overlay
✓ All text fields editable
✓ Quote field editable
✓ Image uploads

Final CTA:
✓ Dark background image uploads
✓ Centered content renders
✓ All text fields editable
✓ Both CTA buttons editable
```

---

## Phase 6: Drag-and-Drop & Visibility ✅
**Status:** Complete

**Goal:** Full section manipulation

### Tasks
- [x] Implement drag handle on sections
- [x] Implement drag-and-drop reordering
- [x] Create visibility toggle popover
- [x] Add visibility checkboxes per field
- [x] Add Show All / Hide All buttons

### Test Criteria
```
✓ Drag handle visible on section hover
✓ Dragging section shows visual feedback
✓ Dropping reorders sections correctly
✓ Section order persists in state
✓ Visibility button opens popover
✓ Each field has visibility checkbox
✓ Unchecking hides field in section
✓ Show All checks all boxes
✓ Hide All unchecks all boxes
✓ Visibility state persists
```

---

## Phase 7: Static Header/Footer ✅
**Status:** Complete

**Goal:** Frame the wireframe with Troy branding

### Tasks
- [x] Create `assets/header.html` (placeholder markup)
- [x] Create `assets/footer.html` (placeholder markup)
- [x] Load and render header above sections
- [x] Load and render footer below sections
- [x] Style header/footer to match Troy brand

### Test Criteria
```
✓ Header appears above all sections
✓ Footer appears below all sections
✓ Header is not editable
✓ Footer is not editable
✓ Header is not draggable
✓ Footer is not draggable
✓ Header/footer don't interfere with section editing
```

---

## Phase 8: JSON Export/Import ✅
**Status:** Complete

**Goal:** Save and restore wireframes

### Tasks
- [x] Add Export JSON button to UI
- [x] Implement JSON export (state + images)
- [x] Add Import JSON button to UI
- [x] Implement JSON import with validation
- [x] Handle import errors gracefully

### Test Criteria
```
✓ Export button downloads .json file
✓ Filename includes timestamp
✓ JSON includes all section data
✓ JSON includes image data (base64)
✓ Import button opens file picker
✓ Valid JSON restores all sections
✓ Invalid JSON shows error message
✓ Images restored from JSON
✓ Full round-trip: export → import → export produces same data
```

---

## Phase 9: Polish & Future-Proofing ✅
**Status:** Complete

**Goal:** Production-ready

### Tasks
- [x] Add `toMarkup()` method to all sections
- [x] Create `js/markup-exporter.js` skeleton
- [ ] Add Export HTML button (disabled/coming soon) — Optional future feature
- [x] Final testing pass against all criteria
- [x] Update CLAUDE.md with any changes
- [x] Create README.md for users

### Test Criteria
```
✓ All Phase 1-8 tests pass
✓ No console errors or warnings
✓ toMarkup() returns valid HTML for each section
□ Export HTML button present (disabled) — Future feature
✓ Documentation is accurate and complete
```

---

## Completion Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Documentation | ✅ Complete |
| 1 | Minimal Viable Shell | ✅ Complete |
| 2 | State & Core Utils | ✅ Complete |
| 3 | Section Registry & First Section | ✅ Complete |
| 4 | Image Upload | ✅ Complete |
| 5 | Remaining Sections | ✅ Complete |
| 6 | Drag-and-Drop & Visibility | ✅ Complete |
| 7 | Static Header/Footer | ✅ Complete |
| 8 | JSON Export/Import | ✅ Complete |
| 9 | Polish & Future-Proofing | ✅ Complete |

---

## Pending External Input

- **Troy's Tailwind config** — When provided, update `tailwind.config` in index.html
- **Troy's actual header/footer markup** — Replace placeholder HTML in `assets/`
- **Section markup from showcase page** — Update section `render()` and `toMarkup()` with exact Tailwind classes

---

## Testing the Build

To verify the implementation:

1. Open `index.html` in a browser (via local server)
2. Add each of the 6 section types
3. Edit text inline
4. Upload images
5. Drag sections to reorder
6. Toggle field visibility
7. Export to JSON
8. Import the JSON file
9. Verify all content restored correctly
