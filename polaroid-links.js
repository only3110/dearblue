/* =====================================================================
   Menjadikan 4 polaroid di landing page sebagai LINK + animasi hover.
   Cara pasang (cukup 1 baris, tanpa mengubah kode landing lain):
       <script src="polaroid-links.js"></script>      <- taruh sebelum </body>
   Polaroid dicocokkan berdasarkan URUTAN di HTML (yang pertama = LINKS[0], dst).
   Ingin override langsung di HTML? Tambahkan data-href="..." atau data-anim="..." di <figure>.
   ===================================================================== */
const LINKS = [
  { href: "pages/museum-of-you.html",         caption: "museum of you",           anim: "swing"  },
  { href: "pages/story-of-us.html",           caption: "story of us",             anim: "drift"  },
  { href: "pages/little-things.html",         caption: "little things",           anim: "hearts" },
  { href: "pages/people-who-love-you.html",   caption: "your people",             anim: "play"   },
];
/* anim: "swing"  = bergoyang + kilau emas     "drift"  = foto zoom pelan (Ken Burns)
         "hearts" = foto berdenyut + hati melayang   "play" = tombol play berdenyut  */

(() => {
  const FADE_MS = 400;        // lama fade sebelum pindah halaman
  const DRAG_TOLERANCE = 6;   // geser kurang dari ini (px) dianggap klik, bukan drag
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = document.createElement("style");
  css.textContent = `
    .pl-link { cursor: pointer; }
    .pl-link:focus-visible { outline: 3px dashed #1d3a6b; outline-offset: 6px; }
    .pl-fx { position: absolute; pointer-events: none; display: none; }
    .pl-link.is-hover .pl-fx { display: block; }
    .pl-shine { top: 0; bottom: 0; left: 0; width: 38%;
      background: linear-gradient(100deg, transparent, rgba(255,255,255,.85), transparent); }
    .pl-play { position: absolute; inset: 0; display: none; place-items: center; z-index: 2; }
    .pl-link.is-hover .pl-play { display: grid; }
    .pl-play svg { width: 34%; height: auto; overflow: visible; }
    .pl-heart { left: 0; bottom: 38%; font-size: 1.1em; color: #4a7fc1; opacity: 0; line-height: 1; }
  `;
  document.head.appendChild(css);


  const ANIMS = {
    swing(el, photo, fx) {
      const base = parseFloat(getComputedStyle(el).rotate) || 0;
      fx.shine = fx.shine || photo.appendChild(Object.assign(document.createElement("div"), { className: "pl-fx pl-shine" }));
      return [
        el.animate([{ rotate: `${base - 2.5}deg` }, { rotate: `${base + 2.5}deg` }],
          { duration: 1100, iterations: Infinity, direction: "alternate", easing: "ease-in-out" }),
        fx.shine.animate([{ transform: "translateX(-130%) skewX(-18deg)" }, { transform: "translateX(330%) skewX(-18deg)" }],
          { duration: 1500, iterations: Infinity, easing: "ease-in-out" }),
      ];
    },
    drift(el, photo) {
      const img = photo.querySelector("img");
      if (img) {
        return [img.animate([{ transform: "scale(1) translate(0,0)" }, { transform: "scale(1.2) translate(-4%,-3%)" }],
          { duration: 2600, iterations: Infinity, direction: "alternate", easing: "ease-in-out" })];
      }
      return [photo.animate([{ backgroundPosition: "0 0" }, { backgroundPosition: "56px 0" }],
        { duration: 1400, iterations: Infinity, easing: "linear" })];       // placeholder: garis-garis bergeser
    },
    hearts(el, photo, fx) {
      if (!fx.hearts) {
        fx.hearts = [0, 1, 2].map((i) => el.appendChild(Object.assign(document.createElement("span"),
          { className: "pl-fx pl-heart", textContent: "♥", style: `left:${22 + i * 24}%` })));
      }
      return [
        photo.animate([{ scale: 1 }, { scale: 1.03 }, { scale: 1 }, { scale: 1.02 }, { scale: 1 }],
          { duration: 4000, iterations: Infinity }),
        ...fx.hearts.map((h, i) => h.animate(
          [{ transform: "translateY(0) scale(.6)", opacity: 0 }, { opacity: 1, offset: .25 },
           { transform: `translateY(-70px) translateX(${i % 2 ? 10 : -10}px) scale(1.2)`, opacity: 0 }],
          { duration: 1800, delay: i * 500, iterations: Infinity })),
      ];
    },
    play(el, photo, fx) {
      if (!fx.play) {
        fx.play = photo.appendChild(Object.assign(document.createElement("div"), { className: "pl-play",
          innerHTML: `<svg viewBox="0 0 60 60"><circle class="ring" cx="30" cy="30" r="27" fill="none" stroke="#1d3a6b" stroke-width="1.5"/>
            <circle class="dot" cx="30" cy="30" r="22" fill="#f5f1e8" stroke="#24477d" stroke-width="1.5"/>
            <path d="M25 20 L40 30 L25 40 Z" fill="#4a7fc1" stroke="#24477d" stroke-width="1.5" stroke-linejoin="round"/></svg>` }));
      }
      const ring = fx.play.querySelector(".ring");
      ring.style.transformOrigin = "center"; ring.style.transformBox = "fill-box";
      return [
        ring.animate([{ transform: "scale(.95)", opacity: .4 }, { transform: "scale(1.3)", opacity: 0 }],
          { duration: 1300, iterations: Infinity, easing: "ease-out" }),
      ];
    },
  };

  const go = (href) => {
    document.body.style.transition = `opacity ${FADE_MS}ms ease`;
    document.body.style.opacity = 0;
    setTimeout(() => (location.href = href), FADE_MS);
  };
  window.addEventListener("pageshow", () => { document.body.style.opacity = 1; });   // saat kembali dengan tombol back

  document.querySelectorAll(".polaroid").forEach((el, i) => {
    const cfg = { ...(LINKS[i] || {}), ...(el.dataset.href && { href: el.dataset.href }), ...(el.dataset.anim && { anim: el.dataset.anim }) };
    if (!cfg.href) return;

    el.classList.add("pl-link");
    el.setAttribute("role", "link");
    el.tabIndex = 0;
    el.setAttribute("aria-label", cfg.caption || cfg.href);

    const cap = el.querySelector("figcaption");
    if (cap && cfg.caption && /^caption\s*\d*$/i.test(cap.textContent.trim())) cap.textContent = cfg.caption;  // hanya ganti caption bawaan

    // klik vs drag (landing.js memakai pointer capture, jadi pakai pointerup)
    let sx = 0, sy = 0;
    el.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; });
    el.addEventListener("pointerup", (e) => {
      if (e.button === 0 && Math.hypot(e.clientX - sx, e.clientY - sy) <= DRAG_TOLERANCE) go(cfg.href);
    });
    el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(cfg.href); } });

    // animasi hover yang berulang selama kursor masih di atas polaroid
    const photo = el.querySelector(".polaroid__photo");
    const make = ANIMS[cfg.anim];
    if (!photo || !make || reduceMotion) return;
    const fx = {}; let running = [];
    const base = () => parseFloat(getComputedStyle(el).rotate) || 0;
    const start = () => { if (running.length) return; el.classList.add("is-hover"); running = make(el, photo, fx); };
    const stop = () => {
      if (!running.length) return;
      const from = getComputedStyle(el).rotate;
      running.forEach((a) => a.cancel()); running = [];
      el.classList.remove("is-hover");
      if (cfg.anim === "swing") el.animate([{ rotate: from }, { rotate: `${base()}deg` }], { duration: 250, easing: "ease-out" });
    };
    el.addEventListener("pointerenter", start); el.addEventListener("pointerleave", stop);
    el.addEventListener("focus", start);        el.addEventListener("blur", stop);
  });
})();
