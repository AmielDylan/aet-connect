import { supabase } from '@/config/database'
// bcrypt supprimé - plus nécessaire avec Supabase Auth
import { JWTUtils } from '@/utils/jwt'
import { LoginResponse } from '@/models/auth.model'

export class AuthService {
  
  // Login utilisateur
  // ⚠️ DEPRECATED: Le frontend utilise Supabase Auth directement
  // Cette fonction n'est plus utilisée mais conservée pour compatibilité
  async login(email: string, password: string): Promise<LoginResponse> {
    // Utiliser Supabase Auth pour vérifier les identifiants
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (authError || !authData.user) {
      throw new Error('Email ou mot de passe incorrect')
    }
    
    // Récupérer l'utilisateur depuis public.users
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .eq('is_active', true)
      .single()
    
    if (userError || !user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Générer les tokens JWT (pour compatibilité avec l'ancien système)
    const tokens = JWTUtils.generateTokens(user.id, user.email, user.role)
    
    // Mettre à jour last_login (optionnel)
    await supabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', user.id)
    
    // Retourner la réponse
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_ambassador: user.is_ambassador,
        school_id: user.school_id,
        entry_year: user.entry_year
      },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token
    }
  }
  
  // Refresh token
  async refreshToken(refresh_token: string): Promise<{ access_token: string; refresh_token: string }> {
    
    // 1. Vérifier le refresh token
    const payload = JWTUtils.verifyToken(refresh_token)
    
    if (!payload || payload.type !== 'refresh') {
      throw new Error('Refresh token invalide ou expiré')
    }
    
    // 2. Vérifier que l'utilisateur existe toujours
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', payload.user_id)
      .single()
    
    if (error || !user || !user.is_active) {
      throw new Error('Utilisateur non trouvé ou inactif')
    }
    
    // 3. Générer de nouveaux tokens
    const tokens = JWTUtils.generateTokens(user.id, user.email, user.role)
    
    return tokens
  }
  
  // Récupérer utilisateur connecté
  async getAuthenticatedUser(user_id: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        is_ambassador,
        school_id,
        entry_year,
        current_city,
        current_country,
        max_codes_allowed,
        created_at,
        school:school_id (
          id,
          name_fr,
          country
        )
      `)
      .eq('id', user_id)
      .eq('is_active', true)
      .single()
    
    if (error || !user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Normaliser school (peut être un tableau ou un objet selon Supabase)
    return {
      ...user,
      school: Array.isArray(user.school) ? user.school[0] : user.school
    }
  }

  /**
   * Change le mot de passe d'un utilisateur
   * Utilise Supabase Auth Admin API
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    try {
      // 1. Récupérer l'utilisateur pour obtenir son email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        throw new Error('Utilisateur non trouvé')
      }

      // 2. Valider le nouveau mot de passe
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      if (!passwordRegex.test(newPassword)) {
        throw new Error(
          'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
        )
      }

      // 3. Vérifier l'ancien mot de passe en tentant une connexion
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      })

      if (signInError || !signInData.user || !signInData.session) {
        throw new Error('Ancien mot de passe incorrect')
      }

      // 4. Mettre à jour le mot de passe avec la session créée
      // Créer un nouveau client avec la session pour pouvoir utiliser updateUser()
      // Note: updateUser() nécessite une session utilisateur active
      const { createClient } = await import('@supabase/supabase-js')
      const { config } = await import('@/config/environment')
      
      // Créer un client temporaire avec la session utilisateur
      const userClient = createClient(config.supabase.url, config.supabase.anonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${signInData.session.access_token}`,
          },
        },
      })

      const { error: updateError } = await userClient.auth.updateUser({
        password: newPassword,
      })

      if (updateError) {
        throw new Error(updateError.message || 'Erreur lors de la mise à jour du mot de passe')
      }

      return { success: true, message: 'Mot de passe changé avec succès' }
    } catch (error: any) {
      console.error('Error changing password:', error)
      throw error
    }
  }
}

export const authService = new AuthService()

