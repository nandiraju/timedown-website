# CounttMinus Website (`CLAUDE.md`)

Marketing and legal website for **CounttMinus** (TimeDown) mobile application on iOS. Deployed on GitHub Pages (`gh-pages` branch) at `https://countdown.cend.in/` via `CNAME`.

## Stack, Build, and Structure
- **Pages:** `index.html` (landing page), `privacy_policy.html`, `terms_of_service.html`, `contact.html`, and `404.html`.
- **Precompiled Tailwind CSS v4:** Source stylesheets in `src/css/*.css`. Compiled and minified output in `assets/css/*.css`.
  - Rebuild all stylesheets: `npm run build:css`
  - Content hash stamped onto `<link rel="stylesheet">` tags automatically by `scripts/build-css.mjs`.
- **Icons:** SVG sprite in `assets/icons/sprite.svg`.
- **Typography:** Self-hosted variable fonts in `assets/fonts/` (`outfit-latin-var.woff2`, `inter-latin-var.woff2`).
- **Discovery & SEO:** `CNAME` (`countdown.cend.in`), `favicon.ico`, `robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest`.
- **App Details:**
  - Name: CounttMinus (TimeDown)
  - Developer: Srikanth Nandiraju
  - Apple App Store ID: `1644886404` (`https://apps.apple.com/us/app/timedown-counttminus/id1644886404`)
  - Target Domain: `https://countdown.cend.in/`
