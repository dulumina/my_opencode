---
name: web-ui-ux-premium
description: >-
  Panduan mendesain UI/UX untuk website yang modern, responsive, interaktif,
  dan terasa premium/mahal, bukan template generik. Gunakan skill ini setiap
  kali user meminta desain website, landing page, redesign UI, mockup web,
  atau menyebut kata modern, responsive, interaktif, premium, elegan,
  high-end, mewah terkait sebuah web atau produk digital, bahkan jika mereka
  hanya bilang "buatin website" tanpa detail lebih lanjut. Cakupan meliputi
  sistem desain (warna, tipografi, layout, spacing), micro-interaction dan
  animasi yang purposeful, strategi responsive mobile-first, dan checklist
  kualitas sebelum kode dikirim. Trigger ini juga berlaku untuk permintaan
  dalam bentuk kode (HTML/CSS/JS, React, Tailwind) maupun mockup visual
  (Design artifact atau Figma).
---

# Web UI/UX Premium

Berperan sebagai design lead di studio desain yang dikenal karena setiap klien mendapat identitas visual yang khas — tidak pernah terlihat seperti template AI generik. Klien membayar untuk sudut pandang yang berani dan disengaja (deliberate), bukan pilihan default yang aman.

Skill ini melengkapi `frontend-design` (kalau tersedia di sesi ini, baca juga — skill itu berisi filosofi desain umum). Skill ini fokus lebih spesifik pada tiga kualitas yang diminta user: **modern, responsive, interaktif, premium**.

## Alur kerja

1. **Pahami brief** — Kalau user tidak menyebutkan industri/subjek, konten asli, atau audiens, jangan menebak dengan konten placeholder generik ("Lorem ipsum", "Company Name", "Feature 1/2/3"). Tanyakan singkat atau buat asumsi konkret (1 subjek, 1 audiens, 1 tujuan utama halaman) dan sebutkan asumsi itu ke user sebelum lanjut.
2. **Buat token desain** (lihat bagian "Sistem Desain" di bawah) sebelum menulis kode apa pun.
3. **Review terhadap default generik** — cek daftar "Anti-pola" di bawah. Kalau ada elemen desainmu yang cocok dengan salah satu ciri generik, ganti dan catat kenapa.
4. **Bangun** — ikuti panduan responsive & interaksi di bawah.
5. **Audit kualitas** sebelum menyerahkan hasil — pakai `references/checklist-kualitas.md`.

## Sistem Desain (Design Tokens)

Tentukan token berikut secara eksplisit, jangan biarkan implisit di kode:

- **Warna**: 4-6 warna inti dalam hex, masing-masing punya peran jelas (background, surface, teks utama, teks sekunder, aksen, border). Kesan "premium" datang dari kontras yang halus dan disiplin — bukan dari makin banyak warna. Lihat `references/palet-tipografi.md` untuk kombinasi yang teruji dan yang harus dihindari.
- **Tipografi**: 1-2 typeface dengan peran jelas (display/headline vs body). Tetapkan type scale (misal 12/14/16/20/28/40/56px) dengan rasio konsisten, letter-spacing dan line-height per level. Font premium terasa dari kualitas kerning & hierarki, bukan dari ukuran besar semata.
- **Layout & spacing**: gunakan skala spacing konsisten (misal basis 4px atau 8px: 4/8/12/16/24/32/48/64/96). Premium = white space yang generous dan disengaja, bukan konten yang rapat. Tentukan lebar konten maksimum (misal 1200-1320px container, 60-75 karakter per baris teks).
- **Radius & shadow**: pilih satu bahasa visual (contoh: radius 4px + shadow tajam untuk kesan "editorial/tegas", atau radius 16-24px + shadow lembut untuk kesan "soft premium") dan pakai konsisten — jangan campur beberapa radius berbeda tanpa alasan hierarki.
- **Motion**: tentukan 1-2 easing curve (misal `cubic-bezier(0.16, 1, 0.3, 1)` untuk gerakan yang halus dan "mahal") dan durasi standar (150-200ms untuk micro-interaction, 300-500ms untuk transisi antar-state, 600-900ms untuk reveal besar).

## Kualitas "Modern & Premium"

Ciri yang benar-benar membuat web terasa premium (bukan sekadar mengikuti tren):

- **Kontras yang disiplin**: satu elemen jadi fokus (hero headline, produk, ilustrasi), sisanya tenang. Jangan semua section bersaing minta perhatian.
- **Detail kecil yang presisi**: alignment pixel-perfect, optical spacing (bukan cuma numeric spacing), border tipis 1px dengan opacity rendah alih-alih border tebal solid, gradient sangat halus (bukan gradient neon).
- **Depth yang halus**: gunakan layering (z-index, blur, subtle shadow) secukupnya untuk hierarki — glassmorphism/frosted glass hanya kalau cocok dengan brief, jangan dipakai default.
- **Fotografi/ilustrasi berkualitas tinggi** atau, kalau tidak ada aset asli, gunakan bentuk geometris/gradient abstrak yang dirancang khusus, bukan clipart generik.
- **Copy yang percaya diri dan spesifik** — lihat bagian "Menulis" di `frontend-design` kalau tersedia; hindari jargon marketing kosong ("Solusi terbaik untuk kebutuhan Anda").
- **Konsistensi lintas breakpoint** — versi mobile bukan versi desktop yang "diciutkan", tapi dirancang ulang secara sadar untuk layar kecil.

## Responsive (mobile-first)

- Desain dari breakpoint terkecil (360-390px) ke atas, bukan sebaliknya. Breakpoint umum: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px, `2xl` 1536px — sesuaikan ke kebutuhan konten, bukan angka baku.
- Tipografi fluid: gunakan `clamp(min, preferred, max)` untuk ukuran heading agar scaling smooth antar breakpoint, contoh: `font-size: clamp(1.75rem, 4vw + 1rem, 3.5rem);`.
- Touch target minimum 44x44px untuk elemen interaktif di mobile; beri jarak antar elemen yang bisa ditekan agar tidak salah tap.
- Layout: grid/flex yang reflow (bukan sekadar men-scale-down), navigasi desktop (navbar horizontal) berubah jadi pola mobile yang sesuai konteks (hamburger, bottom nav, atau tab) — pilih sesuai kompleksitas navigasi, jangan otomatis hamburger.
- Uji minimal 3 lebar: mobile kecil (~375px), tablet (~768px), desktop (~1440px). Jangan hanya andalkan resize browser — cek elemen yang gampang pecah: tabel, kartu multi-kolom, teks panjang, tombol berdampingan.
- Gambar: `srcset`/ukuran responsif, `object-fit: cover` untuk menjaga rasio, lazy-load gambar di luar viewport pertama.

## Interaktif (motion & micro-interaction yang purposeful)

Prinsip utama: **animasi menjelaskan sesuatu, bukan menghias.** Motion yang tidak dipicu user (auto-play, fade-in massal saat scroll di semua section) adalah ciri paling umum dari halaman yang terasa "generated" — pakai secukupnya, satu momen orkestrasi besar lebih baik daripada efek bertebaran di setiap elemen.

Interaksi yang bernilai (utamakan ini):
- **Feedback state**: hover, focus, active, disabled — semua elemen interaktif harus punya state visual yang jelas (bukan hanya `cursor: pointer`).
- **Transisi yang menunjukkan perubahan**: modal/drawer yang muncul dari arah asalnya, accordion yang expand dengan smooth height, tab yang punya indicator bergerak ke tab aktif.
- **Scroll-driven yang informatif**: progress indicator, sticky nav yang mengecil saat scroll, parallax tipis pada hero (jangan berlebihan) — gunakan `IntersectionObserver` (vanilla) atau library ringan (Framer Motion/GSAP untuk React) alih-alih inline JS scroll listener yang berat.
- **Loading & empty state**: skeleton screen alih-alih spinner polos untuk konten yang butuh waktu load; states ini juga bagian dari "premium feel".
- **Cursor/pointer custom** hanya kalau brand benar-benar menuntutnya (misal studio kreatif) — jangan default.

Hindari: efek hover yang sama persis di semua card, fade-slide-up berjenjang di setiap section saat scroll, animasi teks huruf-per-huruf tanpa alasan, parallax berat yang bikin scroll terasa lag, autoplay carousel tanpa kontrol pause.

## Implementasi teknis

- **Kalau diminta kode**: prioritaskan CSS custom properties (`:root { --color-accent: ... }`) untuk semua token supaya konsisten & mudah di-theme (termasuk dark mode via `prefers-color-scheme` kalau relevan).
- **Tailwind**: definisikan token lewat `theme.extend` (warna, font, spacing) daripada hardcode utility class acak di semua tempat.
- **React/komponen**: gunakan library animasi ringan (Framer Motion) hanya untuk transisi yang perlu orkestrasi state; transisi CSS murni sudah cukup untuk hover/focus sederhana — jangan over-engineer.
- **Aksesibilitas bukan opsional**: kontras warna teks minimal WCAG AA (4.5:1 untuk teks normal), visible focus ring (jangan `outline: none` tanpa pengganti), `prefers-reduced-motion` dihormati (matikan/kurangi animasi non-esensial), semantic HTML & alt text.
- **Performa**: hindari shadow/blur berat di elemen yang sering re-render, kompres/optimalkan gambar, jangan load font-weight yang tidak dipakai.

Untuk output yang di-publish sebagai artifact web (HTML mandiri), ikuti aturan environment publikasi yang berlaku di sesi ini (self-contained, tanpa storage browser kalau tidak didukung, dsb) — bagian ini di luar cakupan skill dan mengikuti instruksi platform saat ini.

## Anti-pola (hindari kecuali brief secara eksplisit meminta)

- Background krem hangat (~#F4F1EA) + serif display kontras tinggi + aksen terracotta (~#D97757).
- Background hampir hitam + satu aksen neon-green/vermilion tunggal.
- Layout broadsheet dengan hairline rules, radius nol, kolom rapat ala koran — kalau bukan brief editorial/berita.
- "SaaS-card kit": semua konten dipotong jadi card seragam, satu radius untuk semuanya, shadow abu-abu lembut yang sama di setiap card, gradient dekoratif tanpa makna.
- Chrome template: label eyebrow ALL-CAPS di atas setiap heading, meta text disambung middle-dot ("A · B · C"), label "KATA — fragmen" pakai em dash, near-black (#0B0B0B/#111) menggantikan hitam asli, font monospace untuk label kecil, tanda panah "→" ditambahkan di setiap tombol/link.
- Numbered marker (01/02/03) untuk konten yang sebenarnya bukan urutan/proses.
- Menonjolkan satu kata di headline dengan italic/bold/warna beda sebagai "gaya" tanpa alasan makna.

## Referensi lanjutan

- `references/palet-tipografi.md` — contoh kombinasi warna & font pairing untuk beberapa mood premium (editorial, tech/SaaS, luxury/lifestyle, fintech), plus kombinasi yang harus dihindari.
- `references/checklist-kualitas.md` — checklist audit sebelum menyerahkan hasil (visual, responsive, interaksi, aksesibilitas, performa).

Baca file referensi ini saat masuk ke tahap yang relevan (memilih palet, atau audit akhir) — tidak perlu dibaca semua di awal.
