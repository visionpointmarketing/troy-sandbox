/**
 * TROY Sandbox — Content Spotlight Section
 * 50/50 content and image split with optional stats grid
 * Supports content-left and content-right variants
 */

import { escapeHtml, renderIfVisible, imageSlot } from '../utils.js';
import { COLORS, getContrastConfig } from '../color-config.js';

/**
 * Render a single stat item
 */
function renderStat(content, visibility, numKey, labelKey, textClass, isDark) {
    const showNum = visibility[numKey] !== false;
    const showLabel = visibility[labelKey] !== false;

    if (!showNum && !showLabel) return '';

    const num = content[numKey];
    const label = content[labelKey];

    return `
        <div>
            ${showNum ? `
                <div
                    contenteditable="true"
                    data-field="${numKey}"
                    class="stat-number ${textClass} text-3xl lg:text-4xl font-bold mb-1"
                >${escapeHtml(num)}</div>
            ` : ''}
            ${showLabel ? `
                <a
                    contenteditable="true"
                    data-field="${labelKey}"
                    class="underline text-sm ${textClass} cursor-text"
                >${escapeHtml(label)}</a>
            ` : ''}
        </div>
    `;
}

/**
 * Check if any stats are visible
 */
function hasVisibleStats(visibility) {
    for (let i = 1; i <= 6; i++) {
        if (visibility[`stat${i}Number`] !== false || visibility[`stat${i}Label`] !== false) {
            return true;
        }
    }
    return false;
}

export default {
    type: 'content-spotlight',
    name: 'Content Spotlight',
    category: 'content',
    description: '50/50 content and image split with optional stats grid',

    defaults: {
        variant: 'content-left',
        headline: 'At TROY, You Can Do It All!',
        body: 'Your home away from home has so much to offer. From championship athletics to world-class performances, diverse dining to global connections, Troy University provides the complete college experience.',
        ctaText: 'Learn More',
        image: null,
        // Stats (hidden by default via visibility)
        stat1Number: '16',
        stat1Label: 'DI Athletic Teams',
        stat2Number: '15+',
        stat2Label: 'On-campus Dining Options',
        stat3Number: '200+',
        stat3Label: 'Annual Fine Arts Performances',
        stat4Number: '60+',
        stat4Label: 'Nations Represented on Campus',
        stat5Number: '$1,250',
        stat5Label: 'Scholarships to Study Abroad',
        stat6Number: '78k+',
        stat6Label: 'Square-Foot Recreational Facility'
    },

    fields: [
        { key: 'variant', label: 'Layout', type: 'select', options: ['content-left', 'content-right'] },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'ctaText', label: 'CTA Button', type: 'text' },
        { key: 'stat1Number', label: 'Stat 1 Number', type: 'text' },
        { key: 'stat1Label', label: 'Stat 1 Label', type: 'text' },
        { key: 'stat2Number', label: 'Stat 2 Number', type: 'text' },
        { key: 'stat2Label', label: 'Stat 2 Label', type: 'text' },
        { key: 'stat3Number', label: 'Stat 3 Number', type: 'text' },
        { key: 'stat3Label', label: 'Stat 3 Label', type: 'text' },
        { key: 'stat4Number', label: 'Stat 4 Number', type: 'text' },
        { key: 'stat4Label', label: 'Stat 4 Label', type: 'text' },
        { key: 'stat5Number', label: 'Stat 5 Number', type: 'text' },
        { key: 'stat5Label', label: 'Stat 5 Label', type: 'text' },
        { key: 'stat6Number', label: 'Stat 6 Number', type: 'text' },
        { key: 'stat6Label', label: 'Stat 6 Label', type: 'text' }
    ],

    render(content, visibility, colors = {}) {
        // Get color config
        const bgKey = colors.background || 'sand';
        const colorConfig = COLORS[bgKey] || COLORS.sand;
        const contrast = getContrastConfig(bgKey);
        const bgClass = colorConfig.bgClass;
        const isDark = colorConfig.isDark;

        // Dynamic classes based on background
        const textClass = contrast.text;
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';

        // Build stats grid if any stats are visible
        let statsGrid = '';
        if (hasVisibleStats(visibility)) {
            statsGrid = `
                <div class="grid grid-cols-2 gap-x-8 gap-y-6 mt-8">
                    ${renderStat(content, visibility, 'stat1Number', 'stat1Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat2Number', 'stat2Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat3Number', 'stat3Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat4Number', 'stat4Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat5Number', 'stat5Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat6Number', 'stat6Label', textClass, isDark)}
                </div>
            `;
        }

        // Content column (no padding needed - container handles spacing)
        const contentCol = `
            <div class="flex flex-col justify-center">
                ${renderIfVisible(visibility, 'headline', `
                    <h2
                        contenteditable="true"
                        data-field="headline"
                        class="section-title ${textClass} mb-6"
                    >${escapeHtml(content.headline)}</h2>
                `)}
                ${renderIfVisible(visibility, 'body', `
                    <p
                        contenteditable="true"
                        data-field="body"
                        class="body-text ${textClass} mb-6"
                    >${escapeHtml(content.body)}</p>
                `)}
                ${renderIfVisible(visibility, 'ctaText', `
                    <a
                        contenteditable="true"
                        data-field="ctaText"
                        class="${ctaClass} cursor-text self-start mb-4"
                    >${escapeHtml(content.ctaText)}</a>
                `)}
                ${statsGrid}
            </div>
        `;

        // Image column (contained with aspect ratio)
        const imageCol = `
            <div class="relative overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
                ${imageSlot('image', content.image, 'absolute inset-0 w-full h-full object-cover')}
            </div>
        `;

        // Order based on variant
        const isContentRight = content.variant === 'content-right';
        const firstCol = isContentRight ? imageCol : contentCol;
        const secondCol = isContentRight ? contentCol : imageCol;

        return `
            <section class="${bgClass} py-24">
                <div class="container mx-auto px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        ${firstCol}
                        ${secondCol}
                    </div>
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = {}) {
        // Get color config
        const bgKey = colors.background || 'sand';
        const colorConfig = COLORS[bgKey] || COLORS.sand;
        const contrast = getContrastConfig(bgKey);
        const bgClass = colorConfig.bgClass;
        const isDark = colorConfig.isDark;

        // Dynamic classes based on background
        const textClass = contrast.text;
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';

        // Build stats grid markup if any stats are visible
        let statsGrid = '';
        if (hasVisibleStats(visibility)) {
            let statsHtml = '';
            for (let i = 1; i <= 6; i++) {
                const showNum = visibility[`stat${i}Number`] !== false;
                const showLabel = visibility[`stat${i}Label`] !== false;
                if (showNum || showLabel) {
                    statsHtml += `
                <div>
                    ${showNum ? `<div class="stat-number ${textClass} text-3xl lg:text-4xl font-bold mb-1">${escapeHtml(content[`stat${i}Number`])}</div>` : ''}
                    ${showLabel ? `<a href="#" class="underline text-sm ${textClass}">${escapeHtml(content[`stat${i}Label`])}</a>` : ''}
                </div>`;
                }
            }
            if (statsHtml) {
                statsGrid = `
            <div class="grid grid-cols-2 gap-x-8 gap-y-6 mt-8">${statsHtml}
            </div>`;
            }
        }

        // Content column (no padding needed - container handles spacing)
        const contentCol = `
        <div class="flex flex-col justify-center">
            ${visibility.headline !== false ? `<h2 class="section-title ${textClass} mb-6">${escapeHtml(content.headline)}</h2>` : ''}
            ${visibility.body !== false ? `<p class="body-text ${textClass} mb-6">${escapeHtml(content.body)}</p>` : ''}
            ${visibility.ctaText !== false ? `<a href="#" class="${ctaClass} self-start mb-4">${escapeHtml(content.ctaText)}</a>` : ''}${statsGrid}
        </div>`;

        // Image column (contained with aspect ratio)
        const imageMarkup = content.image
            ? `<img src="${content.image}" alt="" class="absolute inset-0 w-full h-full object-cover">`
            : '<div class="absolute inset-0 w-full h-full bg-gray-200"></div>';
        const imageCol = `
        <div class="relative overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
            ${imageMarkup}
        </div>`;

        // Order based on variant
        const isContentRight = content.variant === 'content-right';
        const firstCol = isContentRight ? imageCol : contentCol;
        const secondCol = isContentRight ? contentCol : imageCol;

        return `
<section class="${bgClass} py-24">
    <div class="container mx-auto px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            ${firstCol}
            ${secondCol}
        </div>
    </div>
</section>`.trim();
    }
};
