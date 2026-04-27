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
        sectionCount: 7,
        // Visual rhythm (per ruleset v2.4 §5.8):
        //   black → sand → light → cardinal → light → sand → black
        //   Emphasis bookends with a mid-page cardinal moment; sand and light
        //   alternate symmetrically between them. Palindromic alternation —
        //   strong rhythm, no clustering.
        sections: [
            {
                type: 'hero',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=2000&q=80',
                    headline: 'Your Future\nStarts Here.',
                    body: 'At Troy University, you\'ll find more than a degree—you\'ll discover a community that believes in you, challenges you, and celebrates every step of your journey.',
                    ctaPrimary: 'Apply Now',
                    ctaSecondary: 'Visit Campus'
                }
            },
            {
                type: 'statistics',
                content: {
                    headline: 'Real Results.\nReal Success.',
                    body: 'Troy University delivers authentic achievements that demonstrate our commitment to student success. Real work always wins.',
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
                type: 'content-spotlight',
                content: {
                    variant: 'content-right',
                    headline: 'At TROY, You Can Do It All!',
                    body: 'Your home away from home has so much to offer. From championship athletics and world-class performances to diverse dining options and a global community, Troy University provides the complete college experience.',
                    ctaText: 'Explore Campus Life',
                    image: null,
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
                    stat6Label: 'Square-Foot Recreational Facility'
                },
                colors: { background: 'white' }
            },
            {
                type: 'promo-carousel',
                content: {
                    variant: 'promo',
                    headline: 'Save Big with Trojan Book Bag',
                    body: 'Trojan Book Bag provides access to course materials at a fraction of the cost. Get your textbooks, digital resources, and supplies all in one convenient package.',
                    ctaText: 'TROJAN BOOK BAG INFORMATION',
                    totalSlides: 3,
                    activeSlide: 2
                },
                // Cardinal mid-page brand moment — anchors the rhythm and
                // gives the page a strong visual peak between the two black
                // emphasis bookends.
                colors: { background: 'cardinal' }
            },
            {
                type: 'academic-excellence',
                content: {
                    headline: 'Five Colleges.\nEndless Possibilities.',
                    body: 'From AACSB-accredited business programs to cutting-edge nursing education, TROY offers real-world preparation across every field of study.',
                    ctaText: 'Explore Programs',
                    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
                    featuredTitle: 'Sorrell College of Business',
                    featuredDescription: 'AACSB-accredited excellence in business education',
                    program1Title: 'Health Sciences',
                    program1Description: 'State-of-the-art simulation labs and clinical partnerships prepare you for healthcare careers.',
                    program2Title: 'Education',
                    program2Description: 'Transform lives through innovative teaching methods and extensive classroom experience.',
                    program3Title: 'Engineering',
                    program3Description: 'Hands-on learning with industry-standard equipment and real-world projects.'
                },
                colors: { background: 'white' }
            },
            {
                type: 'latest-stories',
                content: {
                    headline: 'Real Stories.\nReal Achievements.',
                    body: 'Our students don\'t just learn—they lead, innovate, and make a difference. Their victories are our victories.',
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
                colors: { background: 'sand' }
            },
            {
                type: 'final-cta',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
                    headline: 'Your TROY Story\nStarts Now.',
                    body: 'Join 15,000+ students who chose to be part of something real. At TROY, real work always wins.',
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
        sectionCount: 6,
        // Visual rhythm (per ruleset v2.4 §5.8):
        //   black → sand → light → cardinal → sand → light
        //   Emphasis spread instead of bookended — black opens, cardinal sits
        //   mid-page as a brand emphasis, with sand/light alternating between
        //   them. Mirrors the 25–35% / "3–4 emphasis" guidance for short pages.
        sections: [
            {
                type: 'hero',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=2000&q=80',
                    headline: 'Real Learning.\nReal Impact.',
                    body: 'With 230+ degree programs across five colleges, TROY prepares you for the career you want with the hands-on experience employers demand.',
                    ctaPrimary: 'Browse Programs',
                    ctaSecondary: 'Visit Campus'
                }
            },
            {
                type: 'split-layout',
                content: {
                    variant: 'content-left',
                    headline: 'Learn From Leading Faculty',
                    body: 'Our professors aren\'t just educators—they\'re active researchers, industry experts, and dedicated mentors. With a 16:1 student-faculty ratio, you\'ll receive personalized attention and real-world guidance.',
                    detailLabel1: 'Faculty-to-Student Ratio',
                    detailValue1: '16:1 personalized attention',
                    detailLabel2: 'Faculty Credentials',
                    detailValue2: '90% hold terminal degrees',
                    ctaText: 'MEET OUR FACULTY',
                    image: null
                },
                visibility: {
                    stat1Number: false, stat1Label: false,
                    stat2Number: false, stat2Label: false,
                    stat3Number: false, stat3Label: false,
                    stat4Number: false, stat4Label: false,
                    stat5Number: false, stat5Label: false,
                    stat6Number: false, stat6Label: false
                },
                colors: { background: 'sand' }
            },
            {
                type: 'academic-excellence',
                content: {
                    headline: 'Real Experiences.\nReal Opportunities.',
                    body: 'Our programs combine rigorous academics with practical application. From AACSB-accredited business degrees to award-winning nursing programs, TROY delivers real-world preparation.',
                    ctaText: 'View All Programs',
                    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
                    featuredTitle: 'Sorrell College of Business',
                    featuredDescription: 'Top-tier business education with global recognition',
                    program1Title: 'Arts & Humanities',
                    program1Description: 'Creative expression meets critical thinking in programs designed to shape culture and communication.',
                    program2Title: 'Science & Engineering',
                    program2Description: 'State-of-the-art labs and research opportunities prepare future innovators and problem-solvers.',
                    program3Title: 'Health Sciences',
                    program3Description: 'Clinical excellence through real patient care and cutting-edge simulation technology.'
                },
                colors: { background: 'white' }
            },
            {
                type: 'brand-story',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
                    headline: '135+ Years of\nReal Innovation.',
                    body: 'From our founding as a teachers\' college to becoming a leader in online education and AI-forward initiatives, Troy University has always embraced the future while honoring tradition.',
                    quote: '"We don\'t just teach subjects—we transform students into professionals ready to make an impact."',
                    ctaText: 'Discover Our Story',
                    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80'
                }
            },
            {
                type: 'statistics',
                content: {
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
                type: 'promo-carousel',
                content: {
                    variant: 'news',
                    newsItem1Title: 'TROY Announces New AI Research Center',
                    newsItem1Date: 'March 2026',
                    newsItem1Image: null,
                    newsItem2Title: 'Engineering Program Earns National Recognition',
                    newsItem2Date: 'February 2026',
                    newsItem2Image: null,
                    ctaLinkText: 'All News',
                    totalSlides: 3,
                    activeSlide: 2
                },
                colors: { background: 'white' }
            }
        ]
    },
    {
        id: 'about-troy',
        name: 'About Troy',
        description: 'Institutional brand story',
        sectionCount: 9,
        // Visual rhythm (per ruleset v2.4 §5.8):
        //   black → sand → light → cardinal → light → sand → light → sand → black
        //   Emphasis spread evenly (positions 0, 3, 8) instead of clustered.
        //   Sand and light alternate between emphasis points — this mirrors
        //   the §5.8 example: "Cardinal → Sand → Light → Black → Light → Sand
        //   → Cardinal → Black → Sand → Light".
        //   3 emphasis (33%) · 3 sand (33%) · 3 light (33%) — all targets met.
        sections: [
            {
                type: 'hero',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=2000&q=80',
                    headline: 'Real Heritage.\nReal Vision.',
                    body: 'For over 135 years, Troy University has been transforming lives through education that values authenticity, hard work, and real achievement.',
                    ctaPrimary: 'Our Story',
                    ctaSecondary: 'Visit Campus'
                }
            },
            {
                type: 'statistics',
                content: {
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
                type: 'content-spotlight',
                content: {
                    variant: 'content-left',
                    headline: 'A Truly Global University',
                    body: 'With students from over 65 countries and partnerships spanning the globe, TROY brings the world to Alabama—and Alabama to the world. Our international presence creates a diverse, inclusive community that prepares students for global citizenship.',
                    ctaText: 'Global Initiatives',
                    image: null,
                    stat1Number: '65+',
                    stat1Label: 'Countries Represented',
                    stat2Number: '4',
                    stat2Label: 'Alabama Campuses',
                    stat3Number: '60+',
                    stat3Label: 'International Sites',
                    stat4Number: '15,000+',
                    stat4Label: 'Students Worldwide',
                    stat5Number: '100+',
                    stat5Label: 'Study Abroad Programs',
                    stat6Number: '1990s',
                    stat6Label: 'Online Education Pioneer'
                },
                colors: { background: 'white' }
            },
            {
                type: 'brand-story',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
                    headline: 'No Filters.\nJust Real\nBreakthroughs.',
                    body: 'At TROY, we celebrate the entire journey—not just the destination. We show the proposals that didn\'t work, the setbacks overcome, and the people who inspired breakthrough moments. Because real work always wins.',
                    quote: '"Every step forward is a victory worth celebrating. Your journey matters as much as your destination."',
                    ctaText: 'Learn More',
                    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80'
                }
            },
            {
                type: 'academic-excellence',
                content: {
                    variant: 'content-left',
                    headline: 'Five Colleges.\nOne Trojan Family.',
                    body: 'TROY is organized into five colleges, each delivering nationally recognized programs anchored by hands-on learning, dedicated faculty, and a campus culture that takes the journey as seriously as the destination.',
                    ctaText: 'Explore Programs',
                    featuredImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80',
                    featuredTitle: 'Sorrell College of Business',
                    featuredDescription: 'AACSB-accredited programs that connect classroom learning to real industry outcomes.',
                    program1Title: 'Health Sciences',
                    program1Description: 'Clinical excellence through real patient care, simulation labs, and community partnerships.',
                    program2Title: 'Education and Behavioral Sciences',
                    program2Description: 'Shape the next generation of teachers, counselors, and community leaders.',
                    program3Title: 'Arts and Sciences',
                    program3Description: 'A foundation in critical thinking, communication, and discovery across every discipline.'
                },
                colors: { background: 'white' }
            },
            {
                type: 'split-layout',
                content: {
                    variant: 'content-right',
                    headline: 'Join Us for Homecoming 2026',
                    body: 'Celebrate Troy traditions with fellow Trojans! Homecoming brings together alumni, students, and friends for a weekend of spirit, football, and unforgettable memories. Come home to Troy.',
                    detailLabel1: 'Save the Date',
                    detailValue1: 'October 15-18, 2026',
                    detailLabel2: 'Location',
                    detailValue2: 'Troy Campus, Alabama',
                    ctaText: 'REGISTER NOW',
                    image: null
                },
                visibility: {
                    stat1Number: false, stat1Label: false,
                    stat2Number: false, stat2Label: false,
                    stat3Number: false, stat3Label: false,
                    stat4Number: false, stat4Label: false,
                    stat5Number: false, stat5Label: false,
                    stat6Number: false, stat6Label: false
                },
                colors: { background: 'sand' }
            },
            {
                type: 'latest-stories',
                content: {
                    headline: 'Real Stories.\nReal Trojans.',
                    body: 'Discover the people who make TROY a community — students, faculty, and alumni who turn vision into impact every day.',
                    story1Image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
                    story1Category: 'Alumni Spotlight',
                    story1Title: 'From TROY to the World Stage',
                    story1Description: 'How an Alabama-rooted alumnus is leading global change in clean-energy research and policy.',
                    story2Image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80',
                    story2Category: 'Faculty Research',
                    story2Title: 'Pioneering Research in Cybersecurity',
                    story2Description: 'TROY faculty are shaping the next generation of secure systems through interdisciplinary collaboration.',
                    story3Image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80',
                    story3Category: 'Student Achievement',
                    story3Title: 'First-Gen Student Earns National Award',
                    story3Description: 'Hard work and the right mentorship turn a TROY student into a national leader in service.'
                },
                colors: { background: 'white' }
            },
            {
                type: 'promo-carousel',
                content: {
                    variant: 'news',
                    newsItem1Title: 'TROY Welcomes Record International Class',
                    newsItem1Date: 'September 2026',
                    newsItem1Image: null,
                    newsItem2Title: 'Alumni Network Expands to 100+ Countries',
                    newsItem2Date: 'August 2026',
                    newsItem2Image: null,
                    ctaLinkText: 'All News',
                    totalSlides: 3,
                    activeSlide: 2
                },
                colors: { background: 'sand' }
            },
            {
                type: 'final-cta',
                content: {
                    backgroundImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&q=80',
                    headline: 'Become Part of\nSomething Real.',
                    body: 'Whether you\'re a prospective student, alumnus, or community partner, there\'s a place for you at TROY. Real connections. Real community. Real impact.',
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
