/**
 * TROY Sandbox — Main Application
 * Entry point that bootstraps the application
 */

import state from './state.js';
import { initCanvas, render } from './canvas.js';
import { initUI } from './ui.js';
import { initImageStore } from './image-store.js';
import { initImageModal } from './image-upload-modal.js';
import { initPreviewIframe, setStaticContent, updatePreviewContent } from './preview-iframe.js';
import { getTemplateMap } from './sections/index.js';

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
        // Initialize image storage
        await initImageStore();
        console.log('Image store initialized');

        // Initialize image upload modal
        initImageModal();

        // Load static header/footer
        await loadStaticContent();

        // Initialize preview iframe with static content
        initPreviewIframe();
        setStaticContent(
            document.getElementById('static-header').innerHTML,
            document.getElementById('static-footer').innerHTML
        );

        // Initialize state
        state.init();

        // Connect state changes to canvas rendering
        state.onChange = () => {
            render();

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

        console.log('TROY Sandbox ready!');
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}

// Start the application
init();
