# Checklist Kualitas Sebelum Menyerahkan Hasil

Jalankan ini sebelum bilang "selesai" ke user. Tidak semua poin relevan untuk setiap proyek (misal mockup statis tidak perlu poin performa runtime) — pakai yang relevan.

## Visual & Brand
- [ ] Ada minimal 1 keputusan desain yang jelas-jelas spesifik untuk brief ini (bukan pilihan yang bisa dipakai di brief apa pun).
- [ ] Tidak ada kombinasi warna/tipografi dari daftar "Anti-pola" tanpa alasan eksplisit dari brief.
- [ ] Kontras teks vs background minimal AA (4.5:1 teks normal, 3:1 teks besar ≥24px/bold ≥19px).
- [ ] Satu elemen jadi fokus utama; elemen lain tidak bersaing merebut perhatian.
- [ ] Spacing konsisten mengikuti skala yang ditentukan (bukan angka acak seperti 13px, 22px).

## Responsive
- [ ] Sudah dicek di ≥3 lebar viewport (≈375px, ≈768px, ≈1440px).
- [ ] Tidak ada horizontal scroll yang tidak disengaja di mobile.
- [ ] Touch target ≥44x44px dan tidak berdempetan di mobile.
- [ ] Navigasi mobile dirancang sesuai kompleksitas konten (bukan hamburger otomatis tanpa pertimbangan).
- [ ] Tipografi tidak overflow/terpotong di layar kecil; heading panjang tetap wajar.
- [ ] Gambar punya ukuran responsif / `object-fit` yang tepat, tidak gepeng/stretch.

## Interaksi & Motion
- [ ] Semua elemen interaktif punya state hover/focus/active/disabled yang jelas.
- [ ] Tidak ada animasi scroll-reveal yang diulang identik di setiap section (efek generik).
- [ ] Animasi non-esensial berhenti/berkurang saat `prefers-reduced-motion: reduce`.
- [ ] Durasi transisi wajar (150-500ms untuk sebagian besar interaksi) — tidak terasa lambat/lag.
- [ ] Loading state & empty state didesain, bukan dibiarkan default browser/kosong.

## Aksesibilitas
- [ ] Fokus keyboard terlihat jelas (bukan `outline: none` tanpa pengganti).
- [ ] Struktur heading semantik (h1 → h2 → h3, tidak loncat level tanpa alasan).
- [ ] Semua gambar informatif punya alt text; ikon dekoratif ditandai `aria-hidden`.
- [ ] Form punya label yang terasosiasi dengan benar, bukan hanya placeholder.

## Performa (kalau menghasilkan kode)
- [ ] Tidak ada shadow/blur berat pada elemen yang sering re-render/animasi.
- [ ] Gambar dioptimalkan/lazy-load di luar viewport awal.
- [ ] Tidak memuat font-weight/style yang tidak dipakai.
- [ ] Script pihak ketiga (animasi, analytics) tidak memblokir render awal.

## Copy
- [ ] Tidak ada placeholder generik ("Lorem ipsum", "Your Company", "Feature 1") di deliverable final.
- [ ] CTA memakai kata kerja aktif dan spesifik ("Mulai coba gratis" bukan "Submit"/"Klik di sini").
- [ ] Tidak ada jargon marketing kosong tanpa isi konkret.
