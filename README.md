# Squat Success — Dental Freedom Blueprint (Shopify theme)

Online Store 2.0 theme for the free-book landing site, built from the Figma design
"Squat Success Book › Blueprint — Desktop 1440" (node 35:102), matched 1:1 in September 2026.

## Structure

- `layout/theme.liquid` — shell, Google Fonts (Lexend, Lexend Deca, Manrope), `squat.css`, `squat.js`
- `sections/` — one section per Figma block: `header`, `hero-book`, `dilemma`, `six-questions`, `chapter-reader`,
  `author-letter`, `fit-seam`, `testimonials`, `avenue-video`, `author-bio`, `decision-cta`, `faq`, `footer`,
  plus `main-*` store templates
- `templates/index.json` — the landing page, in Figma order
- `assets/` — tokens + components in `squat.css`; images exported from Figma and pre-sized as WebP (no image over 120 KB)

## Performance notes

- The hero book cover is preloaded with `fetchpriority="high"` (it is the LCP element); everything below the fold is `loading="lazy"`.
- Testimonial films are bundled as 1400 px and 800 px WebP stills with `srcset`; the MP4s only load when a viewer presses play.
- No JavaScript framework: `squat.js` is ~14 KB, deferred, and only wires up the nav, chapter reader, story carousel, videos and claim form.

## Setup after connecting the repo

1. Online Store → Themes → Add theme → Connect from GitHub → `toby-vend/squat-success-shopify`, branch `main`.
2. Create the book product (price £0, physical, requires shipping) and a UK shipping rate of £4.95.
3. Theme settings → The book → pick the product. Every "Send me my free copy" button then adds it and goes straight to checkout.
4. The three testimonial films (Dr Matt, Dr Aisha, Dr Laurie) point at the MP4s on squatsuccess.co.uk; add the Avenue Dental film URL when footage is supplied.

Copy and images are editable per section in the theme editor; bundled Figma exports are used until an image is chosen.
