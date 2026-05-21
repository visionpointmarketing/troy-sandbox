/**
 * TROY Sandbox — Screenshot Exporter
 * Captures the landing page as a PNG image using html2canvas
 */

import { getDefaultColors } from './color-config.js';
import { BRAND_COLORS } from './color-tokens.js';
import { getTimestamp, showToast } from './utils.js';

let headerHtml = '';
let footerHtml = '';
let baseCssContent = null;

/**
 * Set static content (header/footer) for screenshot rendering
 */
export function setStaticContentForScreenshot(header, footer) {
    headerHtml = header;
    footerHtml = footer;
}

/**
 * Build the inline Tailwind config string from BRAND_COLORS.
 * Matches the pattern from preview-iframe.js
 */
function buildTailwindConfig() {
    const colorsJson = JSON.stringify(BRAND_COLORS);
    return `
tailwind.config = {
    theme: {
        fontFamily: {
            'headline-primary': ['pressio-compressed', 'sans-serif'],
            'headline-secondary': ['pressio-compressed', 'sans-serif'],
            'subhead': ['avenir-lt-pro', 'sans-serif'],
            'body': ['avenir-lt-pro', 'sans-serif'],
        },
        extend: {
            colors: ${colorsJson},
            aspectRatio: { 'feature': '16 / 9' },
        }
    }
}`;
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
        console.warn('Could not load base.css for screenshot:', e);
        baseCssContent = '';
    }
    return baseCssContent;
}

/**
 * Wait for all images in a container to load
 */
function waitForImages(container) {
    const images = container.querySelectorAll('img');
    const promises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.onload = resolve;
            img.onerror = resolve; // Continue even if image fails
        });
    });
    return Promise.all(promises);
}

/**
 * Wait for fonts to be ready
 */
async function waitForFonts() {
    if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
    }
    // Additional delay to ensure fonts are rendered
    return new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Capture screenshot of the current landing page
 * @param {Array} sections - Array of section objects
 * @param {Object} templates - Map of section type to template module
 * @returns {Promise<void>}
 */
export async function captureScreenshot(sections, templates) {
    // Check for html2canvas
    if (typeof html2canvas === 'undefined') {
        showToast('Screenshot library not loaded. Please refresh.', { kind: 'warning' });
        return;
    }

    // Check for empty canvas
    if (!sections || sections.length === 0) {
        showToast('Add sections before capturing a screenshot', { kind: 'warning' });
        return;
    }

    const exportBtn = document.getElementById('export-screenshot-btn');
    const originalContent = exportBtn?.innerHTML;

    try {
        // Show loading state
        if (exportBtn) {
            exportBtn.disabled = true;
            exportBtn.innerHTML = `
                <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Capturing...
            `;
        }

        // Get base.css content
        const css = await getBaseCss();

        // Generate clean markup from sections using toMarkup()
        const sectionsMarkup = sections
            .map(section => {
                const template = templates[section.type];
                if (!template || !template.toMarkup) return '';
                const colors = section.colors || getDefaultColors(section.type);
                return template.toMarkup(section.content, section.visibility, colors);
            })
            .join('\n');

        // Create offscreen container
        const container = document.createElement('div');
        container.id = 'screenshot-container';
        container.style.cssText = `
            position: absolute;
            left: -9999px;
            top: 0;
            width: 1440px;
            background: white;
            font-family: 'avenir-lt-pro', sans-serif;
        `;

        // Build the HTML content
        container.innerHTML = `
            <style>${css}</style>
            ${headerHtml}
            <main>${sectionsMarkup}</main>
            ${footerHtml}
        `;

        document.body.appendChild(container);

        // Wait for images and fonts to load
        await Promise.all([
            waitForImages(container),
            waitForFonts()
        ]);

        // Small delay to ensure rendering is complete
        await new Promise(resolve => setTimeout(resolve, 200));

        // Capture with html2canvas
        const canvas = await html2canvas(container, {
            scale: 2, // Retina quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 1440,
            windowWidth: 1440,
            logging: false,
        });

        // Clean up offscreen container
        container.remove();

        // Convert to PNG and download
        const dataUrl = canvas.toDataURL('image/png');
        const timestamp = getTimestamp();
        const filename = `troy-landing-page-${timestamp}.png`;

        // Create download link
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Screenshot saved!', { kind: 'success' });

    } catch (error) {
        console.error('Screenshot capture failed:', error);
        showToast('Screenshot capture failed. Please try again.', { kind: 'warning' });
    } finally {
        // Restore button state
        if (exportBtn && originalContent) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalContent;
        }
    }
}

export default { captureScreenshot, setStaticContentForScreenshot };
