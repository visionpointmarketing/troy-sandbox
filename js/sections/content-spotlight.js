/**
 * TROY Sandbox — Content Spotlight Section
 * 50/50 content and image split with optional stats grid
 * Supports content-left, content-right, and content-both variants
 */

import { escapeHtml, renderIfVisible, imageSlot } from '../utils.js';
import { COLORS, getContrastConfig } from '../color-config.js';

/**
 * Render a single stat item
 */
function renderStat(content, visibility, numKey, labelKey, textClass, isDark) {
    const showNum = visibility[numKey] !== false;
    const showLabel = visibility[labelKey] !== false;

    if (!showNum && !showLabel) return '';

    const num = content[numKey];
    const label = content[labelKey];

    return `
        <div>
            ${showNum ? `
                <div
                    contenteditable="true"
                    data-field="${numKey}"
                    class="stat-number ${textClass} text-3xl lg:text-4xl font-bold mb-1"
                >${escapeHtml(num)}</div>
            ` : ''}
            ${showLabel ? `
                <a
                    contenteditable="true"
                    data-field="${labelKey}"
                    class="underline text-sm ${textClass} cursor-text"
                >${escapeHtml(label)}</a>
            ` : ''}
        </div>
    `;
}

/**
 * Check if any stats are visible
 */
function hasVisibleStats(visibility) {
    for (let i = 1; i <= 6; i++) {
        if (visibility[`stat${i}Number`] !== false || visibility[`stat${i}Label`] !== false) {
            return true;
        }
    }
    return false;
}

/**
 * Check if quote block should be visible
 */
function hasVisibleQuote(visibility) {
    return visibility.quoteText !== false ||
           visibility.quoteAuthor !== false ||
           visibility.quoteTitle !== false ||
           visibility.quoteCredential !== false;
}

/**
 * Check if any FAQs are visible
 */
function hasVisibleFaqs(visibility) {
    if (visibility.faqTitle !== false) return true;
    for (let i = 1; i <= 6; i++) {
        if (visibility[`faq${i}Question`] !== false ||
            visibility[`faq${i}Answer`] !== false) {
            return true;
        }
    }
    return false;
}

/**
 * Render a single FAQ item
 */
function renderFaqItem(content, visibility, questionKey, answerKey, textClass, isDark) {
    const showQuestion = visibility[questionKey] !== false;
    const showAnswer = visibility[answerKey] !== false;

    if (!showQuestion && !showAnswer) return '';

    // Border colors based on background
    const borderClass = isDark ? 'border-white/30' : 'border-black/20';
    const toggleBorderClass = isDark ? 'border-white' : 'border-black';

    return `
        <details class="group border-b ${borderClass}">
            <summary class="flex items-center justify-between py-6 cursor-pointer list-none">
                ${showQuestion ? `
                    <span contenteditable="true" data-field="${questionKey}"
                          class="text-xl font-bold ${textClass} pr-4">${escapeHtml(content[questionKey])}</span>
                ` : '<span></span>'}
                <span class="flex-shrink-0 w-10 h-10 rounded-full border-2 ${toggleBorderClass} ${textClass} flex items-center justify-center transition-transform group-open:rotate-45">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                </span>
            </summary>
            ${showAnswer ? `
                <div class="pb-6">
                    <p contenteditable="true" data-field="${answerKey}"
                       class="body-text ${textClass}">${escapeHtml(content[answerKey])}</p>
                </div>
            ` : ''}
        </details>
    `;
}

export default {
    type: 'content-spotlight',
    name: 'Content Spotlight',
    category: 'content',
    description: '50/50 content and image split with optional stats grid',

    defaults: {
        variant: 'content-left',
        headline: 'At TROY, You Can Do It All!',
        body: 'Your home away from home has so much to offer. From championship athletics to world-class performances, diverse dining to global connections, Troy University provides the complete college experience.',
        ctaText: 'Learn More',
        image: null,
        // Right column content (for content-both variant)
        headline2: 'Specialize in High-Demand Areas',
        body2: 'TROY\'s graduate degree is designed to meet the demands of a rapidly evolving industry — and the careers that come with it.',
        // Stats (hidden by default via visibility)
        stat1Number: '16',
        stat1Label: 'DI Athletic Teams',
        stat2Number: '15+',
        stat2Label: 'On-campus Dining Options',
        stat3Number: '200+',
        stat3Label: 'Annual Fine Arts Performances',
        stat4Number: '60+',
        stat4Label: 'Nations Represented on Campus',
        stat5Number: '$1,250',
        stat5Label: 'Scholarships to Study Abroad',
        stat6Number: '78k+',
        stat6Label: 'Square-Foot Recreational Facility',
        // Quote block (hidden by default via visibility)
        quoteText: '"The Computer Science program at TROY provided me with a solid foundation in both theory and practice. The faculty\'s industry experience and the hands-on projects prepared me well for my career in software development."',
        quoteAuthor: 'Sunny Sharma',
        quoteTitle: 'Principal Engineer, Charter Communications',
        quoteCredential: '2014 graduate, M.S. in Computer Science',
        // Accordion FAQ section (hidden by default via visibility)
        faqTitle: 'Frequently Asked Questions',
        faq1Question: 'What distinguishes good online computer science degrees?',
        faq1Answer: 'Quality online CS programs offer rigorous curriculum, experienced faculty, hands-on projects, and strong industry connections.',
        faq2Question: 'Does TROY offer a master\'s in computer science online?',
        faq2Answer: 'Yes, TROY offers a fully online Master of Science in Computer Science degree program.',
        faq3Question: 'What are the career opportunities after completing a master\'s in computer science?',
        faq3Answer: 'Graduates pursue roles in software engineering, data science, cybersecurity, AI/ML, and technical leadership.',
        faq4Question: 'How do TROY\'s concentrations shape the types of computer careers you can pursue?',
        faq4Answer: 'Our concentrations allow you to specialize in high-demand areas like cybersecurity, data science, or software engineering.',
        faq5Question: 'Is a master\'s in computer science worth it?',
        faq5Answer: 'A master\'s degree opens doors to senior roles, higher salaries, and specialized positions in the tech industry.',
        faq6Question: 'What research opportunities are available?',
        faq6Answer: 'TROY offers research opportunities in AI, machine learning, cybersecurity, and data analytics with experienced faculty mentors.'
    },

    fields: [
        { key: 'variant', label: 'Layout', type: 'select', options: ['content-left', 'content-right', 'content-both'] },
        { key: 'headline', label: 'Headline', type: 'text' },
        { key: 'body', label: 'Body', type: 'textarea' },
        { key: 'ctaText', label: 'CTA Button', type: 'text' },
        { key: 'headline2', label: 'Right Headline', type: 'text' },
        { key: 'body2', label: 'Right Body', type: 'textarea' },
        { key: 'stat1Number', label: 'Stat 1 Number', type: 'text' },
        { key: 'stat1Label', label: 'Stat 1 Label', type: 'text' },
        { key: 'stat2Number', label: 'Stat 2 Number', type: 'text' },
        { key: 'stat2Label', label: 'Stat 2 Label', type: 'text' },
        { key: 'stat3Number', label: 'Stat 3 Number', type: 'text' },
        { key: 'stat3Label', label: 'Stat 3 Label', type: 'text' },
        { key: 'stat4Number', label: 'Stat 4 Number', type: 'text' },
        { key: 'stat4Label', label: 'Stat 4 Label', type: 'text' },
        { key: 'stat5Number', label: 'Stat 5 Number', type: 'text' },
        { key: 'stat5Label', label: 'Stat 5 Label', type: 'text' },
        { key: 'stat6Number', label: 'Stat 6 Number', type: 'text' },
        { key: 'stat6Label', label: 'Stat 6 Label', type: 'text' },
        { key: 'quoteText', label: 'Quote Text', type: 'textarea' },
        { key: 'quoteAuthor', label: 'Quote Author', type: 'text' },
        { key: 'quoteTitle', label: 'Quote Title', type: 'text' },
        { key: 'quoteCredential', label: 'Quote Credential', type: 'text' },
        { key: 'faqTitle', label: 'FAQ Title', type: 'text' },
        { key: 'faq1Question', label: 'FAQ 1 Question', type: 'text' },
        { key: 'faq1Answer', label: 'FAQ 1 Answer', type: 'textarea' },
        { key: 'faq2Question', label: 'FAQ 2 Question', type: 'text' },
        { key: 'faq2Answer', label: 'FAQ 2 Answer', type: 'textarea' },
        { key: 'faq3Question', label: 'FAQ 3 Question', type: 'text' },
        { key: 'faq3Answer', label: 'FAQ 3 Answer', type: 'textarea' },
        { key: 'faq4Question', label: 'FAQ 4 Question', type: 'text' },
        { key: 'faq4Answer', label: 'FAQ 4 Answer', type: 'textarea' },
        { key: 'faq5Question', label: 'FAQ 5 Question', type: 'text' },
        { key: 'faq5Answer', label: 'FAQ 5 Answer', type: 'textarea' },
        { key: 'faq6Question', label: 'FAQ 6 Question', type: 'text' },
        { key: 'faq6Answer', label: 'FAQ 6 Answer', type: 'textarea' }
    ],

    render(content, visibility, colors = {}) {
        // Get color config
        const bgKey = colors.background || 'sand';
        const colorConfig = COLORS[bgKey] || COLORS.sand;
        const contrast = getContrastConfig(bgKey);
        const bgClass = colorConfig.bgClass;
        const isDark = colorConfig.isDark;

        // Dynamic classes based on background
        const textClass = contrast.text;
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';

        // Build stats grid if any stats are visible
        let statsGrid = '';
        if (hasVisibleStats(visibility)) {
            statsGrid = `
                <div class="grid grid-cols-2 gap-x-8 gap-y-6 mt-8">
                    ${renderStat(content, visibility, 'stat1Number', 'stat1Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat2Number', 'stat2Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat3Number', 'stat3Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat4Number', 'stat4Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat5Number', 'stat5Label', textClass, isDark)}
                    ${renderStat(content, visibility, 'stat6Number', 'stat6Label', textClass, isDark)}
                </div>
            `;
        }

        // Check if content-both variant
        const isContentBoth = content.variant === 'content-both';

        // Content column (left side) - no CTA when content-both (CTA moves to right column)
        const contentCol = `
            <div class="flex flex-col justify-center">
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
                ${!isContentBoth ? renderIfVisible(visibility, 'ctaText', `
                    <a
                        contenteditable="true"
                        data-field="ctaText"
                        class="${ctaClass} cursor-text self-start mb-4"
                    >${escapeHtml(content.ctaText)}</a>
                `) : ''}
                ${statsGrid}
            </div>
        `;

        // Second content column (for content-both variant)
        const contentCol2 = `
            <div class="flex flex-col justify-center">
                ${renderIfVisible(visibility, 'headline2', `
                    <h2
                        contenteditable="true"
                        data-field="headline2"
                        class="section-title ${textClass} mb-6"
                    >${escapeHtml(content.headline2)}</h2>
                `)}
                ${renderIfVisible(visibility, 'body2', `
                    <p
                        contenteditable="true"
                        data-field="body2"
                        class="body-text ${textClass} mb-6"
                    >${escapeHtml(content.body2)}</p>
                `)}
                ${renderIfVisible(visibility, 'ctaText', `
                    <a
                        contenteditable="true"
                        data-field="ctaText"
                        class="${ctaClass} cursor-text self-start mb-4"
                    >${escapeHtml(content.ctaText)}</a>
                `)}
            </div>
        `;

        // Image column (contained with aspect ratio)
        const imageCol = `
            <div class="relative overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
                ${imageSlot('image', content.image, 'absolute inset-0 w-full h-full object-cover')}
            </div>
        `;

        // Order based on variant
        let firstCol, secondCol;
        if (isContentBoth) {
            firstCol = contentCol;
            secondCol = contentCol2;
        } else {
            const isContentRight = content.variant === 'content-right';
            firstCol = isContentRight ? imageCol : contentCol;
            secondCol = isContentRight ? contentCol : imageCol;
        }

        // Quote block (appears below the two-column grid, contained width)
        const quoteBlock = hasVisibleQuote(visibility) ? `
            <div class="bg-[#1a1a1a] py-12 mt-12 text-center">
                <!-- Decorative quote line -->
                <div class="flex items-center justify-center gap-4 mb-6">
                    <div class="w-24 h-px bg-white/50"></div>
                    <span class="text-white text-3xl font-serif">"</span>
                    <div class="w-24 h-px bg-white/50"></div>
                </div>
                ${renderIfVisible(visibility, 'quoteText', `
                    <p contenteditable="true" data-field="quoteText" class="text-white text-lg lg:text-xl italic max-w-4xl mx-auto mb-6">${escapeHtml(content.quoteText)}</p>
                `)}
                <div class="text-white text-sm">
                    ${renderIfVisible(visibility, 'quoteAuthor', `<span contenteditable="true" data-field="quoteAuthor" class="font-bold">${escapeHtml(content.quoteAuthor)}</span>`)}${visibility.quoteAuthor !== false && visibility.quoteTitle !== false ? '<span class="mx-2">|</span>' : ''}${renderIfVisible(visibility, 'quoteTitle', `<span contenteditable="true" data-field="quoteTitle">${escapeHtml(content.quoteTitle)}</span>`)}${(visibility.quoteTitle !== false || visibility.quoteAuthor !== false) && visibility.quoteCredential !== false ? '<span class="mx-2">|</span>' : ''}${renderIfVisible(visibility, 'quoteCredential', `<span contenteditable="true" data-field="quoteCredential">${escapeHtml(content.quoteCredential)}</span>`)}
                </div>
            </div>
        ` : '';

        // FAQ Accordion section (appears below quote block, contained width)
        const faqSection = hasVisibleFaqs(visibility) ? `
            <div class="mt-12">
                ${renderIfVisible(visibility, 'faqTitle', `
                    <h3 contenteditable="true" data-field="faqTitle"
                        class="text-2xl lg:text-3xl font-bold ${textClass} mb-6">${escapeHtml(content.faqTitle)}</h3>
                `)}
                <div class="faq-accordion">
                    ${renderFaqItem(content, visibility, 'faq1Question', 'faq1Answer', textClass, isDark)}
                    ${renderFaqItem(content, visibility, 'faq2Question', 'faq2Answer', textClass, isDark)}
                    ${renderFaqItem(content, visibility, 'faq3Question', 'faq3Answer', textClass, isDark)}
                    ${renderFaqItem(content, visibility, 'faq4Question', 'faq4Answer', textClass, isDark)}
                    ${renderFaqItem(content, visibility, 'faq5Question', 'faq5Answer', textClass, isDark)}
                    ${renderFaqItem(content, visibility, 'faq6Question', 'faq6Answer', textClass, isDark)}
                </div>
            </div>
        ` : '';

        return `
            <section class="${bgClass} py-24">
                <div class="container mx-auto px-8">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        ${firstCol}
                        ${secondCol}
                    </div>
                    ${quoteBlock}
                    ${faqSection}
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = {}) {
        // Get color config
        const bgKey = colors.background || 'sand';
        const colorConfig = COLORS[bgKey] || COLORS.sand;
        const contrast = getContrastConfig(bgKey);
        const bgClass = colorConfig.bgClass;
        const isDark = colorConfig.isDark;

        // Dynamic classes based on background
        const textClass = contrast.text;
        const ctaClass = isDark ? 'btn-bordered-white' : 'btn-cardinal-outline';

        // Build stats grid markup if any stats are visible
        let statsGrid = '';
        if (hasVisibleStats(visibility)) {
            let statsHtml = '';
            for (let i = 1; i <= 6; i++) {
                const showNum = visibility[`stat${i}Number`] !== false;
                const showLabel = visibility[`stat${i}Label`] !== false;
                if (showNum || showLabel) {
                    statsHtml += `
                <div>
                    ${showNum ? `<div class="stat-number ${textClass} text-3xl lg:text-4xl font-bold mb-1">${escapeHtml(content[`stat${i}Number`])}</div>` : ''}
                    ${showLabel ? `<a href="#" class="underline text-sm ${textClass}">${escapeHtml(content[`stat${i}Label`])}</a>` : ''}
                </div>`;
                }
            }
            if (statsHtml) {
                statsGrid = `
            <div class="grid grid-cols-2 gap-x-8 gap-y-6 mt-8">${statsHtml}
            </div>`;
            }
        }

        // Check if content-both variant
        const isContentBoth = content.variant === 'content-both';

        // Content column (left side) - no CTA when content-both (CTA moves to right column)
        const contentCol = `
        <div class="flex flex-col justify-center">
            ${visibility.headline !== false ? `<h2 class="section-title ${textClass} mb-6">${escapeHtml(content.headline)}</h2>` : ''}
            ${visibility.body !== false ? `<p class="body-text ${textClass} mb-6">${escapeHtml(content.body)}</p>` : ''}
            ${!isContentBoth && visibility.ctaText !== false ? `<a href="#" class="${ctaClass} self-start mb-4">${escapeHtml(content.ctaText)}</a>` : ''}${statsGrid}
        </div>`;

        // Second content column (for content-both variant)
        const contentCol2 = `
        <div class="flex flex-col justify-center">
            ${visibility.headline2 !== false ? `<h2 class="section-title ${textClass} mb-6">${escapeHtml(content.headline2)}</h2>` : ''}
            ${visibility.body2 !== false ? `<p class="body-text ${textClass} mb-6">${escapeHtml(content.body2)}</p>` : ''}
            ${visibility.ctaText !== false ? `<a href="#" class="${ctaClass} self-start mb-4">${escapeHtml(content.ctaText)}</a>` : ''}
        </div>`;

        // Image column (contained with aspect ratio)
        const imageMarkup = content.image
            ? `<img src="${content.image}" alt="" class="absolute inset-0 w-full h-full object-cover">`
            : '<div class="absolute inset-0 w-full h-full bg-gray-200"></div>';
        const imageCol = `
        <div class="relative overflow-hidden aspect-[4/3] lg:aspect-auto lg:min-h-[400px]">
            ${imageMarkup}
        </div>`;

        // Order based on variant
        let firstCol, secondCol;
        if (isContentBoth) {
            firstCol = contentCol;
            secondCol = contentCol2;
        } else {
            const isContentRight = content.variant === 'content-right';
            firstCol = isContentRight ? imageCol : contentCol;
            secondCol = isContentRight ? contentCol : imageCol;
        }

        // Quote block markup (appears below the two-column grid, contained width)
        let quoteBlockMarkup = '';
        if (hasVisibleQuote(visibility)) {
            const showAuthor = visibility.quoteAuthor !== false;
            const showTitle = visibility.quoteTitle !== false;
            const showCredential = visibility.quoteCredential !== false;

            let attributionParts = [];
            if (showAuthor) attributionParts.push(`<span class="font-bold">${escapeHtml(content.quoteAuthor)}</span>`);
            if (showTitle) attributionParts.push(`<span>${escapeHtml(content.quoteTitle)}</span>`);
            if (showCredential) attributionParts.push(`<span>${escapeHtml(content.quoteCredential)}</span>`);

            quoteBlockMarkup = `
        <div class="bg-[#1a1a1a] py-12 mt-12 text-center">
            <div class="flex items-center justify-center gap-4 mb-6">
                <div class="w-24 h-px bg-white/50"></div>
                <span class="text-white text-3xl font-serif">"</span>
                <div class="w-24 h-px bg-white/50"></div>
            </div>
            ${visibility.quoteText !== false ? `<p class="text-white text-lg lg:text-xl italic max-w-4xl mx-auto mb-6">${escapeHtml(content.quoteText)}</p>` : ''}
            ${attributionParts.length > 0 ? `<div class="text-white text-sm">${attributionParts.join('<span class="mx-2">|</span>')}</div>` : ''}
        </div>`;
        }

        // FAQ Accordion markup (appears below quote block)
        let faqSectionMarkup = '';
        if (hasVisibleFaqs(visibility)) {
            // Border colors based on background
            const borderClass = isDark ? 'border-white/30' : 'border-black/20';
            const toggleBorderClass = isDark ? 'border-white' : 'border-black';

            let faqItemsHtml = '';
            for (let i = 1; i <= 6; i++) {
                const showQuestion = visibility[`faq${i}Question`] !== false;
                const showAnswer = visibility[`faq${i}Answer`] !== false;
                if (showQuestion || showAnswer) {
                    faqItemsHtml += `
            <details class="group border-b ${borderClass}">
                <summary class="flex items-center justify-between py-6 cursor-pointer list-none">
                    ${showQuestion ? `<span class="text-xl font-bold ${textClass} pr-4">${escapeHtml(content[`faq${i}Question`])}</span>` : '<span></span>'}
                    <span class="flex-shrink-0 w-10 h-10 rounded-full border-2 ${toggleBorderClass} ${textClass} flex items-center justify-center transition-transform group-open:rotate-45">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </span>
                </summary>
                ${showAnswer ? `<div class="pb-6"><p class="body-text ${textClass}">${escapeHtml(content[`faq${i}Answer`])}</p></div>` : ''}
            </details>`;
                }
            }
            if (faqItemsHtml) {
                faqSectionMarkup = `
        <div class="mt-12">
            ${visibility.faqTitle !== false ? `<h3 class="text-2xl lg:text-3xl font-bold ${textClass} mb-6">${escapeHtml(content.faqTitle)}</h3>` : ''}
            <div class="faq-accordion">${faqItemsHtml}
            </div>
        </div>`;
            }
        }

        return `
<section class="${bgClass} py-24">
    <div class="container mx-auto px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            ${firstCol}
            ${secondCol}
        </div>${quoteBlockMarkup}${faqSectionMarkup}
    </div>
</section>`.trim();
    }
};
