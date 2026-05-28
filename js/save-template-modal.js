/**
 * TROY Sandbox — Save Template Modal
 *
 * Modal for entering a template name when saving. Supports three modes:
 *
 * - Local-only mode (cloud not configured): destination toggle is hidden;
 *   modal asks for a name and saves to localStorage.
 *
 * - Cloud-create mode (cloud configured, no existing cloud association):
 *   destination toggle is shown, defaults to Cloud; modal asks for a name
 *   and creates a new cloud record on save.
 *
 * - Cloud-update mode (cloud configured AND a cloud template is currently
 *   loaded on the canvas): destination toggle is shown but cloud is forced
 *   (toggling to local would create a new local template, decoupling from
 *   the cloud record); an "Updating: <name>" banner is shown; the name
 *   input is pre-filled; the button reads "Update Template"; a "Save as a
 *   new copy instead" link breaks the cloud association so the save creates
 *   a new record under whatever name the user types.
 */

import { templateNameExists } from './template-storage.js';
import { isCloudConfigured } from './cloud-config.js';

let currentCallback = null;
// Set when opened in update mode. The save callback receives this so the
// caller knows whether to update or create.
let updateTemplateId = null;

// DOM elements
let modal, nameInput, errorEl, cancelBtn, confirmBtn;
let destinationGroup, localNote, cloudNote;
let titleEl, updateBanner, updateNameEl, makeNewCopyBtn;

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
    titleEl = document.getElementById('save-template-title');
    updateBanner = document.getElementById('save-template-update-banner');
    updateNameEl = document.getElementById('save-template-update-name');
    makeNewCopyBtn = document.getElementById('save-template-make-new-copy');

    if (!modal || !nameInput || !cancelBtn || !confirmBtn) {
        console.warn('Save template modal elements not found');
        return;
    }

    cancelBtn.addEventListener('click', closeSaveTemplateModal);
    confirmBtn.addEventListener('click', handleConfirm);

    nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        }
    });
    nameInput.addEventListener('input', () => hideError());

    if (destinationGroup) {
        destinationGroup.addEventListener('change', updateDestinationNote);
    }

    // "Save as a new copy instead" — breaks the cloud-update association
    if (makeNewCopyBtn) {
        makeNewCopyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Switch from update mode to create mode (still cloud)
            updateTemplateId = null;
            updateBanner?.classList.add('hidden');
            titleEl.textContent = 'Save as Template';
            confirmBtn.textContent = 'Save Template';
            // Pre-existing name kept in the input so the user can edit it
            nameInput.select();
            nameInput.focus();
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeSaveTemplateModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeSaveTemplateModal();
        }
    });
}

function showError(message) {
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }
    nameInput?.classList.add('error');
}

function hideError() {
    errorEl?.classList.add('hidden');
    nameInput?.classList.remove('error');
}

/**
 * Validate the template name.
 * - In local-create mode we check the local store for name conflicts.
 * - In cloud-create or cloud-update mode the backend allows duplicate names
 *   (cloud uses unique IDs, not names, as the key).
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
    if (destination === 'local' && !updateTemplateId && templateNameExists(name)) {
        showError('A local template with this name already exists.');
        return null;
    }
    return name;
}

function getSelectedDestination() {
    if (!destinationGroup || destinationGroup.classList.contains('hidden')) {
        return 'local';
    }
    const checked = destinationGroup.querySelector('input[name="save-destination"]:checked');
    return checked?.value || 'cloud';
}

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

function handleConfirm() {
    const destination = getSelectedDestination();
    const name = validateName(destination);
    if (!name || !currentCallback) return;

    // Pass the update template ID (if any) to the caller so it can decide
    // between updating the existing record vs creating a new one.
    currentCallback(name, destination, updateTemplateId);

    // Local saves complete synchronously, so we close immediately.
    // Cloud saves are async — the caller closes the modal after success.
    if (destination === 'local') {
        closeSaveTemplateModal();
    }
}

/**
 * Open the modal.
 *
 * @param {Function} callback - Receives (name, destination, updateTemplateId).
 *   updateTemplateId is non-null only when the user is updating an existing
 *   cloud template. Pass that ID through to cloudSaveTemplate() to update.
 * @param {object} [options]
 * @param {string|null} [options.updateTemplateId] - Existing cloud template ID
 *   to update. When provided, the modal opens in update mode.
 * @param {string|null} [options.updateTemplateName] - Existing template name
 *   to pre-fill in the input.
 */
export function openSaveTemplateModal(callback, options = {}) {
    currentCallback = callback;
    updateTemplateId = options.updateTemplateId || null;
    const updateName = options.updateTemplateName || '';

    hideError();
    confirmBtn.disabled = false;

    if (updateTemplateId) {
        // Update mode
        titleEl.textContent = 'Update Template';
        confirmBtn.textContent = 'Update Template';
        nameInput.value = updateName;
        if (updateBanner && updateNameEl) {
            updateNameEl.textContent = updateName || '(unnamed)';
            updateBanner.classList.remove('hidden');
        }
    } else {
        // Create mode
        titleEl.textContent = 'Save as Template';
        confirmBtn.textContent = 'Save Template';
        nameInput.value = '';
        updateBanner?.classList.add('hidden');
    }

    // Show or hide destination toggle based on whether cloud is configured.
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

    modal.classList.remove('hidden');
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
    if (isSaving) {
        confirmBtn.textContent = label;
    } else {
        confirmBtn.textContent = updateTemplateId ? 'Update Template' : 'Save Template';
    }
}

/**
 * Close the modal
 */
export function closeSaveTemplateModal() {
    modal.classList.add('hidden');
    currentCallback = null;
    updateTemplateId = null;
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Save Template';
    }
    if (titleEl) titleEl.textContent = 'Save as Template';
    updateBanner?.classList.add('hidden');
}

export default {
    initSaveTemplateModal,
    openSaveTemplateModal,
    closeSaveTemplateModal,
    setSaving,
};
