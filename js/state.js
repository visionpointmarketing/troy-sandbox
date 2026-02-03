/**
 * TROY Sandbox — State Management
 * Manages section state with undo/redo history
 */

import { getDefaultColors, sectionHasCards } from './color-config.js';

// Generate unique IDs
function generateId() {
    return 'section-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Deep clone helper
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// State object
const state = {
    sections: [],
    history: [],
    historyIndex: -1,
    maxHistory: 50,

    // Callbacks for state changes
    onChange: null,
    onHistoryChange: null,

    /**
     * Initialize state (optionally from saved data)
     */
    init(savedState = null) {
        if (savedState && savedState.sections) {
            this.sections = deepClone(savedState.sections);
        } else {
            this.sections = [];
        }
        this.history = [];
        this.historyIndex = -1;
        this._saveToHistory();
        this._notifyChange();
    },

    /**
     * Get all sections
     */
    getSections() {
        return this.sections;
    },

    /**
     * Get a section by ID
     */
    getSection(id) {
        return this.sections.find(s => s.id === id);
    },

    /**
     * Add a new section
     */
    addSection(type, defaults, fields, defaultColors = null) {
        const section = {
            id: generateId(),
            type: type,
            content: deepClone(defaults),
            visibility: {},
            colors: defaultColors ? deepClone(defaultColors) : getDefaultColors(type)
        };

        // Initialize all fields as visible
        fields.forEach(field => {
            section.visibility[field.key] = true;
        });

        this.sections.push(section);
        this._saveToHistory();
        this._notifyChange();

        return section;
    },

    /**
     * Update section content
     */
    updateSection(id, field, value) {
        const section = this.getSection(id);
        if (section) {
            section.content[field] = value;
            this._saveToHistory();
            this._notifyChange();
        }
    },

    /**
     * Update section content without triggering re-render
     * Used during active editing to preserve cursor position
     */
    updateSectionSilent(id, field, value) {
        const section = this.getSection(id);
        if (section) {
            section.content[field] = value;
            // No _saveToHistory() - will save on blur
            // No _notifyChange() - prevents re-render
        }
    },

    /**
     * Update section visibility
     */
    updateVisibility(id, field, visible) {
        const section = this.getSection(id);
        if (section) {
            section.visibility[field] = visible;
            this._saveToHistory();
            this._notifyChange();
        }
    },

    /**
     * Set all field visibility for a section
     */
    setAllVisibility(id, visible) {
        const section = this.getSection(id);
        if (section) {
            Object.keys(section.visibility).forEach(key => {
                section.visibility[key] = visible;
            });
            this._saveToHistory();
            this._notifyChange();
        }
    },

    /**
     * Duplicate a section
     */
    duplicateSection(id) {
        const section = this.getSection(id);
        if (section) {
            const index = this.sections.findIndex(s => s.id === id);
            const newSection = {
                id: generateId(),
                type: section.type,
                content: deepClone(section.content),
                visibility: deepClone(section.visibility),
                colors: section.colors ? deepClone(section.colors) : getDefaultColors(section.type)
            };
            this.sections.splice(index + 1, 0, newSection);
            this._saveToHistory();
            this._notifyChange();
            return newSection;
        }
        return null;
    },

    /**
     * Update section color
     */
    updateSectionColor(id, colorType, colorKey) {
        const section = this.getSection(id);
        if (section) {
            if (!section.colors) {
                section.colors = getDefaultColors(section.type);
            }
            section.colors[colorType] = colorKey;
            this._saveToHistory();
            this._notifyChange();
        }
    },

    /**
     * Delete a section
     */
    deleteSection(id) {
        const index = this.sections.findIndex(s => s.id === id);
        if (index !== -1) {
            this.sections.splice(index, 1);
            this._saveToHistory();
            this._notifyChange();
        }
    },

    /**
     * Move section to new position
     */
    moveSection(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        if (fromIndex < 0 || fromIndex >= this.sections.length) return;
        if (toIndex < 0 || toIndex >= this.sections.length) return;

        const [section] = this.sections.splice(fromIndex, 1);
        this.sections.splice(toIndex, 0, section);
        this._saveToHistory();
        this._notifyChange();
    },

    /**
     * Undo last action
     */
    undo() {
        if (this.canUndo()) {
            this.historyIndex--;
            this.sections = deepClone(this.history[this.historyIndex]);
            this._notifyChange();
            this._notifyHistoryChange();
        }
    },

    /**
     * Redo previously undone action
     */
    redo() {
        if (this.canRedo()) {
            this.historyIndex++;
            this.sections = deepClone(this.history[this.historyIndex]);
            this._notifyChange();
            this._notifyHistoryChange();
        }
    },

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.historyIndex > 0;
    },

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    },

    /**
     * Export state to JSON
     */
    toJSON() {
        return {
            version: 1,
            exportedAt: new Date().toISOString(),
            sections: deepClone(this.sections)
        };
    },

    /**
     * Import state from JSON
     */
    fromJSON(json) {
        if (json && json.sections && Array.isArray(json.sections)) {
            this.sections = deepClone(json.sections);
            this._saveToHistory();
            this._notifyChange();
            return true;
        }
        return false;
    },

    /**
     * Clear all sections
     */
    clear() {
        this.sections = [];
        this._saveToHistory();
        this._notifyChange();
    },

    // Private methods

    _saveToHistory() {
        // Remove any redo states
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        // Add current state to history
        this.history.push(deepClone(this.sections));
        this.historyIndex = this.history.length - 1;

        // Trim history if too long
        if (this.history.length > this.maxHistory) {
            this.history.shift();
            this.historyIndex--;
        }

        this._notifyHistoryChange();
    },

    _notifyChange() {
        if (this.onChange) {
            this.onChange(this.sections);
        }
    },

    _notifyHistoryChange() {
        if (this.onHistoryChange) {
            this.onHistoryChange(this.canUndo(), this.canRedo());
        }
    }
};

export default state;
