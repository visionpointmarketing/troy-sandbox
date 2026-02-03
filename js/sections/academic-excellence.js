/**
 * TROY Sandbox — Academic Excellence Section
 * Two-column layout with featured program image and program cards
 */

import { escapeHtml, renderIfVisible } from '../utils.js';

export default {
    type: 'academic-excellence',
    name: 'Academic Programs',
    category: 'content',
    description: 'Featured program + 3 program cards',

    defaults: {
        badge: 'Academic Excellence',
        headline: 'Real Experiences.\nReal Opportunities.',
        body: 'Our programs are designed around real-world application and hands-on learning. From award-winning academic opportunities to exciting Division I athletics events, TROY provides students with <strong>top-notch learning opportunities</strong> that showcase the work, not just the results.',
        ctaText: 'Explore Programs',
        featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
        featuredTag: 'Featured Program',
        featuredTitle: 'Business Administration',
        featuredDescription: 'Real business challenges, real solutions',
        program1Title: 'Engineering',
        program1Description: 'Hands-on learning with industry-standard equipment and real-world projects that prepare you for immediate impact.',
        program2Title: 'Nursing',
        program2Description: 'Clinical excellence through real patient care experiences and state-of-the-art simulation labs.',
        program3Title: 'Education',
        program3Description: 'Transform lives through innovative teaching methods and extensive classroom experience.'
    },

    fields: [
        { key: 'badge', label: 'Section Badge', type: 'text' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'ctaText', label: 'CTA Text', type: 'text' },
        { key: 'featuredImage', label: 'Featured Image', type: 'image' },
        { key: 'featuredTag', label: 'Featured Tag', type: 'text' },
        { key: 'featuredTitle', label: 'Featured Title', type: 'text' },
        { key: 'featuredDescription', label: 'Featured Description', type: 'text' },
        { key: 'program1Title', label: 'Program 1 Title', type: 'text' },
        { key: 'program1Description', label: 'Program 1 Description', type: 'text' },
        { key: 'program2Title', label: 'Program 2 Title', type: 'text' },
        { key: 'program2Description', label: 'Program 2 Description', type: 'text' },
        { key: 'program3Title', label: 'Program 3 Title', type: 'text' },
        { key: 'program3Description', label: 'Program 3 Description', type: 'text' }
    ],

    render(content, visibility) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

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
                            class="program-title text-black mb-4"
                        >${escapeHtml(title)}</h3>
                    ` : ''}
                    ${showDesc ? `
                        <p
                            contenteditable="true"
                            data-field="${descKey}"
                            class="body-text text-black/80"
                        >${escapeHtml(desc)}</p>
                    ` : ''}
                </div>
            `;
        };

        return `
            <section class="bg-white py-24">
                <div class="container mx-auto px-8">

                    <!-- Two-column layout -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">

                        <!-- Left column: Content -->
                        <div>
                            ${renderIfVisible(visibility, 'badge', `
                                <div
                                    contenteditable="true"
                                    data-field="badge"
                                    class="boxed-subhead bg-wheat text-black px-6 py-3 inline-block mb-6"
                                >${escapeHtml(content.badge)}</div>
                            `)}

                            ${renderIfVisible(visibility, 'headline', `
                                <h2
                                    contenteditable="true"
                                    data-field="headline"
                                    class="section-title text-black mb-8 section-header section-header-black"
                                >${headlineHtml}</h2>
                            `)}

                            ${renderIfVisible(visibility, 'body', `
                                <p
                                    contenteditable="true"
                                    data-field="body"
                                    class="body-text mb-10 text-black"
                                >${content.body}</p>
                            `)}

                            ${renderIfVisible(visibility, 'ctaText', `
                                <a
                                    contenteditable="true"
                                    data-field="ctaText"
                                    class="btn-cardinal cursor-text"
                                >${escapeHtml(content.ctaText)}</a>
                            `)}
                        </div>

                        <!-- Right column: Featured program image -->
                        ${renderIfVisible(visibility, 'featuredImage', `
                            <div class="relative overflow-hidden aspect-auto min-h-[280px] sm:aspect-feature cursor-pointer" data-field="featuredImage" data-image-field="true">
                                <img src="${content.featuredImage || ''}"
                                     alt="Featured Program"
                                     class="absolute inset-0 w-full h-full object-cover">

                                <!-- Content overlay -->
                                <div class="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 text-white z-10">
                                    ${renderIfVisible(visibility, 'featuredTag', `
                                        <div
                                            contenteditable="true"
                                            data-field="featuredTag"
                                            class="featured-tag bg-cardinal-800 text-white px-4 py-2 inline-block mb-4"
                                        >${escapeHtml(content.featuredTag)}</div>
                                    `)}
                                    ${renderIfVisible(visibility, 'featuredTitle', `
                                        <h3
                                            contenteditable="true"
                                            data-field="featuredTitle"
                                            class="program-title text-white mb-2"
                                        >${escapeHtml(content.featuredTitle)}</h3>
                                    `)}
                                    ${renderIfVisible(visibility, 'featuredDescription', `
                                        <p
                                            contenteditable="true"
                                            data-field="featuredDescription"
                                            class="text-sm text-white/90"
                                        >${escapeHtml(content.featuredDescription)}</p>
                                    `)}
                                </div>

                                <!-- Multiply overlay -->
                                <div class="absolute inset-0 bg-gradient-to-br from-cardinal-800 to-cardinal-900 mix-blend-multiply opacity-70"></div>
                            </div>
                        `)}
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

    toMarkup(content) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        return `
<section class="bg-white py-24">
    <div class="container mx-auto px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
                <div class="boxed-subhead bg-wheat text-black px-6 py-3 inline-block mb-6">${escapeHtml(content.badge)}</div>
                <h2 class="section-title text-black mb-8 section-header section-header-black">${headlineHtml}</h2>
                <p class="body-text mb-10 text-black">${content.body}</p>
                <a href="#" class="btn-cardinal">${escapeHtml(content.ctaText)}</a>
            </div>
            <div class="relative overflow-hidden aspect-auto min-h-[280px] sm:aspect-feature">
                <img src="${content.featuredImage || ''}" alt="Featured Program" class="absolute inset-0 w-full h-full object-cover">
                <div class="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 text-white z-10">
                    <div class="featured-tag bg-cardinal-800 text-white px-4 py-2 inline-block mb-4">${escapeHtml(content.featuredTag)}</div>
                    <h3 class="program-title text-white mb-2">${escapeHtml(content.featuredTitle)}</h3>
                    <p class="text-sm text-white/90">${escapeHtml(content.featuredDescription)}</p>
                </div>
                <div class="absolute inset-0 bg-gradient-to-br from-cardinal-800 to-cardinal-900 mix-blend-multiply opacity-70"></div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="program-card">
                <h3 class="program-title text-black mb-4">${escapeHtml(content.program1Title)}</h3>
                <p class="body-text text-black/80">${escapeHtml(content.program1Description)}</p>
            </div>
            <div class="program-card">
                <h3 class="program-title text-black mb-4">${escapeHtml(content.program2Title)}</h3>
                <p class="body-text text-black/80">${escapeHtml(content.program2Description)}</p>
            </div>
            <div class="program-card">
                <h3 class="program-title text-black mb-4">${escapeHtml(content.program3Title)}</h3>
                <p class="body-text text-black/80">${escapeHtml(content.program3Description)}</p>
            </div>
        </div>
    </div>
</section>`.trim();
    }
};
