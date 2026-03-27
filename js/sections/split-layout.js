/**
 * TROY Sandbox — Split Layout Section
 * 50/50 content and image split with flexible positioning
 * Supports content-left and content-right variants
 */

import { escapeHtml, renderIfVisible, imageSlot } from '../utils.js';
import { COLORS, getContrastConfig } from '../color-config.js';

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
        image: null
    },

    fields: [
        { key: 'variant', label: 'Layout', type: 'select', options: ['content-left', 'content-right'] },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'detailLabel1', label: 'Detail 1 Label', type: 'text' },
        { key: 'detailValue1', label: 'Detail 1 Value', type: 'text' },
        { key: 'detailLabel2', label: 'Detail 2 Label', type: 'text' },
        { key: 'detailValue2', label: 'Detail 2 Value', type: 'text' },
        { key: 'ctaText', label: 'CTA Text', type: 'text' }
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
                ${visibility.ctaText !== false ? `<a href="#" class="${ctaClass} self-start">${escapeHtml(content.ctaText)}</a>` : ''}
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
