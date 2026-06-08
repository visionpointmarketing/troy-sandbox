/**
 * TROY Sandbox — Main Application
 * Entry point that bootstraps the application
 */

import state from './state.js';
import { initCanvas, render } from './canvas.js';
import { initUI, updateDesignStatus } from './ui.js';
import { initImageStore } from './image-store.js';
import { initImageModal } from './image-upload-modal.js';
import { initSaveTemplateModal } from './save-template-modal.js';
import { initPreviewIframe, setStaticContent, updatePreviewContent } from './preview-iframe.js';
import { setStaticContentForScreenshot } from './screenshot-exporter.js';
import { getTemplateMap } from './sections/index.js';
import { assertTailwindMirrorsBrandColors } from './color-tokens.js';
import { isCloudConfigured } from './cloud-config.js';
import { getSavedTemplate as cloudGetTemplate, CloudError } from './cloud-storage.js';
import { showToast } from './utils.js';

/**
 * Load static header and footer
 */
async function loadStaticContent() {
    try {
        // Load header
        const headerResponse = await fetch('assets/header.html');
        if (headerResponse.ok) {
            const headerHtml = await headerResponse.text();
            document.getElementById('static-header').innerHTML = headerHtml;
        }

        // Load footer
        const footerResponse = await fetch('assets/footer.html');
        if (footerResponse.ok) {
            const footerHtml = await footerResponse.text();
            document.getElementById('static-footer').innerHTML = footerHtml;
        }
    } catch (error) {
        console.warn('Could not load static header/footer:', error);
    }
}

/**
 * Initialize the application
 */
async function init() {
    console.log('TROY Sandbox initializing...');

    try {
        // Verify the inline Tailwind config in index.html still mirrors
        // js/color-tokens.js BRAND_COLORS. Drift logs an error to the console.
        if (typeof window !== 'undefined' && window.tailwind?.config?.theme?.extend?.colors) {
            assertTailwindMirrorsBrandColors(window.tailwind.config.theme.extend.colors);
        }

        // Initialize image storage
        await initImageStore();
        console.log('Image store initialized');

        // Initialize image upload modal
        initImageModal();

        // Initialize save template modal
        initSaveTemplateModal();

        // Load static header/footer
        await loadStaticContent();

        // Initialize preview iframe with static content
        initPreviewIframe();
        const headerContent = document.getElementById('static-header').innerHTML;
        const footerContent = document.getElementById('static-footer').innerHTML;
        setStaticContent(headerContent, footerContent);

        // Initialize screenshot exporter with static content
        setStaticContentForScreenshot(headerContent, footerContent);

        // Initialize state
        state.init();

        // Connect state changes to canvas rendering
        state.onChange = (sections) => {
            render();

            // Update design rules validation
            updateDesignStatus(sections);

            // Also update iframe preview if in tablet/mobile mode
            const currentViewport = localStorage.getItem('troy-sandbox-viewport') || 'desktop';
            if (currentViewport !== 'desktop') {
                updatePreviewContent(state.sections, getTemplateMap());
            }
        };

        // Initialize UI components
        initUI();

        // Initialize canvas
        initCanvas();

        // After everything is ready, check the URL for ?template=<id>.
        // If present, fetch that cloud template and load it onto the canvas.
        // Lets team members share direct links to specific saved pages
        // instead of telling people "go to Templates and find the one named X".
        await maybeLoadTemplateFromUrl();

        console.log('TROY Sandbox ready!');
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

/**
 * Check the URL for ?template=<id>. If present and cloud is configured,
 * fetch the cloud template and load it onto the canvas, associating the
 * canvas with that cloud record so subsequent saves update it.
 *
 * Silently no-ops if:
 *   - the param is missing (the normal case — fresh editor visit)
 *   - cloud isn't configured (placeholders in cloud-config.js)
 *   - the templateId format is invalid
 *
 * On failure (template missing/deleted, network error), the canvas stays
 * empty and a toast explains why.
 */
async function maybeLoadTemplateFromUrl() {
    let templateId;
    try {
        const params = new URLSearchParams(window.location.search);
        templateId = params.get('template');
    } catch {
        return;
    }
    if (!templateId) return;
    if (!/^tpl_[A-Za-z0-9]{6,32}$/.test(templateId)) {
        console.warn('Invalid ?template= value, ignoring:', templateId);
        return;
    }
    if (!isCloudConfigured()) {
        console.warn('?template= specified but cloud is not configured');
        return;
    }

    try {
        const tmpl = await cloudGetTemplate(templateId);
        if (!tmpl || !Array.isArray(tmpl.sections)) {
            showToast('That template link returned unexpected data.', { kind: 'warning', durationMs: 5000 });
            return;
        }
        state.loadTemplate(tmpl.sections, getTemplateMap(), {
            cloudTemplateId: tmpl.templateId,
            cloudTemplateName: tmpl.name,
        });
        showToast(`Loaded "${tmpl.name}" from shared link.`, { kind: 'info', durationMs: 3000 });
    } catch (err) {
        if (err instanceof CloudError && (err.status === 404 || err.code === 'not_found')) {
            showToast('That template link no longer exists (it may have been deleted).', { kind: 'warning', durationMs: 5000 });
        } else {
            showToast(`Couldn't load the shared template: ${err.message}`, { kind: 'warning', durationMs: 5000 });
        }
    }
}

// Start the application
init();
