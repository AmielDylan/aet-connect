import { supabase } from '@/config/database'
import { UpdateProfileRequest, UserPrivacySettings } from '@/models/user.model'

export class UsersService {
  
  
  
  
  // Mon profil complet (toutes infos) - AUTH REQUIS
  async getMyProfile(user_id: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        school:school_id (
          id,
          name_fr,
          country
        ),
        privacy:user_privacy_settings!user_privacy_settings_user_id_fkey (*)
      `)
      .eq('id', user_id)
      .single()
    
    if (error || !user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    const privacy = Array.isArray(user.privacy) ? user.privacy[0] : user.privacy
    
    return {
      ...user,
      school: Array.isArray(user.school) ? user.school[0] : user.school,
      privacy: privacy || null
    }
  }
  
  // Modifier mon profil - AUTH REQUIS
  async updateMyProfile(user_id: string, data: UpdateProfileRequest) {
    // Filtrer uniquement les champs modifiables (exclure email, role, etc.)
    const allowedFields: (keyof UpdateProfileRequest)[] = [
      'first_name',
      'last_name',
      'current_city',
      'current_country',
      'bio',
      'phone',
      'linkedin_url',
      'avatar_url'
    ]
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    
    // Ne garder que les champs autorisés
    // Un champ facultatif vidé par le membre est effacé (null), pas enregistré comme chaîne vide
    const effacables: (keyof UpdateProfileRequest)[] = ['current_city', 'current_country', 'bio', 'phone', 'linkedin_url']
    allowedFields.forEach(field => {
      if (data[field] === undefined) return
      const valeur = typeof data[field] === 'string' ? (data[field] as string).trim() : data[field]
      updateData[field] = valeur === '' && effacables.includes(field) ? null : valeur
    })
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user_id)
      .select(`
        *,
        school:school_id (
          id,
          name_fr,
          country
        )
      `)
      .single()
    
    if (error) throw error
    
    return {
      ...user,
      school: Array.isArray(user.school) ? user.school[0] : user.school
    }
  }
  
  // Réglages de confidentialité : créés par le trigger handle_new_user à l'inscription,
  // ils existent toujours pour un membre.
  private toPrivacySettings(row: any): UserPrivacySettings {
    return {
      show_email: row.show_email,
      show_phone: row.show_phone,
      show_current_location: row.show_current_location,
      show_bio: row.show_bio,
      show_linkedin: row.show_linkedin,
      show_entry_year: row.show_entry_year,
      show_in_directory: row.show_in_directory
    }
  }

  // Récupérer mes privacy settings - AUTH REQUIS
  async getMyPrivacy(user_id: string): Promise<UserPrivacySettings> {
    const { data, error } = await supabase
      .from('user_privacy_settings')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error) throw error
    return this.toPrivacySettings(data)
  }

  // Modifier mes privacy settings - AUTH REQUIS
  async updateMyPrivacy(user_id: string, data: Partial<UserPrivacySettings>): Promise<UserPrivacySettings> {
    // Seuls ces réglages s'écrivent (le corps de la requête n'est pas filtré par la validation) ;
    // la promo se voit toujours : show_entry_year n'en fait plus partie
    const modifiables: (keyof UserPrivacySettings)[] = ['show_email', 'show_phone', 'show_current_location', 'show_bio', 'show_linkedin', 'show_in_directory']
    const changes: Partial<UserPrivacySettings> = {}
    for (const cle of modifiables) {
      if (typeof data[cle] === 'boolean') changes[cle] = data[cle]
    }
    const { data: privacy, error } = await supabase
      .from('user_privacy_settings')
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) throw error
    return this.toPrivacySettings(privacy)
  }

}

export const usersService = new UsersService()

