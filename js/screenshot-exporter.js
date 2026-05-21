/**
 * TROY Sandbox — Screenshot Exporter
 * Captures the landing page as a PNG image using html2canvas
 *
 * Directly captures the canvas element for reliability
 */

import { getDefaultColors } from './color-config.js';
import { getTimestamp, showToast } from './utils.js';

let headerHtml = '';
let footerHtml = '';

/**
 * Set static content (header/footer) for screenshot rendering
 */
export function setStaticContentForScreenshot(header, footer) {
    headerHtml = header;
    footerHtml = footer;
}

/**
 * Capture screenshot of the current landing page
 * Directly captures the canvas element
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
                <span>Capturing...</span>
            `;
        }

        // Get the canvas element directly
        const canvas = document.getElementById('canvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }

        // Hide editor controls temporarily for cleaner capture
        const controls = canvas.querySelectorAll('.section-controls, .section-move-controls');
        controls.forEach(el => el.style.display = 'none');

        // Wait a moment for any animations to settle
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture with html2canvas
        const capturedCanvas = await html2canvas(canvas, {
            scale: 2, // Retina quality
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            // Ignore editor controls
            ignoreElements: (element) => {
                return element.classList?.contains('section-controls') ||
                       element.classList?.contains('section-move-controls');
            }
        });

        // Restore controls
        controls.forEach(el => el.style.display = '');

        // Convert to PNG and download
        const dataUrl = capturedCanvas.toDataURL('image/png');
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
        showToast('Screenshot failed. Please try again.', { kind: 'warning' });
    } finally {
        // Restore button state
        if (exportBtn && originalContent) {
            exportBtn.disabled = false;
            exportBtn.innerHTML = originalContent;
        }
    }
}

export default { captureScreenshot, setStaticContentForScreenshot };
