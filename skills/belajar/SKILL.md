---
name: belajar
description: Panduan belajar konsep teknis, dokumentasi terstruktur, dan pemahaman mendalam.
---
# Skill: Belajar (Cross-session Memory)

Tujuan: Membantu agent "belajar" dan mengingat informasi lintas sesi menggunakan basis pengetahuan tim (`knowledge`), dengan tetap mematuhi prinsip **AI tidak otomatis tepercaya**.

## Prinsip

- Memori lintas sesi menggunakan plugin `knowledge` (PostgreSQL + pgvector, port 55432).
- Semua informasi baru yang disimpan **wajib** berstatus `pending` terlebih dahulu. Hanya item `approved` yang boleh dianggap sebagai fakta tepercaya.
- **Jangan pernah** memanggil `knowledge.review` atas inisiatif sendiri. Review (`approve`/`reject`/`archive`) hanya boleh dilakukan atas permintaan manusia.
- Selalu terapkan **search-first**: cari dulu pengetahuan `approved` yang relevan sebelum menyimpulkan atau mengklaim "ingat".
- Hanya simpan **fakta stabil & terverifikasi**, bukan seluruh percakapan atau state sementara.

## Kapan Aktif

Aktifkan skill ini ketika:
- Ada informasi berulang/stabil yang perlu diingat lintas sesi.
- Berkaitan dengan **user** (nama, username, peran, preferensi bahasa/tonasi/respons).
- Berkaitan dengan **proyek** (nama, path, stack, arsitektur, konvensi kode).
- Adalah **instruksi kerja** (rules, workflow, kebiasaan tim/pribadi).
- Perlu "mempelajari" file (profil, README, spesifikasi, konvensi) untuk jadi konteks tepercaya nanti.
- Bisa mengurangi pengulangan penjelasan di sesi berikutnya.

## Workflow

### 1) Search-first (WAJIB)
Sebelum menyimpan, cari dulu apa yang udah ada.

```ts
tools.knowledge.search({
  query: "<query relevan: nama/user/proyek/topik/file>",
  limit: 10
})
```

- Hanya pertimbangkan hasil berstatus `approved`.
- Kalau ada yang relevan & cukup, **jangan duplikat**. Cuma tambahkan fakta baru yang belum ada.
- Kalau belum ada sama sekali, lanjut ke langkah 2.

### 2) Ekstrak fakta baru
Ambil hanya fakta jelas dari sumber (percakapan/file). Hindari asumsi/spekulasi.

Fokus ke: identitas, preferensi, proyek aktif, path penting, stack, konvensi, aturan kerja.

### 3) Simpan ke knowledge (SELALU PENDING)
Gunakan `knowledge.add` dengan judul ringkas & isi terstruktur.

```ts
tools.knowledge.add({
  title: "User: <username> — <topik>",
  content: "- Username: fikri\n- Nama: ...\n- Bahasa: Indonesia\n- Preferensi: ringkas & jelas\n- Proyek aktif: ...\n- Path kunci: ...\n- Konvensi: ...",
  source: "moh_dzulfikri.md" | "percakapan",
  tags: ["user", "belajar", "preferensi", "profil"]
})
```

**Panduan tags:** minimal `user`, `belajar`. Tambah relevan: `profil`, `proyek`, `stack`, `konvensi`, `workflow`, `cv`, dll.

### 4) Beri tahu user transparan
Lapor setelah berhasil simpan, **wajib** sebut ID & status.

Template:

> Saya sudah menyimpan catatan ini ke basis pengetahuan sebagai **`pending`** (butuh tinjauan manusia).

> **ID:** `<id>`
> **Title:** `<title>`
> **Tags:** `<tags>`
> **Source:** `<source>`

> Supaya bisa aktif dipakai lintas sesi, kamu perlu **approve** item ini:
> ```ts
> tools.knowledge.review({
>   id: <id>,
>   decision: "approve",
>   reviewer: "fikri"
> })
> ```

> Saya **tidak** akan menganggapnya tepercaya sampai statusnya jadi `approved`.

### 5) Hanya pakai approved di jawaban
- Jangan kutip item `pending` sebagai fakta pasti.
- Kalau belum ada `approved` relevan & belum di-approve, bilang jujur: "Belum ada ingatan tepercaya (`approved`) tentang ini di knowledge."
- **Jangan** auto-approve.

### 6) Hindari duplikasi
Cek via `knowledge.search`. Kalau fakta sama udah ada bentuk `approved`, skip simpan. Kalau mirip tapi beda, jelasin bedanya di `content`.

## Aturan Tambahan

- **Transparan.** Selalu infokan status `pending` + cara approve.
- **Minimal & relevan.** Simpan cuma fakta yang berguna lintas sesi.
- **Konsisten AGENTS.md.** Patuhi semua aturan `knowledge_*`.
- **Boleh eksplisit dipanggil.** Bisa dipanggil via `skill(id="belajar")` atau aktif otomatis saat ada minta "pelajari...", "ingatkan...", "simpan ke memory".
- **Fokus user-centric.** Prioritaskan info tentang kamu (profil, preferensi, konteks kerja).

## Contoh Penggunaan

**Contoh 1: Minta pelajari file**
> "Pelajari ~/moh_dzulfikri.md"

Langkah: `read` file → `knowledge.search` (query "fikri profil cv") → ekstrak fakta stabil (nama, kontak, skill kunci, peran, proyek relevan) → `knowledge.add` sebagai pending → lapor ID + cara approve.

**Contoh 2: Minta ingat preferensi**
> "Ingat: aku suka respons singkat & pakai Bahasa Indonesia"

Langkah: search dulu → kalau belum ada, add pending dengan tags `user`, `belajar`, `preferensi`.