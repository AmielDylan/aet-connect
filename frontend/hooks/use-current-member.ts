'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

/** Clé unique du membre connecté dans le cache React Query. */
export const ME_KEY = ['me'] as const

/**
 * Le membre connecté : une seule source pour toute l'appli (en-tête, barre latérale,
 * profil, codes…). null s'il n'y a pas de session. Les modifications passent par
 * useMemberCache, qui met ce cache à jour.
 */
export function useCurrentMember() {
  const query = useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<User | null> => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null
      return apiClient.getMe()
    },
    staleTime: 60_000
  })
  return { member: query.data ?? null, isLoading: query.isLoading }
}

/** Mettre à jour le membre connecté dans le cache, ou le recharger depuis le backend. */
export function useMemberCache() {
  const queryClient = useQueryClient()
  return {
    /** Valeur à jour au moment de l'appel (utile dans un callback asynchrone). */
    current: () => queryClient.getQueryData<User | null>(ME_KEY) ?? null,
    patch: (changes: Partial<User>) =>
      queryClient.setQueryData<User | null>(ME_KEY, (member) => (member ? { ...member, ...changes } : member)),
    refresh: () => queryClient.invalidateQueries({ queryKey: ME_KEY })
  }
}
