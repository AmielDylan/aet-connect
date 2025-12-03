import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Créer un client Supabase seulement si les credentials sont configurés
// Sinon, créer un client factice pour éviter les erreurs
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // Activer la persistance de session pour Supabase Auth
      autoRefreshToken: true, // Activer le refresh automatique des tokens
      detectSessionInUrl: true, // Détecter la session dans l'URL (pour callbacks)
    },
  })
} else {
  console.warn('Supabase credentials not configured. Authentication will not work.')
  // Créer un client factice avec des valeurs par défaut pour éviter les erreurs
  // Ce client ne fonctionnera pas mais évitera les crashes
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export { supabase }

