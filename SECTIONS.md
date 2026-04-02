# TROY Sandbox — Section Specifications

This document defines the 11 section types for the TROY Sandbox builder.

---

## 1. Hero Section

**Type:** `hero`
**Category:** `hero`
**Purpose:** Primary landing section with full-width background image, headline, and CTAs

### Visual Description
- Full-width background image with dark overlay
- Eyebrow badge (small text above headline)
- Large headline
- Body paragraph
- Two CTA buttons (primary filled, secondary outlined)

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `eyebrow` | text | "TROY UNIVERSITY" |
| `headline` | text | "Your Journey Starts Here" |
| `body` | textarea | "Discover your potential at Troy University..." |
| `ctaPrimary` | text | "Apply Now" |
| `ctaSecondary` | text | "Request Info" |
| `backgroundImage` | image | placeholder |

### Tailwind Structure (approximate)
```html
<section class="relative min-h-[600px] bg-cover bg-center" style="background-image: url(...)">
  <div class="absolute inset-0 bg-black/50"></div>
  <div class="relative container mx-auto px-4 py-20 text-white">
    <span class="inline-block bg-troy-gold px-4 py-1 text-sm font-semibold mb-4">
      {eyebrow}
    </span>
    <h1 class="text-5xl font-bold mb-6">{headline}</h1>
    <p class="text-xl max-w-2xl mb-8">{body}</p>
    <div class="flex gap-4">
      <a class="bg-troy-maroon px-6 py-3 font-semibold">{ctaPrimary}</a>
      <a class="border-2 border-white px-6 py-3 font-semibold">{ctaSecondary}</a>
    </div>
  </div>
</section>
```

---

## 2. Program Hero Section

**Type:** `program-hero`
**Category:** `hero`
**Purpose:** Program landing page hero with info box and quick links

### Visual Description
- Cardinal halftone background with two-column layout
- Left column: Program name headline, two CTAs, optional note text
- Right column: White-bordered Program Info box with degree type, phone, deadline, and quick links

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `programName` | text | "COMPUTER SCIENCE" |
| `ctaPrimary` | text | "APPLY NOW" |
| `ctaSecondary` | text | "REQUEST INFORMATION" |
| `noteText` | text | "*Available for International Students" |
| `degreeType` | text | "Graduate" |
| `phone` | text | "(800) 414-5756" |
| `deadline` | text | "Rolling Admission" |
| `link1Text` | text | "Degree Map" |
| `link2Text` | text | "Catalog Link" |

### Tailwind Structure (approximate)
```html
<section class="relative py-16 lg:py-24 overflow-hidden bg-cardinal halftone">
  <div class="container mx-auto px-8 relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <!-- Left Column -->
      <div class="flex flex-col justify-center">
        <h1 class="hero-headline text-white mb-8">{programName}</h1>
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <a class="btn-white">{ctaPrimary}</a>
          <a class="btn-bordered-white">{ctaSecondary}</a>
        </div>
        <p class="text-white/80 text-sm italic">{noteText}</p>
      </div>
      <!-- Right Column: Program Info Box -->
      <div class="border-2 border-white p-6 lg:p-8">
        <h2 class="font-pressio-condensed text-2xl text-white uppercase">Program Info</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <!-- Info fields... -->
        </div>
        <div class="border-t border-white/30 pt-6">
          <p class="text-white/80 text-xs uppercase">Quick Links</p>
          <div class="flex flex-wrap gap-4">
            <a class="text-white underline">{link1Text}</a>
            <a class="text-white underline">{link2Text}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 3. Statistics Section

**Type:** `statistics`
**Category:** `content`
**Purpose:** Showcase key numbers and achievements

### Visual Description
- Cream/textured background
- Eyebrow, headline, body intro
- 4 stat cards in a row
- Each card: large number, label, description

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `eyebrow` | text | "BY THE NUMBERS" |
| `headline` | text | "Troy at a Glance" |
| `body` | textarea | "Our commitment to excellence..." |
| `stat1Number` | text | "150+" |
| `stat1Label` | text | "Programs" |
| `stat1Description` | text | "Undergraduate and graduate..." |
| `stat2Number` | text | "18:1" |
| `stat2Label` | text | "Student-Faculty Ratio" |
| `stat2Description` | text | "Personalized attention..." |
| `stat3Number` | text | "50+" |
| `stat3Label` | text | "Countries" |
| `stat3Description` | text | "Students from around..." |
| `stat4Number` | text | "#1" |
| `stat4Label` | text | "Best Value" |
| `stat4Description` | text | "Recognized for..." |

### Tailwind Structure (approximate)
```html
<section class="bg-troy-cream py-20">
  <div class="container mx-auto px-4">
    <span class="text-troy-maroon font-semibold">{eyebrow}</span>
    <h2 class="text-4xl font-bold mt-2 mb-4">{headline}</h2>
    <p class="text-lg max-w-3xl mb-12">{body}</p>
    <div class="grid grid-cols-4 gap-8">
      <!-- Stat card (x4) -->
      <div class="bg-white p-6 rounded shadow">
        <div class="text-4xl font-bold text-troy-maroon">{statNumber}</div>
        <div class="text-lg font-semibold mt-2">{statLabel}</div>
        <p class="text-gray-600 mt-2">{statDescription}</p>
      </div>
    </div>
  </div>
</section>
```

---

## 4. Academic Excellence Section

**Type:** `academic-excellence`
**Category:** `content`
**Purpose:** Highlight featured program and additional offerings

### Visual Description
- Two-column layout
- Left: Large featured program card with image and overlay text
- Right: Intro text + 3 smaller program cards with maroon left-border accent

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `headline` | text | "Academic Excellence" |
| `body` | textarea | "Troy offers rigorous programs..." |
| `featuredImage` | image | placeholder |
| `featuredTitle` | text | "College of Business" |
| `featuredDescription` | text | "AACSB-accredited programs..." |
| `program1Title` | text | "Nursing" |
| `program1Description` | text | "Prepare for a career..." |
| `program2Title` | text | "Education" |
| `program2Description` | text | "Shape the next generation..." |
| `program3Title` | text | "Computer Science" |
| `program3Description` | text | "Build the future..." |

### Tailwind Structure (approximate)
```html
<section class="py-20">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-2 gap-12">
      <!-- Featured program -->
      <div class="relative h-[500px] bg-cover" style="background-image: url(...)">
        <div class="absolute inset-0 bg-troy-maroon/80"></div>
        <div class="absolute bottom-0 p-8 text-white">
          <h3 class="text-2xl font-bold">{featuredTitle}</h3>
          <p>{featuredDescription}</p>
        </div>
      </div>
      <!-- Right column -->
      <div>
        <h2 class="text-4xl font-bold mb-4">{headline}</h2>
        <p class="mb-8">{body}</p>
        <!-- Program cards -->
        <div class="space-y-4">
          <div class="border-l-4 border-troy-maroon pl-4">
            <h4 class="font-bold">{programTitle}</h4>
            <p class="text-gray-600">{programDescription}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 5. Latest Stories Section

**Type:** `latest-stories`
**Category:** `content`
**Purpose:** Showcase news, stories, or student features

### Visual Description
- Cream background
- Eyebrow, headline, body intro
- 3 story cards in a row
- Each card: image, category badge, title, description

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `eyebrow` | text | "TROY STORIES" |
| `headline` | text | "Latest News" |
| `body` | textarea | "Stay connected with..." |
| `story1Image` | image | placeholder |
| `story1Category` | text | "Student Success" |
| `story1Title` | text | "From Troy to the World" |
| `story1Description` | text | "Meet Sarah, a Trojan..." |
| `story2Image` | image | placeholder |
| `story2Category` | text | "Research" |
| `story2Title` | text | "Breakthrough Discovery" |
| `story2Description` | text | "Our faculty are leading..." |
| `story3Image` | image | placeholder |
| `story3Category` | text | "Athletics" |
| `story3Title` | text | "Championship Season" |
| `story3Description` | text | "Trojans bring home..." |

### Tailwind Structure (approximate)
```html
<section class="bg-troy-cream py-20">
  <div class="container mx-auto px-4">
    <span class="text-troy-maroon font-semibold">{eyebrow}</span>
    <h2 class="text-4xl font-bold mt-2 mb-4">{headline}</h2>
    <p class="max-w-3xl mb-12">{body}</p>
    <div class="grid grid-cols-3 gap-8">
      <!-- Story card (x3) -->
      <div class="bg-white rounded shadow overflow-hidden">
        <img src="..." class="w-full h-48 object-cover" />
        <div class="p-6">
          <span class="text-xs font-semibold text-troy-maroon uppercase">{category}</span>
          <h3 class="text-xl font-bold mt-2">{title}</h3>
          <p class="text-gray-600 mt-2">{description}</p>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## 6. Brand Story Section

**Type:** `brand-story`
**Category:** `content`
**Purpose:** Emotional brand messaging with quote

### Visual Description
- Maroon background with subtle campus image overlay
- Two-column layout
- Left: Eyebrow badge, headline, body, quote with attribution
- Right: Large image
- CTA button

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `eyebrow` | text | "OUR STORY" |
| `headline` | text | "A Legacy of Excellence" |
| `body` | textarea | "For over 130 years, Troy University..." |
| `quote` | textarea | "Troy prepared me for success in ways I never imagined." |
| `quoteAttribution` | text | "— Dr. Jane Smith '95" |
| `ctaText` | text | "Discover Our History" |
| `image` | image | placeholder |

### Tailwind Structure (approximate)
```html
<section class="relative bg-troy-maroon py-20">
  <div class="absolute inset-0 bg-cover opacity-20" style="background-image: url(campus.jpg)"></div>
  <div class="relative container mx-auto px-4">
    <div class="grid grid-cols-2 gap-12 items-center">
      <div class="text-white">
        <span class="inline-block bg-troy-gold px-4 py-1 text-sm font-semibold text-troy-maroon mb-4">
          {eyebrow}
        </span>
        <h2 class="text-4xl font-bold mb-6">{headline}</h2>
        <p class="text-lg mb-8">{body}</p>
        <blockquote class="border-l-4 border-troy-gold pl-4 italic mb-4">
          "{quote}"
        </blockquote>
        <p class="mb-8">{quoteAttribution}</p>
        <a class="bg-white text-troy-maroon px-6 py-3 font-semibold">{ctaText}</a>
      </div>
      <div>
        <img src="..." class="rounded shadow-lg" />
      </div>
    </div>
  </div>
</section>
```

---

## 7. Final CTA Section

**Type:** `final-cta`
**Category:** `cta`
**Purpose:** Strong closing call-to-action

### Visual Description
- Dark photo background (campus at dusk/night)
- Dark overlay
- Centered content
- Eyebrow, headline, body, tagline
- Two CTA buttons

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `backgroundImage` | image | placeholder |
| `eyebrow` | text | "TAKE THE NEXT STEP" |
| `headline` | text | "Your Future Awaits" |
| `body` | textarea | "Join thousands of Trojans..." |
| `tagline` | text | "Earn. Learn. Lead." |
| `ctaPrimary` | text | "Apply Now" |
| `ctaSecondary` | text | "Schedule a Visit" |

### Tailwind Structure (approximate)
```html
<section class="relative min-h-[500px] bg-cover bg-center" style="background-image: url(...)">
  <div class="absolute inset-0 bg-black/60"></div>
  <div class="relative container mx-auto px-4 py-20 text-center text-white">
    <span class="text-troy-gold font-semibold">{eyebrow}</span>
    <h2 class="text-5xl font-bold mt-4 mb-6">{headline}</h2>
    <p class="text-xl max-w-2xl mx-auto mb-4">{body}</p>
    <p class="text-2xl font-bold text-troy-gold mb-8">{tagline}</p>
    <div class="flex justify-center gap-4">
      <a class="bg-troy-maroon px-8 py-4 font-semibold">{ctaPrimary}</a>
      <a class="border-2 border-white px-8 py-4 font-semibold">{ctaSecondary}</a>
    </div>
  </div>
</section>
```

---

## Field Types Reference

| Type | Editing Behavior |
|------|------------------|
| `text` | Single-line contenteditable |
| `textarea` | Multi-line contenteditable |
| `image` | Click to open upload modal |

---

## Visibility Toggle

Each field can be shown/hidden via the visibility popover. Hidden fields:
- Are not rendered in the section
- Maintain their content in state
- Can be toggled back on

---

## 8. Promo Carousel Section

**Type:** `promo-carousel`
**Category:** `content`
**Purpose:** Full-width promotional banner with carousel visual styling

### Visual Description
- Full-width section with decorative carousel arrows (left and right)
- Two variants: promo (banner) and news (2 news cards)
- Dot indicators for visual carousel effect
- Dynamic text colors based on background

### Editable Fields (Promo Variant)

| Field | Type | Default |
|-------|------|---------|
| `variant` | select | "promo" |
| `headline` | text | "Save Big with Trojan Book Bag" |
| `body` | textarea | "Trojan Book Bag provides access to course materials..." |
| `ctaText` | text | "TROJAN BOOK BAG INFORMATION" |

### Editable Fields (News Variant)

| Field | Type | Default |
|-------|------|---------|
| `newsItem1Title` | text | "ATO Walk Hard raises record-breaking $200K..." |
| `newsItem1Date` | text | "March 20, 2026" |
| `newsItem1Image` | image | placeholder |
| `newsItem2Title` | text | "Troy University to welcome Fulbright Scholar..." |
| `newsItem2Date` | text | "March 19, 2026" |
| `newsItem2Image` | image | placeholder |
| `ctaLinkText` | text | "All News" |

### Tailwind Structure (approximate)
```html
<section class="relative bg-black py-24 overflow-hidden">
  <!-- Left/Right Arrow buttons (decorative) -->
  <button class="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2">
    <svg><!-- Arrow icon --></svg>
  </button>
  <div class="container mx-auto px-8">
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
      <div class="lg:col-span-3">
        <h2 class="section-title text-white mb-4">{headline}</h2>
        <p class="body-text text-white max-w-xl">{body}</p>
      </div>
      <div class="lg:col-span-2 flex lg:justify-end">
        <a class="btn-bordered-white">{ctaText}</a>
      </div>
    </div>
  </div>
  <!-- Dot indicators -->
  <div class="flex justify-center gap-3 mt-12">
    <span class="w-3 h-3 rounded-full border-2 border-white"></span>
    <!-- ... -->
  </div>
</section>
```

---

## 9. Split Layout Section

**Type:** `split-layout`
**Category:** `content`
**Purpose:** 50/50 content and image split with flexible positioning

### Visual Description
- Two-column layout with content on one side, image on the other
- Supports content-left and content-right variants
- Optional detail rows (label/value pairs)
- Optional stats grid (up to 6 stats)
- Optional button links grid
- Optional stacked links list

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `variant` | select | "content-left" |
| `headline` | text | "The Helen Keller Lecture Series Returns March 31" |
| `body` | textarea | "This annual event shares powerful stories..." |
| `detailLabel1` | text | "Save the Date" |
| `detailValue1` | text | "March 31 at 11 AM" |
| `detailLabel2` | text | "" |
| `detailValue2` | text | "" |
| `ctaText` | text | "LEARN MORE" |
| `image` | image | placeholder |
| `stat1Number` | text | "16" |
| `stat1Label` | text | "DI Athletic Teams" |
| ... (up to 6 stats) | | |
| `buttonLink1` | text | "Arts and Humanities" |
| ... (up to 6 button links) | | |
| `stackedLink1` | text | "International Student" |
| ... (up to 6 stacked links) | | |

### Tailwind Structure (approximate)
```html
<section class="bg-black">
  <div class="grid grid-cols-1 lg:grid-cols-2">
    <!-- Content Column -->
    <div class="flex flex-col justify-center p-12 lg:p-16">
      <h2 class="section-title text-white mb-6">{headline}</h2>
      <p class="body-text text-white mb-6">{body}</p>
      <div class="mb-8 space-y-1">
        <div class="flex flex-wrap gap-x-2">
          <span class="font-semibold">{detailLabel}</span>
          <span>{detailValue}</span>
        </div>
      </div>
      <a class="btn-bordered-white self-start">{ctaText}</a>
      <!-- Optional: stats grid, button links, stacked links -->
    </div>
    <!-- Image Column -->
    <div class="relative min-h-[400px] lg:min-h-[500px]">
      <img src="..." class="absolute inset-0 w-full h-full object-cover">
    </div>
  </div>
</section>
```

---

## 10. Content Spotlight Section

**Type:** `content-spotlight`
**Category:** `content`
**Purpose:** 50/50 content and image split with optional stats grid, FAQs, and helpful links

### Visual Description
- Two-column layout with multiple variants: content-left, content-right, content-both
- Optional stats grid (up to 6 stats)
- Optional quote block with dark background
- Optional FAQ accordion section (up to 6 Q&As)
- Optional helpful links section (up to 6 links)

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `variant` | select | "content-left" |
| `headline` | text | "At TROY, You Can Do It All!" |
| `body` | textarea | "Your home away from home has so much to offer..." |
| `ctaText` | text | "Learn More" |
| `image` | image | placeholder |
| `headline2` | text | "Specialize in High-Demand Areas" |
| `body2` | textarea | "TROY's graduate degree is designed..." |
| `stat1Number` | text | "16" |
| `stat1Label` | text | "DI Athletic Teams" |
| ... (up to 6 stats) | | |
| `quoteText` | textarea | "The Computer Science program at TROY..." |
| `quoteAuthor` | text | "Sunny Sharma" |
| `quoteTitle` | text | "Principal Engineer, Charter Communications" |
| `quoteCredential` | text | "2014 graduate, M.S. in Computer Science" |
| `faqTitle` | text | "Frequently Asked Questions" |
| `faq1Question` | text | "What distinguishes good online CS degrees?" |
| `faq1Answer` | textarea | "Quality online CS programs offer..." |
| ... (up to 6 FAQs) | | |
| `helpfulLinksTitle` | text | "Helpful Links" |
| `helpfulLink1` | text | "Scholarships" |
| ... (up to 6 helpful links) | | |

### Tailwind Structure (approximate)
```html
<section class="bg-sand py-24">
  <div class="container mx-auto px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <!-- Content Column -->
      <div class="flex flex-col justify-center">
        <h2 class="section-title mb-6">{headline}</h2>
        <p class="body-text mb-6">{body}</p>
        <a class="btn-cardinal-outline self-start mb-4">{ctaText}</a>
        <!-- Optional: stats grid -->
      </div>
      <!-- Image Column -->
      <div class="relative overflow-hidden aspect-[4/3]">
        <img src="..." class="absolute inset-0 w-full h-full object-cover">
      </div>
    </div>
    <!-- Optional: Quote block, FAQ accordion, Helpful links -->
  </div>
</section>
```

---

## 11. In-Page Navigation Section

**Type:** `in-page-nav`
**Category:** `content`
**Purpose:** Horizontal navigation bar for anchor links within the page

### Visual Description
- Horizontal navigation bar with centered links
- Border bottom separator
- Responsive with flexible wrapping
- Dynamic text colors based on background

### Editable Fields

| Field | Type | Default |
|-------|------|---------|
| `navItem1` | text | "About" |
| `navItem2` | text | "Highlights" |
| `navItem3` | text | "Curriculum" |
| `navItem4` | text | "Locations" |
| `navItem5` | text | "Careers" |
| `navItem6` | text | "Concentrations" |
| `navItem7` | text | "FAQ" |
| `navItem8` | text | "Contact" |

### Tailwind Structure (approximate)
```html
<section class="bg-white py-6 border-b border-black/10 relative overflow-hidden">
  <div class="container mx-auto px-8 relative z-10">
    <nav class="flex flex-wrap justify-center gap-x-12 gap-y-4">
      <a href="#about" class="text-black font-semibold hover:underline">About</a>
      <a href="#highlights" class="text-black font-semibold hover:underline">Highlights</a>
      <!-- ... more nav items -->
    </nav>
  </div>
</section>
```

---

## Field Types Reference

| Type | Editing Behavior |
|------|------------------|
| `text` | Single-line contenteditable |
| `textarea` | Multi-line contenteditable |
| `image` | Click to open upload modal |
| `select` | Dropdown for variant selection |

---

## Visibility Toggle

Each field can be shown/hidden via the visibility popover. Hidden fields:
- Are not rendered in the section
- Maintain their content in state
- Can be toggled back on

---

## Background Colors

Sections support 14+ background color options:

| Light Backgrounds | Dark Backgrounds |
|-------------------|------------------|
| White | Cardinal |
| Sand | Cardinal Dark |
| Sand Dark | Black |
| Sand Halftone | Cardinal Halftone |
| Wheat | Cardinal Wheat Halftone |

---

## Notes for Implementation

1. **Image placeholders**: Use a neutral gray placeholder with upload icon
2. **Contenteditable**: Add `data-field="fieldName"` attribute to editable elements
3. **Responsive**: Sections should be responsive, but editor shows desktop view
4. **Clean export**: `toMarkup()` should output Tailwind without editor artifacts
5. **Color contrast**: Use `getContrastConfig()` to ensure text is readable on any background
6. **Halftone textures**: Applied via CSS classes from `color-config.js`
