/**
 * Migration : création de la table deletion_requests
 * Utilise l'API REST Supabase avec service_role_key
 */

import path from 'path'
import dotenv from 'dotenv'

// Charger les variables d'environnement
const rootDir = path.resolve(process.cwd(), '..')
dotenv.config({ path: path.resolve(rootDir, '.env.shared') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variables NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquantes')
  process.exit(1)
}

const SQL = `
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
`

async function runMigration() {
  console.log('🚀 Migration deletion_requests...')
  console.log(`   URL : ${SUPABASE_URL}`)

  // 1. Vérifier si la table existe déjà via une requête SELECT
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/deletion_requests?select=id&limit=1`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    }
  )

  if (checkRes.ok) {
    console.log('✅ Table deletion_requests existe déjà — migration ignorée.')
    return
  }

  const checkError = await checkRes.json()
  const tableNotFound =
    checkRes.status === 404 ||
    (checkError?.message && checkError.message.includes('relation') && checkError.message.includes('does not exist'))

  if (!tableNotFound) {
    console.log('⚠️  Erreur inattendue lors de la vérification :', JSON.stringify(checkError))
    console.log('   On tente quand même la création via rpc...')
  }

  // 2. Essayer exec_sql via RPC
  const rpcRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql: SQL }),
  })

  if (rpcRes.ok) {
    console.log('✅ Table deletion_requests créée via rpc/exec_sql !')
    return
  }

  // 3. Essayer l'endpoint /pg/query (Supabase >= 2.x)
  const pgRes = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  })

  if (pgRes.ok) {
    console.log('✅ Table deletion_requests créée via /pg/query !')
    return
  }

  // 4. Aucune méthode programmatique disponible — afficher le SQL pour exécution manuelle
  console.log('\n⚠️  Exécution automatique non disponible pour ce projet Supabase.')
  console.log('   Copiez-collez le SQL suivant dans le SQL Editor de votre dashboard Supabase :\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(SQL)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n   URL Dashboard : https://app.supabase.com/project/vknmdjljsidraflzywlg/sql/new')
  process.exit(1)
}

runMigration().catch((err) => {
  console.error('❌ Erreur :', err)
  process.exit(1)
})
