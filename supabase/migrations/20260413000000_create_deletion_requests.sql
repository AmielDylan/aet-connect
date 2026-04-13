-- Migration : création de la table deletion_requests
-- Historique des demandes de suppression de compte

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
