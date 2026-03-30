/**
 * TROY Sandbox — Split Layout Section
 * 50/50 content and image split with flexible positioning
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

/**
 * Check if any button links are visible
 */
function hasVisibleButtonLinks(visibility) {
    for (let i = 1; i <= 6; i++) {
        if (visibility[`buttonLink${i}`] !== false) return true;
    }
    return false;
}

/**
 * Check if any stacked links are visible
 */
function hasVisibleStackedLinks(visibility) {
    for (let i = 1; i <= 6; i++) {
        if (visibility[`stackedLink${i}`] !== false) return true;
    }
    return false;
}

/**
 * Render a detail row (label + value pair)
 */
function renderDetailRow(content, visibility, labelKey, valueKey, labelClass, textClass) {
    const label = content[labelKey];
    const value = content[valueKey];

    // Skip if both are empty
    if (!label && !value) return '';

    // Check visibility for both fields
    const labelVisible = visibility[labelKey] !== false;
    const valueVisible = visibility[valueKey] !== false;

    if (!labelVisible && !valueVisible) return '';

    return `
        <div class="flex flex-wrap gap-x-2">
            ${labelVisible && label ? `
                <span
                    contenteditable="true"
                    data-field="${labelKey}"
                    class="${labelClass}"
                >${escapeHtml(label)}</span>
            ` : ''}
            ${valueVisible && value ? `
                <span
                    contenteditable="true"
                    data-field="${valueKey}"
                    class="${textClass}"
                >${escapeHtml(value)}</span>
            ` : ''}
        </div>
    `;
}

export default {
    type: 'split-layout',
    name: 'Split Layout',
    category: 'content',
    description: '50/50 content and image split with flexible positioning',

    defaults: {
        variant: 'content-left',
        headline: 'The Helen Keller Lecture Series Returns March 31',
        body: 'This annual event shares powerful stories of resilience and purpose. The lecture honors the enduring legacy of Helen Keller and celebrates strength, courage and the human spirit.',
        detailLabel1: 'Save the Date',
        detailValue1: 'March 31 at 11 AM',
        detailLabel2: '',
        detailValue2: '',
        ctaText: 'LEARN MORE',
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
        stat6Label: 'Square-Foot Recreational Facility',
        // Button links (hidden by default via visibility)
        buttonLink1: 'Arts and Humanities',
        buttonLink2: 'Business and Entrepreneurship',
        buttonLink3: 'Communications',
        buttonLink4: 'Community and Government',
        buttonLink5: 'Dual Enrollment',
        buttonLink6: 'Education',
        // Stacked links (hidden by default via visibility)
        stackedLink1: 'International Student',
        stackedLink2: 'Military / Family Student',
        stackedLink3: 'Veteran / Family Student',
        stackedLink4: 'Online Student',
        stackedLink5: 'Transfer Student',
        stackedLink6: 'Dual Enrollment - Early College Student'
    },

    fields: [
        { key: 'variant', label: 'Layout', type: 'select', options: ['content-left', 'content-right'] },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'detailLabel1', label: 'Detail 1 Label', type: 'text' },
        { key: 'detailValue1', label: 'Detail 1 Value', type: 'text' },
        { key: 'detailLabel2', label: 'Detail 2 Label', type: 'text' },
        { key: 'detailValue2', label: 'Detail 2 Value', type: 'text' },
        { key: 'ctaText', label: 'CTA Text', type: 'text' },
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
        { key: 'stat6Label', label: 'Stat 6 Label', type: 'text' },
        { key: 'buttonLink1', label: 'Button Link 1', type: 'text' },
        { key: 'buttonLink2', label: 'Button Link 2', type: 'text' },
        { key: 'buttonLink3', label: 'Button Link 3', type: 'text' },
        { key: 'buttonLink4', label: 'Button Link 4', type: 'text' },
        { key: 'buttonLink5', label: 'Button Link 5', type: 'text' },
        { key: 'buttonLink6', label: 'Button Link 6', type: 'text' },
        { key: 'stackedLink1', label: 'Stacked Link 1', type: 'text' },
        { key: 'stackedLink2', label: 'Stacked Link 2', type: 'text' },
        { key: 'stackedLink3', label: 'Stacked Link 3', type: 'text' },
        { key: 'stackedLink4', label: 'Stacked Link 4', type: 'text' },
        { key: 'stackedLink5', label: 'Stacked Link 5', type: 'text' },
        { key: 'stackedLink6', label: 'Stacked Link 6', type: 'text' }
    ],

    render(content, visibility, colors = {}) {
        // Get color config
        const bgKey = colors.background || 'black';
        const colorConfig = COLORS[bgKey] || COLORS.black;
        const contrast = getContrastConfig(bgKey);
        const bgClass = colorConfig.bgClass;
        const isDark = colorConfig.isDark;

        // Dynamic classes based on background
        const textClass = contrast.text;
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';
        const detailLabelClass = isDark ? 'text-white font-semibold' : 'text-cardinal font-semibold';

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

        // Build button links grid if any are visible
        let buttonLinksGrid = '';
        if (hasVisibleButtonLinks(visibility)) {
            const buttonClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';
            buttonLinksGrid = `
                <div class="flex flex-wrap gap-3 mt-8">
                    ${[1,2,3,4,5,6].map(i =>
                        visibility[`buttonLink${i}`] !== false && content[`buttonLink${i}`] ? `
                            <a contenteditable="true" data-field="buttonLink${i}"
                               class="${buttonClass} cursor-text">${escapeHtml(content[`buttonLink${i}`])}</a>
                        ` : ''
                    ).join('')}
                </div>
            `;
        }

        // Build stacked links list if any are visible
        let stackedLinksList = '';
        if (hasVisibleStackedLinks(visibility)) {
            stackedLinksList = `
                <div class="space-y-3 mt-8">
                    ${[1,2,3,4,5,6].map(i =>
                        visibility[`stackedLink${i}`] !== false && content[`stackedLink${i}`] ? `
                            <a contenteditable="true" data-field="stackedLink${i}"
                               class="${textClass} font-bold uppercase tracking-wide text-sm block cursor-text">${escapeHtml(content[`stackedLink${i}`])}</a>
                        ` : ''
                    ).join('')}
                </div>
            `;
        }

        // Content column
        const contentCol = `
            <div class="flex flex-col justify-center p-12 lg:p-16">
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
                <!-- Detail rows -->
                <div class="mb-8 space-y-1">
                    ${renderDetailRow(content, visibility, 'detailLabel1', 'detailValue1', detailLabelClass, textClass)}
                    ${renderDetailRow(content, visibility, 'detailLabel2', 'detailValue2', detailLabelClass, textClass)}
                </div>
                ${renderIfVisible(visibility, 'ctaText', `
                    <a
                        contenteditable="true"
                        data-field="ctaText"
                        class="${ctaClass} cursor-text self-start"
                    >${escapeHtml(content.ctaText)}</a>
                `)}
                ${buttonLinksGrid}
                ${stackedLinksList}
                ${statsGrid}
            </div>
        `;

        // Image column
        const imageCol = `
            <div class="relative min-h-[400px] lg:min-h-[500px]">
                ${imageSlot('image', content.image, 'absolute inset-0 w-full h-full object-cover')}
            </div>
        `;

        // Order based on variant
        const isContentRight = content.variant === 'content-right';
        const firstCol = isContentRight ? imageCol : contentCol;
        const secondCol = isContentRight ? contentCol : imageCol;

        return `
            <section class="${bgClass}">
                <div class="grid grid-cols-1 lg:grid-cols-2">
                    ${firstCol}
                    ${secondCol}
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = {}) {
        // Get color config
        const bgKey = colors.background || 'black';
        const colorConfig = COLORS[bgKey] || COLORS.black;
        const contrast = getContrastConfig(bgKey);
        const bgClass = colorConfig.bgClass;
        const isDark = colorConfig.isDark;

        // Dynamic classes based on background
        const textClass = contrast.text;
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';
        const detailLabelClass = isDark ? 'text-white font-semibold' : 'text-cardinal font-semibold';

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

        // Build button links markup if any are visible
        let buttonLinksGrid = '';
        if (hasVisibleButtonLinks(visibility)) {
            const buttonClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';
            let buttonsHtml = '';
            for (let i = 1; i <= 6; i++) {
                if (visibility[`buttonLink${i}`] !== false && content[`buttonLink${i}`]) {
                    buttonsHtml += `<a href="#" class="${buttonClass}">${escapeHtml(content[`buttonLink${i}`])}</a>`;
                }
            }
            if (buttonsHtml) {
                buttonLinksGrid = `
            <div class="flex flex-wrap gap-3 mt-8">${buttonsHtml}</div>`;
            }
        }

        // Build stacked links markup if any are visible
        let stackedLinksList = '';
        if (hasVisibleStackedLinks(visibility)) {
            let linksHtml = '';
            for (let i = 1; i <= 6; i++) {
                if (visibility[`stackedLink${i}`] !== false && content[`stackedLink${i}`]) {
                    linksHtml += `<a href="#" class="${textClass} font-bold uppercase tracking-wide text-sm block">${escapeHtml(content[`stackedLink${i}`])}</a>`;
                }
            }
            if (linksHtml) {
                stackedLinksList = `
            <div class="space-y-3 mt-8">${linksHtml}</div>`;
            }
        }

        // Build detail rows for markup
        let detailRows = '';
        if (content.detailLabel1 || content.detailValue1) {
            const showLabel = visibility.detailLabel1 !== false && content.detailLabel1;
            const showValue = visibility.detailValue1 !== false && content.detailValue1;
            if (showLabel || showValue) {
                detailRows += `<div class="flex flex-wrap gap-x-2">`;
                if (showLabel) detailRows += `<span class="${detailLabelClass}">${escapeHtml(content.detailLabel1)}</span>`;
                if (showValue) detailRows += `<span class="${textClass}">${escapeHtml(content.detailValue1)}</span>`;
                detailRows += `</div>`;
            }
        }
        if (content.detailLabel2 || content.detailValue2) {
            const showLabel = visibility.detailLabel2 !== false && content.detailLabel2;
            const showValue = visibility.detailValue2 !== false && content.detailValue2;
            if (showLabel || showValue) {
                detailRows += `<div class="flex flex-wrap gap-x-2">`;
                if (showLabel) detailRows += `<span class="${detailLabelClass}">${escapeHtml(content.detailLabel2)}</span>`;
                if (showValue) detailRows += `<span class="${textClass}">${escapeHtml(content.detailValue2)}</span>`;
                detailRows += `</div>`;
            }
        }

        // Content column
        const contentCol = `
            <div class="flex flex-col justify-center p-12 lg:p-16">
                ${visibility.headline !== false ? `<h2 class="section-title ${textClass} mb-6">${escapeHtml(content.headline)}</h2>` : ''}
                ${visibility.body !== false ? `<p class="body-text ${textClass} mb-6">${escapeHtml(content.body)}</p>` : ''}
                ${detailRows ? `<div class="mb-8 space-y-1">${detailRows}</div>` : ''}
                ${visibility.ctaText !== false ? `<a href="#" class="${ctaClass} self-start">${escapeHtml(content.ctaText)}</a>` : ''}${buttonLinksGrid}${stackedLinksList}${statsGrid}
            </div>`;

        // Image column
        const imageMarkup = content.image
            ? `<img src="${content.image}" alt="" class="absolute inset-0 w-full h-full object-cover">`
            : '<div class="absolute inset-0 w-full h-full bg-gray-200"></div>';
        const imageCol = `
            <div class="relative min-h-[400px] lg:min-h-[500px]">
                ${imageMarkup}
            </div>`;

        // Order based on variant
        const isContentRight = content.variant === 'content-right';
        const firstCol = isContentRight ? imageCol : contentCol;
        const secondCol = isContentRight ? contentCol : imageCol;

        return `
<section class="${bgClass}">
    <div class="grid grid-cols-1 lg:grid-cols-2">
        ${firstCol}
        ${secondCol}
    </div>
</section>`.trim();
    }
};
