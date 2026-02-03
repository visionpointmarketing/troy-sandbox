/**
 * TROY Sandbox — Page Templates
 * Pre-built page layouts with Troy University-specific content
 */

// Template definitions
const pageTemplates = [
    {
        id: 'prospective-students',
        name: 'Prospective Students',
        description: 'Undergraduate recruitment focus',
        sectionCount: 5,
        sections: [
            {
                type: 'hero',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=2000&q=80',
                    tagline: 'All Ways Real. Always TROY.',
                    headline: 'Your Future\nStarts Here.',
                    body: 'At Troy University, you\'ll find more than a degree—you\'ll discover a community that believes in you, challenges you, and celebrates every step of your journey.',
                    ctaPrimary: 'Apply Now',
                    ctaSecondary: 'Visit Campus'
                }
            },
            {
                type: 'statistics',
                content: {
                    badge: 'By The Numbers',
                    headline: 'Real Results.\nReal Success.',
                    body: 'Troy University delivers authentic achievements that demonstrate our commitment to student success. <strong>Real work always wins.</strong>',
                    stat1Number: '15,000+',
                    stat1Label: 'Students',
                    stat1Description: 'Across 4 Alabama campuses',
                    stat2Number: '230+',
                    stat2Label: 'Degree Programs',
                    stat2Description: 'Undergraduate & graduate',
                    stat3Number: '95%',
                    stat3Label: 'Acceptance Rate',
                    stat3Description: 'Your journey starts here',
                    stat4Number: '75%',
                    stat4Label: 'Retention Rate',
                    stat4Description: 'Students who stay succeed'
                },
                colors: { background: 'sand' }
            },
            {
                type: 'academic-excellence',
                content: {
                    badge: 'Academic Excellence',
                    headline: 'Five Colleges.\nEndless Possibilities.',
                    body: 'From AACSB-accredited business programs to cutting-edge nursing education, TROY offers <strong>real-world preparation</strong> across every field of study.',
                    ctaText: 'Explore Programs',
                    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
                    featuredTag: 'Featured',
                    featuredTitle: 'Sorrell College of Business',
                    featuredDescription: 'AACSB-accredited excellence in business education',
                    program1Title: 'Health Sciences',
                    program1Description: 'State-of-the-art simulation labs and clinical partnerships prepare you for healthcare careers.',
                    program2Title: 'Education',
                    program2Description: 'Transform lives through innovative teaching methods and extensive classroom experience.',
                    program3Title: 'Engineering',
                    program3Description: 'Hands-on learning with industry-standard equipment and real-world projects.'
                },
                colors: { background: 'white', cardBackground: 'sand' }
            },
            {
                type: 'latest-stories',
                content: {
                    badge: 'Student Success',
                    headline: 'Real Stories.\nReal Achievements.',
                    body: 'Our students don\'t just learn—they lead, innovate, and make a difference. <strong>Their victories are our victories.</strong>',
                    story1Image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
                    story1Category: 'Student Achievement',
                    story1Title: 'First-Generation Graduate Earns Prestigious Fellowship',
                    story1Description: 'How TROY\'s mentorship programs helped one student break barriers and achieve national recognition.',
                    story2Image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80',
                    story2Category: 'Research Excellence',
                    story2Title: 'Undergraduate Research Team Publishes Groundbreaking Study',
                    story2Description: 'Student researchers collaborate with faculty to advance environmental science solutions.',
                    story3Image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
                    story3Category: 'Community Impact',
                    story3Title: 'Nursing Students Launch Rural Health Initiative',
                    story3Description: 'Making healthcare accessible to underserved communities through student-led programs.'
                },
                colors: { background: 'sand', cardBackground: 'white' }
            },
            {
                type: 'final-cta',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
                    badge: 'Your Journey Awaits',
                    headline: 'Your TROY Story\nStarts Now.',
                    body: 'Join 15,000+ students who chose to be part of something real. At TROY, <strong>real work always wins</strong>.',
                    tagline: 'Because your success is our success.',
                    ctaPrimary: 'Apply Today',
                    ctaSecondary: 'Request Info'
                }
            }
        ]
    },
    {
        id: 'academic-programs',
        name: 'Academic Programs',
        description: 'Program showcase focus',
        sectionCount: 4,
        sections: [
            {
                type: 'hero',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=2000&q=80',
                    tagline: 'All Ways Real. Always TROY.',
                    headline: 'Real Learning.\nReal Impact.',
                    body: 'With 230+ degree programs across five colleges, TROY prepares you for the career you want with the hands-on experience employers demand.',
                    ctaPrimary: 'Browse Programs',
                    ctaSecondary: 'Visit Campus'
                }
            },
            {
                type: 'academic-excellence',
                content: {
                    badge: 'Five Colleges',
                    headline: 'Real Experiences.\nReal Opportunities.',
                    body: 'Our programs combine rigorous academics with practical application. From AACSB-accredited business degrees to award-winning nursing programs, <strong>TROY delivers real-world preparation</strong>.',
                    ctaText: 'View All Programs',
                    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
                    featuredTag: 'AACSB Accredited',
                    featuredTitle: 'Sorrell College of Business',
                    featuredDescription: 'Top-tier business education with global recognition',
                    program1Title: 'Arts & Humanities',
                    program1Description: 'Creative expression meets critical thinking in programs designed to shape culture and communication.',
                    program2Title: 'Science & Engineering',
                    program2Description: 'State-of-the-art labs and research opportunities prepare future innovators and problem-solvers.',
                    program3Title: 'Health Sciences',
                    program3Description: 'Clinical excellence through real patient care and cutting-edge simulation technology.'
                },
                colors: { background: 'white', cardBackground: 'sand' }
            },
            {
                type: 'statistics',
                content: {
                    badge: 'Academic Excellence',
                    headline: 'Numbers That\nMatter.',
                    body: 'Troy University combines accessibility with excellence, offering world-class education that prepares students for real-world success.',
                    stat1Number: '230+',
                    stat1Label: 'Degree Programs',
                    stat1Description: 'Undergraduate & graduate',
                    stat2Number: '65+',
                    stat2Label: 'Countries',
                    stat2Description: 'Global student body',
                    stat3Number: '16:1',
                    stat3Label: 'Student-Faculty Ratio',
                    stat3Description: 'Personalized attention',
                    stat4Number: '1990s',
                    stat4Label: 'Online Pioneer',
                    stat4Description: 'Leading distance education'
                },
                colors: { background: 'sand' }
            },
            {
                type: 'brand-story',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
                    tagline: 'Since 1887',
                    headline: '135+ Years of\nReal Innovation.',
                    body: 'From our founding as a teachers\' college to becoming a leader in online education and AI-forward initiatives, Troy University has always embraced the future while honoring tradition.',
                    quote: '"We don\'t just teach subjects—we transform students into professionals ready to make an impact."',
                    ctaText: 'Discover Our Story',
                    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80'
                }
            }
        ]
    },
    {
        id: 'about-troy',
        name: 'About Troy',
        description: 'Institutional brand story',
        sectionCount: 4,
        sections: [
            {
                type: 'hero',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=2000&q=80',
                    tagline: 'All Ways Real. Always TROY.',
                    headline: 'Real Heritage.\nReal Vision.',
                    body: 'For over 135 years, Troy University has been transforming lives through education that values authenticity, hard work, and real achievement.',
                    ctaPrimary: 'Our Story',
                    ctaSecondary: 'Visit Campus'
                }
            },
            {
                type: 'brand-story',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
                    tagline: 'All Ways Real. Always TROY.',
                    headline: 'No Filters.\nJust Real\nBreakthroughs.',
                    body: 'At TROY, we celebrate the entire journey—not just the destination. We show the proposals that didn\'t work, the setbacks overcome, and the people who inspired breakthrough moments. <strong>Because real work always wins.</strong>',
                    quote: '"Every step forward is a victory worth celebrating. Your journey matters as much as your destination."',
                    ctaText: 'Learn More',
                    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80'
                }
            },
            {
                type: 'statistics',
                content: {
                    badge: 'Our Legacy',
                    headline: 'Real Numbers.\nReal Impact.',
                    body: 'From a small teachers\' college to a global university, Troy has grown while staying true to our mission of accessible, authentic education.',
                    stat1Number: '1887',
                    stat1Label: 'Founded',
                    stat1Description: '135+ years of excellence',
                    stat2Number: '4',
                    stat2Label: 'Alabama Campuses',
                    stat2Description: 'Troy, Dothan, Montgomery, Phenix City',
                    stat3Number: '65+',
                    stat3Label: 'Countries',
                    stat3Description: 'Truly global community',
                    stat4Number: '#1',
                    stat4Label: 'Military Friendly',
                    stat4Description: 'Top school for veterans'
                },
                colors: { background: 'sand' }
            },
            {
                type: 'final-cta',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
                    badge: 'Join Our Story',
                    headline: 'Become Part of\nSomething Real.',
                    body: 'Whether you\'re a prospective student, alumnus, or community partner, there\'s a place for you at TROY. <strong>Real connections. Real community. Real impact.</strong>',
                    tagline: 'All Ways Real. Always TROY.',
                    ctaPrimary: 'Get Started',
                    ctaSecondary: 'Contact Us'
                }
            }
        ]
    }
];

/**
 * Get all page templates
 * @returns {Array} Array of template objects
 */
export function getAllPageTemplates() {
    return pageTemplates;
}

/**
 * Get a page template by ID
 * @param {string} id - Template ID
 * @returns {object|null} Template object or null
 */
export function getPageTemplate(id) {
    return pageTemplates.find(t => t.id === id) || null;
}

export default pageTemplates;
