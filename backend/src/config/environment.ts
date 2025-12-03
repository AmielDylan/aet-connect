import dotenv from 'dotenv'
import path from 'path'

// Charger d'abord .env.shared depuis la racine du projet (variables partagées)
const rootDir = path.resolve(process.cwd(), '..')
dotenv.config({ path: path.resolve(rootDir, '.env.shared') })

// Puis charger .env.local du backend (peut surcharger les variables partagées)
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
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
    console.error('\n💡 Copy .env.example to .env.local and fill in your values')
    return false
  }
  
  return true
}

