// ═══════════════════════════════════════════════════
// AUTH STORE - Zustand
// Gestion de l'état d'authentification avec Supabase Auth
// ═══════════════════════════════════════════════════

import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Login avec Supabase Auth
   */
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })

    if (!supabase) {
      set({ isLoading: false })
      throw new Error('Supabase n\'est pas configuré')
    }

    try {
      // 1. Login avec Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        set({ isLoading: false })
        throw error
      }

      if (!data.user) {
        set({ isLoading: false })
        throw new Error('Aucun utilisateur retourné')
      }

      // 2. Récupérer les données complètes depuis la table users
      // Ajouter un timeout pour éviter de rester bloqué
      const userDataPromise = supabase
        .from('users')
        .select(`
          *,
          schools:school_id (
            id,
            name_fr,
            name_en,
            country,
            established_year
          )
        `)
        .eq('id', data.user.id)
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout lors de la récupération des données utilisateur')), 10000)
      )

      let userData: any
      let userError: any

      try {
        const result = await Promise.race([
          userDataPromise,
          timeoutPromise
        ]) as { data: any, error: any }
        userData = result.data
        userError = result.error
      } catch (timeoutError) {
        console.warn('User data fetch timeout during login:', timeoutError)
        userData = null
        userError = { message: 'Timeout' }
      }

      if (userError || !userData) {
        set({ isLoading: false })
        throw new Error(userError?.message || 'Impossible de récupérer les données utilisateur')
      }

      // 3. Mettre à jour le state
      set({
        user: userData as User,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion'
      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      })
      throw error
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    set({ isLoading: true })

    if (!supabase) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
      return
    }

    try {
      await supabase.auth.signOut()
      
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Forcer la déconnexion même en cas d'erreur
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  },

  /**
   * Charger l'utilisateur depuis la session Supabase
   */
  loadUser: async () => {
    set({ isLoading: true })

    if (!supabase) {
      console.warn('Supabase client not available')
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return
    }

    try {
      // 1. Récupérer la session Supabase avec timeout court
      // getSession() lit depuis localStorage mais peut parfois bloquer
      const sessionPromise = supabase.auth.getSession()
      const sessionTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session timeout')), 1000)
      )

      let session: any
      let sessionError: any

      try {
        const result = await Promise.race([
          sessionPromise,
          sessionTimeout
        ]) as { data: { session: any }, error: any }
        session = result.data?.session
        sessionError = result.error
      } catch (timeoutError) {
        // Timeout sur getSession() - continuer sans session
        console.debug('getSession timeout (non-critical)')
        session = null
        sessionError = { message: 'Timeout' }
      }

      if (sessionError || !session) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return
      }

      // 2. Récupérer les données complètes depuis la table users avec timeout court
      const userDataPromise = supabase
        .from('users')
        .select(`
          *,
          schools:school_id (
            id,
            name_fr,
            name_en,
            country,
            established_year
          )
        `)
        .eq('id', session.user.id)
        .single()

      const userTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User data timeout')), 2000)
      )

      let userData: any
      let userError: any

      try {
        const result = await Promise.race([
          userDataPromise,
          userTimeoutPromise
        ]) as { data: any, error: any }
        userData = result.data
        userError = result.error
      } catch (timeoutError) {
        // Si c'est un timeout, on continue sans userData
        console.debug('User data fetch timeout (non-critical)')
        userData = null
        userError = { message: 'Timeout' }
      }

      if (userError || !userData) {
        console.debug('User data not found (non-critical):', userError?.message)
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return
      }

      set({
        user: userData as User,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      // Ne pas logger les erreurs de timeout comme des erreurs critiques
      if (error instanceof Error && error.message.includes('timeout')) {
        console.debug('Load user timeout (non-critical)')
      } else {
        console.debug('Load user error (non-critical):', error instanceof Error ? error.message : 'Unknown')
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  /**
   * Mettre à jour l'utilisateur
   */
  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: !!user,
    })
  },
}))
