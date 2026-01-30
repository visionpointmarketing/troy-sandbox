/**
 * TROY Sandbox — Markup Exporter
 * Generates clean Tailwind HTML from sections
 *
 * FUTURE FEATURE: This module will export clean, production-ready
 * Tailwind markup that can be used directly in Troy's codebase.
 */

import state from './state.js';
import { getTemplate } from './sections/index.js';

/**
 * Export all sections as clean HTML markup
 * @returns {string} Complete HTML document
 */
export function exportMarkup() {
    const sections = state.getSections();

    const sectionsMarkup = sections.map(section => {
        const template = getTemplate(section.type);
        if (!template || !template.toMarkup) {
            console.warn(`No toMarkup method for section type: ${section.type}`);
            return '';
        }
        return template.toMarkup(section.content);
    }).join('\n\n');

    return sectionsMarkup;
}

/**
 * Export as a complete HTML document
 * @returns {string} Full HTML document with Tailwind CDN
 */
export function exportFullDocument() {
    const markup = exportMarkup();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Troy University Landing Page</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        troy: {
                            maroon: '#8B1F32',
                            gold: '#C9A227',
                            cream: '#F5F0E6',
                            'maroon-dark': '#6B1728'
                        }
                    }
                }
            }
        }
    </script>
</head>
<body>
${markup}
</body>
</html>`;
}

/**
 * Download the markup as an HTML file
 */
export function downloadMarkup() {
    const html = exportFullDocument();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `troy-landing-page-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export default { exportMarkup, exportFullDocument, downloadMarkup };
