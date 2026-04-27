/**
 * TROY Sandbox — Brand Story Section
 * Cardinal background with gradient overlay, two-column layout
 */

import { escapeHtml, renderIfVisible } from '../utils.js';

export default {
    type: 'brand-story',
    name: 'Brand Story',
    category: 'content',
    description: 'Cardinal background with image and optional link list',

    defaults: {
        backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
        overlayColor: 'cardinal',  // Options: 'cardinal' | 'black'
        headline: 'No Filters.\nJust Real Breakthroughs.',
        body: 'Instead of just highlighting glossy, finished products, TROY differentiates itself by revealing the entire journey as a valuable, relatable experience. We show the proposals that didn\'t work, the setbacks overcome, and the people who inspired breakthrough moments.',
        ctaText: 'Learn Our Story',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
        link1Text: 'College of Arts and Humanities',
        link2Text: 'College of Education and Behavioral Sciences',
        link3Text: 'College of Health Sciences',
        link4Text: 'College of Science and Engineering',
        link5Text: 'Sorrell College of Business',
        link6Text: 'Graduate School'
    },

    fields: [
        { key: 'backgroundImage', label: 'Background Image', type: 'image' },
        { key: 'overlayColor', label: 'Overlay', type: 'select', options: ['cardinal', 'black'] },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'ctaText', label: 'CTA Text', type: 'text' },
        { key: 'image', label: 'Right Image', type: 'image' },
        { key: 'link1Text', label: 'Link 1', type: 'text' },
        { key: 'link2Text', label: 'Link 2', type: 'text' },
        { key: 'link3Text', label: 'Link 3', type: 'text' },
        { key: 'link4Text', label: 'Link 4', type: 'text' },
        { key: 'link5Text', label: 'Link 5', type: 'text' },
        { key: 'link6Text', label: 'Link 6', type: 'text' }
    ],

    render(content, visibility) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        const isBlackOverlay = content.overlayColor === 'black';
        const overlayColor = isBlackOverlay ? 'rgba(0,0,0,0.7)' : 'rgba(114,7,36,0.85)';
        const fallbackBg = isBlackOverlay ? '#231F20' : '#720724';

        const bgStyle = content.backgroundImage
            ? `background-image: linear-gradient(${overlayColor}, ${overlayColor}), url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : `background-color: ${fallbackBg};`;

        // Check if any links are visible
        const hasVisibleLinks = ['link1Text', 'link2Text', 'link3Text', 'link4Text', 'link5Text', 'link6Text']
            .some(key => visibility[key] !== false);

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
                            ${renderIfVisible(visibility, 'headline', `
                                <h2
                                    contenteditable="true"
                                    data-field="headline"
                                    class="section-title text-white mb-10"
                                >${headlineHtml}</h2>
                            `)}

                            ${renderIfVisible(visibility, 'body', `
                                <p
                                    contenteditable="true"
                                    data-field="body"
                                    class="text-base md:text-lg leading-[1.8] text-white mb-8"
                                >${content.body}</p>
                            `)}

                            ${renderIfVisible(visibility, 'ctaText', `
                                <a
                                    contenteditable="true"
                                    data-field="ctaText"
                                    class="btn-bordered-white cursor-text"
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

                    <!-- Link list (full-width, below grid) -->
                    ${hasVisibleLinks ? `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mt-10">
                        <div class="space-y-4">
                            ${renderIfVisible(visibility, 'link1Text', `
                                <a contenteditable="true" data-field="link1Text" class="block text-white underline hover:text-white/80 font-bold text-xl cursor-text">${escapeHtml(content.link1Text)}</a>
                            `)}
                            ${renderIfVisible(visibility, 'link2Text', `
                                <a contenteditable="true" data-field="link2Text" class="block text-white underline hover:text-white/80 font-bold text-xl cursor-text">${escapeHtml(content.link2Text)}</a>
                            `)}
                            ${renderIfVisible(visibility, 'link3Text', `
                                <a contenteditable="true" data-field="link3Text" class="block text-white underline hover:text-white/80 font-bold text-xl cursor-text">${escapeHtml(content.link3Text)}</a>
                            `)}
                        </div>
                        <div class="space-y-4">
                            ${renderIfVisible(visibility, 'link4Text', `
                                <a contenteditable="true" data-field="link4Text" class="block text-white underline hover:text-white/80 font-bold text-xl cursor-text">${escapeHtml(content.link4Text)}</a>
                            `)}
                            ${renderIfVisible(visibility, 'link5Text', `
                                <a contenteditable="true" data-field="link5Text" class="block text-white underline hover:text-white/80 font-bold text-xl cursor-text">${escapeHtml(content.link5Text)}</a>
                            `)}
                            ${renderIfVisible(visibility, 'link6Text', `
                                <a contenteditable="true" data-field="link6Text" class="block text-white underline hover:text-white/80 font-bold text-xl cursor-text">${escapeHtml(content.link6Text)}</a>
                            `)}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = {}) {
        const headlineHtml = escapeHtml(content.headline).replace(/\n/g, '<br>');

        const isBlackOverlay = content.overlayColor === 'black';
        const overlayColor = isBlackOverlay ? 'rgba(0,0,0,0.7)' : 'rgba(114,7,36,0.85)';
        const fallbackBg = isBlackOverlay ? '#231F20' : '#720724';

        const bgStyle = content.backgroundImage
            ? `background-image: linear-gradient(${overlayColor}, ${overlayColor}), url('${content.backgroundImage}'); background-size: cover; background-position: center;`
            : `background-color: ${fallbackBg};`;

        // Check if any links are visible
        const hasVisibleLinks = ['link1Text', 'link2Text', 'link3Text', 'link4Text', 'link5Text', 'link6Text']
            .some(key => visibility[key] !== false);

        // Build link columns
        const leftLinks = [
            visibility.link1Text !== false ? `<a href="#" class="block text-white underline hover:text-white/80 font-bold text-xl">${escapeHtml(content.link1Text)}</a>` : '',
            visibility.link2Text !== false ? `<a href="#" class="block text-white underline hover:text-white/80 font-bold text-xl">${escapeHtml(content.link2Text)}</a>` : '',
            visibility.link3Text !== false ? `<a href="#" class="block text-white underline hover:text-white/80 font-bold text-xl">${escapeHtml(content.link3Text)}</a>` : ''
        ].filter(Boolean).join('\n                        ');

        const rightLinks = [
            visibility.link4Text !== false ? `<a href="#" class="block text-white underline hover:text-white/80 font-bold text-xl">${escapeHtml(content.link4Text)}</a>` : '',
            visibility.link5Text !== false ? `<a href="#" class="block text-white underline hover:text-white/80 font-bold text-xl">${escapeHtml(content.link5Text)}</a>` : '',
            visibility.link6Text !== false ? `<a href="#" class="block text-white underline hover:text-white/80 font-bold text-xl">${escapeHtml(content.link6Text)}</a>` : ''
        ].filter(Boolean).join('\n                        ');

        const linkListMarkup = hasVisibleLinks ? `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mt-10">
                    <div class="space-y-4">
                        ${leftLinks}
                    </div>
                    <div class="space-y-4">
                        ${rightLinks}
                    </div>
                </div>` : '';

        return `
<section class="relative py-24 overflow-hidden" style="${bgStyle}">
    <div class="container mx-auto px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
                ${visibility.headline !== false ? `<h2 class="section-title text-white mb-10">${headlineHtml}</h2>` : ''}
                ${visibility.body !== false ? `<p class="text-base md:text-lg leading-[1.8] text-white mb-8">${escapeHtml(content.body)}</p>` : ''}
                ${visibility.ctaText !== false ? `<a href="#" class="btn-bordered-white">${escapeHtml(content.ctaText)}</a>` : ''}
            </div>
            ${visibility.image !== false ? `
            <div class="overflow-hidden">
                <div class="aspect-feature">
                    ${content.image ? `<img src="${content.image}" alt="TROY students collaborating" class="w-full h-full object-cover">` : ''}
                </div>
            </div>` : ''}
        </div>${linkListMarkup}
    </div>
</section>`.trim();
    }
};
