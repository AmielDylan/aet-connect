// Garde-fou : les tests ne tournent QUE contre la base Supabase locale (`supabase start`).
// Lancé avant chaque script de test (voir package.json).

const url = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!url) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL absent. Lancez les tests via Doppler : `doppler run -- npm test`')
  process.exit(1)
}

const host = new URL(url).hostname
if (host !== '127.0.0.1' && host !== 'localhost') {
  console.error(`❌ Tests refusés : la base visée (${host}) n'est pas locale. Utilisez la config Doppler dev_backend.`)
  process.exit(1)
}

console.log(`✅ Base locale (${url}), tests autorisés`)
