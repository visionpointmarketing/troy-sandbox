/**
 * TROY Sandbox — Final CTA Section
 * Full-width background image with floating black content block at top-center
 */

import { escapeHtml, renderIfVisible } from '../utils.js';

export default {
    type: 'final-cta',
    name: 'Final CTA',
    category: 'cta',
    description: 'Background image with floating black content block',

    defaults: {
        backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
        headline: 'Real Opportunity\nStarts Here.',
        body: 'Join our Trojan Family',
        ctaPrimary: 'Visit',
        ctaSecondary: 'Request Info',
        ctaTertiary: 'Apply'
    },

    fields: [
        { key: 'backgroundImage', label: 'Background Image', type: 'image' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'ctaPrimary', label: 'Primary CTA', type: 'text' },
        { key: 'ctaSecondary', label: 'Secondary CTA', type: 'text' },
        { key: 'ctaTertiary', label: 'Tertiary CTA', type: 'text' }
    ],

    render(content, visibility) {
        const bgStyle = content.backgroundImage
            ? `background-image: url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : 'background-color: #1f2937;';

        return `
            <section class="relative min-h-[70vh]" style="${bgStyle}">

                <!-- Background image upload zone -->
                ${renderIfVisible(visibility, 'backgroundImage', `
                    <div class="absolute inset-0 z-5 cursor-pointer" data-field="backgroundImage" data-image-field="true" title="Click to change background image"></div>
                `)}

                <!-- Black content block at top-center -->
                <div class="relative z-10 flex justify-center pt-12 px-4">
                    <div class="bg-black max-w-4xl w-full px-12 py-16">

                        ${renderIfVisible(visibility, 'headline', `
                            <h2
                                contenteditable="true"
                                data-field="headline"
                                class="hero-headline text-white mb-6 whitespace-pre-line"
                            >${escapeHtml(content.headline)}</h2>
                        `)}

                        ${renderIfVisible(visibility, 'body', `
                            <p
                                contenteditable="true"
                                data-field="body"
                                class="body-text-large text-white mb-10"
                            >${escapeHtml(content.body)}</p>
                        `)}

                        <div class="flex flex-wrap gap-4">
                            ${renderIfVisible(visibility, 'ctaPrimary', `
                                <a
                                    contenteditable="true"
                                    data-field="ctaPrimary"
                                    class="btn-blue cursor-text"
                                >${escapeHtml(content.ctaPrimary)}</a>
                            `)}

                            ${renderIfVisible(visibility, 'ctaSecondary', `
                                <a
                                    contenteditable="true"
                                    data-field="ctaSecondary"
                                    class="btn-bordered-white cursor-text"
                                >${escapeHtml(content.ctaSecondary)}</a>
                            `)}

                            ${renderIfVisible(visibility, 'ctaTertiary', `
                                <a
                                    contenteditable="true"
                                    data-field="ctaTertiary"
                                    class="btn-bordered-white cursor-text"
                                >${escapeHtml(content.ctaTertiary)}</a>
                            `)}
                        </div>

                    </div>
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = {}) {
        const bgStyle = content.backgroundImage
            ? `background-image: url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : 'background-color: #1f2937;';

        return `
<section class="relative min-h-[70vh]" style="${bgStyle}">
    <div class="relative z-10 flex justify-center pt-12 px-4">
        <div class="bg-black max-w-4xl w-full px-12 py-16">
            ${visibility.headline !== false ? `<h2 class="hero-headline text-white mb-6 whitespace-pre-line">${escapeHtml(content.headline)}</h2>` : ''}
            ${visibility.body !== false ? `<p class="body-text-large text-white mb-10">${escapeHtml(content.body)}</p>` : ''}
            <div class="flex flex-wrap gap-4">
                ${visibility.ctaPrimary !== false ? `<a href="#" class="btn-blue">${escapeHtml(content.ctaPrimary)}</a>` : ''}
                ${visibility.ctaSecondary !== false ? `<a href="#" class="btn-bordered-white">${escapeHtml(content.ctaSecondary)}</a>` : ''}
                ${visibility.ctaTertiary !== false ? `<a href="#" class="btn-bordered-white">${escapeHtml(content.ctaTertiary)}</a>` : ''}
            </div>
        </div>
    </div>
</section>`.trim();
    }
};
