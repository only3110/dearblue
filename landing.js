/* Membuat semua benda (.item) bisa digeser dengan mouse atau jari */
let topZ = 10;

document.querySelectorAll(".item").forEach((el) => {
  el.addEventListener("pointerdown", (e) => {
    el.setPointerCapture(e.pointerId);
    el.classList.add("is-dragging");
    el.style.zIndex = ++topZ;                       // benda yang dipegang naik ke paling atas

    const startX = e.clientX, startY = e.clientY;
    const baseX = parseFloat(el.dataset.dx || 0);
    const baseY = parseFloat(el.dataset.dy || 0);

    const move = (ev) => {
      const dx = baseX + ev.clientX - startX;
      const dy = baseY + ev.clientY - startY;
      el.dataset.dx = dx;
      el.dataset.dy = dy;
      el.style.setProperty("--dx", dx + "px");
      el.style.setProperty("--dy", dy + "px");
    };
    const up = () => {
      el.classList.remove("is-dragging");
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  });
});

/* Munculnya benda satu per satu */
document.querySelectorAll(".item").forEach((el, i) => {
  el.style.animationDelay = 200 + i * 50 + "ms";
});

// Music

// music button
const music = document.getElementById("birthdayMusic");
const musicButton = document.getElementById("musicButton");
const volumeSlider = document.getElementById("volumeSlider");

music.volume = 0.3;
volumeSlider.value = 0.3;

// =========================
// PLAY / PAUSE
// =========================

window.addEventListener("load", () => {
    music.play();
});

musicButton.addEventListener("click", () => {

    if (music.paused) {
        music.play();

        musicButton.innerHTML = '<i class="bi bi-music-note"></i> Pause';
    } else {
        music.pause();

        musicButton.innerHTML = '<i class="bi bi-music-note"></i> Play';
    }

});


// =========================
// VOLUME
// =========================

volumeSlider.addEventListener("input", () => {

    music.volume = volumeSlider.value;

});