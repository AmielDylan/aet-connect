-- ═══════════════════════════════════════════════════
-- MIGRATION : deletion_requests
-- Historique des demandes de suppression de compte
-- À exécuter dans Supabase SQL Editor
-- ═══════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS deletion_requests (
  id                    UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason                TEXT,
  status                VARCHAR(20)  NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
  processed_at          TIMESTAMPTZ,
  processed_by_admin_id UUID         REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_deletion_requests_status  ON deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON deletion_requests(user_id);

-- Politique RLS (si RLS est activé sur la table)
-- ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;
-- Les accès sont gérés via le service_role_key côté backend, pas de RLS nécessaire.
