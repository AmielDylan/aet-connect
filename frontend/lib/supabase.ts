import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Créer un client Supabase avec SSR pour synchroniser les cookies
// Best practice: persistSession true pour maintenir la session
let supabase: ReturnType<typeof createBrowserClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true, // ✅ IMPORTANT
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
} else {
  console.warn('Supabase credentials not configured. Authentication will not work.')
  supabase = createBrowserClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

export { supabase }

