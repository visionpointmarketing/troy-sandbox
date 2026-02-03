/**
 * TROY Sandbox — Canvas Rendering
 * Handles section rendering, inline editing, and drag-and-drop
 */

import state from './state.js';
import { getTemplate } from './sections/index.js';
import { wrapSection } from './utils.js';
import { openImageModal } from './image-upload-modal.js';
import { storeImage } from './image-store.js';

let sectionsContainer = null;
let visibilityPopover = null;
let currentVisibilitySection = null;

// Editing state tracking - prevents re-render during active typing
let isEditing = false;

/**
 * Initialize the canvas
 */
export function initCanvas() {
    sectionsContainer = document.getElementById('sections-container');
    visibilityPopover = document.getElementById('visibility-popover');

    // Event delegation for section interactions
    sectionsContainer.addEventListener('click', handleClick);
    sectionsContainer.addEventListener('input', handleInput);
    sectionsContainer.addEventListener('blur', handleBlur, true);

    // Track editing state for render guard
    sectionsContainer.addEventListener('focusin', (e) => {
        if (e.target.hasAttribute('contenteditable')) {
            isEditing = true;
        }
    });

    sectionsContainer.addEventListener('focusout', (e) => {
        if (e.target.hasAttribute('contenteditable')) {
            isEditing = false;
        }
    });

    // Visibility popover
    document.getElementById('visibility-close').addEventListener('click', closeVisibilityPopover);
    document.getElementById('visibility-show-all').addEventListener('click', () => setAllVisibility(true));
    document.getElementById('visibility-hide-all').addEventListener('click', () => setAllVisibility(false));

    // Close popover on outside click
    document.addEventListener('click', (e) => {
        if (!visibilityPopover.contains(e.target) &&
            !e.target.closest('[data-action="visibility"]')) {
            closeVisibilityPopover();
        }
    });

    // Initial render
    render();
}

/**
 * Render all sections to the canvas
 */
export function render() {
    // Skip re-render during active editing to preserve cursor position
    if (isEditing) {
        return;
    }

    const sections = state.getSections();

    if (sections.length === 0) {
        sectionsContainer.innerHTML = `
            <div class="p-12 text-center text-gray-400">
                <p class="text-lg mb-2">No sections yet</p>
                <p class="text-sm">Click a section type in the sidebar to add it</p>
            </div>
        `;
        updateSectionCount(0);
        return;
    }

    sectionsContainer.innerHTML = sections.map(section => {
        const template = getTemplate(section.type);
        if (!template) {
            console.error(`Unknown section type: ${section.type}`);
            return '';
        }
        const innerHtml = template.render(section.content, section.visibility);
        return wrapSection(section.id, section.type, innerHtml);
    }).join('');

    updateSectionCount(sections.length);
    updateMoveButtonStates();
}

/**
 * Update the section count display
 */
function updateSectionCount(count) {
    const countEl = document.getElementById('section-count');
    if (countEl) {
        countEl.textContent = `${count} section${count !== 1 ? 's' : ''}`;
    }
}

/**
 * Handle click events (buttons, image uploads)
 */
function handleClick(e) {
    const target = e.target;

    // Move buttons
    const moveBtn = target.closest('.move-btn');
    if (moveBtn) {
        const action = moveBtn.dataset.action;
        const wrapper = moveBtn.closest('.section-wrapper');
        const index = Array.from(sectionsContainer.children).indexOf(wrapper);

        if (action === 'move-up' && index > 0) {
            state.moveSection(index, index - 1);
        } else if (action === 'move-down' && index < sectionsContainer.children.length - 1) {
            state.moveSection(index, index + 1);
        }
        return;
    }

    // Control buttons
    const controlBtn = target.closest('.section-control-btn');
    if (controlBtn) {
        const action = controlBtn.dataset.action;
        const wrapper = controlBtn.closest('.section-wrapper');
        const sectionId = wrapper?.dataset.sectionId;

        if (!sectionId) return;

        switch (action) {
            case 'duplicate':
                state.duplicateSection(sectionId);
                break;
            case 'delete':
                state.deleteSection(sectionId);
                break;
            case 'visibility':
                openVisibilityPopover(sectionId, controlBtn);
                break;
        }
        return;
    }

    // Image upload
    const imageField = target.closest('[data-image-field="true"]');
    if (imageField) {
        const field = imageField.dataset.field;
        const wrapper = imageField.closest('.section-wrapper');
        const sectionId = wrapper?.dataset.sectionId;

        if (sectionId && field) {
            openImageModal(async (dataUrl) => {
                // Store image in IndexedDB
                const imageId = `${sectionId}-${field}`;
                await storeImage(imageId, dataUrl);

                // Update state
                state.updateSection(sectionId, field, dataUrl);
            });
        }
        return;
    }
}

/**
 * Handle input events (contenteditable)
 * Uses silent update to preserve cursor position
 */
function handleInput(e) {
    const target = e.target;
    if (!target.hasAttribute('contenteditable')) return;

    const field = target.dataset.field;
    if (!field) return;

    const wrapper = target.closest('.section-wrapper');
    const sectionId = wrapper?.dataset.sectionId;

    if (sectionId) {
        // Get text content, preserving line breaks for textareas
        const value = target.innerText;
        // Silent update - state is updated but no re-render
        state.updateSectionSilent(sectionId, field, value);
    }
}

/**
 * Handle blur events (ensure state is saved)
 */
function handleBlur(e) {
    const target = e.target;
    if (!target.hasAttribute('contenteditable')) return;

    const field = target.dataset.field;
    if (!field) return;

    const wrapper = target.closest('.section-wrapper');
    const sectionId = wrapper?.dataset.sectionId;

    if (sectionId) {
        const value = target.innerText;
        state.updateSection(sectionId, field, value);
    }
}

/**
 * Update disabled state of move buttons based on position
 */
function updateMoveButtonStates() {
    const wrappers = sectionsContainer.querySelectorAll('.section-wrapper');
    wrappers.forEach((wrapper, index) => {
        const upBtn = wrapper.querySelector('.move-up');
        const downBtn = wrapper.querySelector('.move-down');
        if (upBtn) upBtn.disabled = (index === 0);
        if (downBtn) downBtn.disabled = (index === wrappers.length - 1);
    });
}

/**
 * Open visibility popover for a section
 */
function openVisibilityPopover(sectionId, button) {
    const section = state.getSection(sectionId);
    if (!section) return;

    const template = getTemplate(section.type);
    if (!template) return;

    currentVisibilitySection = sectionId;

    // Build field checkboxes
    const fieldsContainer = document.getElementById('visibility-fields');
    fieldsContainer.innerHTML = template.fields.map(field => `
        <div class="visibility-field-row">
            <input
                type="checkbox"
                id="vis-${field.key}"
                data-field="${field.key}"
                ${section.visibility[field.key] !== false ? 'checked' : ''}
            >
            <label for="vis-${field.key}">${field.label}</label>
        </div>
    `).join('');

    // Add change listeners
    fieldsContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            state.updateVisibility(currentVisibilitySection, e.target.dataset.field, e.target.checked);
        });
    });

    // Position popover
    const rect = button.getBoundingClientRect();
    visibilityPopover.style.top = `${rect.bottom + 8}px`;
    visibilityPopover.style.right = `${window.innerWidth - rect.right}px`;
    visibilityPopover.classList.remove('hidden');
}

/**
 * Close visibility popover
 */
function closeVisibilityPopover() {
    visibilityPopover.classList.add('hidden');
    currentVisibilitySection = null;
}

/**
 * Set all field visibility for current section
 */
function setAllVisibility(visible) {
    if (!currentVisibilitySection) return;

    state.setAllVisibility(currentVisibilitySection, visible);

    // Update checkboxes
    document.querySelectorAll('#visibility-fields input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = visible;
    });
}

export default { initCanvas, render };
