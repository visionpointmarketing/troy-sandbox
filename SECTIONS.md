# TROY Sandbox — Section Specifications

This document defines the 6 section types for the TROY Sandbox builder.

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

## 2. Statistics Section

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

## 3. Academic Excellence Section

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

## 4. Latest Stories Section

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

## 5. Brand Story Section

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

## 6. Final CTA Section

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

## Notes for Implementation

1. **Image placeholders**: Use a neutral gray placeholder with upload icon
2. **Contenteditable**: Add `data-field="fieldName"` attribute to editable elements
3. **Responsive**: Sections should be responsive, but editor shows desktop view
4. **Clean export**: `toMarkup()` should output Tailwind without editor artifacts
