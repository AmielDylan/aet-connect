'use client'

import { QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import type { AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { createQueryClient } from '@/lib/query-client'
import { ME_KEY } from '@/hooks/use-current-member'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'

/**
 * La session Supabase commande le cache :
 *  - déconnexion → tout le cache est vidé (rien d'un membre ne survit pour le suivant) ;
 *  - connexion, jeton renouvelé, compte modifié → le membre connecté est rechargé.
 */
function SessionSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear()
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ME_KEY })
      }
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <SessionSync />
      {children}
      <SonnerToaster />
      <Toaster />
    </QueryClientProvider>
  )
}
