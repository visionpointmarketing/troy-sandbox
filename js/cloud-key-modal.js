/**
 * TROY Sandbox — Cloud Key Modal
 *
 * Small modal that prompts the user for their sandbox API key, stores it in
 * localStorage (via cloud-config.js), and notifies callers so the UI can
 * refresh its cloud-aware state.
 *
 * Also offers a "Disconnect" path that clears the stored key.
 *
 * No HTML for this modal is required in index.html — the modal is created
 * lazily and appended to <body> on first open. Keeps the cloud feature
 * self-contained: if cloud-config.js is never edited, no DOM is added.
 */

import { getCloudKey, setCloudKey, clearCloudKey } from './cloud-config.js';
import { showToast } from './utils.js';

let modalEl = null;
let inputEl = null;
let errorEl = null;
let saveBtn = null;
let cancelBtn = null;
let disconnectBtn = null;
let onSaveCallback = null;

/**
 * Build the modal DOM on first use.
 */
function buildModal() {
    if (modalEl) return;

    modalEl = document.createElement('div');
    modalEl.id = 'cloud-key-modal';
    modalEl.className = 'hidden fixed inset-0 z-50 bg-black/50 flex items-center justify-center';
    modalEl.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 class="text-lg font-bold mb-2">Connect to Cloud Library</h3>
            <p class="text-sm text-gray-600 mb-4">
                Paste the TROY Sandbox API key to enable cloud save and shared templates on this device.
                You only need to do this once per browser.
            </p>
            <div class="mb-4">
                <input
                    type="password"
                    id="cloud-key-input"
                    placeholder="Sandbox API key"
                    autocomplete="off"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-cardinal focus:ring-1 focus:ring-cardinal font-mono text-sm"
                >
                <p id="cloud-key-error" class="hidden mt-2 text-sm text-red-600"></p>
            </div>
            <div class="flex gap-2">
                <button
                    id="cloud-key-disconnect"
                    class="hidden px-4 py-2 bg-gray-100 text-red-700 rounded hover:bg-gray-200"
                    title="Forget the key on this device"
                >Disconnect</button>
                <button id="cloud-key-cancel" class="flex-1 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                <button id="cloud-key-save" class="flex-1 px-4 py-2 bg-cardinal text-white rounded hover:bg-cardinal-dark">Connect</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalEl);

    inputEl = modalEl.querySelector('#cloud-key-input');
    errorEl = modalEl.querySelector('#cloud-key-error');
    saveBtn = modalEl.querySelector('#cloud-key-save');
    cancelBtn = modalEl.querySelector('#cloud-key-cancel');
    disconnectBtn = modalEl.querySelector('#cloud-key-disconnect');

    saveBtn.addEventListener('click', handleSave);
    cancelBtn.addEventListener('click', closeModal);
    disconnectBtn.addEventListener('click', handleDisconnect);

    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
    });
    inputEl.addEventListener('input', hideError);

    modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modalEl.classList.contains('hidden')) {
            closeModal();
        }
    });
}

function showError(message) {
    if (!errorEl) return;
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
    inputEl?.classList.add('error');
}

function hideError() {
    if (!errorEl) return;
    errorEl.classList.add('hidden');
    inputEl?.classList.remove('error');
}

function handleSave() {
    const value = inputEl.value.trim();
    if (!value) {
        showError('Please paste the API key.');
        return;
    }
    if (value.length < 16) {
        showError('That doesn\'t look like a valid API key (too short).');
        return;
    }
    const stored = setCloudKey(value);
    if (!stored) {
        showError('Could not save the key to this browser\'s storage.');
        return;
    }
    closeModal();
    showToast('Connected to cloud library.', { kind: 'info', durationMs: 3000 });
    if (typeof onSaveCallback === 'function') {
        try { onSaveCallback(); } catch (e) { console.warn('onSaveCallback threw:', e); }
    }
}

function handleDisconnect() {
    if (!confirm('Disconnect this browser from the cloud library? You can reconnect later by re-entering the key.')) {
        return;
    }
    clearCloudKey();
    closeModal();
    showToast('Disconnected from cloud library.', { kind: 'info', durationMs: 3000 });
    if (typeof onSaveCallback === 'function') {
        try { onSaveCallback(); } catch (e) { console.warn('onSaveCallback threw:', e); }
    }
}

/**
 * Open the cloud-key modal.
 * @param {Function} onChange - Called after Connect or Disconnect succeeds.
 */
export function openCloudKeyModal(onChange) {
    buildModal();
    onSaveCallback = onChange || null;

    // If already connected, show the Disconnect button and prefill (masked)
    const existing = getCloudKey();
    if (existing) {
        disconnectBtn.classList.remove('hidden');
        inputEl.value = existing;
        inputEl.placeholder = 'Replace with a new key, or click Disconnect';
    } else {
        disconnectBtn.classList.add('hidden');
        inputEl.value = '';
        inputEl.placeholder = 'Sandbox API key';
    }

    hideError();
    modalEl.classList.remove('hidden');
    setTimeout(() => inputEl.focus(), 50);
}

export function closeCloudKeyModal() {
    closeModal();
}

function closeModal() {
    if (modalEl) modalEl.classList.add('hidden');
    onSaveCallback = null;
}

export default { openCloudKeyModal, closeCloudKeyModal };
