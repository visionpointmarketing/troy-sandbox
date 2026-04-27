/**
 * TROY Sandbox — Academic Excellence Section
 * Two-column layout with featured program image and program cards
 */

import { escapeHtml, renderIfVisible } from '../utils.js';
import { COLORS, getContrastConfig, getBackgroundStyle, getHalftoneClasses } from '../color-config.js';

export default {
    type: 'academic-excellence',
    name: 'Academic Programs',
    category: 'content',
    description: 'Featured program + 3 program cards',

    defaults: {
        variant: 'content-left',
        headline: 'Real Experiences.\nReal Opportunities.',
        body: 'Our programs are designed around real-world application and hands-on learning. From award-winning academic opportunities to exciting Division I athletics events, TROY provides students with top-notch learning opportunities that showcase the work, not just the results.',
        ctaText: 'Explore Programs',
        featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
        program1Title: 'Engineering',
        program1Description: 'Hands-on learning with industry-standard equipment and real-world projects that prepare you for immediate impact.',
        program2Title: 'Nursing',
        program2Description: 'Clinical excellence through real patient care experiences and state-of-the-art simulation labs.',
        program3Title: 'Education',
        program3Description: 'Transform lives through innovative teaching methods and extensive classroom experience.'
    },

    fields: [
        { key: 'variant', label: 'Layout', type: 'select', options: ['content-left', 'content-right'] },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'ctaText', label: 'CTA Text', type: 'text' },
        { key: 'featuredImage', label: 'Featured Image', type: 'image' },
        { key: 'program1Title', label: 'Program 1 Title', type: 'text' },
        { key: 'program1Description', label: 'Program 1 Description', type: 'text' },
        { key: 'program2Title', label: 'Program 2 Title', type: 'text' },
        { key: 'program2Description', label: 'Program 2 Description', type: 'text' },
        { key: 'program3Title', label: 'Program 3 Title', type: 'text' },
        { key: 'program3Description', label: 'Program 3 Description', type: 'text' }
    ],

    render(content, visibility, colors = { background: 'white' }) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        // Get color config
        const bgColor = COLORS[colors.background] || COLORS.white;
        const contrast = getContrastConfig(colors.background);
        const isDark = bgColor.isDark;
        // CTA: cardinal-style on light, white-style on dark
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';

        // Determine layout variant
        const isContentRight = content.variant === 'content-right';

        const renderProgramCard = (title, desc, titleKey, descKey) => {
            const showTitle = visibility[titleKey] !== false;
            const showDesc = visibility[descKey] !== false;

            if (!showTitle && !showDesc) return '';

            return `
                <div class="program-card">
                    ${showTitle ? `
                        <h3
                            contenteditable="true"
                            data-field="${titleKey}"
                            class="program-title ${contrast.text} mb-4"
                        >${escapeHtml(title)}</h3>
                    ` : ''}
                    ${showDesc ? `
                        <p
                            contenteditable="true"
                            data-field="${descKey}"
                            class="body-text ${contrast.textMuted}"
                        >${escapeHtml(desc)}</p>
                    ` : ''}
                </div>
            `;
        };

        const bgStyle = getBackgroundStyle(colors.background);
        const halftoneClasses = getHalftoneClasses(colors.background);

        // Content column
        const contentCol = `
            <div>
                ${renderIfVisible(visibility, 'headline', `
                    <h2
                        contenteditable="true"
                        data-field="headline"
                        class="section-title ${contrast.text} mb-8"
                    >${headlineHtml}</h2>
                `)}

                ${renderIfVisible(visibility, 'body', `
                    <p
                        contenteditable="true"
                        data-field="body"
                        class="body-text mb-10 ${contrast.text}"
                    >${content.body}</p>
                `)}

                ${renderIfVisible(visibility, 'ctaText', `
                    <a
                        contenteditable="true"
                        data-field="ctaText"
                        class="${ctaClass} cursor-text"
                    >${escapeHtml(content.ctaText)}</a>
                `)}
            </div>
        `;

        // Image column (simplified - no overlay)
        const imageCol = renderIfVisible(visibility, 'featuredImage', `
            <div class="relative overflow-hidden aspect-auto min-h-[280px] sm:aspect-feature cursor-pointer" data-field="featuredImage" data-image-field="true">
                ${content.featuredImage ? `
                    <img src="${content.featuredImage}"
                         alt="Featured Program"
                         class="absolute inset-0 w-full h-full object-cover">
                ` : `
                    <div class="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                        <span class="text-sm">Click to add image</span>
                    </div>
                `}
            </div>
        `);

        // Determine column order based on variant
        const firstCol = isContentRight ? imageCol : contentCol;
        const secondCol = isContentRight ? contentCol : imageCol;

        return `
            <section class="${bgColor.bgClass} ${halftoneClasses} py-24"${bgStyle ? ` style="${bgStyle}"` : ''}>
                <div class="container mx-auto px-8 relative z-10">

                    <!-- Two-column layout -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                        ${firstCol}
                        ${secondCol}
                    </div>

                    <!-- Programs grid -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        ${renderProgramCard(content.program1Title, content.program1Description, 'program1Title', 'program1Description')}
                        ${renderProgramCard(content.program2Title, content.program2Description, 'program2Title', 'program2Description')}
                        ${renderProgramCard(content.program3Title, content.program3Description, 'program3Title', 'program3Description')}
                    </div>
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = { background: 'white' }) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        // Get color config
        const bgColor = COLORS[colors.background] || COLORS.white;
        const contrast = getContrastConfig(colors.background);
        const bgStyle = getBackgroundStyle(colors.background);
        const halftoneClasses = getHalftoneClasses(colors.background);
        const isDark = bgColor.isDark;
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';

        // Determine layout variant
        const isContentRight = content.variant === 'content-right';

        const renderProgramMarkup = (title, desc, titleKey, descKey) => {
            const showTitle = visibility[titleKey] !== false;
            const showDesc = visibility[descKey] !== false;

            if (!showTitle && !showDesc) return '';

            return `
            <div class="program-card">
                ${showTitle ? `<h3 class="program-title ${contrast.text} mb-4">${escapeHtml(title)}</h3>` : ''}
                ${showDesc ? `<p class="body-text ${contrast.textMuted}">${escapeHtml(desc)}</p>` : ''}
            </div>`;
        };

        // Content column markup
        const contentColMarkup = `
            <div>
                ${visibility.headline !== false ? `<h2 class="section-title ${contrast.text} mb-8">${headlineHtml}</h2>` : ''}
                ${visibility.body !== false ? `<p class="body-text mb-10 ${contrast.text}">${escapeHtml(content.body)}</p>` : ''}
                ${visibility.ctaText !== false ? `<a href="#" class="${ctaClass}">${escapeHtml(content.ctaText)}</a>` : ''}
            </div>`;

        // Image column markup (simplified - no overlay)
        const imageColMarkup = visibility.featuredImage !== false ? `
            <div class="relative overflow-hidden aspect-auto min-h-[280px] sm:aspect-feature">
                ${content.featuredImage ? `<img src="${content.featuredImage}" alt="Featured Program" class="absolute inset-0 w-full h-full object-cover">` : ''}
            </div>` : '';

        // Determine column order based on variant
        const firstColMarkup = isContentRight ? imageColMarkup : contentColMarkup;
        const secondColMarkup = isContentRight ? contentColMarkup : imageColMarkup;

        return `
<section class="${bgColor.bgClass} ${halftoneClasses} py-24"${bgStyle ? ` style="${bgStyle}"` : ''}>
    <div class="container mx-auto px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            ${firstColMarkup}
            ${secondColMarkup}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            ${renderProgramMarkup(content.program1Title, content.program1Description, 'program1Title', 'program1Description')}
            ${renderProgramMarkup(content.program2Title, content.program2Description, 'program2Title', 'program2Description')}
            ${renderProgramMarkup(content.program3Title, content.program3Description, 'program3Title', 'program3Description')}
        </div>
    </div>
</section>`.trim();
    }
};
