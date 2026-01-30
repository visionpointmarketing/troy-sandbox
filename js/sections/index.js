/**
 * TROY Sandbox — Section Registry
 * Imports all section modules and exports the registry
 */

import hero from './hero.js';
import statistics from './statistics.js';
import academicExcellence from './academic-excellence.js';
import latestStories from './latest-stories.js';
import brandStory from './brand-story.js';
import finalCta from './final-cta.js';

// All section templates
const templates = [
    hero,
    statistics,
    academicExcellence,
    latestStories,
    brandStory,
    finalCta
];

// Create lookup map by type
const sectionTemplates = {};
templates.forEach(template => {
    sectionTemplates[template.type] = template;
});

// Categories for sidebar organization (if needed)
const categories = [
    { id: 'hero', name: 'Hero' },
    { id: 'content', name: 'Content' },
    { id: 'cta', name: 'Call to Action' }
];

/**
 * Get all section templates as array
 */
export function getAllTemplates() {
    return templates;
}

/**
 * Get a template by type
 */
export function getTemplate(type) {
    return sectionTemplates[type] || null;
}

/**
 * Get all categories
 */
export function getCategories() {
    return categories;
}

/**
 * Get templates grouped by category
 */
export function getTemplatesByCategory() {
    const grouped = {};
    categories.forEach(cat => {
        grouped[cat.id] = templates.filter(t => t.category === cat.id);
    });
    return grouped;
}

export { sectionTemplates, categories };
export default sectionTemplates;
