/**
 * TROY Sandbox — Hero Section
 * Full-width background image with gradient overlay, brand tagline, and CTAs
 */

import { escapeHtml, renderIfVisible } from '../utils.js';

export default {
    type: 'hero',
    name: 'Hero',
    category: 'hero',
    description: 'Full-width hero with background image and gradient overlay',

    defaults: {
        backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=2000&q=80',
        tagline: 'All Ways Real. Always TROY.',
        headline: 'Real People.\nReal Success.',
        body: 'At TROY, no one works alone. Every challenge you face is met with a team behind you, ready to lift you up, push you forward and celebrate your every breakthrough.',
        ctaPrimary: 'Visit Campus',
        ctaSecondary: 'Apply Now'
    },

    fields: [
        { key: 'backgroundImage', label: 'Background Image', type: 'image' },
        { key: 'tagline', label: 'Brand Tagline', type: 'text' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'ctaPrimary', label: 'Primary CTA', type: 'text' },
        { key: 'ctaSecondary', label: 'Secondary CTA', type: 'text' }
    ],

    render(content, visibility) {
        const bgStyle = content.backgroundImage
            ? `background-image: url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : 'background-color: #374151;';

        // Convert newlines to <br> for headline display
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        return `
            <section class="relative min-h-[80vh] flex items-center overflow-hidden py-24 halftone-overlay"
                     style="${bgStyle}">

                <!-- Background gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-r from-black/95 to-black/80"></div>

                <!-- Image upload zone (invisible, covers whole section) -->
                ${renderIfVisible(visibility, 'backgroundImage', `
                    <div class="absolute inset-0 z-5 cursor-pointer" data-field="backgroundImage" data-image-field="true" title="Click to change background image"></div>
                `)}

                <!-- Content container -->
                <div class="container mx-auto px-8 relative z-10">
                    <div class="w-full lg:max-w-[61.8%]">

                        ${renderIfVisible(visibility, 'tagline', `
                            <div
                                contenteditable="true"
                                data-field="tagline"
                                class="brand-tagline bg-wheat text-black px-6 py-3 inline-block mb-8"
                            >${escapeHtml(content.tagline)}</div>
                        `)}

                        ${renderIfVisible(visibility, 'headline', `
                            <h1
                                contenteditable="true"
                                data-field="headline"
                                class="hero-headline text-sand mb-8"
                            >${headlineHtml}</h1>
                        `)}

                        ${renderIfVisible(visibility, 'body', `
                            <p
                                contenteditable="true"
                                data-field="body"
                                class="body-text-large text-white mb-12 max-w-lg"
                            >${escapeHtml(content.body)}</p>
                        `)}

                        <div class="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                            ${renderIfVisible(visibility, 'ctaPrimary', `
                                <a
                                    contenteditable="true"
                                    data-field="ctaPrimary"
                                    class="btn-bordered-white cursor-text"
                                >${escapeHtml(content.ctaPrimary)}</a>
                            `)}

                            ${renderIfVisible(visibility, 'ctaSecondary', `
                                <a
                                    contenteditable="true"
                                    data-field="ctaSecondary"
                                    class="btn-blue cursor-text"
                                >${escapeHtml(content.ctaSecondary)}</a>
                            `)}
                        </div>

                    </div>
                </div>
            </section>
        `;
    },

    toMarkup(content) {
        const bgStyle = content.backgroundImage
            ? `background-image: url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : 'background-color: #374151;';

        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        return `
<section class="relative min-h-[80vh] flex items-center overflow-hidden py-24 halftone-overlay" style="${bgStyle}">
    <div class="absolute inset-0 bg-gradient-to-r from-black/95 to-black/80"></div>
    <div class="container mx-auto px-8 relative z-10">
        <div class="w-full lg:max-w-[61.8%]">
            <div class="brand-tagline bg-wheat text-black px-6 py-3 inline-block mb-8">${escapeHtml(content.tagline)}</div>
            <h1 class="hero-headline text-sand mb-8">${headlineHtml}</h1>
            <p class="body-text-large text-white mb-12 max-w-lg">${escapeHtml(content.body)}</p>
            <div class="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                <a href="#" class="btn-bordered-white">${escapeHtml(content.ctaPrimary)}</a>
                <a href="#" class="btn-blue">${escapeHtml(content.ctaSecondary)}</a>
            </div>
        </div>
    </div>
</section>`.trim();
    }
};
