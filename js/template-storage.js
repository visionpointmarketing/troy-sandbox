/**
 * TROY Sandbox — Template Storage
 * localStorage CRUD operations for user-saved templates
 */

const STORAGE_KEY = 'troy-sandbox-templates';
const MAX_TEMPLATES = 20;

/**
 * Get storage data with version check
 * @returns {Object} Storage object with version and templates array
 */
function getStorageData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return { version: 1, templates: [] };
        }
        const data = JSON.parse(raw);
        if (!data.templates || !Array.isArray(data.templates)) {
            return { version: 1, templates: [] };
        }
        return data;
    } catch (error) {
        console.error('Failed to read template storage:', error);
        return { version: 1, templates: [] };
    }
}

/**
 * Save storage data
 * @param {Object} data - Storage object to save
 * @returns {boolean} Success status
 */
function setStorageData(data) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            alert('Storage quota exceeded. Please delete some saved templates and try again.');
        } else {
            console.error('Failed to save template:', error);
            alert('Failed to save template. Please try again.');
        }
        return false;
    }
}

/**
 * Strip base64 images from sections to prevent localStorage bloat
 * @param {Array} sections - Array of section objects
 * @returns {Array} Sections with base64 images replaced with null
 */
export function stripBase64Images(sections) {
    return sections.map(section => {
        const strippedContent = {};
        for (const [key, value] of Object.entries(section.content || {})) {
            if (typeof value === 'string' && value.startsWith('data:image/')) {
                strippedContent[key] = null;
            } else {
                strippedContent[key] = value;
            }
        }
        return {
            ...section,
            content: strippedContent
        };
    });
}

/**
 * Get all saved templates
 * @returns {Array} Array of saved template objects
 */
export function getSavedTemplates() {
    const data = getStorageData();
    return data.templates;
}

/**
 * Get a single saved template by ID
 * @param {string} id - Template ID
 * @returns {Object|null} Template object or null if not found
 */
export function getSavedTemplate(id) {
    const templates = getSavedTemplates();
    return templates.find(t => t.id === id) || null;
}

/**
 * Check if a template name already exists
 * @param {string} name - Template name to check
 * @returns {boolean} True if name exists
 */
export function templateNameExists(name) {
    const templates = getSavedTemplates();
    const normalizedName = name.trim().toLowerCase();
    return templates.some(t => t.name.trim().toLowerCase() === normalizedName);
}

/**
 * Save a new template
 * @param {string} name - Template name
 * @param {Array} sections - Array of section objects
 * @returns {Object|null} Saved template object or null on failure
 */
export function saveTemplate(name, sections) {
    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
        alert('Please enter a template name.');
        return null;
    }
    if (trimmedName.length > 50) {
        alert('Template name must be 50 characters or less.');
        return null;
    }
    if (templateNameExists(trimmedName)) {
        alert('A template with this name already exists. Please choose a different name.');
        return null;
    }

    // Validate sections
    if (!sections || sections.length === 0) {
        alert('Please add at least one section before saving.');
        return null;
    }

    // Check max templates limit
    const data = getStorageData();
    if (data.templates.length >= MAX_TEMPLATES) {
        alert(`You can save up to ${MAX_TEMPLATES} templates. Please delete some templates first.`);
        return null;
    }

    // Strip base64 images and create template
    const strippedSections = stripBase64Images(sections);
    const template = {
        id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: trimmedName,
        sectionCount: sections.length,
        createdAt: new Date().toISOString(),
        sections: strippedSections
    };

    // Save to storage
    data.templates.unshift(template); // Add to beginning for most recent first
    if (setStorageData(data)) {
        return template;
    }
    return null;
}

/**
 * Delete a saved template by ID
 * @param {string} id - Template ID to delete
 * @returns {boolean} Success status
 */
export function deleteTemplate(id) {
    const data = getStorageData();
    const index = data.templates.findIndex(t => t.id === id);
    if (index === -1) {
        return false;
    }
    data.templates.splice(index, 1);
    return setStorageData(data);
}

export default {
    getSavedTemplates,
    getSavedTemplate,
    saveTemplate,
    deleteTemplate,
    templateNameExists,
    stripBase64Images
};
