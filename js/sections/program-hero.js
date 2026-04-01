/**
 * TROY Sandbox — Program Hero Section
 * Program landing page hero with info box, two-column layout
 * Cardinal halftone background with white bordered info container
 */

import { escapeHtml, renderIfVisible } from '../utils.js';
import { COLORS, getHalftoneClasses } from '../color-config.js';

export default {
    type: 'program-hero',
    name: 'Program Hero',
    category: 'hero',
    description: 'Program landing page hero with info box',

    defaults: {
        // Left column
        programName: 'COMPUTER SCIENCE',
        ctaPrimary: 'APPLY NOW',
        ctaSecondary: 'REQUEST INFORMATION',
        noteText: '*Available for International Students',

        // Program Info values (labels are fixed in template)
        degreeType: 'Graduate',
        phone: '(800) 414-5756',
        deadline: 'Rolling Admission',

        // Quick links
        link1Text: 'Degree Map',
        link2Text: 'Catalog Link'
    },

    fields: [
        { key: 'programName', label: 'Program Name', type: 'text' },
        { key: 'ctaPrimary', label: 'Primary CTA', type: 'text' },
        { key: 'ctaSecondary', label: 'Secondary CTA', type: 'text' },
        { key: 'noteText', label: 'Note Text', type: 'text' },
        { key: 'degreeType', label: 'Degree Type', type: 'text' },
        { key: 'phone', label: 'Phone Number', type: 'text' },
        { key: 'deadline', label: 'Deadline', type: 'text' },
        { key: 'link1Text', label: 'Degree Map Link', type: 'text' },
        { key: 'link2Text', label: 'Catalog Link', type: 'text' }
    ],

    render(content, visibility, colors = {}) {
        const bgKey = colors.background || 'cardinal-halftone';
        const colorConfig = COLORS[bgKey] || COLORS['cardinal-halftone'];
        const halftoneClasses = getHalftoneClasses(bgKey);

        return `
            <section class="relative py-16 lg:py-24 overflow-hidden ${colorConfig.bgClass} ${halftoneClasses}">
                <!-- Content container -->
                <div class="container mx-auto px-8 relative z-10">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                        <!-- Left Column: Program Name & CTAs -->
                        <div class="flex flex-col justify-center">
                            ${renderIfVisible(visibility, 'programName', `
                                <h1
                                    contenteditable="true"
                                    data-field="programName"
                                    class="hero-headline text-white mb-8"
                                >${escapeHtml(content.programName)}</h1>
                            `)}

                            <div class="flex flex-col sm:flex-row gap-4 mb-6">
                                ${renderIfVisible(visibility, 'ctaPrimary', `
                                    <a
                                        contenteditable="true"
                                        data-field="ctaPrimary"
                                        class="btn-white cursor-text"
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

                            ${renderIfVisible(visibility, 'noteText', `
                                <p
                                    contenteditable="true"
                                    data-field="noteText"
                                    class="text-white/80 text-sm italic"
                                >${escapeHtml(content.noteText)}</p>
                            `)}
                        </div>

                        <!-- Right Column: Program Info Box -->
                        <div class="border-2 border-white p-6 lg:p-8">
                            <h2 class="font-pressio-condensed text-2xl text-white uppercase tracking-wider mb-6">Program Info</h2>

                            <!-- Info Grid -->
                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                                <!-- Degree Type -->
                                <div>
                                    <p class="nav-heading text-white/80 text-xs uppercase tracking-wider mb-2">Degree Type:</p>
                                    ${renderIfVisible(visibility, 'degreeType', `
                                        <span
                                            contenteditable="true"
                                            data-field="degreeType"
                                            class="inline-block border border-white text-white px-3 py-1 text-sm"
                                        >${escapeHtml(content.degreeType)}</span>
                                    `)}
                                </div>

                                <!-- Questions -->
                                <div>
                                    <p class="nav-heading text-white/80 text-xs uppercase tracking-wider mb-2">Questions?</p>
                                    ${renderIfVisible(visibility, 'phone', `
                                        <p
                                            contenteditable="true"
                                            data-field="phone"
                                            class="text-white body-text"
                                        >${escapeHtml(content.phone)}</p>
                                    `)}
                                </div>

                                <!-- Application Deadline -->
                                <div>
                                    <p class="nav-heading text-white/80 text-xs uppercase tracking-wider mb-2">Application Deadline:</p>
                                    ${renderIfVisible(visibility, 'deadline', `
                                        <p
                                            contenteditable="true"
                                            data-field="deadline"
                                            class="text-white body-text"
                                        >${escapeHtml(content.deadline)}</p>
                                    `)}
                                </div>
                            </div>

                            <!-- Quick Links -->
                            <div class="border-t border-white/30 pt-6">
                                <p class="nav-heading text-white/80 text-xs uppercase tracking-wider mb-3">Quick Links</p>
                                <div class="flex flex-wrap gap-4">
                                    ${renderIfVisible(visibility, 'link1Text', `
                                        <a
                                            contenteditable="true"
                                            data-field="link1Text"
                                            class="text-white underline hover:text-wheat cursor-text"
                                        >${escapeHtml(content.link1Text)}</a>
                                    `)}
                                    ${renderIfVisible(visibility, 'link2Text', `
                                        <a
                                            contenteditable="true"
                                            data-field="link2Text"
                                            class="text-white underline hover:text-wheat cursor-text"
                                        >${escapeHtml(content.link2Text)}</a>
                                    `)}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        `;
    },

    toMarkup(content, visibility = {}, colors = {}) {
        const bgKey = colors.background || 'cardinal-halftone';
        const colorConfig = COLORS[bgKey] || COLORS['cardinal-halftone'];
        const halftoneClasses = getHalftoneClasses(bgKey);

        return `
<section class="relative py-16 lg:py-24 overflow-hidden ${colorConfig.bgClass} ${halftoneClasses}">
    <div class="container mx-auto px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div class="flex flex-col justify-center">
                ${visibility.programName !== false ? `<h1 class="hero-headline text-white mb-8">${escapeHtml(content.programName)}</h1>` : ''}
                <div class="flex flex-col sm:flex-row gap-4 mb-6">
                    ${visibility.ctaPrimary !== false ? `<a href="#" class="btn-white">${escapeHtml(content.ctaPrimary)}</a>` : ''}
                    ${visibility.ctaSecondary !== false ? `<a href="#" class="btn-bordered-white">${escapeHtml(content.ctaSecondary)}</a>` : ''}
                </div>
                ${visibility.noteText !== false ? `<p class="text-white/80 text-sm italic">${escapeHtml(content.noteText)}</p>` : ''}
            </div>
            <div class="border-2 border-white p-6 lg:p-8">
                <h2 class="font-pressio-condensed text-2xl text-white uppercase tracking-wider mb-6">Program Info</h2>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div>
                        <p class="nav-heading text-white/80 text-xs uppercase tracking-wider mb-2">Degree Type:</p>
                        ${visibility.degreeType !== false ? `<span class="inline-block border border-white text-white px-3 py-1 text-sm">${escapeHtml(content.degreeType)}</span>` : ''}
                    </div>
                    <div>
                        <p class="nav-heading text-white/80 text-xs uppercase tracking-wider mb-2">Questions?</p>
                        ${visibility.phone !== false ? `<p class="text-white body-text">${escapeHtml(content.phone)}</p>` : ''}
                    </div>
                    <div>
                        <p class="nav-heading text-white/80 text-xs uppercase tracking-wider mb-2">Application Deadline:</p>
                        ${visibility.deadline !== false ? `<p class="text-white body-text">${escapeHtml(content.deadline)}</p>` : ''}
                    </div>
                </div>
                <div class="border-t border-white/30 pt-6">
                    <p class="nav-heading text-white/80 text-xs uppercase tracking-wider mb-3">Quick Links</p>
                    <div class="flex flex-wrap gap-4">
                        ${visibility.link1Text !== false ? `<a href="#" class="text-white underline hover:text-wheat">${escapeHtml(content.link1Text)}</a>` : ''}
                        ${visibility.link2Text !== false ? `<a href="#" class="text-white underline hover:text-wheat">${escapeHtml(content.link2Text)}</a>` : ''}
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>`.trim();
    }
};
