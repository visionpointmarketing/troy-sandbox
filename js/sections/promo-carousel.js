/**
 * TROY Sandbox — Promo Carousel Section
 * Full-width promotional banner with carousel visual styling (decorative)
 * Supports two variants: promo (banner) and news (2 news cards)
 */

import { escapeHtml, renderIfVisible, imageSlot } from '../utils.js';
import { COLORS, getContrastConfig } from '../color-config.js';

export default {
    type: 'promo-carousel',
    name: 'Promo Carousel',
    category: 'content',
    description: 'Full-width promotional banner with carousel styling',

    defaults: {
        variant: 'promo',
        headline: 'Save Big with Trojan Book Bag',
        body: 'Trojan Book Bag provides access to course materials at a fraction of the cost. Get your textbooks, digital resources, and supplies all in one convenient package.',
        ctaText: 'TROJAN BOOK BAG INFORMATION',
        // News variant fields
        newsItem1Title: 'ATO Walk Hard raises record-breaking $200K for veterans',
        newsItem1Date: 'March 20, 2026',
        newsItem1Image: null,
        newsItem2Title: 'Troy University to welcome Fulbright Scholar Dr. Jiri Minarcik March 23-26',
        newsItem2Date: 'March 19, 2026',
        newsItem2Image: null,
        ctaLinkText: 'All News',
        totalSlides: 3,
        activeSlide: 2
    },

    fields: [
        { key: 'variant', label: 'Layout', type: 'select', options: ['promo', 'news'] },
        // Promo variant fields
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'ctaText', label: 'CTA Text', type: 'text' },
        // News variant fields
        { key: 'newsItem1Title', label: 'News 1 Title', type: 'text' },
        { key: 'newsItem1Date', label: 'News 1 Date', type: 'text' },
        { key: 'newsItem2Title', label: 'News 2 Title', type: 'text' },
        { key: 'newsItem2Date', label: 'News 2 Date', type: 'text' },
        { key: 'ctaLinkText', label: 'CTA Link Text', type: 'text' }
    ],

    render(content, visibility, colors = {}) {
        const bgKey = colors.background || 'black';
        const colorConfig = COLORS[bgKey] || COLORS.black;
        const contrast = getContrastConfig(bgKey);
        const bgClass = colorConfig.bgClass;
        const isDark = colorConfig.isDark;

        // Dynamic colors based on background
        const textClass = contrast.text;
        const borderClass = isDark ? 'border-white' : 'border-cardinal';
        const arrowClass = isDark ? 'text-white' : 'text-cardinal';
        const dotBorderClass = isDark ? 'border-white' : 'border-cardinal';
        const dotFillClass = isDark ? 'bg-white' : 'bg-cardinal';
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';
        const linkClass = isDark ? 'text-white hover:text-white/80' : 'text-cardinal hover:text-cardinal-dark';

        // Generate dot indicators
        const dots = [];
        for (let i = 1; i <= content.totalSlides; i++) {
            const isActive = i === content.activeSlide;
            dots.push(`
                <span class="w-3 h-3 rounded-full border-2 ${dotBorderClass} ${isActive ? dotFillClass : 'bg-transparent'}"></span>
            `);
        }

        // News variant
        if (content.variant === 'news') {
            return `
                <section class="relative ${bgClass} py-16 overflow-hidden">
                    <!-- Left Arrow (decorative) -->
                    <button class="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 ${borderClass} flex items-center justify-center pointer-events-none z-10" aria-hidden="true">
                        <svg class="w-6 h-6 ${arrowClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>

                    <!-- Right Arrow (decorative) -->
                    <button class="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 ${borderClass} flex items-center justify-center pointer-events-none z-10" aria-hidden="true">
                        <svg class="w-6 h-6 ${arrowClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>

                    <!-- Content Container -->
                    <div class="container mx-auto px-16 lg:px-24">
                        <!-- Section Title -->
                        <h2 class="section-title ${textClass} text-center mb-8">News</h2>

                        <!-- News Cards Grid -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <!-- News Card 1 -->
                            <div class="news-card">
                                ${imageSlot('newsItem1Image', content.newsItem1Image, 'aspect-video rounded-lg mb-4')}
                                ${renderIfVisible(visibility, 'newsItem1Title', `
                                    <h3
                                        contenteditable="true"
                                        data-field="newsItem1Title"
                                        class="text-lg font-semibold ${textClass} mb-2 leading-tight"
                                    >${escapeHtml(content.newsItem1Title)}</h3>
                                `)}
                                ${renderIfVisible(visibility, 'newsItem1Date', `
                                    <p
                                        contenteditable="true"
                                        data-field="newsItem1Date"
                                        class="text-sm ${isDark ? 'text-white/70' : 'text-black/60'}"
                                    >${escapeHtml(content.newsItem1Date)}</p>
                                `)}
                            </div>

                            <!-- News Card 2 -->
                            <div class="news-card">
                                ${imageSlot('newsItem2Image', content.newsItem2Image, 'aspect-video rounded-lg mb-4')}
                                ${renderIfVisible(visibility, 'newsItem2Title', `
                                    <h3
                                        contenteditable="true"
                                        data-field="newsItem2Title"
                                        class="text-lg font-semibold ${textClass} mb-2 leading-tight"
                                    >${escapeHtml(content.newsItem2Title)}</h3>
                                `)}
                                ${renderIfVisible(visibility, 'newsItem2Date', `
                                    <p
                                        contenteditable="true"
                                        data-field="newsItem2Date"
                                        class="text-sm ${isDark ? 'text-white/70' : 'text-black/60'}"
                                    >${escapeHtml(content.newsItem2Date)}</p>
                                `)}
                            </div>
                        </div>

                        <!-- Dot Indicators (decorative) -->
                        <div class="flex justify-center gap-3 mt-8" aria-hidden="true">
                            ${dots.join('')}
                        </div>

                        <!-- All News Link -->
                        ${renderIfVisible(visibility, 'ctaLinkText', `
                            <div class="text-center mt-6">
                                <a
                                    contenteditable="true"
                                    data-field="ctaLinkText"
                                    class="${linkClass} font-semibold cursor-text"
                                >${escapeHtml(content.ctaLinkText)} &gt;</a>
                            </div>
                        `)}
                    </div>
                </section>
            `;
        }

        // Promo variant (default)
        return `
            <section class="relative ${bgClass} py-24 overflow-hidden">
                <!-- Left Arrow (decorative) -->
                <button class="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 ${borderClass} flex items-center justify-center pointer-events-none z-10" aria-hidden="true">
                    <svg class="w-6 h-6 ${arrowClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>

                <!-- Right Arrow (decorative) -->
                <button class="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 ${borderClass} flex items-center justify-center pointer-events-none z-10" aria-hidden="true">
                    <svg class="w-6 h-6 ${arrowClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>

                <!-- Content Container -->
                <div class="container mx-auto px-8 lg:px-20">
                    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
                        <!-- Text Content (60%) -->
                        <div class="lg:col-span-3">
                            ${renderIfVisible(visibility, 'headline', `
                                <h2
                                    contenteditable="true"
                                    data-field="headline"
                                    class="section-title ${textClass} mb-4"
                                >${escapeHtml(content.headline)}</h2>
                            `)}

                            ${renderIfVisible(visibility, 'body', `
                                <p
                                    contenteditable="true"
                                    data-field="body"
                                    class="body-text ${textClass} max-w-xl"
                                >${escapeHtml(content.body)}</p>
                            `)}
                        </div>

                        <!-- CTA (40%) -->
                        <div class="lg:col-span-2 flex lg:justify-end">
                            ${renderIfVisible(visibility, 'ctaText', `
                                <a
                                    contenteditable="true"
                                    data-field="ctaText"
                                    class="${ctaClass} cursor-text"
                                >${escapeHtml(content.ctaText)}</a>
                            `)}
                        </div>
                    </div>
                </div>

                <!-- Dot Indicators (decorative) -->
                <div class="flex justify-center gap-3 mt-12" aria-hidden="true">
                    ${dots.join('')}
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = {}) {
        const bgKey = colors.background || 'black';
        const colorConfig = COLORS[bgKey] || COLORS.black;
        const contrast = getContrastConfig(bgKey);
        const bgClass = colorConfig.bgClass;
        const isDark = colorConfig.isDark;

        // Dynamic colors based on background
        const textClass = contrast.text;
        const borderClass = isDark ? 'border-white' : 'border-cardinal';
        const arrowClass = isDark ? 'text-white' : 'text-cardinal';
        const dotBorderClass = isDark ? 'border-white' : 'border-cardinal';
        const dotFillClass = isDark ? 'bg-white' : 'bg-cardinal';
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';
        const linkClass = isDark ? 'text-white hover:text-white/80' : 'text-cardinal hover:text-cardinal-dark';

        // Generate dot indicators
        const dots = [];
        for (let i = 1; i <= content.totalSlides; i++) {
            const isActive = i === content.activeSlide;
            dots.push(`<span class="w-3 h-3 rounded-full border-2 ${dotBorderClass} ${isActive ? dotFillClass : 'bg-transparent'}"></span>`);
        }

        // News variant
        if (content.variant === 'news') {
            return `
<section class="relative ${bgClass} py-16 overflow-hidden">
    <!-- Left Arrow -->
    <button class="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 ${borderClass} flex items-center justify-center" aria-label="Previous slide">
        <svg class="w-6 h-6 ${arrowClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
    </button>

    <!-- Right Arrow -->
    <button class="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 ${borderClass} flex items-center justify-center" aria-label="Next slide">
        <svg class="w-6 h-6 ${arrowClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
    </button>

    <!-- Content -->
    <div class="container mx-auto px-16 lg:px-24">
        <h2 class="section-title ${textClass} text-center mb-8">News</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- News Card 1 -->
            <div class="news-card">
                ${content.newsItem1Image ? `<img src="${content.newsItem1Image}" alt="" class="aspect-video rounded-lg mb-4 object-cover w-full">` : '<div class="aspect-video rounded-lg mb-4 bg-gray-200"></div>'}
                ${visibility.newsItem1Title !== false ? `<h3 class="text-lg font-semibold ${textClass} mb-2 leading-tight">${escapeHtml(content.newsItem1Title)}</h3>` : ''}
                ${visibility.newsItem1Date !== false ? `<p class="text-sm ${isDark ? 'text-white/70' : 'text-black/60'}">${escapeHtml(content.newsItem1Date)}</p>` : ''}
            </div>

            <!-- News Card 2 -->
            <div class="news-card">
                ${content.newsItem2Image ? `<img src="${content.newsItem2Image}" alt="" class="aspect-video rounded-lg mb-4 object-cover w-full">` : '<div class="aspect-video rounded-lg mb-4 bg-gray-200"></div>'}
                ${visibility.newsItem2Title !== false ? `<h3 class="text-lg font-semibold ${textClass} mb-2 leading-tight">${escapeHtml(content.newsItem2Title)}</h3>` : ''}
                ${visibility.newsItem2Date !== false ? `<p class="text-sm ${isDark ? 'text-white/70' : 'text-black/60'}">${escapeHtml(content.newsItem2Date)}</p>` : ''}
            </div>
        </div>

        <!-- Dot Indicators -->
        <div class="flex justify-center gap-3 mt-8" aria-hidden="true">
            ${dots.join('\n            ')}
        </div>

        ${visibility.ctaLinkText !== false ? `<div class="text-center mt-6"><a href="#" class="${linkClass} font-semibold">${escapeHtml(content.ctaLinkText)} &gt;</a></div>` : ''}
    </div>
</section>`.trim();
        }

        // Promo variant (default)
        return `
<section class="relative ${bgClass} py-24 overflow-hidden">
    <!-- Left Arrow -->
    <button class="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 ${borderClass} flex items-center justify-center" aria-label="Previous slide">
        <svg class="w-6 h-6 ${arrowClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
    </button>

    <!-- Right Arrow -->
    <button class="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 ${borderClass} flex items-center justify-center" aria-label="Next slide">
        <svg class="w-6 h-6 ${arrowClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
    </button>

    <!-- Content -->
    <div class="container mx-auto px-8 lg:px-20">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            <div class="lg:col-span-3">
                ${visibility.headline !== false ? `<h2 class="section-title ${textClass} mb-4">${escapeHtml(content.headline)}</h2>` : ''}
                ${visibility.body !== false ? `<p class="body-text ${textClass} max-w-xl">${escapeHtml(content.body)}</p>` : ''}
            </div>
            <div class="lg:col-span-2 flex lg:justify-end">
                ${visibility.ctaText !== false ? `<a href="#" class="${ctaClass}">${escapeHtml(content.ctaText)}</a>` : ''}
            </div>
        </div>
    </div>

    <!-- Dot Indicators -->
    <div class="flex justify-center gap-3 mt-12" aria-hidden="true">
        ${dots.join('\n        ')}
    </div>
</section>`.trim();
    }
};
