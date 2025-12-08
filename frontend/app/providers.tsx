'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    // Timeout de sécurité : forcer le chargement après 2 secondes MAX
    const timeout = setTimeout(() => {
      setIsReady(true)
    }, 2000)

    // Essayer de charger l'utilisateur
    loadUser()
      .catch((err) => console.error('LoadUser error:', err))
      .finally(() => {
        clearTimeout(timeout)
        setIsReady(true)
      })

    return () => clearTimeout(timeout)
  }, [loadUser])

  // Loader pendant max 2 secondes
  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <SonnerToaster />
      <Toaster />
    </QueryClientProvider>
  )
}
