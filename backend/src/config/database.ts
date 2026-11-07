import { createClient } from '@supabase/supabase-js'
import { config } from './environment'

// Client Supabase avec service role key (accès admin)
export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * Client jetable (clé anon, aucune session persistée) pour vérifier des identifiants.
 *
 * Ne jamais appeler `auth.signInWithPassword` sur le client `supabase` ci-dessus :
 * supabase-js garderait la session en mémoire et les requêtes suivantes partiraient
 * avec le jeton de cet utilisateur au lieu de la clé service_role.
 */
export function createCredentialsClient() {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Test de connexion
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('schools')
      .select('id')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Database connection error:', error)
    return false
  }
}

