import { supabase } from '@/config/database'

// Lecture des codes d'un membre. Émettre, vérifier, consommer et révoquer :
// voir le module Code d'invitation (src/invitations).
export class CodesService {
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
        status:invitation_code_status,
        schools:school_id (
          name_fr
        )
      `)
      .eq('created_by_user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  }
}

export const codesService = new CodesService()
