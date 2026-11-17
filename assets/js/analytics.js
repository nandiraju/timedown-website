/*
 * Google Analytics 4: dedicated MoodMeter property (web stream https://moodmeter.cend.in).
 * Never use the Cend.in stream G-84VRLCP0H7 here.
 *
 * Load order in every page <head> (must stay in this order):
 *   1. <script src="assets/js/analytics.js"></script>       (this file, NOT async: sets consent first)
 *   2. <script async src="https://www.googletagmanager.com/gtag/js?id=G-HBMC3XJK4X"></script>
 *
 * Consent Mode v2:
 *   - Global default: analytics_storage granted; ad_storage, ad_user_data, ad_personalization denied.
 *   - Region default for the EEA, UK and Switzerland: everything denied (Google applies this by IP).
 *   - A visitor's stored choice (localStorage 'mm-consent' = 'granted' | 'denied') is replayed as an update.
 *   - Banner: shown only when no choice is stored AND the browser time zone is in the EEA/UK/CH.
 *     GitHub Pages can't geolocate, so the time zone is the client-side signal. Mismatches fail safe:
 *     an EEA visitor outside these zones stays denied (Google's region default) and simply sees no banner.
 *   - window.mmConsent.open() re-opens the banner (privacy policy "Cookie settings" button).
 * Update the privacy policy in the same release whenever these defaults change.
 */
(function () {
  var MEASUREMENT_ID = 'G-HBMC3XJK4X';
  var STORE_KEY = 'mm-consent';
  // ISO 3166-1 alpha-2: EU 27 + Iceland, Liechtenstein, Norway (EEA) + United Kingdom + Switzerland.
  var CONSENT_REGIONS = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT',
    'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'];
  // IANA time zones used in those countries (incl. outermost regions that are part of the EU).
  var CONSENT_TIME_ZONES = ['Europe/Vienna', 'Europe/Brussels', 'Europe/Sofia', 'Europe/Zagreb', 'Asia/Nicosia',
    'Asia/Famagusta', 'Europe/Nicosia', 'Europe/Prague', 'Europe/Copenhagen', 'Europe/Tallinn', 'Europe/Helsinki',
    'Europe/Mariehamn', 'Europe/Paris', 'Europe/Berlin', 'Europe/Busingen', 'Europe/Athens', 'Europe/Budapest',
    'Europe/Dublin', 'Europe/Rome', 'Europe/Riga', 'Europe/Vilnius', 'Europe/Luxembourg', 'Europe/Malta',
    'Europe/Amsterdam', 'Europe/Warsaw', 'Europe/Lisbon', 'Atlantic/Madeira', 'Atlantic/Azores', 'Europe/Bucharest',
    'Europe/Bratislava', 'Europe/Ljubljana', 'Europe/Madrid', 'Africa/Ceuta', 'Atlantic/Canary', 'Europe/Stockholm',
    'Atlantic/Reykjavik', 'Europe/Vaduz', 'Europe/Oslo', 'Arctic/Longyearbyen', 'Europe/London', 'Europe/Belfast',
    'Europe/Guernsey', 'Europe/Jersey', 'Europe/Isle_of_Man', 'Europe/Gibraltar', 'Europe/Zurich',
    'America/Cayenne', 'America/Guadeloupe', 'America/Martinique', 'Indian/Reunion', 'Indian/Mayotte',
    'America/Marigot'];

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  function withAds(analytics) {
    return { analytics_storage: analytics, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  }

  // Region-specific default first, then the global default (the more specific region always wins).
  var regional = withAds('denied');
  regional.region = CONSENT_REGIONS;
  gtag('consent', 'default', regional);
  gtag('consent', 'default', withAds('granted'));

  function readChoice() {
    try { var v = localStorage.getItem(STORE_KEY); return v === 'granted' || v === 'denied' ? v : null; } catch (_) { return null; }
  }
  function saveChoice(v) {
    try { localStorage.setItem(STORE_KEY, v); } catch (_) {}
  }

  var stored = readChoice();
  if (stored) gtag('consent', 'update', withAds(stored));

  gtag('js', new Date());
  gtag('config', MEASUREMENT_ID);

  // Key event: store badge clicks. store = 'app_store' | 'google_play'.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var store = /apps\.apple\.com/.test(a.href) ? 'app_store' : /play\.google\.com/.test(a.href) ? 'google_play' : '';
    if (store) gtag('event', 'store_click', { store: store });
  });

  // ---- Consent banner (EEA / UK / CH only) ----
  function inConsentRegion() {
    try { return CONSENT_TIME_ZONES.indexOf(Intl.DateTimeFormat().resolvedOptions().timeZone) !== -1; } catch (_) { return false; }
  }

  var CSS = '' +
    '.mm-consent{position:fixed;left:16px;right:16px;bottom:16px;z-index:60;max-width:560px;margin:0 auto;' +
    'padding:16px 18px;border-radius:20px;background:var(--bg-color,#0f172a);color:var(--text-main,#aab6cb);' +
    'border:1px solid var(--surface-border,rgba(255,255,255,.12));box-shadow:0 18px 40px -12px rgba(2,6,23,.55);' +
    'font:500 13px/1.5 Inter,system-ui,sans-serif;display:flex;flex-wrap:wrap;align-items:center;gap:12px}' +
    '.mm-consent p{margin:0;flex:1 1 260px}' +
    '.mm-consent a{color:#6366f1;font-weight:600;text-decoration:underline}' +
    '.dark .mm-consent a{color:#a5b4fc}' +
    '.mm-consent__actions{display:flex;gap:8px;flex:0 0 auto}' +
    '.mm-consent button{cursor:pointer;border-radius:9999px;padding:8px 16px;font:700 13px/1 Inter,system-ui,sans-serif;' +
    'border:1px solid var(--surface-border,rgba(255,255,255,.12));background:transparent;color:var(--text-heading,#fff)}' +
    '.mm-consent button[data-choice="granted"]{background:#4f46e5;border-color:#4f46e5;color:#fff}' +
    '.mm-consent button:focus-visible{outline:2px solid #818cf8;outline-offset:2px}';

  var banner = null;
  function closeBanner() { if (banner) { banner.remove(); banner = null; } }
  function choose(v) {
    saveChoice(v);
    gtag('consent', 'update', withAds(v));
    closeBanner();
  }
  function openBanner() {
    if (banner || !document.body) return;
    if (!document.getElementById('mm-consent-style')) {
      var st = document.createElement('style');
      st.id = 'mm-consent-style';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var root = document.querySelector('script[src*="assets/js/analytics.js"]');
    var base = root && root.getAttribute('src').charAt(0) === '/' ? '/' : '';
    banner = document.createElement('div');
    banner.className = 'mm-consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p>This website uses Google Analytics cookies to count visits and store-button clicks. ' +
      'The Mood Meter app itself collects no data. <a href="' + base + 'privacy_policy.html#website-analytics">Details</a></p>' +
      '<div class="mm-consent__actions">' +
      '<button type="button" data-choice="denied">Decline</button>' +
      '<button type="button" data-choice="granted">Accept</button></div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-choice]');
      if (b) choose(b.getAttribute('data-choice'));
    });
    document.body.appendChild(banner);
  }

  window.mmConsent = { open: openBanner, choice: readChoice };

  if (!stored && inConsentRegion()) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', openBanner);
    else openBanner();
  }
})();
