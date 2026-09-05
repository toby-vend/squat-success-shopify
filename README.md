# Squat Success — Dental Freedom Blueprint (Shopify theme)

Online Store 2.0 theme for the free-book landing site, built from the Figma design
"Squat Success Book › Blueprint — Desktop 1440".

## Structure

- `layout/theme.liquid` — shell, Google Fonts (Lexend, Lexend Deca, Manrope), `squat.css`, `squat.js`
- `sections/` — one section per Figma block: `header`, `hero-book`, `dilemma`, `six-questions`, `chapter-reader`,
  `author-letter`, `fit-seam`, `testimonials`, `avenue-video`, `author-bio`, `decision-cta`, `faq`, `footer`,
  plus `main-*` store templates
- `templates/index.json` — the landing page, in Figma order
- `assets/` — tokens + components in `squat.css`; images exported from Figma

## Setup after connecting the repo

1. Online Store → Themes → Add theme → Connect from GitHub → `toby-vend/squat-success-shopify`, branch `main`.
2. Create the book product (price £0, physical, requires shipping) and a UK shipping rate of £4.95.
3. Theme settings → The book → pick the product. Every "Send me my free copy" button then adds it and goes straight to checkout.
4. Add the film URLs in the Testimonials and Avenue Dental sections when footage is supplied.

Copy and images are editable per section in the theme editor; bundled Figma exports are used until an image is chosen.
