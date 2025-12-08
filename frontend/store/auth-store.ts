import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { apiClient } from '@/lib/api'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),

  loadUser: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        set({ user: null })
        return
      }

      // ✅ Charger les données depuis public.users avec le nom de l'école
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        set({ user: null })
        return
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          schools:school_id (
            id,
            name_fr,
            country
          )
        `)
        .eq('id', authUser.id)
        .single()

      if (userError || !userData) {
        console.error('Error loading user data:', userError)
        // Fallback sur apiClient.getMe() si la requête directe échoue
        try {
          const response = await apiClient.getMe()
          set({ user: response })
        } catch (fallbackError) {
          console.error('Error loading user from API:', fallbackError)
          set({ user: null })
        }
        return
      }

      // ✅ Construire l'objet user avec school_name
      const school = Array.isArray(userData.schools) ? userData.schools[0] : userData.schools
      
      const user: User = {
        id: userData.id,
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        school_id: userData.school_id,
        school_name: school?.name_fr || null, // ✅ Ajouter
        entry_year: userData.entry_year,
        current_city: userData.current_city,
        current_country: userData.current_country,
        role: userData.role,
        is_ambassador: userData.is_ambassador,
        is_active: userData.is_active,
        max_codes_allowed: userData.max_codes_allowed,
        bio: userData.bio,
        phone: userData.phone,
        linkedin_url: userData.linkedin_url,
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        school: school ? {
          id: school.id,
          name_fr: school.name_fr,
          name_en: null,
          country: school.country,
          city: '',
          established_year: null,
          is_active: true,
        } : null,
      }

      set({ user })
    } catch (error) {
      console.error('Error loading user:', error)
      set({ user: null })
    }
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await get().loadUser()
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
