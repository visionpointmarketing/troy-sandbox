/**
 * TROY Sandbox — In-Page Navigation Section
 * Horizontal navigation bar for anchor links within the page
 */

import { escapeHtml } from '../utils.js';
import { COLORS, getContrastConfig, getBackgroundStyle, getHalftoneClasses } from '../color-config.js';

export default {
    type: 'in-page-nav',
    name: 'In-Page Navigation',
    category: 'content',
    description: 'Horizontal navigation bar for page sections',

    defaults: {
        navItem1: 'About',
        navItem2: 'Highlights',
        navItem3: 'Curriculum',
        navItem4: 'Locations',
        navItem5: 'Careers',
        navItem6: 'Concentrations',
        navItem7: 'FAQ',
        navItem8: 'Contact'
    },

    fields: [
        { key: 'navItem1', label: 'Nav Item 1', type: 'text' },
        { key: 'navItem2', label: 'Nav Item 2', type: 'text' },
        { key: 'navItem3', label: 'Nav Item 3', type: 'text' },
        { key: 'navItem4', label: 'Nav Item 4', type: 'text' },
        { key: 'navItem5', label: 'Nav Item 5', type: 'text' },
        { key: 'navItem6', label: 'Nav Item 6', type: 'text' },
        { key: 'navItem7', label: 'Nav Item 7', type: 'text' },
        { key: 'navItem8', label: 'Nav Item 8', type: 'text' }
    ],

    render(content, visibility, colors = { background: 'white' }) {
        // Get color config
        const bgColor = COLORS[colors.background] || COLORS.white;
        const contrast = getContrastConfig(colors.background);
        const bgStyle = getBackgroundStyle(colors.background);
        const halftoneClasses = getHalftoneClasses(colors.background);

        // Build nav items
        const navItems = [];
        for (let i = 1; i <= 8; i++) {
            const key = `navItem${i}`;
            if (visibility[key] !== false) {
                navItems.push(`
                    <a contenteditable="true" data-field="${key}"
                       class="${contrast.text} font-semibold hover:underline cursor-text whitespace-nowrap">
                        ${escapeHtml(content[key])}
                    </a>
                `);
            }
        }

        return `
            <section class="${bgColor.bgClass} ${halftoneClasses} py-6 border-b border-black/10 relative overflow-hidden"${bgStyle ? ` style="${bgStyle}"` : ''}>
                <div class="container mx-auto px-8 relative z-10">
                    <nav class="flex flex-wrap justify-center gap-x-12 gap-y-4">
                        ${navItems.join('')}
                    </nav>
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = { background: 'white' }) {
        // Get color config
        const bgColor = COLORS[colors.background] || COLORS.white;
        const contrast = getContrastConfig(colors.background);
        const bgStyle = getBackgroundStyle(colors.background);
        const halftoneClasses = getHalftoneClasses(colors.background);

        // Build nav items
        const navItems = [];
        for (let i = 1; i <= 8; i++) {
            const key = `navItem${i}`;
            if (visibility[key] !== false) {
                // Create anchor href from the nav item text
                const href = content[key].toLowerCase().replace(/\s+/g, '-');
                navItems.push(`
            <a href="#${href}" class="${contrast.text} font-semibold hover:underline whitespace-nowrap">
                ${escapeHtml(content[key])}
            </a>`);
            }
        }

        return `
<section class="${bgColor.bgClass} ${halftoneClasses} py-6 border-b border-black/10 relative overflow-hidden"${bgStyle ? ` style="${bgStyle}"` : ''}>
    <div class="container mx-auto px-8 relative z-10">
        <nav class="flex flex-wrap justify-center gap-x-12 gap-y-4">${navItems.join('')}
        </nav>
    </div>
</section>`.trim();
    }
};
