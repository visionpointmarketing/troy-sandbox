/**
 * TROY Sandbox — Image Upload Modal
 * Handles image upload UI and file selection
 */

import { readFileAsDataURL, storeImage } from './image-store.js';

let currentCallback = null;
let selectedFile = null;

// DOM elements
let modal, dropZone, fileInput, preview, previewImg, cancelBtn, confirmBtn;

/**
 * Initialize the modal
 */
export function initImageModal() {
    modal = document.getElementById('image-modal');
    dropZone = document.getElementById('image-drop-zone');
    fileInput = document.getElementById('image-file-input');
    preview = document.getElementById('image-preview');
    previewImg = document.getElementById('preview-img');
    cancelBtn = document.getElementById('image-cancel-btn');
    confirmBtn = document.getElementById('image-confirm-btn');

    // Click to select file
    dropZone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-active');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-active');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-active');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Cancel button
    cancelBtn.addEventListener('click', closeModal);

    // Confirm button
    confirmBtn.addEventListener('click', confirmUpload);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

/**
 * Handle file selection from input
 */
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

/**
 * Process selected file
 */
async function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        return;
    }

    selectedFile = file;

    // Show preview
    try {
        const dataUrl = await readFileAsDataURL(file);
        previewImg.src = dataUrl;
        preview.classList.remove('hidden');
        confirmBtn.disabled = false;
    } catch (error) {
        console.error('Failed to read file:', error);
        alert('Failed to read image file');
    }
}

/**
 * Confirm the upload
 */
async function confirmUpload() {
    if (!selectedFile || !currentCallback) return;

    try {
        const dataUrl = await readFileAsDataURL(selectedFile);
        currentCallback(dataUrl);
        closeModal();
    } catch (error) {
        console.error('Failed to process image:', error);
        alert('Failed to process image');
    }
}

/**
 * Open the modal
 * @param {Function} callback - Called with base64 data URL on confirm
 */
export function openImageModal(callback) {
    currentCallback = callback;
    selectedFile = null;

    // Reset state
    fileInput.value = '';
    preview.classList.add('hidden');
    previewImg.src = '';
    confirmBtn.disabled = true;

    // Show modal
    modal.classList.remove('hidden');
}

/**
 * Close the modal
 */
export function closeModal() {
    modal.classList.add('hidden');
    currentCallback = null;
    selectedFile = null;
}
