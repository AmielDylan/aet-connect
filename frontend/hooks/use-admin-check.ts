'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export function useAdminCheck() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
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

