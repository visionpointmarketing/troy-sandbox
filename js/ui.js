/**
 * TROY Sandbox — UI Components
 * Sidebar, export/import, and other UI elements
 */

import state from './state.js';
import { getAllTemplates, getTemplate, getTemplateMap } from './sections/index.js';
import { downloadFile, getTimestamp } from './utils.js';
import { getAllImages, storeImage, clearAllImages } from './image-store.js';
import { setViewportMode, updatePreviewContent } from './preview-iframe.js';
import { getAllPageTemplates, getPageTemplate } from './page-templates.js';

/**
 * Initialize UI components
 */
export function initUI() {
    initSidebar();
    initSidebarToggle();
    initViewportToggle();
    initTemplateDropdown();
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
 * Initialize viewport preview toggle
 */
function initViewportToggle() {
    const toggleGroup = document.getElementById('viewport-toggle');
    const canvas = document.getElementById('canvas');

    if (!toggleGroup || !canvas) return;

    // Load saved preference
    const savedViewport = localStorage.getItem('troy-sandbox-viewport') || 'desktop';
    setViewport(savedViewport);

    // Event delegation for viewport buttons
    toggleGroup.addEventListener('click', (e) => {
        const btn = e.target.closest('.viewport-btn');
        if (!btn) return;
        setViewport(btn.dataset.viewport);
    });

    function setViewport(viewport) {
        // Update button states
        toggleGroup.querySelectorAll('.viewport-btn').forEach(btn => {
            const isActive = btn.dataset.viewport === viewport;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        // Switch between canvas and iframe
        setViewportMode(viewport);

        // Update iframe content when entering preview mode
        if (viewport !== 'desktop') {
            updatePreviewContent(state.sections, getTemplateMap());
        }

        // Save preference
        localStorage.setItem('troy-sandbox-viewport', viewport);
    }
}

/**
 * Initialize template dropdown
 */
function initTemplateDropdown() {
    const templatesBtn = document.getElementById('templates-btn');
    const templatePopover = document.getElementById('template-popover');
    const templateList = document.getElementById('template-list');
    const templateClose = document.getElementById('template-close');

    if (!templatesBtn || !templatePopover || !templateList) return;

    const pageTemplates = getAllPageTemplates();
    const sectionTemplates = getTemplateMap();

    // Populate template list
    templateList.innerHTML = pageTemplates.map(template => `
        <button class="template-card" data-template-id="${template.id}">
            <div class="template-card-header">
                <span class="template-card-name">${template.name}</span>
                <span class="template-card-badge">${template.sectionCount} sections</span>
            </div>
            <div class="template-card-description">${template.description}</div>
        </button>
    `).join('');

    // Toggle popover
    templatesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = templatePopover.classList.contains('hidden');

        if (isHidden) {
            // Position popover below button
            const btnRect = templatesBtn.getBoundingClientRect();
            const toolbarRect = templatesBtn.closest('#toolbar').getBoundingClientRect();

            templatePopover.style.top = `${btnRect.bottom - toolbarRect.top + 8}px`;
            templatePopover.style.left = `${btnRect.left - toolbarRect.left}px`;

            templatePopover.classList.remove('hidden');
            templatesBtn.classList.add('active');
        } else {
            templatePopover.classList.add('hidden');
            templatesBtn.classList.remove('active');
        }
    });

    // Close button
    if (templateClose) {
        templateClose.addEventListener('click', () => {
            templatePopover.classList.add('hidden');
            templatesBtn.classList.remove('active');
        });
    }

    // Handle template selection
    templateList.addEventListener('click', (e) => {
        const card = e.target.closest('.template-card');
        if (!card) return;

        const templateId = card.dataset.templateId;
        const template = getPageTemplate(templateId);

        if (!template) return;

        // Check if there are existing sections
        const currentSections = state.getSections();
        if (currentSections.length > 0) {
            const confirmed = confirm(
                `Loading the "${template.name}" template will replace your current ${currentSections.length} section(s). Continue?`
            );
            if (!confirmed) return;
        }

        // Load the template
        state.loadTemplate(template.sections, sectionTemplates);

        // Close popover
        templatePopover.classList.add('hidden');
        templatesBtn.classList.remove('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!templatePopover.contains(e.target) && !templatesBtn.contains(e.target)) {
            templatePopover.classList.add('hidden');
            templatesBtn.classList.remove('active');
        }
    });
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
