# TROY Sandbox

A visual landing page builder for Troy University. Build landing pages by selecting from 6 pre-built section types, editing content inline, and exporting to JSON.

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
| **Statistics** | 4 stat cards showcasing key numbers |
| **Academic Excellence** | Featured program + 3 program cards |
| **Latest Stories** | 3 story cards with images |
| **Brand Story** | Maroon background with quote and image |
| **Final CTA** | Dark background with centered call-to-action |

## Features

- **Inline Editing**: Click any text to edit it directly
- **Image Upload**: Click image areas to upload custom images
- **Drag & Drop**: Reorder sections by dragging
- **Visibility Toggle**: Show/hide individual fields
- **Undo/Redo**: Ctrl/Cmd+Z and Ctrl/Cmd+Y
- **JSON Export/Import**: Save and restore your work

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
│   ├── markup-exporter.js  # HTML export (future)
│   └── sections/           # Section templates
├── styles/
│   └── editor.css          # Editor UI styles
└── assets/
    ├── header.html         # Static header
    └── footer.html         # Static footer
```

## Tailwind Configuration

Uses Tailwind CSS via CDN with Troy brand colors:

- `troy-maroon`: #8B1F32
- `troy-gold`: #C9A227
- `troy-cream`: #F5F0E6

## Future Features

- HTML markup export for production use
- Additional section types
- Integration with Troy's Tailwind config
