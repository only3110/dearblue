/* things.js — tiap .thing membuka catatan di #overlay; counter hanya menghitung benda unik. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (root.getAttribute('data-things-init')) return;
  root.setAttribute('data-things-init', '1');

  var $ = function (id) { return document.getElementById(id); };
  var things = Array.prototype.slice.call(document.querySelectorAll('.thing'));
  var overlay = $('overlay'), finale = $('finale');
  if (!things.length || !overlay) return;
  var closeBtn = overlay.querySelector('.note__x'), nImg = $('nImg');
  var found = new Set(), opener = null, rain = false;
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ($('total')) $('total').textContent = things.length;
  function count() { if ($('found')) $('found').textContent = found.size; }
  count();

  function open(el) {
    opener = el;
    var img = el.querySelector('img');
    $('nTitle').textContent = el.getAttribute('data-title') || '';     // isi dari item yang dipilih
    $('nStory').textContent = el.getAttribute('data-story') || '';
    if (nImg) {
      if (img && img.getAttribute('src')) { nImg.src = img.getAttribute('src'); nImg.alt = ''; nImg.hidden = false; }
      else nImg.hidden = true;
    }
    found.add(el); el.classList.add('is-found'); count();
    overlay.hidden = false;
    if (closeBtn) closeBtn.focus();
  }
  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    if (opener) opener.focus();
    if (found.size === things.length && !rain) { rain = true; if (finale) finale.hidden = false; heartRain(); }
  }
  function heartRain() {
    if (calm) return;
    for (var i = 0; i < 24; i++) {
      var h = document.createElement('span');
      h.className = 'heart'; h.textContent = '♥'; h.setAttribute('aria-hidden', 'true');
      h.style.left = Math.random() * 100 + 'vw';
      h.style.fontSize = 14 + Math.random() * 22 + 'px';
      h.style.animationDuration = 3 + Math.random() * 3 + 's';
      h.style.animationDelay = Math.random() * 1.5 + 's';
      h.style.setProperty('--dr', (Math.random() * 80 - 40) + 'px');
      h.addEventListener('animationend', function (e) { e.target.remove(); });   // bersihkan sendiri
      document.body.appendChild(h);
    }
  }

  things.forEach(function (el) { el.addEventListener('click', function () { open(el); }); });
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });   // backdrop
  document.addEventListener('keydown', function (e) {
    if (overlay.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'Tab') { e.preventDefault(); if (closeBtn) closeBtn.focus(); }        // fokus tetap di modal
  });
})();
