# AGENTS.md — panduan global

## Basis pengetahuan (plugin `knowledge`)

Ada basis pengetahuan tim di PostgreSQL lokal (pgvector, port 55432) yang diakses
lewat tool ber-namespace `knowledge_*`.

Prinsip utama: **hasil AI tidak otomatis tepercaya.**

- Simpan temuan, catatan, atau hasil riset dengan `knowledge_add`. Item tersimpan
  sebagai `pending`.
- Hanya item berstatus `approved` yang boleh dianggap sebagai pengetahuan
  tepercaya. Jangan menyajikan item `pending` sebagai fakta pasti.
- Sebelum menjawab pertanyaan yang mungkin tercakup, cari dulu dengan
  `knowledge_search` (dirinya hanya menampilkan item `approved`).
- Jangan memanggil `knowledge_review` atas inisiatif sendiri. Tinjauan
  (`approve`/`reject`/`archive`) hanya dilakukan atas permintaan manusia.
- Gunakan `knowledge_pending` untuk melihat antrian yang menunggu tinjauan, dan
  `knowledge_get` untuk detail satu item.

Catatan: pencarian saat ini memakai full-text search. Pencarian semantik
(pgvector) akan diaktifkan setelah model embedding dipilih.
