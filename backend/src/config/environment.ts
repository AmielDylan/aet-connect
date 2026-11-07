// Les variables viennent de Doppler, jamais d'un fichier .env :
//   - en local : `doppler run -- …` (config dev_backend, voir doppler.yaml)
//   - en prod  : intégration Doppler → Railway (config prd_backend)

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-CHANGE-IN-PROD',
    expiresIn: '7d'
  }
}

// Validation au démarrage
export function validateConfig() {
  const required = [
    'supabase.url',
    'supabase.anonKey',
    'supabase.serviceRoleKey'
  ]
  
  const missing: string[] = []
  
  if (!config.supabase.url) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!config.supabase.anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!config.supabase.serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(key => console.error(`   - ${key}`))
    console.error('\n💡 Lancez le backend via Doppler : `doppler run -- npm run dev` (voir README)')
    return false
  }
  
  return true
}

