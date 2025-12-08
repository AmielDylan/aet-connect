// ═══════════════════════════════════════════════════
// useAuth Hook
// Hook personnalisé pour accéder à l'authentification
// ═══════════════════════════════════════════════════

'use client'

import { useAuthStore } from '@/store/auth-store'

/**
 * Custom hook to access authentication state and actions
 * 
 * @returns Authentication state and actions
 * 
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * 
 * if (isAuthenticated) {
 *   return <div>Hello {user?.first_name}</div>
 * }
 * ```
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const loadUser = useAuthStore((state) => state.loadUser)
  const setUser = useAuthStore((state) => state.setUser)

  // Calculer isAuthenticated et isLoading depuis user
  const isAuthenticated = !!user
  const isLoading = false // Simplifié : pas de state isLoading pour l'instant

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    loadUser,
    setUser,
  }
}

