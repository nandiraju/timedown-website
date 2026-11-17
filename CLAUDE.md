# TimeDown Website (`CLAUDE.md`)

Marketing and legal website for **TimeDown** mobile application on iOS and Android. Deployed on GitHub Pages from the `main` branch at `https://timedown.cend.in/` via `CNAME`.

## Stack, Build, and Structure
- **Pages:** `index.html` (landing page), `privacy_policy.html`, `terms_of_service.html`, `contact.html`, and `404.html`.
- **Precompiled Tailwind CSS v4:** Source stylesheets in `src/css/*.css`. Compiled and minified output in `assets/css/*.css`.
  - Rebuild all stylesheets: `npm run build:css`
  - Content hash stamped onto `<link rel="stylesheet">` tags automatically by `scripts/build-css.mjs`.
- **Colorful icons:** `assets/icons/color/*.svg` are cleaned copies (Illustrator bloat stripped, 297 KB to 29 KB, pixel-identical) of icons from the "300 colorful icons" IconJar pack in `~/GRAPHIC_ASSETS`. Used as `<img src="assets/icons/color/NAME.svg" alt="" width height loading="lazy">` inside a neutral glass tile for the Why TimeDown and Great For cards, contact cards, and the privacy/terms section headings. Keep native colours. The mono sprite below stays for small UI glyphs.
- **Icons:** SVG sprite in `assets/icons/sprite.svg` (Ionicons; markup `<svg class="icon" aria-hidden="true" focusable="false"><use href="assets/icons/sprite.svg#name"></use></svg>`, root-absolute on `404.html`). Every page's footer carries the `#theme-toggle` button (`sunny`/`moon` swap, key `mm-theme`); keep it on all five pages. App icon: `assets/images/app-icon.svg` (hand-built vector of the clock icon, also the SVG favicon and a manifest icon), plus PNG/WebP rasters. Share image: `assets/images/og-image-v2.jpg` (1200x630 JPEG, green theme, under 100 KB; use a new filename when it changes so social sites refetch).
- **Theme (green + blend, liquid glass):** dark by default (`<html class="dark">`). Palette is emerald green blended into teal and cyan (cyan echoes the blue app icon); use Tailwind `emerald-*` for accents and `teal-*`/`cyan-*` for the blend, never indigo/purple/pink. All theme tokens, the four aurora orbs (`.ambient` holds `orb-a`..`orb-d` spans on every page), glass rims, pointer spotlight and Lottie styles live in `src/css/shared-theme.css`, which `scripts/build-css.mjs` appends to every page's CSS before compiling, so edit it there. There is no `watch:css`; run `npm run build:css`.
- **Lottie illustrations:** recoloured (purple to emerald, orange to cyan) and minified from the commercial Whoooa pack (licence: fine in end products, not redistributable as stock or source files) into `assets/lottie/*.json`. Player `assets/js/lottie_light.min.js` (lottie-web, MIT, self-hosted). `assets/js/site-fx.js` (deferred on every page) lazy-loads the player and each JSON when its element nears the viewport, pauses off-screen, shows a still frame under reduced motion, and drives the glass spotlight. Markup: `<div class="lottie" data-lottie="assets/lottie/x.json" data-viewbox="x y w h" style="aspect-ratio: w / h" aria-hidden="true"></div>` (viewBox crops the empty 1920x1080 canvas; measure it when adding one). Placements: How It Works, Live Preview, FAQ, final CTA, contact, 404.
- **Typography:** Self-hosted variable fonts in `assets/fonts/` (`outfit-latin-var.woff2`, `inter-latin-var.woff2`).
- **Discovery & SEO:** `CNAME` (`timedown.cend.in`), `favicon.ico`, `robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest`.
- **App Details:**
  - Name: TimeDown
  - Developer: Srikanth Nandiraju
  - Apple App Store ID: `1644886404` (`https://apps.apple.com/us/app/timedown-counttminus/id1644886404`). The `timedown-counttminus` slug is the real store URL and must not be renamed.
  - Google Play: `https://play.google.com/store/apps/details?id=nsri.countdown.app`
  - Target Domain: `https://timedown.cend.in/`

## Hard Rules
- **Never use emojis or Unicode dingbats/symbols anywhere in UI markup, CSS, JS, data attributes, or docs** (this includes infinity, check marks, stars, arrows and decorative bullets). Use the SVG sprite icons or plain text. Before finishing any edit, scan the changed files for emoji and symbol code points.

## Analytics (GA4 `G-5L7ETM7Y7E`)
- Every page `<head>` starts with `<script src="assets/js/analytics.js"></script>` (root-absolute on `404.html`) followed by the Google tag snippet (async `gtag.js`, `gtag('js')`, `gtag('config', 'G-5L7ETM7Y7E')`). **Keep that order**: `analytics.js` sets Consent Mode v2 defaults, which must exist before the first hit. `analytics.js` must not call `gtag('js')` or `gtag('config')` and must never configure the Mood Meter (`G-HBMC3XJK4X`) or Cend.in (`G-84VRLCP0H7`) streams.
- Consent: region default denies everything for the EEA, UK and Switzerland; elsewhere analytics is granted; ads storage, user data and personalization are always denied. Choice stored in `localStorage['mm-consent']`; the banner shows only for EEA/UK/CH time zones. `window.mmConsent.open()` reopens it (privacy policy "Cookie settings" button). `store_click` (`store: app_store | google_play`) fires on store links.
- The privacy policy section `#website-analytics` discloses this. Change consent defaults and that wording in the same release.
- Test locally with `googletagmanager.com` and `google-analytics.com` blocked so localhost hits never reach the property.
