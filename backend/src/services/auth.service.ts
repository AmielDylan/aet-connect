import { supabase, createCredentialsClient } from '@/config/database'

// Authentification : gérée par Supabase Auth côté client (connexion, session, déconnexion).
// Le backend ne garde que ce qui demande la clé service_role.
export class AuthService {
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
      //    Mêmes règles qu'à l'inscription ; tous les caractères sont permis
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
      if (!passwordRegex.test(newPassword)) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre')
      }

      // 3. Vérifier l'ancien mot de passe sur un client jetable
      //    (jamais sur le client service_role partagé, voir createCredentialsClient)
      const { data: signInData, error: signInError } = await createCredentialsClient().auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      })

      if (signInError || !signInData.user || signInData.user.id !== userId) {
        throw new Error('Ancien mot de passe incorrect')
      }

      // 4. Mettre à jour le mot de passe via l'API admin (client service_role)
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
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

