/**
 * TROY Sandbox — Canvas Rendering
 * Handles section rendering, inline editing, and drag-and-drop
 */

import state from './state.js';
import { getTemplate } from './sections/index.js';
import { wrapSection } from './utils.js';
import { openImageModal } from './image-upload-modal.js';
import { storeImage } from './image-store.js';
import { COLORS, getSectionBackgroundColors, getCardBackgroundColors, sectionHasCards, getDefaultColors } from './color-config.js';

let sectionsContainer = null;
let visibilityPopover = null;
let colorPopover = null;
let currentVisibilitySection = null;
let currentColorSection = null;

// Editing state tracking - prevents re-render during active typing
let isEditing = false;

/**
 * Initialize the canvas
 */
export function initCanvas() {
    sectionsContainer = document.getElementById('sections-container');
    visibilityPopover = document.getElementById('visibility-popover');
    colorPopover = document.getElementById('color-popover');

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

    // Strip HTML from pasted content to prevent XSS
    sectionsContainer.addEventListener('paste', (e) => {
        if (e.target.hasAttribute('contenteditable')) {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        }
    }, true);

    // Visibility popover
    document.getElementById('visibility-close').addEventListener('click', closeVisibilityPopover);
    document.getElementById('visibility-show-all').addEventListener('click', () => setAllVisibility(true));
    document.getElementById('visibility-hide-all').addEventListener('click', () => setAllVisibility(false));

    // Use event delegation for visibility checkboxes to prevent listener accumulation
    document.getElementById('visibility-fields').addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.dataset.field && currentVisibilitySection) {
            state.updateVisibility(currentVisibilitySection, e.target.dataset.field, e.target.checked);
        }
    });

    // Color popover
    document.getElementById('color-close').addEventListener('click', closeColorPopover);

    // Use event delegation for color swatches to prevent listener accumulation
    document.getElementById('section-color-swatches').addEventListener('click', handleColorSwatchClick);
    document.getElementById('card-color-swatches').addEventListener('click', handleColorSwatchClick);

    // Close popovers on outside click
    document.addEventListener('click', (e) => {
        if (!visibilityPopover.contains(e.target) &&
            !e.target.closest('[data-action="visibility"]')) {
            closeVisibilityPopover();
        }
        if (!colorPopover.contains(e.target) &&
            !e.target.closest('[data-action="color"]')) {
            closeColorPopover();
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
        // Pass colors to render, falling back to defaults if not set
        const colors = section.colors || getDefaultColors(section.type);
        const innerHtml = template.render(section.content, section.visibility, colors);
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
            case 'color':
                openColorPopover(sectionId, controlBtn);
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

    // Build field checkboxes (event delegation handles change events)
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

    // Position popover (account for scroll offset)
    const rect = button.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    visibilityPopover.style.top = `${rect.bottom + scrollTop + 8}px`;
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

/**
 * Open color popover for a section
 */
function openColorPopover(sectionId, button) {
    const section = state.getSection(sectionId);
    if (!section) return;

    currentColorSection = sectionId;
    const colors = section.colors || getDefaultColors(section.type);
    const hasCards = sectionHasCards(section.type);

    // Build section background swatches (event delegation handles clicks)
    const sectionSwatches = document.getElementById('section-color-swatches');
    sectionSwatches.innerHTML = getSectionBackgroundColors().map(color => {
        const isSelected = colors.background === color.key;
        const isDark = color.isDark;
        const swatchStyle = color.bgImage
            ? `background-image: url('${color.bgImage}'); background-size: cover;`
            : `background-color: ${color.hex};`;
        return `
            <button
                class="color-swatch ${isSelected ? 'selected' : ''} ${isDark ? 'dark' : 'light'}"
                data-color-type="background"
                data-color-key="${color.key}"
                style="${swatchStyle}"
                title="${color.label}"
            ></button>
        `;
    }).join('');

    // Show/hide card color section
    const cardSection = document.getElementById('card-color-section');
    if (hasCards) {
        cardSection.classList.remove('hidden');

        // Build card background swatches (event delegation handles clicks)
        const cardSwatches = document.getElementById('card-color-swatches');
        cardSwatches.innerHTML = getCardBackgroundColors().map(color => {
            const isSelected = colors.cardBackground === color.key;
            return `
                <button
                    class="color-swatch ${isSelected ? 'selected' : ''} light"
                    data-color-type="cardBackground"
                    data-color-key="${color.key}"
                    style="background-color: ${color.hex};"
                    title="${color.label}"
                ></button>
            `;
        }).join('');
    } else {
        cardSection.classList.add('hidden');
    }

    // Position popover (account for scroll offset)
    const rect = button.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    colorPopover.style.top = `${rect.bottom + scrollTop + 8}px`;
    colorPopover.style.right = `${window.innerWidth - rect.right}px`;
    colorPopover.classList.remove('hidden');
}

/**
 * Handle color swatch click (using event delegation)
 */
function handleColorSwatchClick(e) {
    const swatch = e.target.closest('.color-swatch');
    if (!swatch) return;

    const colorType = swatch.dataset.colorType;
    const colorKey = swatch.dataset.colorKey;

    if (!currentColorSection || !colorType || !colorKey) return;

    // Update state
    state.updateSectionColor(currentColorSection, colorType, colorKey);

    // Update UI - remove selected from siblings, add to clicked
    const container = swatch.parentElement;
    container.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
    swatch.classList.add('selected');
}

/**
 * Close color popover
 */
function closeColorPopover() {
    colorPopover.classList.add('hidden');
    currentColorSection = null;
}

export default { initCanvas, render };
