/* museum.js — membuka #viewer untuk tiap .exhibit (judul/tanggal/deskripsi dari data-*). */
(function () {
  'use strict';
  var root = document.documentElement;
  if (root.getAttribute('data-museum-init')) return;
  root.setAttribute('data-museum-init', '1');

  var items = Array.prototype.slice.call(document.querySelectorAll('.exhibit'));
  var dlg = document.getElementById('viewer');
  if (!items.length || !dlg) return;
  var $ = function (id) { return document.getElementById(id); };
  var art = $('vArt'), no = $('vNo'), title = $('vTitle'), date = $('vDate'), desc = $('vDesc');
  var cur = 0, opener = null;

  function show(i) {
    cur = (i + items.length) % items.length;                    // berputar
    var el = items[cur], src = el.querySelector('.art');
    art.className = 'viewer__art';                              // salin class mask-* agar frames.css berlaku
    el.classList.forEach(function (c) { if (c.indexOf('mask-') === 0) art.classList.add(c); });
    art.textContent = '';
    if (src) {
      var clone = src.cloneNode(true);
      art.appendChild(clone);
      clone.querySelectorAll('img').forEach(function (im) {      // tanpa ikon gambar rusak
        im.addEventListener('error', function () { if (!im.classList.contains('frame')) im.remove(); });
      });
    }
    no.textContent = (cur + 1) + ' / ' + items.length;
    title.textContent = el.getAttribute('data-title') || '';    // textContent: tidak ada HTML mentah
    date.textContent = el.getAttribute('data-date') || '';
    desc.textContent = el.getAttribute('data-desc') || '';
  }
  function open(i, trigger) {
    opener = trigger || opener;
    show(i);
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
  }
  function close() { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); }

  items.forEach(function (el, i) {
    el.addEventListener('click', function () { open(i, el); });
    el.querySelectorAll('.photo img').forEach(function (im) { im.addEventListener('error', function () { im.remove(); }); });
  });
  var q = function (s) { return dlg.querySelector(s); };
  if (q('.viewer__prev')) q('.viewer__prev').addEventListener('click', function () { show(cur - 1); });
  if (q('.viewer__next')) q('.viewer__next').addEventListener('click', function () { show(cur + 1); });
  if (q('.viewer__close')) q('.viewer__close').addEventListener('click', close);

  dlg.addEventListener('click', function (e) {                  // klik backdrop = di luar kotak dialog
    var r = dlg.getBoundingClientRect();
    if (e.target === dlg && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) close();
  });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    else if (e.key === 'ArrowRight') show(cur + 1);
  });
  dlg.addEventListener('close', function () { if (opener) opener.focus(); });   // Escape ditangani <dialog>
})();
