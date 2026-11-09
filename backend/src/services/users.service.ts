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
    
    // Compter événements et codes
    const { count: eventsCount } = await supabase
      .from('event_participants')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
    
    const { count: codesCount } = await supabase
      .from('invitation_codes')
      .select('*', { count: 'exact', head: true })
      .eq('created_by_user_id', user_id)
    
    const privacy = Array.isArray(user.privacy) ? user.privacy[0] : user.privacy
    
    return {
      ...user,
      school: Array.isArray(user.school) ? user.school[0] : user.school,
      privacy: privacy || null,
      events_participated: eventsCount || 0,
      codes_generated: codesCount || 0
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
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field]
      }
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
    const { data: privacy, error } = await supabase
      .from('user_privacy_settings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .select()
      .single()

    if (error) throw error
    return this.toPrivacySettings(privacy)
  }

}

export const usersService = new UsersService()

