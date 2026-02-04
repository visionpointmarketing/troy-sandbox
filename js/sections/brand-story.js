/**
 * TROY Sandbox — Brand Story Section
 * Cardinal background with gradient overlay, two-column layout with quote
 */

import { escapeHtml, renderIfVisible } from '../utils.js';

export default {
    type: 'brand-story',
    name: 'Brand Story',
    category: 'content',
    description: 'Cardinal background with quote and image',

    defaults: {
        backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
        tagline: 'All Ways Real. Always TROY.',
        headline: 'No Filters.\nJust Real Breakthroughs.',
        body: 'Instead of just highlighting glossy, finished products, TROY differentiates itself by revealing the entire journey as a valuable, relatable experience. We show the proposals that didn\'t work, the setbacks overcome, and the people who inspired breakthrough moments.',
        quote: '"Because here, we believe every step forward is a victory worth celebrating."',
        ctaText: 'Learn Our Story',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80'
    },

    fields: [
        { key: 'backgroundImage', label: 'Background Image', type: 'image' },
        { key: 'tagline', label: 'Brand Tagline', type: 'text' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'quote', label: 'Quote', type: 'textarea' },
        { key: 'ctaText', label: 'CTA Text', type: 'text' },
        { key: 'image', label: 'Right Image', type: 'image' }
    ],

    render(content, visibility) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        const bgStyle = content.backgroundImage
            ? `background-image: linear-gradient(rgba(145,0,57,0.85), rgba(114,7,36,0.9)), url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : 'background-color: #910039;';

        return `
            <section class="relative py-24 overflow-hidden" style="${bgStyle}">

                <!-- Background image upload zone -->
                ${renderIfVisible(visibility, 'backgroundImage', `
                    <div class="absolute inset-0 z-5 cursor-pointer" data-field="backgroundImage" data-image-field="true" title="Click to change background image"></div>
                `)}

                <div class="container mx-auto px-8 relative z-10">

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        <!-- Left column: Content -->
                        <div>
                            ${renderIfVisible(visibility, 'tagline', `
                                <div
                                    contenteditable="true"
                                    data-field="tagline"
                                    class="brand-tag-dark bg-cardinal-900 text-white px-6 py-3 inline-block mb-8"
                                >${escapeHtml(content.tagline)}</div>
                            `)}

                            ${renderIfVisible(visibility, 'headline', `
                                <h2
                                    contenteditable="true"
                                    data-field="headline"
                                    class="section-title text-sand mb-10 section-header section-header-light"
                                >${headlineHtml}</h2>
                            `)}

                            ${renderIfVisible(visibility, 'body', `
                                <p
                                    contenteditable="true"
                                    data-field="body"
                                    class="text-base md:text-lg leading-[1.8] text-white mb-8"
                                >${content.body}</p>
                            `)}

                            ${renderIfVisible(visibility, 'quote', `
                                <blockquote
                                    contenteditable="true"
                                    data-field="quote"
                                    class="text-wheat italic text-base mb-10"
                                >${escapeHtml(content.quote)}</blockquote>
                            `)}

                            ${renderIfVisible(visibility, 'ctaText', `
                                <a
                                    contenteditable="true"
                                    data-field="ctaText"
                                    class="btn-blue cursor-text"
                                >${escapeHtml(content.ctaText)}</a>
                            `)}
                        </div>

                        <!-- Right column: Image -->
                        ${renderIfVisible(visibility, 'image', `
                            <div class="overflow-hidden cursor-pointer" data-field="image" data-image-field="true">
                                <div class="aspect-feature">
                                    ${content.image ? `
                                        <img src="${content.image}"
                                             alt="TROY students collaborating"
                                             class="w-full h-full object-cover">
                                    ` : `
                                        <div class="w-full h-full bg-white/20 flex items-center justify-center text-white/60">
                                            <span class="text-sm">Click to add image</span>
                                        </div>
                                    `}
                                </div>
                            </div>
                        `)}

                    </div>
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = {}) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        const bgStyle = content.backgroundImage
            ? `background-image: linear-gradient(rgba(145,0,57,0.85), rgba(114,7,36,0.9)), url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : 'background-color: #910039;';

        return `
<section class="relative py-24 overflow-hidden" style="${bgStyle}">
    <div class="container mx-auto px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
                ${visibility.tagline !== false ? `<div class="brand-tag-dark bg-cardinal-900 text-white px-6 py-3 inline-block mb-8">${escapeHtml(content.tagline)}</div>` : ''}
                ${visibility.headline !== false ? `<h2 class="section-title text-sand mb-10 section-header section-header-light">${headlineHtml}</h2>` : ''}
                ${visibility.body !== false ? `<p class="text-base md:text-lg leading-[1.8] text-white mb-8">${escapeHtml(content.body)}</p>` : ''}
                ${visibility.quote !== false ? `<blockquote class="text-wheat italic text-base mb-10">${escapeHtml(content.quote)}</blockquote>` : ''}
                ${visibility.ctaText !== false ? `<a href="#" class="btn-blue">${escapeHtml(content.ctaText)}</a>` : ''}
            </div>
            ${visibility.image !== false ? `
            <div class="overflow-hidden">
                <div class="aspect-feature">
                    ${content.image ? `<img src="${content.image}" alt="TROY students collaborating" class="w-full h-full object-cover">` : ''}
                </div>
            </div>` : ''}
        </div>
    </div>
</section>`.trim();
    }
};
