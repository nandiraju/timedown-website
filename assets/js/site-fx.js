/*
 * Site effects (loaded with `defer` on every page):
 *  1. Lottie illustrations: <div class="lottie" data-lottie="assets/lottie/x.json" data-viewbox="x y w h">.
 *     The player (lottie_light.min.js, self-hosted) and the JSON are fetched only when the element
 *     approaches the viewport. Playback pauses off-screen and in hidden tabs. Under
 *     prefers-reduced-motion the animation is shown as a single still frame.
 *  2. Glass spotlight: writes --mx/--my on .app-card under a fine pointer so the CSS hover glow follows it.
 *  3. One-shot celebration bursts (confetti, popper, fireworks, streamers), never on reduced motion:
 *       [data-burst="path.json"]        click -> burst inside the nearest [data-burst-scope] > [data-burst-layer]
 *       [data-hover-burst="path.json"]  pointer hover (fine pointers only) -> burst inside its own layer
 *       [data-burst-on-view="path.json"] first time it scrolls into view -> burst
 *     data-burst-fit="slice" covers the layer, otherwise the art is centred ("meet").
 *     The player and the effect files are warmed shortly before they are needed.
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

  /* ---------- 3. One-shot bursts ---------- */
  var burstTriggers = document.querySelectorAll('[data-burst], [data-hover-burst], [data-burst-on-view]');
  if (burstTriggers.length && !reduce) {
    var warmed = false;
    var warmAll = function () {
      if (warmed) return;
      warmed = true;
      var run = function () {
        loadLib().catch(function () {});
        var seen = {};
        burstTriggers.forEach(function (el) {
          var p = el.getAttribute('data-burst') || el.getAttribute('data-hover-burst') || el.getAttribute('data-burst-on-view');
          if (p && !seen[p]) { seen[p] = 1; fetch(p).catch(function () {}); }
        });
      };
      (window.requestIdleCallback || function (f) { setTimeout(f, 300); })(run);
    };

    var layerFor = function (el) {
      var scope = el.closest('[data-burst-scope]') || el;
      return scope.querySelector('[data-burst-layer]');
    };

    var burst = function (layer, path, fit) {
      if (!layer || !path || layer._busy) return;
      layer._busy = true;
      loadLib().then(function () {
        var holder = document.createElement('div');
        holder.className = 'burst';
        layer.appendChild(holder);
        var anim = window.lottie.loadAnimation({
          container: holder, renderer: 'svg', loop: false, autoplay: true, path: path,
          rendererSettings: { preserveAspectRatio: fit === 'slice' ? 'xMidYMid slice' : 'xMidYMid meet', hideOnTransparent: true }
        });
        var done = false;
        var finish = function () {
          if (done) return;
          done = true;
          holder.classList.add('is-done');
          setTimeout(function () { try { anim.destroy(); } catch (_) {} holder.remove(); layer._busy = false; }, 600);
        };
        anim.addEventListener('complete', finish);
        setTimeout(finish, 7000);
      }).catch(function () { layer._busy = false; });
    };

    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-burst]');
      if (t) burst(layerFor(t), t.getAttribute('data-burst'), t.getAttribute('data-burst-fit'));
    });

    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      document.addEventListener('pointerover', function (e) {
        var c = e.target.closest && e.target.closest('[data-hover-burst]');
        if (!c || c.contains(e.relatedTarget)) return;
        var now = Date.now();
        if (c._last && now - c._last < 3500) return;
        c._last = now;
        burst(layerFor(c), c.getAttribute('data-hover-burst'), c.getAttribute('data-burst-fit'));
      }, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      var warmIo = new IntersectionObserver(function (entries, obs) {
        if (entries.some(function (en) { return en.isIntersecting; })) { warmAll(); obs.disconnect(); }
      }, { rootMargin: '700px 0px' });
      burstTriggers.forEach(function (el) { warmIo.observe(el); });

      var viewIo = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          obs.unobserve(en.target);
          burst(layerFor(en.target), en.target.getAttribute('data-burst-on-view'), en.target.getAttribute('data-burst-fit'));
        });
      }, { threshold: 0.4 });
      document.querySelectorAll('[data-burst-on-view]').forEach(function (el) { viewIo.observe(el); });
    } else {
      warmAll();
    }
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
