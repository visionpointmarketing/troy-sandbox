/**
 * TROY Sandbox — Latest Stories Section
 * Sand background with halftone overlay and 3 news cards
 */

import { escapeHtml, renderIfVisible } from '../utils.js';
import { COLORS, getContrastConfig } from '../color-config.js';

export default {
    type: 'latest-stories',
    name: 'Latest Stories',
    category: 'content',
    description: '3 news cards with images',

    defaults: {
        badge: 'Latest Stories',
        headline: 'Real Stories.\nReal Impact.',
        body: 'Stories that showcase the real work, real people, and real results that define TROY. We don\'t just highlight outcomes—<strong>we celebrate the entire journey</strong>.',
        story1Image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
        story1Category: 'Student in the Work',
        story1Title: 'Engineering Student\'s 47 Prototypes Lead to National Win',
        story1Description: 'Real innovation through persistence: How TROY student Sarah Chen\'s determination through multiple failed attempts led to breakthrough design recognition.',
        story2Image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80',
        story2Category: 'Research Breakthrough',
        story2Title: 'Biology Team\'s Persistence Yields Environmental Solution',
        story2Description: 'After two years of trial and refinement, undergraduate researchers develop innovative water purification method.',
        story3Image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
        story3Category: 'Community Impact',
        story3Title: 'Nursing Students Transform Rural Healthcare Access',
        story3Description: 'Real solutions for real communities: How student-led clinics are making healthcare accessible to underserved populations.'
    },

    fields: [
        { key: 'badge', label: 'Section Badge', type: 'text' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'story1Image', label: 'Story 1 Image', type: 'image' },
        { key: 'story1Category', label: 'Story 1 Category', type: 'text' },
        { key: 'story1Title', label: 'Story 1 Title', type: 'text' },
        { key: 'story1Description', label: 'Story 1 Description', type: 'text' },
        { key: 'story2Image', label: 'Story 2 Image', type: 'image' },
        { key: 'story2Category', label: 'Story 2 Category', type: 'text' },
        { key: 'story2Title', label: 'Story 2 Title', type: 'text' },
        { key: 'story2Description', label: 'Story 2 Description', type: 'text' },
        { key: 'story3Image', label: 'Story 3 Image', type: 'image' },
        { key: 'story3Category', label: 'Story 3 Category', type: 'text' },
        { key: 'story3Title', label: 'Story 3 Title', type: 'text' },
        { key: 'story3Description', label: 'Story 3 Description', type: 'text' }
    ],

    render(content, visibility, colors = { background: 'sand', cardBackground: 'white' }) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        // Get color config
        const bgColor = COLORS[colors.background] || COLORS.sand;
        const cardBgColor = COLORS[colors.cardBackground] || COLORS.white;
        const contrast = getContrastConfig(colors.background);

        const renderNewsCard = (image, category, title, desc, imageKey, categoryKey, titleKey, descKey, grayscale = false) => {
            const showImage = visibility[imageKey] !== false;
            const showCategory = visibility[categoryKey] !== false;
            const showTitle = visibility[titleKey] !== false;
            const showDesc = visibility[descKey] !== false;

            if (!showImage && !showCategory && !showTitle && !showDesc) return '';

            return `
                <article class="news-card ${cardBgColor.bgClass}">
                    ${showImage ? `
                        <div class="aspect-video cursor-pointer" data-field="${imageKey}" data-image-field="true">
                            ${image ? `
                                <img src="${image}"
                                     alt="${escapeHtml(title || 'News story')}"
                                     class="w-full h-full object-cover ${grayscale ? 'grayscale' : ''}">
                            ` : `
                                <div class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    <span class="text-sm">Click to add image</span>
                                </div>
                            `}
                        </div>
                    ` : ''}
                    <div class="p-8">
                        ${showCategory ? `
                            <div
                                contenteditable="true"
                                data-field="${categoryKey}"
                                class="nav-heading text-cardinal-800 mb-3"
                            >${escapeHtml(category)}</div>
                        ` : ''}
                        ${showTitle ? `
                            <h3
                                contenteditable="true"
                                data-field="${titleKey}"
                                class="news-title text-black mb-4"
                            >${escapeHtml(title)}</h3>
                        ` : ''}
                        ${showDesc ? `
                            <p
                                contenteditable="true"
                                data-field="${descKey}"
                                class="body-text-small text-black/80"
                            >${escapeHtml(desc)}</p>
                        ` : ''}
                    </div>
                </article>
            `;
        };

        return `
            <section class="${bgColor.bgClass} py-24 relative overflow-hidden">
                <!-- Halftone overlay -->
                ${contrast.showHalftone ? '<div class="halftone-overlay absolute inset-0 pointer-events-none"></div>' : ''}

                <div class="container mx-auto px-8 relative z-10">

                    <!-- Centered header -->
                    <div class="text-center mb-16">
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
                                class="section-title ${contrast.text} mb-8 ${contrast.headerAccentCenter}"
                            >${headlineHtml}</h2>
                        `)}

                        ${renderIfVisible(visibility, 'body', `
                            <p
                                contenteditable="true"
                                data-field="body"
                                class="body-text max-w-3xl mx-auto ${contrast.text}"
                            >${content.body}</p>
                        `)}
                    </div>

                    <!-- News grid -->
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        ${renderNewsCard(
                            content.story1Image, content.story1Category, content.story1Title, content.story1Description,
                            'story1Image', 'story1Category', 'story1Title', 'story1Description', true
                        )}
                        ${renderNewsCard(
                            content.story2Image, content.story2Category, content.story2Title, content.story2Description,
                            'story2Image', 'story2Category', 'story2Title', 'story2Description', false
                        )}
                        ${renderNewsCard(
                            content.story3Image, content.story3Category, content.story3Title, content.story3Description,
                            'story3Image', 'story3Category', 'story3Title', 'story3Description', false
                        )}
                    </div>
                </div>
            </section>
        `;
    },

    toMarkup(content, colors = { background: 'sand', cardBackground: 'white' }) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        // Get color config
        const bgColor = COLORS[colors.background] || COLORS.sand;
        const cardBgColor = COLORS[colors.cardBackground] || COLORS.white;
        const contrast = getContrastConfig(colors.background);

        const renderNewsMarkup = (image, category, title, desc, grayscale = false) => `
            <article class="news-card ${cardBgColor.bgClass}">
                <div class="aspect-video">
                    ${image ? `<img src="${image}" alt="${escapeHtml(title || 'News story')}" class="w-full h-full object-cover ${grayscale ? 'grayscale' : ''}">` : ''}
                </div>
                <div class="p-8">
                    <div class="nav-heading text-cardinal-800 mb-3">${escapeHtml(category)}</div>
                    <h3 class="news-title text-black mb-4">${escapeHtml(title)}</h3>
                    <p class="body-text-small text-black/80">${escapeHtml(desc)}</p>
                </div>
            </article>`;

        return `
<section class="${bgColor.bgClass} py-24 relative overflow-hidden">
    ${contrast.showHalftone ? '<div class="halftone-overlay absolute inset-0 pointer-events-none"></div>' : ''}
    <div class="container mx-auto px-8 relative z-10">
        <div class="text-center mb-16">
            <div class="boxed-subhead ${contrast.badgeBg} ${contrast.badgeText} px-6 py-3 inline-block mb-6">${escapeHtml(content.badge)}</div>
            <h2 class="section-title ${contrast.text} mb-8 ${contrast.headerAccentCenter}">${headlineHtml}</h2>
            <p class="body-text max-w-3xl mx-auto ${contrast.text}">${escapeHtml(content.body)}</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${renderNewsMarkup(content.story1Image, content.story1Category, content.story1Title, content.story1Description, true)}
            ${renderNewsMarkup(content.story2Image, content.story2Category, content.story2Title, content.story2Description)}
            ${renderNewsMarkup(content.story3Image, content.story3Category, content.story3Title, content.story3Description)}
        </div>
    </div>
</section>`.trim();
    }
};
