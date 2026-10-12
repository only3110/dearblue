/* story.js — progress bar (#bar), penghitung hari (#days), animasi .interlude.
   .reveal ditangani shared.js (tidak diulang di sini). */
(function () {
  'use strict';
  var root = document.documentElement;
  if (root.getAttribute('data-story-init')) return;
  root.setAttribute('data-story-init', '1');

  /* ====== UBAH DI SINI: tanggal jadian, format "YYYY-MM-DD" (mis. "2024-02-14") ====== */
  var START_DATE = '2024-10-29';

  var $ = function (id) { return document.getElementById(id); };

  /* --- progress scroll --- */
  var bar = $('bar'), ticking = false;
  function progress() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (bar) bar.style.transform = 'scaleX(' + p + ')';
  }
  function request() { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  window.addEventListener('pageshow', progress);
  progress();

  /* --- hari bersama (tanggal lokal; selisih dihitung lewat UTC agar kebal DST) --- */
  function parse(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s).trim());
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3], dt = new Date(y, mo - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt : null;
  }
  var out = $('days'), note = $('sinceNote');
  if (out) {
    var s = parse(START_DATE), t = new Date(), n = NaN;
    if (s) n = Math.round((Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()) -
                           Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())) / 864e5);
    if (n >= 0) {
      out.textContent = n.toLocaleString('id-ID');
      if (note) note.textContent = 'sejak ' + s.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } else {
      out.textContent = '—';
      if (note) note.textContent = s ? 'tanggal mulai ada di masa depan' : 'isi START_DATE di story.js';
    }
  }

  /* --- interlude: baris muncul bergantian (teks tetap terlihat tanpa JS / reduced motion) --- */
  var inter = $('interlude');
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (inter && !calm && 'IntersectionObserver' in window) {
    root.classList.add('story-js');
    new IntersectionObserver(function (es, obs) {
      es.forEach(function (e) { if (e.isIntersecting) { inter.classList.add('is-in'); obs.disconnect(); } });
    }, { threshold: 0.25 }).observe(inter);
  }
})();
