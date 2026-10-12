/* ====== PENGATURAN (ubah di sini) ====== */
const CONFIG = {
  sentences: [
    "hawooo, gimana kabar kamu hari ini??",
    "hihi aku ada hadiaah tau buat kamu",
    "maaf yaah kalo cuma ini yang bisa aku kasih",
    "tapi aku harap kamu sukaa dan happy teyuss",
  ],
  typeSpeed: 80,       // ms per huruf saat mengetik
  deleteSpeed: 50,     // ms per huruf saat menghapus
  pauseBetween: 250,   // jeda (ms) setelah menghapus, sebelum mengetik
  startDelay: 500,     // jeda (ms) sebelum kalimat pertama muncul
  loop: false,         // true = kembali ke kalimat 1 setelah kalimat terakhir
  nextPage: "landing.html", // halaman tujuan setelah kalimat terakhir
  fadeOut: 500,        // ms durasi fade sebelum pindah halaman
  sound: {
    enabled: true,
    file: "assets/typing.mp3", // File MP3 suara ketikan
    volume: 0.1, // Volume suara ketikan
    onDelete: false,  // Suara juga saat menghapus huruf
  },

  onFinish: () => {
    document.body.classList.add("is-leaving");

    setTimeout(() => {
      window.location.href = CONFIG.nextPage;
    }, CONFIG.fadeOut);
  },

  onFinish: () => {    // dijalankan saat klik di kalimat terakhir (jika loop: false)
    document.body.classList.add("is-leaving");
    setTimeout(() => { window.location.href = CONFIG.nextPage; }, CONFIG.fadeOut);
  },
};

/* =====================================================
   SUARA KETIK DARI FILE MP3
   ===================================================== */

// Membuat audio dari file MP3
let keySound = null;

if (CONFIG.sound.enabled) {
  keySound = new Audio(CONFIG.sound.file);

  // Preload supaya suara lebih cepat dimainkan
  keySound.preload = "auto";

  // Volume default
  keySound.volume = CONFIG.sound.volume;
}

/* Memainkan suara ketikan cloneNode() digunakan supaya suara bisa dimainkan berulang kali dengan cepat tanpa menunggu suara sebelumnya selesai. */
function playKey(isDelete = false) {

  if (!CONFIG.sound.enabled || !keySound) return;

  const sound = keySound.cloneNode(true);

  sound.volume = CONFIG.sound.volume * (isDelete ? 0.7 : 1);

  sound.currentTime = 0;

  sound.play().catch(() => {
    // Browser dapat memblokir audio sebelum user berinteraksi.
    // Error sengaja diabaikan.
  });
}



/* ====== LOGIKA (biasanya tidak perlu diubah) ====== */
const textEl  = document.getElementById("text");
const caretEl = document.getElementById("caret");
const introEl = document.getElementById("intro");
const ghostEl = document.getElementById("ghost");

let index = 0;
let busy  = false;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function type(sentence) {
  for (let i = 1; i <= sentence.length; i++) {
    textEl.textContent = sentence.slice(0, i);
    playKey(false);
    await wait(CONFIG.typeSpeed);
  }
}

async function erase() {
  while (textEl.textContent.length > 0) {
    textEl.textContent = textEl.textContent.slice(0, -1);
    await wait(CONFIG.deleteSpeed);
  }
}

async function goTo(nextIndex) {
  busy = true;
  caretEl.classList.add("is-busy");

  await erase();
  await wait(CONFIG.pauseBetween);
  index = nextIndex;
  ghostEl.textContent = CONFIG.sentences[index];
  await type(CONFIG.sentences[index]);

  caretEl.classList.remove("is-busy");
  busy = false;
}

introEl.addEventListener("click", () => {
  if (busy) return;                          // abaikan klik saat animasi berjalan

  const isLast = index === CONFIG.sentences.length - 1;
  if (isLast && !CONFIG.loop) {
    CONFIG.onFinish();
    return;
  }
  goTo(isLast ? 0 : index + 1);
});

// Mulai
(async () => {
  await wait(CONFIG.startDelay);
  ghostEl.textContent = CONFIG.sentences[0];
  busy = true;
  caretEl.classList.add("is-busy");
  await type(CONFIG.sentences[0]);
  caretEl.classList.remove("is-busy");
  busy = false;
})();