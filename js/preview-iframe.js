/**
 * TROY Sandbox — Preview Iframe Manager
 * Renders sections in an iframe for true responsive preview
 */

let iframe = null;
let baseCssContent = null;
let headerHtml = '';
let footerHtml = '';

// Track current viewport mode for proper responsive behavior
let currentViewport = 'desktop';
const viewportWidths = { mobile: 375, tablet: 768 };

// Tailwind config (must match index.html)
const tailwindConfig = `
tailwind.config = {
    theme: {
        fontFamily: {
            'headline-primary': ['pressio-x-compressed', 'sans-serif'],
            'headline-secondary': ['pressio-compressed', 'sans-serif'],
            'subhead': ['avenir-lt-pro', 'sans-serif'],
            'body': ['avenir-lt-pro', 'sans-serif'],
        },
        extend: {
            colors: {
                cardinal: { DEFAULT: '#910039', 800: '#910039', 900: '#720724' },
                sand: { DEFAULT: '#f1efe3', 300: '#e8e6da' },
                wheat: { DEFAULT: '#efd19f', light: '#f5e1b3' },
                grey: '#999999',
            },
            aspectRatio: { 'feature': '16 / 9' },
        }
    }
}`;

/**
 * Initialize the preview iframe system
 */
export function initPreviewIframe() {
    iframe = document.getElementById('preview-iframe');
}

/**
 * Set static content (header/footer) for iframe
 */
export function setStaticContent(header, footer) {
    headerHtml = header;
    footerHtml = footer;
}

/**
 * Fetch and cache base.css content
 */
async function getBaseCss() {
    if (baseCssContent) return baseCssContent;
    try {
        const response = await fetch('static/base.css');
        baseCssContent = await response.text();
    } catch (e) {
        console.warn('Could not load base.css for preview:', e);
        baseCssContent = '';
    }
    return baseCssContent;
}

/**
 * Build complete HTML document for iframe
 */
async function buildDocument(sectionsMarkup) {
    const css = await getBaseCss();

    // Preview-specific styles to disable interactivity on header/footer
    const previewStyles = `
        header, footer, header *, footer * {
            pointer-events: none;
            user-select: none;
        }
    `;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=${viewportWidths[currentViewport] || 'device-width'}, initial-scale=1.0">
    <link rel="stylesheet" href="https://use.typekit.net/yie8ysb.css">
    <script src="https://cdn.tailwindcss.com"><\/script>
    <script>${tailwindConfig}<\/script>
    <style>${css}</style>
    <style>${previewStyles}</style>
</head>
<body class="font-body">
    ${headerHtml}
    <main>${sectionsMarkup}</main>
    ${footerHtml}
</body>
</html>`;
}

/**
 * Update iframe content with current sections
 */
export async function updatePreviewContent(sections, templates) {
    if (!iframe) return;

    // Render sections using toMarkup() (clean HTML, no editor controls)
    const markup = sections
        .filter(s => s.visibility !== false)
        .map(section => {
            const template = templates[section.type];
            if (!template || !template.toMarkup) return '';
            return template.toMarkup(section.content);
        })
        .join('\n');

    const doc = await buildDocument(markup);
    iframe.srcdoc = doc;
}

/**
 * Switch viewport mode
 */
export function setViewportMode(viewport, sections, templates) {
    const canvas = document.getElementById('canvas');
    const canvasWrapper = document.getElementById('canvas-wrapper');

    // Store current viewport for buildDocument
    currentViewport = viewport;

    if (viewport === 'desktop') {
        // Show direct canvas, hide iframe
        canvas.classList.remove('hidden');
        iframe.classList.add('hidden');
        canvasWrapper.classList.remove('preview-mode');
        iframe.classList.remove('tablet', 'mobile');
    } else {
        // Hide canvas, show iframe at correct width
        canvas.classList.add('hidden');
        iframe.classList.remove('hidden', 'tablet', 'mobile');
        iframe.classList.add(viewport);
        canvasWrapper.classList.add('preview-mode');

        // Rebuild content with correct viewport width in meta tag
        if (sections && templates) {
            updatePreviewContent(sections, templates);
        }
    }
}
