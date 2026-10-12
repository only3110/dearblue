/* shared.js — navigasi fade [data-leave], scroll-reveal .reveal, dan utilitas kecil.
   Tidak menyentuh fitur khusus halaman (museum/story/things/people) maupun polaroid-links.js. */
(function () {
  'use strict';

  var root = document.documentElement;
  if (root.getAttribute('data-shared-init')) return;   // cegah inisialisasi ganda
  root.setAttribute('data-shared-init', '1');

  var FADE_MS = 300;
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var leaving = false;

  /* ---------- 1. Navigasi dengan fade (event delegation) ---------- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented) return;                        // sudah ditangani skrip halaman
    var a = e.target.closest && e.target.closest('a[data-leave]');
    if (!a) return;

    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('download')) return;
    var target = a.getAttribute('target');
    if (target && target !== '_self') return;

    var raw = a.getAttribute('href');
    if (!raw || raw.charAt(0) === '#' || /^\s*javascript:/i.test(raw)) return;

    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.protocol !== location.protocol || url.origin !== location.origin) return;   // tautan luar
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // hash di halaman sama

    if (mq.matches) return;                                // gerak dikurangi: pindah langsung
    e.preventDefault();
    if (leaving) return;                                   // klik ganda saat fade
    leaving = true;
    root.classList.add('is-leaving');
    setTimeout(function () { location.href = url.href; }, FADE_MS);
  });

  // kembali lewat tombol back / bfcache: halaman harus terlihat lagi
  window.addEventListener('pageshow', function () {
    leaving = false;
    root.classList.remove('is-leaving');
  });

  /* ---------- 2. Scroll reveal ---------- */
  function initReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!els.length) return;

    if (mq.matches || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }

    var vh = window.innerHeight || root.clientHeight;
    var pending = els.filter(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.9) {     // sudah terlihat / sudah terlewat
        el.classList.add('is-revealed');
        return false;
      }
      return true;
    });

    root.classList.add('reveal-ready');
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-revealed');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
    pending.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 3. Utilitas aksesibilitas ---------- */
  function hardenExternalLinks() {
    var links = document.querySelectorAll('a[target="_blank"]');
    Array.prototype.forEach.call(links, function (a) {
      var rel = (a.getAttribute('rel') || '').toLowerCase();
      if (rel.indexOf('noopener') === -1) a.setAttribute('rel', (rel + ' noopener').trim());
    });
  }

  /* ---------- Titik masuk tunggal ---------- */
  function init() { initReveal(); hardenExternalLinks(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();