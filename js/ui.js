/**
 * TROY Sandbox — UI Components
 * Sidebar, export/import, and other UI elements
 */

import state from './state.js';
import { getAllTemplates, getTemplate, getTemplateMap } from './sections/index.js';
import { downloadFile, getTimestamp, showToast } from './utils.js';
import { getAllImages, storeImage, clearAllImages } from './image-store.js';
import { setViewportMode, updatePreviewContent } from './preview-iframe.js';
import { getAllPageTemplates, getPageTemplate } from './page-templates.js';
import { validateDesignRules, getStatusMessage } from './design-rules.js';
import { getSavedTemplates, getSavedTemplate, saveTemplate, deleteTemplate } from './template-storage.js';
import { openSaveTemplateModal, closeSaveTemplateModal, setSaving } from './save-template-modal.js';
import { captureScreenshot } from './screenshot-exporter.js';
import {
    isCloudConfigured,
    isCloudConnected,
} from './cloud-config.js';
import {
    getSavedTemplates as cloudListTemplates,
    getSavedTemplate as cloudGetTemplate,
    saveTemplate as cloudSaveTemplate,
    deleteTemplate as cloudDeleteTemplate,
    CloudError,
} from './cloud-storage.js';

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
    initDesignStatusPopover();

    // Run initial validation
    updateDesignStatus(state.getSections());
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
    const saveCurrentBtn = document.getElementById('save-current-template-btn');
    const savedTemplatesSection = document.getElementById('saved-templates-section');
    const savedTemplateList = document.getElementById('saved-template-list');
    // Cloud-related DOM (created lazily in renderCloudSection)
    let cloudSectionEl = null;
    let cloudListEl = null;
    let cloudStatusEl = null;

    if (!templatesBtn || !templatePopover || !templateList) return;

    const pageTemplates = getAllPageTemplates();
    const sectionTemplates = getTemplateMap();

    // Populate preset template list
    templateList.innerHTML = pageTemplates.map(template => `
        <button class="template-card" data-template-id="${template.id}">
            <div class="template-card-header">
                <span class="template-card-name">${template.name}</span>
                <span class="template-card-badge">${template.sectionCount} sections</span>
            </div>
            <div class="template-card-description">${template.description}</div>
        </button>
    `).join('');

    /**
     * Render saved templates list
     */
    function renderSavedTemplates() {
        const savedTemplates = getSavedTemplates();

        if (savedTemplates.length === 0) {
            savedTemplatesSection.classList.add('hidden');
            return;
        }

        savedTemplatesSection.classList.remove('hidden');
        savedTemplateList.innerHTML = savedTemplates.map(template => `
            <div class="saved-template-card" data-saved-template-id="${template.id}">
                <button class="template-card saved">
                    <div class="template-card-header">
                        <span class="template-card-name">${escapeHtml(template.name)}</span>
                        <span class="template-card-badge saved">${template.sectionCount} sections</span>
                    </div>
                </button>
                <button class="saved-template-delete" data-delete-id="${template.id}" title="Delete template">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    // Escape HTML for safe rendering
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // -----------------------------------------------------------------
    // Cloud Library rendering
    // -----------------------------------------------------------------

    /**
     * Lazily create the Cloud Library section inside the popover.
     * Returns the list <div> we render template cards into.
     */
    function ensureCloudSection() {
        if (cloudSectionEl) return cloudListEl;

        const popoverInner = templatePopover;
        cloudSectionEl = document.createElement('div');
        cloudSectionEl.id = 'cloud-templates-section';
        cloudSectionEl.className = 'mb-3';
        cloudSectionEl.innerHTML = `
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">Cloud Library</div>
            <div id="cloud-status" class="text-xs text-gray-400 mb-2 hidden"></div>
            <div id="cloud-template-list" class="space-y-2"></div>
        `;
        // Insert ABOVE the "Your Templates" section (or above starter list)
        const insertBefore = savedTemplatesSection || templateList.parentElement.querySelector('.text-xs.text-gray-500.uppercase');
        if (insertBefore) {
            insertBefore.parentElement.insertBefore(cloudSectionEl, insertBefore);
        } else {
            popoverInner.insertBefore(cloudSectionEl, popoverInner.firstChild);
        }
        cloudListEl = cloudSectionEl.querySelector('#cloud-template-list');
        cloudStatusEl = cloudSectionEl.querySelector('#cloud-status');

        // List click handler — delegated for both load-template and delete
        cloudListEl.addEventListener('click', handleCloudListClick);

        return cloudListEl;
    }

    /**
     * Render the Cloud Library section. Hides itself entirely when cloud
     * is not configured (Phase 1 endpoints not deployed). Otherwise loads
     * and renders the template list directly — the API key is embedded in
     * cloud-config.js so no "Connect" step is required.
     */
    async function renderCloudSection() {
        // Cloud not configured → hide section completely
        if (!isCloudConfigured()) {
            if (cloudSectionEl) cloudSectionEl.classList.add('hidden');
            return;
        }

        ensureCloudSection();
        cloudSectionEl.classList.remove('hidden');

        // Load + render list directly. The X-Sandbox-Key header is set
        // automatically via getCloudKey() inside cloud-storage.js.
        cloudStatusEl.classList.remove('hidden');
        cloudStatusEl.textContent = 'Loading…';
        cloudListEl.innerHTML = '';

        try {
            const cloudTemplates = await cloudListTemplates();
            if (!Array.isArray(cloudTemplates) || cloudTemplates.length === 0) {
                cloudStatusEl.textContent = 'No cloud templates yet. Save one to share with the team.';
                return;
            }
            cloudStatusEl.classList.add('hidden');
            cloudListEl.innerHTML = cloudTemplates.map(t => `
                <div class="saved-template-card" data-cloud-template-id="${escapeAttr(t.templateId)}">
                    <button class="template-card saved">
                        <div class="template-card-header">
                            <span class="template-card-name">${escapeText(t.name)}</span>
                            <span class="template-card-badge saved">${t.sectionCount || 0} sections</span>
                        </div>
                    </button>
                    <button class="saved-template-delete" data-cloud-delete-id="${escapeAttr(t.templateId)}" title="Delete from cloud">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            `).join('');
        } catch (err) {
            const isCloud = err instanceof CloudError;
            if (isCloud && err.code === 'unauthorized') {
                // The embedded key was rejected. This typically means the
                // Lambda SANDBOX_KEY env var was rotated but cloud-config.js
                // hasn't been pushed yet.
                cloudStatusEl.textContent = 'Cloud key was rejected by the server. The deployed key may be out of sync with this build — contact the developer.';
            } else {
                cloudStatusEl.textContent = `Couldn't load cloud templates: ${err.message}`;
            }
        }
    }

    /**
     * Click handler for the cloud template list (load / delete).
     */
    async function handleCloudListClick(e) {
        const deleteBtn = e.target.closest('[data-cloud-delete-id]');
        if (deleteBtn) {
            e.stopPropagation();
            const templateId = deleteBtn.dataset.cloudDeleteId;
            if (!confirm('Delete this template from the cloud library? This cannot be undone.')) return;
            try {
                await cloudDeleteTemplate(templateId);
                showToast('Cloud template deleted.', { kind: 'info', durationMs: 3000 });
                // If the current canvas was tied to this template, decouple it
                if (state.getCloudTemplateId && state.getCloudTemplateId() === templateId) {
                    state.setCloudTemplateId(null);
                }
                renderCloudSection();
            } catch (err) {
                alert(`Failed to delete: ${err.message}`);
            }
            return;
        }

        const card = e.target.closest('[data-cloud-template-id]');
        if (!card) return;
        const templateId = card.dataset.cloudTemplateId;

        const currentSections = state.getSections();
        if (currentSections.length > 0) {
            if (!confirm(`Loading this cloud template will replace your current ${currentSections.length} section(s). Continue?`)) {
                return;
            }
        }

        try {
            const tmpl = await cloudGetTemplate(templateId);
            if (!tmpl || !Array.isArray(tmpl.sections)) {
                alert('Cloud template returned unexpected data.');
                return;
            }
            state.loadTemplate(tmpl.sections, sectionTemplates, { cloudTemplateId: templateId });
            templatePopover.classList.add('hidden');
            templatesBtn.classList.remove('active');
            showToast(`Loaded "${tmpl.name}" from cloud.`, { kind: 'info', durationMs: 3000 });
        } catch (err) {
            alert(`Failed to load cloud template: ${err.message}`);
        }
    }

    /**
     * Safe text escape (separate from the HTML attribute escape).
     */
    function escapeText(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }
    function escapeAttr(str) {
        return String(str == null ? '' : str).replace(/"/g, '&quot;').replace(/</g, '&lt;');
    }

    // Initial render of saved templates
    renderSavedTemplates();
    // Initial render of cloud section (no-op if cloud not configured)
    renderCloudSection();

    // Toggle popover
    templatesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = templatePopover.classList.contains('hidden');

        if (isHidden) {
            // Refresh saved templates list when opening
            renderSavedTemplates();
            // Refresh cloud section too (no-op if cloud not configured)
            renderCloudSection();

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

    // Save Current Page button
    if (saveCurrentBtn) {
        saveCurrentBtn.addEventListener('click', (e) => {
            e.stopPropagation();

            const currentSections = state.getSections();
            if (currentSections.length === 0) {
                alert('Please add at least one section before saving.');
                return;
            }

            openSaveTemplateModal(async (name, destination) => {
                if (destination === 'cloud') {
                    // Cloud save — async, may upload images, may update existing
                    setSaving(true, 'Saving to cloud…');
                    try {
                        const existingId = state.getCloudTemplateId
                            ? state.getCloudTemplateId()
                            : null;
                        const result = await cloudSaveTemplate(
                            name,
                            currentSections,
                            existingId
                        );
                        // Associate the canvas with the saved cloud record
                        if (state.setCloudTemplateId && result?.templateId) {
                            state.setCloudTemplateId(result.templateId);
                        }
                        closeSaveTemplateModal();
                        showToast(
                            result?.created === false
                                ? `Updated "${name}" in cloud library.`
                                : `Saved "${name}" to cloud library.`,
                            { kind: 'info', durationMs: 3000 }
                        );
                        renderCloudSection();
                    } catch (err) {
                        setSaving(false);
                        if (err instanceof CloudError && err.code === 'unauthorized') {
                            alert('Cloud key was rejected by the server. The deployed key may be out of sync with this build — contact the developer.');
                        } else {
                            alert(`Cloud save failed: ${err.message}`);
                        }
                    }
                } else {
                    // Local save — synchronous
                    const saved = saveTemplate(name, currentSections);
                    if (saved) {
                        renderSavedTemplates();
                    }
                    // Modal closes itself on local-save path (see save-template-modal.js)
                }
            });
        });
    }

    // Handle saved template selection and deletion
    if (savedTemplateList) {
        savedTemplateList.addEventListener('click', (e) => {
            // Handle delete button
            const deleteBtn = e.target.closest('.saved-template-delete');
            if (deleteBtn) {
                e.stopPropagation();
                const templateId = deleteBtn.dataset.deleteId;
                const template = getSavedTemplate(templateId);
                if (template && confirm(`Delete "${template.name}"?`)) {
                    deleteTemplate(templateId);
                    renderSavedTemplates();
                }
                return;
            }

            // Handle template card click
            const card = e.target.closest('.saved-template-card');
            if (!card) return;

            const templateId = card.dataset.savedTemplateId;
            const template = getSavedTemplate(templateId);

            if (!template) return;

            // Check if there are existing sections
            const currentSections = state.getSections();
            if (currentSections.length > 0) {
                const confirmed = confirm(
                    `Loading "${template.name}" will replace your current ${currentSections.length} section(s). Continue?`
                );
                if (!confirmed) return;
            }

            // Load the saved template
            state.loadTemplate(template.sections, sectionTemplates);

            // Close popover
            templatePopover.classList.add('hidden');
            templatesBtn.classList.remove('active');
        });
    }

    // Handle preset template selection
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
    const exportScreenshotBtn = document.getElementById('export-screenshot-btn');
    const importBtn = document.getElementById('import-btn');
    const importInput = document.getElementById('import-input');

    // Screenshot Export
    if (exportScreenshotBtn) {
        exportScreenshotBtn.addEventListener('click', () => {
            const sections = state.getSections();
            const templates = getTemplateMap();
            captureScreenshot(sections, templates);
        });
    }

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

/**
 * Initialize design status popover
 */
function initDesignStatusPopover() {
    const statusBtn = document.getElementById('design-status');
    const popover = document.getElementById('design-status-popover');
    const closeBtn = document.getElementById('design-status-close');

    if (!statusBtn || !popover) return;

    // Toggle popover on click
    statusBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isHidden = popover.classList.contains('hidden');

        if (isHidden) {
            // Position popover below button
            const btnRect = statusBtn.getBoundingClientRect();
            const toolbarRect = statusBtn.closest('#toolbar').getBoundingClientRect();

            popover.style.top = `${btnRect.bottom - toolbarRect.top + 8}px`;
            popover.style.left = `${btnRect.left - toolbarRect.left}px`;

            popover.classList.remove('hidden');
        } else {
            popover.classList.add('hidden');
        }
    });

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            popover.classList.add('hidden');
        });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!popover.contains(e.target) && !statusBtn.contains(e.target)) {
            popover.classList.add('hidden');
        }
    });
}

/**
 * Update design status based on current sections
 * @param {Array} sections - Array of section objects
 */
export function updateDesignStatus(sections) {
    const statusEl = document.getElementById('design-status');
    const warningsEl = document.getElementById('design-status-warnings');
    const countsEl = document.getElementById('design-status-counts');

    if (!statusEl) return;

    const result = validateDesignRules(sections);
    const status = getStatusMessage(result);

    // Update status badge — three states map to the existing two CSS classes:
    //   success → ok (green), warning → warning (yellow/red), info → warning (advisory)
    const cssState = status.type === 'success' ? 'ok' : 'warning';
    statusEl.className = `design-status design-status-${cssState}`;

    // Update icon
    const iconSvg = status.type === 'success'
        ? '<polyline points="20 6 9 17 4 12"/>'
        : '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';

    statusEl.querySelector('.status-icon').innerHTML = iconSvg;
    statusEl.querySelector('.status-text').textContent = status.message;

    // Update popover content
    if (warningsEl) {
        if (result.warnings.length > 0) {
            warningsEl.innerHTML = result.warnings.map(w => `
                <div class="status-warning-item">
                    <svg class="status-warning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span class="status-warning-text">${w.message}</span>
                </div>
            `).join('');
        } else {
            warningsEl.innerHTML = `
                <div class="text-sm text-green-700 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    All design rules are satisfied
                </div>
            `;
        }
    }

    // Update counts (v2.4 ruleset: 4 weight categories + halftone, with target ranges)
    if (countsEl && result.counts) {
        const { cardinal, black, sand, light, halftone, total } = result.counts;
        const emphasis = cardinal + black;
        const pct = (n) => total > 0 ? `${Math.round((n / total) * 100)}%` : '—';

        const items = [
            { label: 'Cardinal', count: cardinal, hint: pct(cardinal) },
            { label: 'Black', count: black, hint: pct(black) },
            { label: 'Emphasis', count: emphasis, hint: `${pct(emphasis)} (target 25–35%)` },
            { label: 'Sand', count: sand, hint: `${pct(sand)} (≤35%)` },
            { label: 'White', count: light, hint: `${pct(light)} (target 25–35%)` },
            { label: 'Halftone', count: halftone, hint: `max 1` },
        ];

        countsEl.innerHTML = items.map(({ label, count, hint }) => {
            // Halftone has a hard cap; flag it visually if exceeded.
            const overLimit = label === 'Halftone' && count > 1;
            const statusClass = overLimit ? 'over-limit' : '';
            return `
                <div class="status-count-item ${statusClass}">
                    <span class="status-count-number">${count}</span>
                    <span class="status-count-label">${label}</span>
                    <span class="status-count-hint">${hint}</span>
                </div>
            `;
        }).join('');
    }
}

export default { initUI, updateDesignStatus };
