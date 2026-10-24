-- Skema basis pengetahuan OpenCode (pgvector) — idempotent.
-- Dijalankan sebagai admin/superuser (ai_knowledge_admin).
-- Password akun aplikasi TIDAK ada di sini; diberikan via psql -v app_password=...

\set ON_ERROR_STOP on

-- 1. Ekstensi pgvector (butuh superuser)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Akun aplikasi dengan hak akses terbatas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_knowledge_app') THEN
    CREATE ROLE ai_knowledge_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

ALTER ROLE ai_knowledge_app WITH LOGIN PASSWORD :'app_password';

-- 3. Tabel pengetahuan
CREATE TABLE IF NOT EXISTS knowledge (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title           text NOT NULL,
  content         text NOT NULL,
  source          text,
  source_url      text,
  tags            text[] NOT NULL DEFAULT '{}',
  -- pending  : hasil AI, belum dipercaya
  -- approved : sudah ditinjau manusia, boleh dipakai sebagai pengetahuan
  -- rejected / archived
  status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
  metadata        jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- embedding sengaja tanpa dimensi dulu (pgvector mengizinkan `vector` polos).
  -- Setelah model embedding dipilih: ALTER COLUMN ... TYPE vector(N) lalu buat index.
  embedding       vector,
  embedding_model text,
  embedding_at    timestamptz,
  search_vector   tsvector GENERATED ALWAYS AS (
                    to_tsvector('simple',
                      coalesce(title, '') || ' ' || coalesce(content, ''))
                  ) STORED,
  created_by      text NOT NULL DEFAULT current_user,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  reviewed_by     text,
  reviewed_at     timestamptz
);

CREATE INDEX IF NOT EXISTS knowledge_status_idx     ON knowledge (status);
CREATE INDEX IF NOT EXISTS knowledge_tags_idx       ON knowledge USING gin (tags);
CREATE INDEX IF NOT EXISTS knowledge_source_idx     ON knowledge (source);
CREATE INDEX IF NOT EXISTS knowledge_created_at_idx ON knowledge (created_at DESC);
CREATE INDEX IF NOT EXISTS knowledge_search_idx     ON knowledge USING gin (search_vector);

-- 4. Tabel audit (jejak siapa mengubah apa)
CREATE TABLE IF NOT EXISTS knowledge_audit (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  knowledge_id bigint REFERENCES knowledge (id) ON DELETE CASCADE,
  action       text NOT NULL CHECK (action IN
                 ('create', 'update', 'submit', 'approve', 'reject', 'archive', 'delete')),
  from_status  text,
  to_status    text,
  actor        text NOT NULL DEFAULT current_user,
  details      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_audit_knowledge_idx ON knowledge_audit (knowledge_id);
CREATE INDEX IF NOT EXISTS knowledge_audit_created_at_idx ON knowledge_audit (created_at DESC);

-- 5. Trigger updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS knowledge_set_updated_at ON knowledge;
CREATE TRIGGER knowledge_set_updated_at
  BEFORE UPDATE ON knowledge
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 6. Trigger audit: mencatat otomatis setiap create/update/perubahan status,
--    sehingga audit tidak bergantung pada disiplin plugin.
CREATE OR REPLACE FUNCTION knowledge_audit_trigger() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO knowledge_audit (knowledge_id, action, to_status, actor)
    VALUES (NEW.id, 'create', NEW.status, NEW.created_by);
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO knowledge_audit (knowledge_id, action, from_status, to_status, actor)
    VALUES (
      NEW.id,
      CASE NEW.status
        WHEN 'approved' THEN 'approve'
        WHEN 'rejected' THEN 'reject'
        WHEN 'archived' THEN 'archive'
        ELSE 'submit'
      END,
      OLD.status, NEW.status,
      coalesce(NEW.reviewed_by, current_user)
    );
  ELSE
    INSERT INTO knowledge_audit (knowledge_id, action, from_status, to_status, actor)
    VALUES (NEW.id, 'update', OLD.status, NEW.status, coalesce(NEW.reviewed_by, current_user));
  END IF;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS knowledge_audit_aiu ON knowledge;
CREATE TRIGGER knowledge_audit_aiu
  AFTER INSERT OR UPDATE ON knowledge
  FOR EACH ROW EXECUTE FUNCTION knowledge_audit_trigger();

-- 7. Hak akses terbatas hanya untuk DML
GRANT CONNECT ON DATABASE ai_knowledge TO ai_knowledge_app;
GRANT USAGE ON SCHEMA public TO ai_knowledge_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON knowledge, knowledge_audit TO ai_knowledge_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ai_knowledge_app;
