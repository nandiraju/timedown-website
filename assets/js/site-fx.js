/*
 * Site effects (loaded with `defer` on every page):
 *  1. Lottie illustrations: <div class="lottie" data-lottie="assets/lottie/x.json" data-viewbox="x y w h">.
 *     The player (lottie_light.min.js, self-hosted) and the JSON are fetched only when the element
 *     approaches the viewport. Playback pauses off-screen and in hidden tabs. Under
 *     prefers-reduced-motion the animation is shown as a single still frame.
 *  2. Glass spotlight: writes --mx/--my on .app-card under a fine pointer so the CSS hover glow follows it.
 */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scriptEl = document.currentScript;
  var jsBase = scriptEl && scriptEl.src ? scriptEl.src.replace(/[^/]*$/, '') : 'assets/js/';

  /* ---------- 1. Lottie ---------- */
  var nodes = document.querySelectorAll('[data-lottie]');
  var libPromise = null;

  function loadLib() {
    if (window.lottie) return Promise.resolve();
    if (!libPromise) {
      libPromise = new Promise(function (resolve, reject) {
        var s = document.createElement('script');
        s.src = jsBase + 'lottie_light.min.js';
        s.async = true;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return libPromise;
  }

  function start(el) {
    loadLib().then(function () {
      var anim = window.lottie.loadAnimation({
        container: el,
        renderer: 'svg',
        loop: true,
        autoplay: !reduce,
        path: el.getAttribute('data-lottie'),
        rendererSettings: { preserveAspectRatio: 'xMidYMid meet', hideOnTransparent: true }
      });
      anim.addEventListener('DOMLoaded', function () {
        var svg = el.querySelector('svg');
        var vb = el.getAttribute('data-viewbox');
        if (svg && vb) svg.setAttribute('viewBox', vb);
        if (reduce) anim.goToAndStop(Math.floor(anim.totalFrames * 0.6), true);
        el.classList.add('is-ready');
      });
      if (!reduce) {
        el._lottie = anim;
        el._visible = true;
      }
    }).catch(function () { /* decorative: fail silently */ });
  }

  if (nodes.length && 'IntersectionObserver' in window) {
    var starter = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { obs.unobserve(e.target); start(e.target); }
      });
    }, { rootMargin: '300px 0px' });

    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target;
        el._visible = e.isIntersecting;
        if (el._lottie) { e.isIntersecting && !document.hidden ? el._lottie.play() : el._lottie.pause(); }
      });
    }, { threshold: 0.05 });

    nodes.forEach(function (el) { starter.observe(el); if (!reduce) watcher.observe(el); });

    document.addEventListener('visibilitychange', function () {
      nodes.forEach(function (el) {
        if (!el._lottie) return;
        (document.hidden || !el._visible) ? el._lottie.pause() : el._lottie.play();
      });
    });
  } else {
    nodes.forEach(start);
  }

  /* ---------- 2. Glass spotlight ---------- */
  if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var raf = 0, lastEvt = null;
    document.addEventListener('pointermove', function (e) {
      lastEvt = e;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var t = lastEvt && lastEvt.target && lastEvt.target.closest ? lastEvt.target.closest('.app-card') : null;
        if (!t) return;
        var r = t.getBoundingClientRect();
        t.style.setProperty('--mx', (lastEvt.clientX - r.left) + 'px');
        t.style.setProperty('--my', (lastEvt.clientY - r.top) + 'px');
      });
    }, { passive: true });
  }
})();
