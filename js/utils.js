/**
 * TROY Sandbox — Utility Functions
 */

/**
 * Escape HTML special characters
 */
export function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/**
 * Render content only if visible
 * Returns empty string if field is hidden
 */
export function renderIfVisible(visibility, field, html) {
    if (visibility && visibility[field] === false) {
        return '';
    }
    return html;
}

/**
 * SVG Icons for section controls
 */
const ICONS = {
    drag: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5h6M9 9h6M9 13h6M9 17h6" stroke-linecap="round"/></svg>`,
    visibility: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    duplicate: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    delete: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`
};

/**
 * Wrap section HTML with editor controls
 * Adds drag handle, duplicate/delete/visibility buttons
 */
export function wrapSection(sectionId, sectionType, innerHtml) {
    return `
        <div class="section-wrapper" data-section-id="${sectionId}" data-section-type="${sectionType}">
            <div class="drag-handle" draggable="true" title="Drag to reorder">${ICONS.drag}</div>
            <div class="section-controls">
                <button class="section-control-btn visibility" data-action="visibility" title="Toggle field visibility">
                    ${ICONS.visibility}
                </button>
                <button class="section-control-btn duplicate" data-action="duplicate" title="Duplicate section">
                    ${ICONS.duplicate}
                </button>
                <button class="section-control-btn delete" data-action="delete" title="Delete section">
                    ${ICONS.delete}
                </button>
            </div>
            <div class="section-content">
                ${innerHtml}
            </div>
        </div>
    `;
}

/**
 * Create a contenteditable element
 */
export function editable(tag, field, content, classes = '') {
    const escaped = escapeHtml(content);
    return `<${tag}
        contenteditable="true"
        data-field="${field}"
        class="${classes}"
    >${escaped}</${tag}>`;
}

/**
 * Create an image placeholder or display uploaded image
 */
export function imageSlot(field, imageData, classes = '') {
    if (imageData) {
        return `
            <div class="image-placeholder has-image ${classes}" data-field="${field}" data-image-field="true" style="position: relative;">
                <img src="${imageData}" alt="" class="w-full h-full object-cover">
            </div>
        `;
    }
    return `
        <div class="image-placeholder ${classes}" data-field="${field}" data-image-field="true">
        </div>
    `;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate a timestamp string for filenames
 */
export function getTimestamp() {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
}

/**
 * Download a file
 */
export function downloadFile(content, filename, mimeType = 'application/json') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
