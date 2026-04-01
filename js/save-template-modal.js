/**
 * TROY Sandbox — Save Template Modal
 * Modal for entering template name when saving
 */

import { templateNameExists } from './template-storage.js';

let currentCallback = null;

// DOM elements
let modal, nameInput, errorEl, cancelBtn, confirmBtn;

/**
 * Initialize the modal
 */
export function initSaveTemplateModal() {
    modal = document.getElementById('save-template-modal');
    nameInput = document.getElementById('template-name-input');
    errorEl = document.getElementById('template-name-error');
    cancelBtn = document.getElementById('save-template-cancel');
    confirmBtn = document.getElementById('save-template-confirm');

    if (!modal || !nameInput || !cancelBtn || !confirmBtn) {
        console.warn('Save template modal elements not found');
        return;
    }

    // Cancel button
    cancelBtn.addEventListener('click', closeSaveTemplateModal);

    // Confirm button
    confirmBtn.addEventListener('click', handleConfirm);

    // Enter key in input
    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        }
    });

    // Clear error on input
    nameInput.addEventListener('input', () => {
        hideError();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSaveTemplateModal();
        }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeSaveTemplateModal();
        }
    });
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
    if (nameInput) {
        nameInput.classList.add('error');
    }
}

/**
 * Hide error message
 */
function hideError() {
    if (errorEl) {
        errorEl.classList.add('hidden');
    }
    if (nameInput) {
        nameInput.classList.remove('error');
    }
}

/**
 * Validate the template name
 * @returns {string|null} Validated name or null if invalid
 */
function validateName() {
    const name = nameInput.value.trim();

    if (!name) {
        showError('Please enter a template name.');
        return null;
    }

    if (name.length > 50) {
        showError('Name must be 50 characters or less.');
        return null;
    }

    if (templateNameExists(name)) {
        showError('A template with this name already exists.');
        return null;
    }

    return name;
}

/**
 * Handle confirm button click
 */
function handleConfirm() {
    const name = validateName();
    if (name && currentCallback) {
        currentCallback(name);
        closeSaveTemplateModal();
    }
}

/**
 * Open the modal
 * @param {Function} callback - Called with template name on confirm
 */
export function openSaveTemplateModal(callback) {
    currentCallback = callback;

    // Reset state
    nameInput.value = '';
    hideError();

    // Show modal
    modal.classList.remove('hidden');

    // Focus input
    setTimeout(() => nameInput.focus(), 50);
}

/**
 * Close the modal
 */
export function closeSaveTemplateModal() {
    modal.classList.add('hidden');
    currentCallback = null;
}

export default {
    initSaveTemplateModal,
    openSaveTemplateModal,
    closeSaveTemplateModal
};
