/**
 * TROY Sandbox — Save Template Modal
 *
 * Modal for entering a template name when saving. When cloud is connected,
 * exposes a Cloud / Local destination toggle and calls back with the chosen
 * destination. When cloud is not connected, behaves exactly as before
 * (local-only, no toggle).
 */

import { templateNameExists } from './template-storage.js';
import { isCloudConfigured } from './cloud-config.js';

let currentCallback = null;

// DOM elements
let modal, nameInput, errorEl, cancelBtn, confirmBtn;
let destinationGroup, localNote, cloudNote;

/**
 * Initialize the modal
 */
export function initSaveTemplateModal() {
    modal = document.getElementById('save-template-modal');
    nameInput = document.getElementById('template-name-input');
    errorEl = document.getElementById('template-name-error');
    cancelBtn = document.getElementById('save-template-cancel');
    confirmBtn = document.getElementById('save-template-confirm');
    destinationGroup = document.getElementById('save-destination-group');
    localNote = document.getElementById('save-template-local-note');
    cloudNote = document.getElementById('save-template-cloud-note');

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

    // Update note when destination changes
    if (destinationGroup) {
        destinationGroup.addEventListener('change', updateDestinationNote);
    }

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
 * Validate the template name. For local saves we check uniqueness against
 * the local store; for cloud saves the backend handles name conflicts
 * (we still allow same-name templates since cloud uses unique IDs).
 */
function validateName(destination) {
    const name = nameInput.value.trim();

    if (!name) {
        showError('Please enter a template name.');
        return null;
    }

    if (name.length > 50) {
        showError('Name must be 50 characters or less.');
        return null;
    }

    if (destination === 'local' && templateNameExists(name)) {
        showError('A local template with this name already exists.');
        return null;
    }

    return name;
}

/**
 * Returns the currently-selected destination ('cloud' or 'local').
 */
function getSelectedDestination() {
    if (!destinationGroup || destinationGroup.classList.contains('hidden')) {
        return 'local';
    }
    const checked = destinationGroup.querySelector('input[name="save-destination"]:checked');
    return checked?.value || 'cloud';
}

/**
 * Update the descriptive note based on the chosen destination.
 */
function updateDestinationNote() {
    const dest = getSelectedDestination();
    if (dest === 'cloud') {
        cloudNote?.classList.remove('hidden');
        localNote?.classList.add('hidden');
    } else {
        cloudNote?.classList.add('hidden');
        localNote?.classList.remove('hidden');
    }
}

/**
 * Handle confirm button click
 */
function handleConfirm() {
    const destination = getSelectedDestination();
    const name = validateName(destination);
    if (name && currentCallback) {
        currentCallback(name, destination);
        // Note: the caller is responsible for closing the modal AFTER any
        // async cloud-save completes, so users see the spinner state.
        // Local saves complete synchronously, so we close immediately.
        if (destination === 'local') {
            closeSaveTemplateModal();
        }
    }
}

/**
 * Open the modal
 * @param {Function} callback - Called as callback(name, destination) on confirm.
 *   destination is 'cloud' or 'local'.
 */
export function openSaveTemplateModal(callback) {
    currentCallback = callback;

    // Reset state
    nameInput.value = '';
    hideError();
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Save Template';

    // Show or hide destination toggle based on whether cloud is configured.
    // Since the API key is embedded in cloud-config.js, "configured" implies
    // "usable" — no separate connect step is required.
    if (destinationGroup) {
        if (isCloudConfigured()) {
            destinationGroup.classList.remove('hidden');
            // Default to cloud when configured
            const cloudRadio = destinationGroup.querySelector('input[value="cloud"]');
            if (cloudRadio) cloudRadio.checked = true;
        } else {
            destinationGroup.classList.add('hidden');
        }
        updateDestinationNote();
    }

    // Show modal
    modal.classList.remove('hidden');

    // Focus input
    setTimeout(() => nameInput.focus(), 50);
}

/**
 * Disable the confirm button (used during async cloud save). Callers should
 * call this before kicking off an async save, then closeSaveTemplateModal()
 * when done.
 */
export function setSaving(isSaving, label = 'Saving…') {
    if (!confirmBtn) return;
    confirmBtn.disabled = isSaving;
    confirmBtn.textContent = isSaving ? label : 'Save Template';
}

/**
 * Close the modal
 */
export function closeSaveTemplateModal() {
    modal.classList.add('hidden');
    currentCallback = null;
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Save Template';
    }
}

export default {
    initSaveTemplateModal,
    openSaveTemplateModal,
    closeSaveTemplateModal,
    setSaving,
};
