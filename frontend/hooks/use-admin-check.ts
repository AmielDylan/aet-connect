'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export function useAdminCheck() {
  const router = useRouter()
  const { user } = useAuth()
  const isAuthenticated = !!user

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (user?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, isAuthenticated, router])

  return { isAdmin: user?.role === 'admin' }
}



