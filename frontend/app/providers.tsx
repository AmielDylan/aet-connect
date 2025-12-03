'use client'

// ═══════════════════════════════════════════════════
// PROVIDERS
// Configuration React Query + Initialisation Auth
// ═══════════════════════════════════════════════════

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { supabase } from '@/lib/supabase'
import { Toaster } from '@/components/ui/sonner'

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  const loadUser = useAuthStore((state) => state.loadUser)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    let isMounted = true
    let subscription: { unsubscribe: () => void } | null = null

    // Timeout réduit à 2 secondes pour éviter de rester bloqué
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.debug('Initialization timeout - proceeding anyway')
        setIsInitialized(true)
      }
    }, 2000) // 2 secondes max - assez pour getSession() mais pas trop long

    // Try to load user from token on app initialization
    // Utiliser Promise.race pour forcer un timeout sur loadUser()
    const initAuth = async () => {
      try {
        // Race entre loadUser() et un timeout de 1.5 secondes
        await Promise.race([
          loadUser(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Load user timeout')), 1500)
          )
        ])
      } catch (error) {
        // Silently fail - c'est normal s'il n'y a pas de session
        if (error instanceof Error && error.message.includes('timeout')) {
          console.debug('Initialization timeout (non-critical)')
        } else {
          console.debug('No valid session found')
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId)
          setIsInitialized(true)
        }
      }
    }

    // Démarrer l'initialisation
    initAuth()

    // Écouter les changements de session Supabase
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.debug('Auth state changed:', event, session?.user?.id)
          
          if (event === 'SIGNED_IN' && session) {
            // Recharger l'utilisateur quand on se connecte
            try {
              await loadUser()
            } catch (error) {
              console.error('Error reloading user after sign in:', error)
            }
          } else if (event === 'SIGNED_OUT') {
            // Nettoyer le state quand on se déconnecte
            useAuthStore.getState().setUser(null)
          } else if (event === 'TOKEN_REFRESHED' && session) {
            // Recharger l'utilisateur quand le token est rafraîchi
            try {
              await loadUser()
            } catch (error) {
              console.error('Error reloading user after token refresh:', error)
            }
          }
        }
      )
      subscription = data.subscription
    }

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [loadUser])

  // Show loading screen while initializing auth
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">
            Initialisation...
          </p>
        </div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}

