// Garde-fou : les parcours e2e créent des comptes, ils ne tournent QUE sur la base locale.
export default function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url || !['127.0.0.1', 'localhost'].includes(new URL(url).hostname)) {
    throw new Error(`Tests e2e refusés : base non locale (${url ?? 'URL absente'}). Lancer via « npm run test:e2e ».`)
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY absente : lancer via « npm run test:e2e » (config Doppler dev_backend).')
  }
}
