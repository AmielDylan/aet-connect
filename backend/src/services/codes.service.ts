import { supabase } from '@/config/database'

export class CodesService {
  
  async generateUserCode(user_id: string, data?: { school_id?: string; entry_year?: string }): Promise<{
    code: string
    codes_remaining: number
  }> {
    
    // 1. Récupérer l'utilisateur
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('school_id, entry_year, max_codes_allowed, role, is_ambassador')
      .eq('id', user_id)
      .single()
    
    if (userError || !user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Admin peut spécifier école + promo, sinon utilise les siennes
    const schoolId = data?.school_id || user.school_id
    const entryYear = data?.entry_year || user.entry_year
    
    if (!schoolId || !entryYear) {
      throw new Error('École et promotion requises')
    }
    
    // VALIDATION : S'assurer que entry_year est au format YYYY
    if (entryYear.length !== 4) {
      throw new Error('Année d\'entrée invalide (format YYYY requis)')
    }
    
    // 2. Compter les codes déjà créés par cet utilisateur
    const { count, error: countError } = await supabase
      .from('invitation_codes')
      .select('*', { count: 'exact', head: true })
      .eq('created_by_user_id', user_id)
    
    if (countError) throw countError
    
    const codesCreated = count || 0
    
    // 3. Vérifier la limite (sauf pour les admins)
    if (user.role !== 'admin' && codesCreated >= user.max_codes_allowed) {
      throw new Error(
        `Vous avez atteint votre limite de ${user.max_codes_allowed} codes. ` +
        (user.is_ambassador 
          ? 'Contactez un administrateur pour augmenter votre limite.' 
          : 'Contactez votre ambassadeur ou un administrateur.')
      )
    }
    
    // 4. Générer le code
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    const code = `USER-${randomPart}`
    
    // 5. Créer le code en DB
    const { data: newCode, error: createError } = await supabase
      .from('invitation_codes')
      .insert({
        code: code,
        school_id: schoolId,
        entry_year: entryYear,
        created_by_user_id: user_id,
        is_admin_code: user.role === 'admin',
        max_uses: 1, // 1 code = 1 utilisation
        current_uses: 0,
        is_active: true
      })
      .select()
      .single()
    
    if (createError) throw createError
    
    return {
      code: newCode.code,
      codes_remaining: user.role === 'admin' ? -1 : user.max_codes_allowed - codesCreated - 1
    }
  }
  
  async getUserCodes(user_id: string) {
    const { data, error } = await supabase
      .from('invitation_codes')
      .select(`
        id,
        code,
        entry_year,
        max_uses,
        current_uses,
        expires_at,
        is_active,
        created_at,
        schools:school_id (
          name_fr
        )
      `)
      .eq('created_by_user_id', user_id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    return data
  }

  // Vérifier un code et récupérer ses informations (sans authentification)
  async verifyCode(code: string) {
    const { data, error } = await supabase
      .from('invitation_codes')
      .select(`
        code,
        school_id,
        entry_year,
        max_uses,
        current_uses,
        expires_at,
        is_active,
        schools:school_id (
          id,
          name_fr
        )
      `)
      .eq('code', code)
      .single()
    
    if (error || !data) {
      throw new Error('Code invalide')
    }

    // Vérifier si le code est encore valide
    if (!data.is_active) {
      throw new Error('Ce code a été révoqué')
    }

    if (data.current_uses >= data.max_uses) {
      throw new Error('Ce code a déjà été utilisé')
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      throw new Error('Ce code a expiré')
    }

    const school = Array.isArray(data.schools) ? data.schools[0] : data.schools

    return {
      code: data.code,
      school_id: data.school_id,
      school_name: school?.name_fr || 'Non spécifiée',
      entry_year: data.entry_year,
      valid: true,
    }
  }
}

export const codesService = new CodesService()

