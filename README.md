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
3. Theme settings → The book → pick the product. Every "Send me my free copy" button then opens the claim form (lead capture), which pre-fills checkout.
4. The three testimonial films (Dr Matt, Dr Aisha, Dr Laurie) point at the MP4s on squatsuccess.co.uk; add the Avenue Dental film URL when footage is supplied.

Copy and images are editable per section in the theme editor; bundled Figma exports are used until an image is chosen.

## Lead capture → GHL → checkout (the gated flow)

```
Landing page / book page / cart ──► Claim form (pop-up)
        │                                   │
        │                                   ├─► POST JSON to GHL inbound webhook  → tag `book-requested`
        │                                   └─► /cart/<variant>:1?checkout[…]&attributes[claimed]=1
        │                                                (checkout pre-filled with name, email, phone, address)
        └─ /cart without attributes[claimed] ─► "Tell us where to post it" (opens the form) — checkout button hidden

Shopify admin ─ orders/paid webhook ─► GHL inbound webhook → match on email → tag `book-received`
```

- Form markup: `snippets/claim-form.liquid`, rendered by the pop-up `snippets/claim-modal.liquid`. Any link with `?claim` opens the pop-up.
- JS: `assets/squat.js` "Claim your copy". Saves the lead in `localStorage.ss_lead` (pre-fills the form on return),
  posts a flat JSON payload to every URL in Theme settings → GoHighLevel (one per line), then follows the permalink.
- Gate: `sections/main-cart.liquid` hides checkout unless the cart has `attributes[claimed]=1`;
  `sections/main-product.liquid` and `snippets/order-button.liquid` route through the form when
  "Buttons go to" = Claim form. Set it to "Straight to checkout" to switch the gate off.
- Payload keys: `first_name last_name full_name email phone address1 city postal_code country tag tags[] source product
  utm_source utm_medium utm_campaign utm_content utm_term gclid fbclid landing_page referrer page submitted_at`.
- Cart attributes `claimed`, `lead_source`, `utm_source`, `utm_medium`, `utm_campaign` land on the order
  (Additional details / `note_attributes` in the order webhook) so GHL can attribute the paid order.

### GHL setup

1. Automation → Workflows → new workflow, trigger **Inbound Webhook**. Copy the URL into
   Theme settings → GoHighLevel → Inbound webhook URL(s). Submit the form once so GHL captures a sample payload.
2. Actions: **Create/Update Contact** (map email, phone, first_name, last_name, address1, city, postal_code, country,
   source) → **Add Tag** `book-requested` (or use `{{inboundWebhookRequest.tag}}`). Map the utm_* keys to custom fields.
3. Second workflow, trigger **Inbound Webhook** → **Create/Update Contact** (email from `{{inboundWebhookRequest.email}}`)
   → **Add Tag** `book-received` → optionally **Remove Tag** `book-requested`.
4. Shopify admin → Settings → Notifications → Webhooks → Create webhook → Event **Order payment**, format JSON,
   URL = the second workflow's inbound webhook URL. Fire a test order so GHL learns the shape
   (`email`, `customer.first_name`, `shipping_address.*`, `note_attributes[]`).
