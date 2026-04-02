# TROY Sandbox

A visual landing page builder for Troy University. Build landing pages by selecting from 11 pre-built section types, editing content inline, and exporting to JSON.

## Quick Start

1. Open `index.html` in a browser (use a local server for full functionality)
2. Click section types in the sidebar to add them to the canvas
3. Edit text directly by clicking on it
4. Click images to upload new ones
5. Drag sections to reorder
6. Export your work as JSON

## Running Locally

For best results, use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Section Types

| Section | Description |
|---------|-------------|
| **Hero** | Full-width background image with headline and CTAs |
| **Program Hero** | Program landing page hero with info box and quick links |
| **Statistics** | 4 stat cards showcasing key numbers |
| **Academic Excellence** | Featured program + 3 program cards |
| **Latest Stories** | 3 story cards with images |
| **Brand Story** | Maroon background with quote and image |
| **Final CTA** | Dark background with centered call-to-action |
| **Promo Carousel** | Full-width promotional banner (promo or news variants) |
| **Split Layout** | 50/50 content and image split with flexible positioning |
| **Content Spotlight** | 50/50 split with stats grid, FAQs, and helpful links |
| **In-Page Navigation** | Horizontal navigation bar for anchor links |

## Features

- **Inline Editing**: Click any text to edit it directly
- **Image Upload**: Click image areas to upload custom images
- **Drag & Drop**: Reorder sections by dragging
- **Visibility Toggle**: Show/hide individual fields
- **Undo/Redo**: Ctrl/Cmd+Z and Ctrl/Cmd+Y
- **JSON Export/Import**: Save and restore your work
- **Background Colors**: 14+ color options per section with brand compliance
- **Design Rules**: Automatic validation against Troy VP Reskin V2 guidelines
- **Page Templates**: Preset templates and save your own custom templates
- **Responsive Preview**: Desktop, tablet, and mobile viewport toggle
- **Layout Variants**: Content-left or content-right positioning for applicable sections

## Project Structure

```
troy-sandbox/
├── index.html              # Main entry point
├── js/
│   ├── app.js              # Bootstrap
│   ├── state.js            # State management
│   ├── canvas.js           # Canvas rendering
│   ├── ui.js               # UI components
│   ├── utils.js            # Utilities
│   ├── image-store.js      # IndexedDB storage
│   ├── image-upload-modal.js
│   ├── markup-exporter.js  # HTML export
│   ├── color-config.js     # Color definitions and contrast logic
│   ├── design-rules.js     # Design rule validation
│   ├── page-templates.js   # Preset template library
│   ├── template-storage.js # User template storage
│   ├── save-template-modal.js
│   ├── preview-iframe.js   # Responsive preview
│   └── sections/           # Section templates (11 total)
├── styles/
│   └── editor.css          # Editor UI styles
├── static/
│   └── base.css            # Base component styles
└── assets/
    ├── header.html         # Static header
    ├── footer.html         # Static footer
    └── textures/           # Halftone texture files
```

## Tailwind Configuration

Uses Tailwind CSS via CDN with Troy brand colors:

- `troy-maroon`: #8B1F32
- `troy-gold`: #C9A227
- `troy-cream`: #F5F0E6

## Future Features

- Integration with Troy's full Tailwind config
- PNG export for presentations
- Google Docs export
