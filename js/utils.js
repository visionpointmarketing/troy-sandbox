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
 * Strip HTML tags from text
 */
export function stripHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.innerHTML = String(text);
    return div.textContent || div.innerText || '';
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
    moveUp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 15l-6-6-6 6"/></svg>`,
    moveDown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>`,
    visibility: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    color: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>`,
    layout: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
    duplicate: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    delete: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`
};

// Section types that support color customization
const COLOR_SECTIONS = ['statistics', 'academic-excellence', 'latest-stories', 'promo-carousel', 'split-layout', 'content-spotlight', 'program-hero', 'in-page-nav'];

// Section types that support variant/layout switching
const VARIANT_SECTIONS = ['promo-carousel', 'split-layout', 'content-spotlight', 'academic-excellence', 'brand-story'];

/**
 * Wrap section HTML with editor controls
 * Adds move buttons, duplicate/delete/visibility buttons
 */
export function wrapSection(sectionId, sectionType, innerHtml) {
    const showColorBtn = COLOR_SECTIONS.includes(sectionType);
    const showVariantBtn = VARIANT_SECTIONS.includes(sectionType);

    return `
        <div class="section-wrapper" data-section-id="${sectionId}" data-section-type="${sectionType}">
            <div class="section-move-controls">
                <button class="move-btn move-up" data-action="move-up" title="Move section up">${ICONS.moveUp}</button>
                <button class="move-btn move-down" data-action="move-down" title="Move section down">${ICONS.moveDown}</button>
            </div>
            <div class="section-controls">
                ${showVariantBtn ? `
                    <button class="section-control-btn variant" data-action="variant" title="Change layout">
                        ${ICONS.layout}
                    </button>
                ` : ''}
                ${showColorBtn ? `
                    <button class="section-control-btn color" data-action="color" title="Change background color">
                        ${ICONS.color}
                    </button>
                ` : ''}
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

/**
 * Show a non-blocking toast notification at the bottom of the screen.
 * Auto-dismisses after `durationMs`. Multiple toasts stack.
 *
 * Used by the color-token migration shim so users see a brief notice when
 * older saved templates / JSON imports are auto-upgraded to the current
 * brand palette. Kept dependency-free (no external CSS required).
 *
 * @param {string} message
 * @param {{ durationMs?: number, kind?: 'info'|'success'|'warning' }} [opts]
 */
export function showToast(message, opts = {}) {
    const { durationMs = 4500, kind = 'info' } = opts;

    // Lazy-create the container
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: '9999',
            pointerEvents: 'none',
        });
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, {
        background: kind === 'warning' ? '#910039' : '#231F20',
        color: '#ffffff',
        padding: '10px 16px',
        borderRadius: '6px',
        fontSize: '14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        opacity: '0',
        transition: 'opacity 200ms ease',
        pointerEvents: 'auto',
        maxWidth: '480px',
    });
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => { toast.style.opacity = '1'; });

    // Auto-dismiss
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 250);
    }, durationMs);
}
