# Palet Warna & Tipografi

Gunakan ini sebagai titik berangkat, bukan resep kaku — sesuaikan hue/nilai dengan brief spesifik. Yang penting adalah *logika* di balik tiap kombinasi, bukan hex-nya persis.

## Mood: Editorial / Konten Percaya Diri
- Warna: `#0E0E10` (teks/ink), `#FAFAF8` (background), `#5B5A57` (teks sekunder), `#B8722C` (aksen hangat tapi bukan terracotta klise — coba pertimbangkan warna lain sesuai brand: hijau tua `#2F4B3C`, biru tinta `#28324A`)
- Tipografi: satu serif display berkarakter (bukan Playfair Display default) dipasangkan dengan sans-serif netral untuk body (Inter, Söhne, atau sejenis).
- Karakter: line length pendek, whitespace vertikal besar antar section, sedikit garis pemisah tipis.

## Mood: Tech / SaaS Modern
- Warna: base netral gelap atau terang + SATU aksen brand yang jenuh (bukan gradient rainbow), gunakan tint/shade dari aksen itu untuk state (hover, active, disabled) alih-alih menambah warna baru.
- Tipografi: sans-serif geometris/grotesk untuk display (Geist, General Sans, Söhne) + monospace HANYA untuk data teknis asli (kode, angka metrik) bukan sebagai gaya label dekoratif.
- Karakter: grid rapi, card dengan radius konsisten (pilih satu: 8px tegas ATAU 20px+ soft, jangan campur), micro-interaction pada elemen data (chart, angka animasi saat scroll).

## Mood: Luxury / Lifestyle
- Warna: palet sangat minim (2-3 warna), kontras rendah dan tenang, aksen metalik/emas HANYA sebagai garis tipis atau detail kecil, bukan blok warna besar.
- Tipografi: display elegan dengan letter-spacing lebar untuk judul pendek, body yang sangat readable dan tenang.
- Karakter: foto/gambar besar full-bleed, teks sedikit, banyak white space, transisi halaman yang halus dan pelan (400-600ms).

## Mood: Fintech / Trust-first
- Warna: biru/hijau tua sebagai basis trust, aksen terang untuk CTA saja (satu warna, dipakai konsisten hanya untuk aksi utama), hindari warna "playful" berlebihan yang mengurangi kesan aman.
- Tipografi: sans-serif sangat legible untuk angka (tabular figures aktif), hierarki jelas antara data primer dan sekunder.
- Karakter: banyak state (loading, verified, error) harus didesain eksplisit, bukan asal styling.

## Kombinasi yang perlu diwaspadai (bukan dilarang, tapi sering jadi default AI)
- Krem hangat + serif kontras tinggi + terracotta `#D97757` (dikenali sebagai warna interaksi Claude, jadi terasa seperti "template AI" kalau brief tidak memintanya).
- Hitam pekat + satu neon-green/vermilion sebagai satu-satunya aksen.
- Font pairing default tanpa pertimbangan: Playfair Display + Inter, atau Poppins + Roboto, dipakai tanpa alasan spesifik untuk brand tsb.

## Type scale contoh (basis 16px, rasio ~1.25-1.333)
```
12 / 14 / 16 / 20 / 25 / 31 / 39 / 49 / 61 (px)
```
Sesuaikan rasio: rasio lebih kecil (1.125-1.2) untuk UI padat/data-heavy, rasio lebih besar (1.333-1.5) untuk halaman marketing/editorial yang butuh headline dramatis.
