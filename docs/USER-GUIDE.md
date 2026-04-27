# TROY Sandbox User Guide

A visual landing page builder for Troy University marketing teams.

---

## Getting Started

### Opening the Tool

1. Open the `index.html` file in Chrome, Edge, or Safari
2. No installation or setup required—it runs directly in your browser

### Interface Overview

| Area | Purpose |
|------|---------|
| **Sidebar** (left) | Add new sections to your page |
| **Canvas** (center) | Preview and edit your page content |
| **Toolbar** (top) | Templates, export/import, undo/redo, viewport preview |

---

## Building Your Page

### Adding Sections

- Click any section button in the left sidebar to add it to your page
- New sections appear at the bottom of your page

### Editing Content

- **Text**: Click directly on any text to edit it
- **Images**: Click on an image area to upload a new image
- Changes save automatically as you type

### Reordering Sections

- Hover over a section to see the drag handle (left edge)
- Drag sections up or down to reorder them

### Section Controls

Each section has controls in the top-right corner:

| Button | Action |
|--------|--------|
| **Duplicate** | Create a copy of the section |
| **Delete** | Remove the section (cannot be undone) |
| **Eye icon** | Show/hide individual fields within the section |

---

## Section Types

### Hero

Full-width opening section with a dramatic background image.

- **Best for**: Page openers, major campaign landing pages
- **Key fields**: Background image, headline, body text, two CTA buttons
- **Tip**: Headlines support line breaks—press Enter to create multi-line text

### Program Hero

Program landing page hero with info box and quick links.

- **Best for**: Program landing pages, degree pages, academic department pages
- **Key fields**: Program name, two CTAs, note text, degree type, phone, deadline, quick links
- **Default background**: Cardinal halftone
- **Tip**: Use the quick links section to provide direct access to degree maps and catalog pages

### Statistics

Display key numbers and metrics in a grid layout.

- **Best for**: Showcasing achievements, enrollment data, rankings
- **Key fields**: Headline, body text, 4 stat cards (number, label, description)
- **Tip**: Works well with sand or white backgrounds

### Academic Programs

Highlight academic offerings with a featured program and supporting cards.

- **Best for**: Program pages, college showcases, recruitment
- **Key fields**: Headline, body, featured image, 3 program cards with titles and descriptions
- **Layout options**: Content left or content right

### Latest Stories

Display news and stories in a 3-card grid format.

- **Best for**: News sections, student spotlights, research highlights
- **Key fields**: Headline, body, 3 story cards (image, category, title, description)
- **Tip**: Use consistent image sizes for best appearance

### Brand Story

Bold section with cardinal background for institutional messaging.

- **Best for**: Mission statements, brand messaging, college listings
- **Key fields**: Background image, headline, body, CTA, right-side image, up to 6 links
- **Overlay options**: Cardinal or black

### Final CTA

Closing section with background image and floating content block.

- **Best for**: Page closers, conversion points, application prompts
- **Key fields**: Background image, headline, body, up to 3 CTA buttons
- **Tip**: Use a compelling image that reinforces your call to action

### Promo Carousel

Promotional banner with carousel-style visual treatment.

- **Best for**: Announcements, special offers, news highlights
- **Key fields**: Headline, body, CTA button
- **Variants**: Promo (single banner) or News (2 news cards)

### Split Layout

50/50 content and image split for flexible messaging.

- **Best for**: Feature highlights, event promotions, detailed information
- **Key fields**: Headline, body, detail labels/values, CTA, image, optional stats
- **Layout options**: Content left or content right

### Content Spotlight

Similar to Split Layout with an integrated stats grid.

- **Best for**: Campus life highlights, program features, data-driven stories
- **Key fields**: Headline, body, CTA, image, up to 6 stat cards
- **Layout options**: Content left, content right, or content both (two text columns)
- **Optional features**: Quote block, FAQ accordion (up to 6 Q&As), helpful links section

### In-Page Navigation

Horizontal navigation bar for anchor links within the page.

- **Best for**: Long-form program pages, multi-section landing pages
- **Key fields**: Up to 8 navigation items
- **Tip**: Navigation items automatically generate anchor links from their text
- **Background**: Supports all background color options

---

## Using Templates

### Loading a Starter Template

1. Click the **Templates** button in the toolbar
2. Choose from 3 pre-built templates:
   - **Prospective Students** — Undergraduate recruitment focus
   - **Academic Programs** — Program showcase focus
   - **About Troy** — Institutional brand story
3. Click to load (you'll be asked to confirm if you have existing content)

### Saving Your Own Templates

1. Build your page with the sections you want
2. Click **Templates** in the toolbar
3. Click **Save Current Page**
4. Enter a name for your template
5. Your template appears in the "Saved Templates" section

### Managing Saved Templates

- Click a saved template to load it
- Click the trash icon to delete a saved template
- **Note**: Saved templates store layout and text only—images are not saved

---

## Customization Options

### Background Colors

Click the color swatch on any section to choose from 8 brand-aligned background options:

| Light Backgrounds | Dark Backgrounds |
|-------------------|------------------|
| White | Cardinal |
| Sand | Cardinal Dark |
| Sand Halftone | Black |
|  | Cardinal Halftone |
|  | Cardinal + Wheat Halftone |

### Layout Variants

Some sections offer layout options:

- **Content Left**: Text on left, image on right
- **Content Right**: Image on left, text on right

Access layout options through the section's settings panel.

### Visibility Toggles

Hide specific fields without deleting content:

1. Click the **eye icon** on any section
2. Toggle individual fields on/off
3. Hidden fields are preserved but not displayed
4. Great for A/B testing different content combinations

---

## Design Rules

The tool includes soft guidelines based on Troy's Web Reskin CSS Ruleset (v2.4). A status indicator in the toolbar shows your page's compliance.

### The Rules

The ruleset uses **four visual weight categories** — Cardinal, Black, Sand, and Light (white) — and enforces rhythm across the page.

| Rule | What it does | Why It Matters |
|------|--------------|----------------|
| Rhythm | No more than 2 consecutive sections of the same visual weight | Prevents flat or striped layouts |
| Cardinal → Cardinal | Not allowed | Same emphasis twice in a row reads as repetition |
| Black → Black | Not allowed | Same emphasis twice in a row reads as repetition |
| Sand → Sand | Not allowed | Two sand sections back-to-back read as a sand "base" |
| Cardinal → Black | **Allowed** | Distinct weights — creates visual depth |
| Max emphasis run | 2 in a row | Cardinal → Black is fine; a third needs a sand or white break |
| Combined emphasis | ~25–35% of page | Emphasis is impactful when it's not constant |
| Sand distribution | No hard cap (≤35% recommended) | Sand bridges rhythm; shouldn't dominate |
| White presence | ~25–35% of page | White is the page's base for clarity |
| Halftone textures | Max 1 per page | Texture is rare and intentional |

### Checking Status

- **Green checkmark**: All rules satisfied
- **Yellow warning**: A rule was violated (e.g., consecutive same-weight sections, halftone over-cap)
- **Yellow info**: A distribution target is off (e.g., emphasis percentage outside 25–35%)

Click the status indicator to see detailed counts, percentages, and specific warnings.

**Note**: These are soft warnings — you can proceed even if limits are exceeded, but consider adjusting for optimal design.

The full canonical rule set lives in the Troy Web Reskin codebase at `reskin-docs/TROY Web Reskin CSS Ruleset.md`. See `docs/DESIGN-RULES.md` for which rules this builder currently enforces and which are deferred.

---

## Exporting Your Page

### Export as JSON

1. Click **Export** in the toolbar
2. A JSON file downloads automatically
3. The file includes all sections, content, settings, and images

### Import from JSON

1. Click **Import** in the toolbar
2. Select a previously exported JSON file
3. Your page loads with all content restored

### What's Included in Exports

- All section types and order
- All text content
- Background color choices
- Layout variant settings
- Visibility toggle states
- Uploaded images (embedded in the file)

### Sharing with Developers

Export your JSON file and share it with the development team. They can use it to build the final production page with your approved content and layout.

---

## Quick Reference

### Keyboard Shortcuts

| Action | Mac | Windows |
|--------|-----|---------|
| Undo | ⌘ + Z | Ctrl + Z |
| Redo | ⌘ + Shift + Z | Ctrl + Shift + Z |
| Redo (alternate) | ⌘ + Y | Ctrl + Y |

### Tips for Efficiency

- **Start with a template**: Load a starter template, then customize rather than building from scratch
- **Preview responsively**: Use the viewport toggle (desktop/tablet/mobile icons) to check your design
- **Use visibility toggles**: Hide fields instead of deleting—you can always bring them back
- **Save frequently**: Export your work regularly to avoid losing changes
- **Check design status**: Keep an eye on the status indicator to maintain brand compliance

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Changes not saving | Content saves automatically—try refreshing if issues persist |
| Image won't upload | Ensure file is JPG, PNG, or GIF under 10MB |
| Section won't drag | Grab the drag handle on the far left edge of the section |
| Undo not working | Keyboard shortcuts only work when not editing text |
| Template missing images | Saved templates don't include images—re-upload after loading |

---

## Need Help?

Contact the web team for assistance with:

- Technical issues with the tool
- Questions about brand guidelines
- Requests for new section types
- Production implementation of your pages
