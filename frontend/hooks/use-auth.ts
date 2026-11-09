'use client'

import { supabase } from '@/lib/supabase'
import { useCurrentMember } from '@/hooks/use-current-member'

/**
 * Session et membre connecté.
 * La session appartient à Supabase Auth ; le membre vient de useCurrentMember.
 * À la déconnexion, SessionSync (app/providers) vide tout le cache.
 */
export const useAuth = () => {
  const { member, isLoading } = useCurrentMember()

  return {
    user: member,
    isAuthenticated: !!member,
    isLoading,
    login: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    logout: async () => {
      await supabase.auth.signOut()
    },
  }
}
