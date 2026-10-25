/**
 * knowledge.ts — plugin global OpenCode (V2, `@opencode/plugin`).
 *
 * Basis pengetahuan tim dengan alur validasi: hasil AI masuk sebagai
 * `pending` dan HANYA dipakai sebagai pengetahuan tepercaya setelah
 * ditinjau manusia → `approved`.
 *
 * Kredensial dibaca dari `~/.config/opencode/knowledge.env`
 * (fallback: variabel environment dengan nama yang sama).
 *
 * Catatan embedding: kolom `knowledge.embedding` sengaja bertipe `vector`
 * tanpa dimensi sampai model embedding dipilih. Setelah dipilih, jalankan
 * `ALTER TABLE knowledge ALTER COLUMN embedding TYPE vector(N);` lalu buat
 * index (ivfflat/hnsw). Selama itu, pencarian memakai full-text search.
 */

import { Plugin } from "@opencode/plugin"
import postgres from "postgres"
import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

// ---------------------------------------------------------------------------
// Konfigurasi & koneksi
// ---------------------------------------------------------------------------

const CONFIG_DIR = process.env.XDG_CONFIG_HOME
  ? join(process.env.XDG_CONFIG_HOME, "opencode")
  : join(homedir(), ".config", "opencode")
const ENV_FILE = join(CONFIG_DIR, "knowledge.env")

function readEnvFile(): Record<string, string> {
  const out: Record<string, string> = {}
  let text: string
  try {
    text = readFileSync(ENV_FILE, "utf8")
  } catch {
    return out
  }
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const eq = line.indexOf("=")
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let val = line.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

function loadConfig() {
  const file = readEnvFile()
  const get = (key: string, fallback = "") => file[key] ?? process.env[key] ?? fallback
  return {
    host: get("KNOWLEDGE_DB_HOST", "127.0.0.1"),
    port: Number(get("KNOWLEDGE_DB_PORT", "55432")),
    database: get("KNOWLEDGE_DB_NAME", "ai_knowledge"),
    username: get("KNOWLEDGE_DB_USER", "ai_knowledge_app"),
    password: get("KNOWLEDGE_DB_PASSWORD", ""),
  }
}

let sql: ReturnType<typeof postgres> | undefined

function getDb() {
  if (sql) return sql
  const c = loadConfig()
  sql = postgres({
    host: c.host,
    port: c.port,
    database: c.database,
    username: c.username,
    password: c.password,
    max: 2,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  })
  return sql
}

function msg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

function text(content: string) {
  return { content }
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

export default Plugin.define({
  id: "knowledge",

  async setup(ctx) {
    await ctx.tool.transform((editor) => {
      editor.namespace({
        name: "knowledge",
        description:
          "Basis pengetahuan tim. Hasil AI masuk sebagai `pending`; hanya `approved` yang dianggap tepercaya.",
      })

      // -- Tambah pengetahuan (selalu pending) -----------------------------
      editor.add({
        name: "add",
        description:
          "Simpan pengetahuan baru sebagai `pending` untuk ditinjau manusia. Tidak langsung dipercaya.",
        options: { namespace: "knowledge" },
        input: {
          type: "object",
          properties: {
            title: { type: "string", description: "Judul singkat" },
            content: { type: "string", description: "Isi pengetahuan" },
            source: { type: "string", description: "Asal, mis. nama repo/persona" },
            source_url: { type: "string", description: "URL referensi" },
            tags: { type: "array", items: { type: "string" }, description: "Label" },
          },
          required: ["title", "content"],
          additionalProperties: false,
        },
        execute: async (input, context) => {
          const a = input as {
            title: string
            content: string
            source?: string
            source_url?: string
            tags?: string[]
          }
          try {
            await context.progress({ status: "menyimpan sebagai pending" })
            const rows = await getDb()`
              INSERT INTO knowledge (title, content, source, source_url, tags)
              VALUES (
                ${a.title},
                ${a.content},
                ${a.source ?? null},
                ${a.source_url ?? null},
                ${a.tags ?? []}::text[]
              )
              RETURNING id, status, created_at
            `
            const row = rows[0]
            return text(
              `Tersimpan sebagai *${row.status}* (id ${row.id}).\n` +
                `Tinjau lewat knowledge_review sebelum dipakai sebagai pengetahuan tepercaya.`,
            )
          } catch (e) {
            return text(`Gagal menyimpan: ${msg(e)}`)
          }
        },
      })

      // -- Cari (hanya approved) -------------------------------------------
      editor.add({
        name: "search",
        description: "Cari pengetahuan yang sudah `approved` (full-text search).",
        options: { namespace: "knowledge" },
        input: {
          type: "object",
          properties: {
            query: { type: "string", description: "Kata kunci; kosong = terbaru" },
            tag: { type: "string", description: "Filter satu tag" },
            limit: { type: "integer", minimum: 1, maximum: 50, description: "Default 10" },
          },
          required: ["query"],
          additionalProperties: false,
        },
        execute: async (input, context) => {
          const a = input as { query: string; tag?: string; limit?: number }
          const q = (a.query ?? "").trim()
          const tag = a.tag ?? null
          const limit = Math.min(Math.max(a.limit ?? 10, 1), 50)
          try {
            await context.progress({ status: "mencari pengetahuan approved" })
            const rows = await getDb()`
              SELECT id, title, source, source_url, tags,
                     left(content, 240) AS snippet,
                     ts_rank(search_vector, websearch_to_tsquery('simple', ${q})) AS rank
              FROM knowledge
              WHERE status = 'approved'
                AND (${tag}::text IS NULL OR ${tag}::text = ANY(tags))
                AND (${q} = '' OR search_vector @@ websearch_to_tsquery('simple', ${q}))
              ORDER BY rank DESC NULLS LAST, updated_at DESC
              LIMIT ${limit}
            `
            if (rows.length === 0) {
              return text("Tidak ada pengetahuan `approved` yang cocok.")
            }
            const body = rows
              .map((r) => `- [#${r.id}] ${r.title}${r.source ? ` — ${r.source}` : ""}\n  ${r.snippet}`)
              .join("\n")
            return text(`${rows.length} hasil:\n${body}`)
          } catch (e) {
            return text(`Gagal mencari: ${msg(e)}`)
          }
        },
      })

      // -- Daftar pending ---------------------------------------------------
      editor.add({
        name: "pending",
        description: "Daftar pengetahuan yang menunggu peninjauan (`pending`).",
        options: { namespace: "knowledge" },
        input: {
          type: "object",
          properties: {
            limit: { type: "integer", minimum: 1, maximum: 100, description: "Default 20" },
          },
          additionalProperties: false,
        },
        execute: async (input, context) => {
          const a = input as { limit?: number }
          const limit = Math.min(Math.max(a.limit ?? 20, 1), 100)
          try {
            await context.progress({ status: "membaca antrian pending" })
            const rows = await getDb()`
              SELECT id, title, source, created_at
              FROM knowledge
              WHERE status = 'pending'
              ORDER BY created_at ASC
              LIMIT ${limit}
            `
            if (rows.length === 0) return text("Tidak ada item `pending`.")
            const body = rows
              .map((r) => `- [#${r.id}] ${r.title}${r.source ? ` — ${r.source}` : ""} (${r.created_at.toISOString()})`)
              .join("\n")
            return text(`${rows.length} item menunggu tinjauan:\n${body}`)
          } catch (e) {
            return text(`Gagal membaca daftar: ${msg(e)}`)
          }
        },
      })

      // -- Tinjau: pending → approved/rejected/archived ---------------------
      editor.add({
        name: "review",
        description:
          "Tinjau item `pending`: approve (jadikan tepercaya), reject, atau archive. Hanya berlaku untuk status pending.",
        options: { namespace: "knowledge" },
        input: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID pengetahuan" },
            decision: { type: "string", enum: ["approve", "reject", "archive"] },
            reviewer: { type: "string", description: "Nama peninjau (default: human)" },
            note: { type: "string", description: "Catatan tinjauan" },
          },
          required: ["id", "decision"],
          additionalProperties: false,
        },
        execute: async (input, context) => {
          const a = input as {
            id: number
            decision: "approve" | "reject" | "archive"
            reviewer?: string
            note?: string
          }
          const status =
            a.decision === "approve" ? "approved" : a.decision === "reject" ? "rejected" : "archived"
          try {
            await context.progress({ status: `menandai ${a.decision}` })
            const rows = await getDb()`
              UPDATE knowledge
              SET status = ${status},
                  reviewed_by = ${a.reviewer ?? "human"},
                  reviewed_at = now(),
                  metadata = metadata || ${getDb().json({ review_note: a.note ?? null })}::jsonb
              WHERE id = ${a.id} AND status = 'pending'
              RETURNING id, status, reviewed_by, reviewed_at
            `
            if (rows.length === 0) {
              return text(`id ${a.id} tidak ditemukan atau bukan berstatus \`pending\`.`)
            }
            const row = rows[0]
            return text(`id ${row.id} → *${row.status}* oleh ${row.reviewed_by}.`)
          } catch (e) {
            return text(`Gagal meninjau: ${msg(e)}`)
          }
        },
      })

      // -- Ambil detail -----------------------------------------------------
      editor.add({
        name: "get",
        description: "Ambil detail satu pengetahuan berdasarkan id (status apa pun).",
        options: { namespace: "knowledge" },
        input: {
          type: "object",
          properties: { id: { type: "integer", description: "ID pengetahuan" } },
          required: ["id"],
          additionalProperties: false,
        },
        execute: async (input) => {
          const a = input as { id: number }
          try {
            const rows = await getDb()`
              SELECT id, title, content, tags, status, source, source_url,
                     created_by, created_at, updated_at, reviewed_by, reviewed_at
              FROM knowledge
              WHERE id = ${a.id}
            `
            if (rows.length === 0) return text(`id ${a.id} tidak ditemukan.`)
            const r = rows[0]
            const meta = [
              `[#${r.id}] ${r.title} (${r.status})`,
              r.source ? `Source: ${r.source}${r.source_url ? ` <${r.source_url}>` : ""}` : "",
              r.tags?.length ? `Tags: ${r.tags.join(", ")}` : "",
              r.reviewed_by ? `Reviewed by: ${r.reviewed_by}` : "",
            ].filter(Boolean).join(" | ")
            return text(`${meta}\n\n${r.content}`)
          } catch (e) {
            return text(`Gagal mengambil: ${msg(e)}`)
          }
        },
      })
    })

    // Bersihkan koneksi saat plugin di-unload.
    return async () => {
      const db = sql
      sql = undefined
      if (db) {
        try {
          await db.end({ timeout: 5 })
        } catch {
          // ignore
        }
      }
    }
  },
})
