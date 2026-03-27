/**
 * TROY Sandbox — Final CTA Section
 * Dark background with centered call-to-action
 */

import { escapeHtml, renderIfVisible } from '../utils.js';

export default {
    type: 'final-cta',
    name: 'Final CTA',
    category: 'cta',
    description: 'Dark background with centered CTAs',

    defaults: {
        backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
        headline: 'Unlock the Real You.',
        body: 'Your journey to real success starts here. Join a community that celebrates every step forward and believes that real work always wins.',
        ctaPrimary: 'Apply Today',
        ctaSecondary: 'Schedule Visit'
    },

    fields: [
        { key: 'backgroundImage', label: 'Background Image', type: 'image' },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'ctaPrimary', label: 'Primary CTA', type: 'text' },
        { key: 'ctaSecondary', label: 'Secondary CTA', type: 'text' }
    ],

    render(content, visibility) {
        const bgStyle = content.backgroundImage
            ? `background-image: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : 'background-color: #1f2937;';

        return `
            <section class="relative py-24" style="${bgStyle}">

                <!-- Background image upload zone -->
                ${renderIfVisible(visibility, 'backgroundImage', `
                    <div class="absolute inset-0 z-5 cursor-pointer" data-field="backgroundImage" data-image-field="true" title="Click to change background image"></div>
                `)}

                <div class="container mx-auto px-8 text-center relative z-10">

                    ${renderIfVisible(visibility, 'headline', `
                        <h2
                            contenteditable="true"
                            data-field="headline"
                            class="section-title text-white mb-12"
                        >${escapeHtml(content.headline)}</h2>
                    `)}

                    ${renderIfVisible(visibility, 'body', `
                        <p
                            contenteditable="true"
                            data-field="body"
                            class="body-text-large max-w-3xl mx-auto mb-16 text-white"
                        >${content.body}</p>
                    `)}

                    <div class="flex flex-col md:flex-row gap-8 justify-center items-center">
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
                                class="btn-bordered-white cursor-text"
                            >${escapeHtml(content.ctaSecondary)}</a>
                        `)}
                    </div>

                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = {}) {
        const bgStyle = content.backgroundImage
            ? `background-image: linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.9)), url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : 'background-color: #1f2937;';

        return `
<section class="relative py-24" style="${bgStyle}">
    <div class="container mx-auto px-8 text-center relative z-10">
        ${visibility.headline !== false ? `<h2 class="section-title text-white mb-12">${escapeHtml(content.headline)}</h2>` : ''}
        ${visibility.body !== false ? `<p class="body-text-large max-w-3xl mx-auto mb-16 text-white">${escapeHtml(content.body)}</p>` : ''}
        <div class="flex flex-col md:flex-row gap-8 justify-center items-center">
            ${visibility.ctaPrimary !== false ? `<a href="#" class="btn-bordered-white">${escapeHtml(content.ctaPrimary)}</a>` : ''}
            ${visibility.ctaSecondary !== false ? `<a href="#" class="btn-bordered-white">${escapeHtml(content.ctaSecondary)}</a>` : ''}
        </div>
    </div>
</section>`.trim();
    }
};
