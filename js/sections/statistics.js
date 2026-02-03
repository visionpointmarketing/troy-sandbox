/**
 * TROY Sandbox — Statistics Section
 * Sand background with halftone overlay and 4-column stats grid
 */

import { escapeHtml, renderIfVisible } from '../utils.js';
import { COLORS, getContrastConfig } from '../color-config.js';

export default {
    type: 'statistics',
    name: 'Statistics',
    category: 'content',
    description: 'Stats grid with numbers and labels',

    defaults: {
        badge: 'Student Success',
        headline: 'Real Innovation.\nReal Progress.',
        body: 'Troy University stands out with authentic achievements that demonstrate our commitment to student success and community impact. <strong>Real work always wins.</strong>',
        stat1Number: '95%',
        stat1Label: 'Job Placement Rate',
        stat1Description: 'Within 6 months of graduation',
        stat2Number: '$58K',
        stat2Label: 'Average Starting Salary',
        stat2Description: 'For recent graduates',
        stat3Number: '150+',
        stat3Label: 'Industry Partners',
        stat3Description: 'Providing real-world experience',
        stat4Number: '20:1',
        stat4Label: 'Student-Faculty Ratio',
        stat4Description: 'Personalized attention guaranteed'
    },

    fields: [
        { key: 'badge', label: 'Section Badge', type: 'text' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'stat1Number', label: 'Stat 1 Number', type: 'text' },
        { key: 'stat1Label', label: 'Stat 1 Label', type: 'text' },
        { key: 'stat1Description', label: 'Stat 1 Description', type: 'text' },
        { key: 'stat2Number', label: 'Stat 2 Number', type: 'text' },
        { key: 'stat2Label', label: 'Stat 2 Label', type: 'text' },
        { key: 'stat2Description', label: 'Stat 2 Description', type: 'text' },
        { key: 'stat3Number', label: 'Stat 3 Number', type: 'text' },
        { key: 'stat3Label', label: 'Stat 3 Label', type: 'text' },
        { key: 'stat3Description', label: 'Stat 3 Description', type: 'text' },
        { key: 'stat4Number', label: 'Stat 4 Number', type: 'text' },
        { key: 'stat4Label', label: 'Stat 4 Label', type: 'text' },
        { key: 'stat4Description', label: 'Stat 4 Description', type: 'text' }
    ],

    render(content, visibility, colors = { background: 'sand' }) {
        // Convert newlines to <br> for headline display
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        // Get color config
        const bgColor = COLORS[colors.background] || COLORS.sand;
        const contrast = getContrastConfig(colors.background);

        const renderStatCard = (num, label, desc, numKey, labelKey, descKey) => {
            const showNum = visibility[numKey] !== false;
            const showLabel = visibility[labelKey] !== false;
            const showDesc = visibility[descKey] !== false;

            if (!showNum && !showLabel && !showDesc) return '';

            return `
                <div class="text-center py-8 px-4">
                    ${showNum ? `
                        <div
                            contenteditable="true"
                            data-field="${numKey}"
                            class="stat-number ${contrast.text} mb-3"
                        >${escapeHtml(num)}</div>
                    ` : ''}
                    ${showLabel ? `
                        <div
                            contenteditable="true"
                            data-field="${labelKey}"
                            class="nav-heading ${contrast.text} mb-2"
                        >${escapeHtml(label)}</div>
                    ` : ''}
                    ${showDesc ? `
                        <p
                            contenteditable="true"
                            data-field="${descKey}"
                            class="text-sm ${contrast.text}"
                        >${escapeHtml(desc)}</p>
                    ` : ''}
                </div>
            `;
        };

        return `
            <section class="${bgColor.bgClass} py-24 relative overflow-hidden">
                <!-- Halftone overlay -->
                ${contrast.showHalftone ? '<div class="halftone-overlay absolute inset-0 pointer-events-none"></div>' : ''}

                <div class="container mx-auto px-8 text-center relative z-10">

                    ${renderIfVisible(visibility, 'badge', `
                        <div
                            contenteditable="true"
                            data-field="badge"
                            class="boxed-subhead ${contrast.badgeBg} ${contrast.badgeText} px-6 py-3 inline-block mb-6"
                        >${escapeHtml(content.badge)}</div>
                    `)}

                    ${renderIfVisible(visibility, 'headline', `
                        <h2
                            contenteditable="true"
                            data-field="headline"
                            class="section-title ${contrast.text} mb-12 ${contrast.headerAccentCenter}"
                        >${headlineHtml}</h2>
                    `)}

                    ${renderIfVisible(visibility, 'body', `
                        <p
                            contenteditable="true"
                            data-field="body"
                            class="body-text-large max-w-3xl mx-auto mb-16 ${contrast.text}"
                        >${content.body}</p>
                    `)}

                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        ${renderStatCard(content.stat1Number, content.stat1Label, content.stat1Description, 'stat1Number', 'stat1Label', 'stat1Description')}
                        ${renderStatCard(content.stat2Number, content.stat2Label, content.stat2Description, 'stat2Number', 'stat2Label', 'stat2Description')}
                        ${renderStatCard(content.stat3Number, content.stat3Label, content.stat3Description, 'stat3Number', 'stat3Label', 'stat3Description')}
                        ${renderStatCard(content.stat4Number, content.stat4Label, content.stat4Description, 'stat4Number', 'stat4Label', 'stat4Description')}
                    </div>
                </div>
            </section>
        `;
    },

    toMarkup(content, colors = { background: 'sand' }) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        // Get color config
        const bgColor = COLORS[colors.background] || COLORS.sand;
        const contrast = getContrastConfig(colors.background);

        return `
<section class="${bgColor.bgClass} py-24 relative overflow-hidden">
    ${contrast.showHalftone ? '<div class="halftone-overlay absolute inset-0 pointer-events-none"></div>' : ''}
    <div class="container mx-auto px-8 text-center relative z-10">
        <div class="boxed-subhead ${contrast.badgeBg} ${contrast.badgeText} px-6 py-3 inline-block mb-6">${escapeHtml(content.badge)}</div>
        <h2 class="section-title ${contrast.text} mb-12 ${contrast.headerAccentCenter}">${headlineHtml}</h2>
        <p class="body-text-large max-w-3xl mx-auto mb-16 ${contrast.text}">${content.body}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center py-8 px-4">
                <div class="stat-number ${contrast.text} mb-3">${escapeHtml(content.stat1Number)}</div>
                <div class="nav-heading ${contrast.text} mb-2">${escapeHtml(content.stat1Label)}</div>
                <p class="text-sm ${contrast.text}">${escapeHtml(content.stat1Description)}</p>
            </div>
            <div class="text-center py-8 px-4">
                <div class="stat-number ${contrast.text} mb-3">${escapeHtml(content.stat2Number)}</div>
                <div class="nav-heading ${contrast.text} mb-2">${escapeHtml(content.stat2Label)}</div>
                <p class="text-sm ${contrast.text}">${escapeHtml(content.stat2Description)}</p>
            </div>
            <div class="text-center py-8 px-4">
                <div class="stat-number ${contrast.text} mb-3">${escapeHtml(content.stat3Number)}</div>
                <div class="nav-heading ${contrast.text} mb-2">${escapeHtml(content.stat3Label)}</div>
                <p class="text-sm ${contrast.text}">${escapeHtml(content.stat3Description)}</p>
            </div>
            <div class="text-center py-8 px-4">
                <div class="stat-number ${contrast.text} mb-3">${escapeHtml(content.stat4Number)}</div>
                <div class="nav-heading ${contrast.text} mb-2">${escapeHtml(content.stat4Label)}</div>
                <p class="text-sm ${contrast.text}">${escapeHtml(content.stat4Description)}</p>
            </div>
        </div>
    </div>
</section>`.trim();
    }
};
