/**
 * TROY Sandbox — UI Components
 * Sidebar, export/import, and other UI elements
 */

import state from './state.js';
import { getAllTemplates, getTemplate } from './sections/index.js';
import { downloadFile, getTimestamp } from './utils.js';
import { getAllImages, storeImage, clearAllImages } from './image-store.js';

/**
 * Initialize UI components
 */
export function initUI() {
    initSidebar();
    initSidebarToggle();
    initExportImport();
    initUndoRedo();
    initKeyboardShortcuts();
}

/**
 * Initialize sidebar with section buttons
 */
function initSidebar() {
    const container = document.getElementById('section-buttons');
    const templates = getAllTemplates();

    container.innerHTML = templates.map(template => `
        <button
            class="section-add-btn"
            data-section-type="${template.type}"
        >
            <div class="section-name">${template.name}</div>
            <div class="section-desc">${template.description}</div>
        </button>
    `).join('');

    // Add click handlers
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.section-add-btn');
        if (!btn) return;

        const type = btn.dataset.sectionType;
        const template = getTemplate(type);

        if (template) {
            state.addSection(type, template.defaults, template.fields);
        }
    });
}

/**
 * Initialize sidebar toggle button
 */
function initSidebarToggle() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            toggleBtn.classList.toggle('active');
        });
    }
}

/**
 * Initialize export/import functionality
 */
function initExportImport() {
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importInput = document.getElementById('import-input');

    // Export
    exportBtn.addEventListener('click', async () => {
        const data = state.toJSON();

        // Include images
        try {
            const images = await getAllImages();
            data.images = images;
        } catch (error) {
            console.warn('Could not export images:', error);
            data.images = {};
        }

        const json = JSON.stringify(data, null, 2);
        const filename = `troy-sandbox-${getTimestamp()}.json`;
        downloadFile(json, filename);
    });

    // Import button triggers file input
    importBtn.addEventListener('click', () => {
        importInput.click();
    });

    // Handle file selection
    importInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);

            // Validate structure
            if (!data.sections || !Array.isArray(data.sections)) {
                throw new Error('Invalid file format: missing sections array');
            }

            // Clear existing images and import new ones
            if (data.images) {
                await clearAllImages();
                for (const [id, imageData] of Object.entries(data.images)) {
                    await storeImage(id, imageData);
                }
            }

            // Import state
            if (state.fromJSON(data)) {
                alert('Import successful!');
            } else {
                throw new Error('Failed to import state');
            }
        } catch (error) {
            console.error('Import error:', error);
            alert(`Import failed: ${error.message}`);
        }

        // Reset file input
        importInput.value = '';
    });
}

/**
 * Initialize undo/redo buttons
 */
function initUndoRedo() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');

    undoBtn.addEventListener('click', () => state.undo());
    redoBtn.addEventListener('click', () => state.redo());

    // Update button states when history changes
    state.onHistoryChange = (canUndo, canRedo) => {
        undoBtn.disabled = !canUndo;
        redoBtn.disabled = !canRedo;
    };
}

/**
 * Initialize keyboard shortcuts
 */
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Skip if user is editing text
        if (e.target.hasAttribute('contenteditable') ||
            e.target.tagName === 'INPUT' ||
            e.target.tagName === 'TEXTAREA') {
            return;
        }

        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const modifier = isMac ? e.metaKey : e.ctrlKey;

        if (modifier && e.key === 'z') {
            if (e.shiftKey) {
                e.preventDefault();
                state.redo();
            } else {
                e.preventDefault();
                state.undo();
            }
        }

        if (modifier && e.key === 'y') {
            e.preventDefault();
            state.redo();
        }
    });
}

export default { initUI };
