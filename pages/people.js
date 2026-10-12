/* people.js — pemutar video ucapan + panel berbagi. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (root.getAttribute('data-people-init')) return;
  root.setAttribute('data-people-init', '1');

  /* ====== UBAH DI SINI ====== */
  var videoSrc = '../video/ucapan.mov';   // relatif terhadap pages/ → folder video/ di root proyek
  var CAPTION  = 'Ucapan ulang tahun dari orang-orang yang menyayangimu 💙';
  var SHARE_URL = '';                     // kosong = alamat halaman utama website ini

  var $ = function (id) { return document.getElementById(id); };
  var v = $('video'), player = $('player');
  if (!v) return;
  var shareUrl = SHARE_URL || new URL('../landing.html', location.href).href;
  var shareText = CAPTION + ' ' + shareUrl;
  var seeking = false, speeds = [0.75, 1, 1.25, 1.5, 2], si = 1;

  function on(id, ev, fn) { var el = $(id); if (el) el.addEventListener(ev, fn); }
  function setText(id, t) { var el = $(id); if (el) el.textContent = t; }
  function hide(id, h) { var el = $(id); if (el) el.hidden = h; }
  function fmt(s) { if (!isFinite(s)) s = 0; var m = Math.floor(s / 60), x = Math.floor(s % 60); return m + ':' + (x < 10 ? '0' : '') + x; }
  function say(t) { setText('msg', t); }

  /* ikon sebagai teks sederhana (tombol di HTML memang kosong) */
  setText('back10', '↺10'); setText('fwd10', '10↻'); setText('pip', '⧉'); setText('fs', '⛶');
  setText('bigplay', '▶'); setText('speed', '1×');
  function sync() {
    setText('play', v.paused ? '▶' : '❚❚');
    setText('mute', v.muted || v.volume === 0 ? '🔇' : '🔊');
    var vol = $('vol'); if (vol) vol.value = v.muted ? 0 : v.volume;
    setText('time', fmt(v.currentTime) + ' / ' + fmt(v.duration));
    var sk = $('seek'); if (sk && !seeking) sk.value = v.duration ? v.currentTime / v.duration * 1000 : 0;
  }
  ['loadedmetadata', 'timeupdate', 'play', 'pause', 'volumechange', 'durationchange'].forEach(function (e) { v.addEventListener(e, sync); });

  /* sumber & error */
  v.addEventListener('error', function () { hide('missing', false); hide('bigplay', true); hide('unmute', true); });
  v.addEventListener('loadedmetadata', function () { hide('missing', true); });
  v.src = videoSrc;

  /* putar: gagal (diblokir) → tampilkan #bigplay; berhasil tapi muted → tampilkan #unmute */
  function play() {
    var p = v.play();
    if (p && p.then) p.then(function () { hide('bigplay', true); hide('end', true); }).catch(function () { if (!v.error) hide('bigplay', false); });
  }
  v.muted = true;                                  // autoplay hanya dicoba dalam keadaan senyap
  v.addEventListener('playing', function () { hide('unmute', !v.muted); hide('bigplay', true); });
  play();
  on('bigplay', 'click', function () { play(); });
  on('unmute', 'click', function () { v.muted = false; if (v.volume === 0) v.volume = 1; hide('unmute', true); });
  on('play', 'click', function () { if (v.paused) play(); else v.pause(); });
  v.addEventListener('click', function () { if (v.paused) play(); else v.pause(); });
  on('back10', 'click', function () { v.currentTime = Math.max(0, v.currentTime - 10); });
  on('fwd10', 'click', function () { if (isFinite(v.duration)) v.currentTime = Math.min(v.duration, v.currentTime + 10); });
  on('seek', 'pointerdown', function () { seeking = true; });
  on('seek', 'input', function (e) { if (isFinite(v.duration)) v.currentTime = v.duration * e.target.value / 1000; });
  ['pointerup', 'change', 'blur'].forEach(function (e) { on('seek', e, function () { seeking = false; }); });
  on('speed', 'click', function () { si = (si + 1) % speeds.length; v.playbackRate = speeds[si]; setText('speed', speeds[si] + '×'); });
  on('mute', 'click', function () { v.muted = !v.muted; if (!v.muted && v.volume === 0) v.volume = 0.5; hide('unmute', !v.muted); });
  on('vol', 'input', function (e) { v.volume = +e.target.value; v.muted = v.volume === 0; });

  /* PiP & fullscreen: hanya tampil bila didukung */
  var pipOk = document.pictureInPictureEnabled && v.requestPictureInPicture;
  hide('pip', !pipOk);
  on('pip', 'click', function () {
    (document.pictureInPictureElement ? document.exitPictureInPicture() : v.requestPictureInPicture()).catch(function () {});
  });
  var fsEl = player && (player.requestFullscreen || player.webkitRequestFullscreen), fsIos = v.webkitEnterFullscreen;
  hide('fs', !(fsEl || fsIos));
  on('fs', 'click', function () {
    var cur = document.fullscreenElement || document.webkitFullscreenElement;
    if (cur) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else if (fsEl) (player.requestFullscreen || player.webkitRequestFullscreen).call(player);
    else if (fsIos) v.webkitEnterFullscreen();
  });

  /* panel akhir */
  setText('caption', CAPTION);
  v.addEventListener('ended', function () { hide('end', false); });
  on('replay', 'click', function () { hide('end', true); v.currentTime = 0; play(); });
  on('demoEnd', 'click', function () { hide('end', false); });   // hanya pratinjau panel, video tidak dianggap selesai

  /* berbagi (tidak ada yang terkirim sebelum pengguna menekan tombol) */
  var q = encodeURIComponent;
  function href(id, u) { var a = $(id); if (a) a.href = u; }
  href('shWa', 'https://wa.me/?text=' + q(shareText));
  href('shTg', 'https://t.me/share/url?url=' + q(shareUrl) + '&text=' + q(CAPTION));
  href('shX', 'https://twitter.com/intent/tweet?text=' + q(CAPTION) + '&url=' + q(shareUrl));
  href('shFb', 'https://www.facebook.com/sharer/sharer.php?u=' + q(shareUrl));
  function copy(text, okMsg) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      ta.remove(); say(ok ? okMsg : 'Gagal menyalin. Salin manual: ' + text);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { say(okMsg); }, fallback);
    else fallback();
  }
  hide('shNative', !navigator.share);
  on('shNative', 'click', function () {
    navigator.share({ title: document.title, text: CAPTION, url: shareUrl })
      .then(function () { say('Terima kasih sudah membagikan 💙'); })
      .catch(function (e) { if (e && e.name !== 'AbortError') say('Berbagi gagal. Coba tombol lain.'); });
  });
  on('shCopyText', 'click', function () { copy(shareText, 'Teks disalin.'); });
  on('shCopyLink', 'click', function () { copy(shareUrl, 'Tautan disalin.'); });
  on('shIg', 'click', function () {   // Instagram tidak menerima unggahan otomatis dari browser
    copy(shareText, 'Teks disalin. Instagram tidak bisa menerima unggahan otomatis dari browser: simpan videonya, lalu unggah manual lewat aplikasi Instagram dan tempel teksnya.');
  });
  sync();
})();
