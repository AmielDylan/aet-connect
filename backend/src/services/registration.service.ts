import { supabase } from '@/config/database'
import { logger } from '@/utils/logger'
import type { Grant } from '@/invitations'
import { CheckSchoolPromoResponse, AccessRequest } from '@/models/registration.model'

export class RegistrationService {
  
  // Vérifier si une école/promo existe
  async checkSchoolPromo(
    school_id: string,
    entry_year: string
  ): Promise<CheckSchoolPromoResponse> {
    
    // Valider l'année d'entrée selon established_year de l'école
    const { data: school } = await supabase
      .from('schools')
      .select('established_year')
      .eq('id', school_id)
      .single()
    
    if (school) {
      const entryYearNum = parseInt(entry_year, 10)
      const minYear = school.established_year || 1950
      
      if (entryYearNum < minYear) {
        throw new Error(
          school.established_year 
            ? `Cette école a été créée en ${school.established_year}. L'année minimale est ${school.established_year}.`
            : 'Année d\'entrée invalide'
        )
      }
    }
    
    // Compter les membres de cette promo
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', school_id)
      .eq('entry_year', entry_year)
    
    if (countError) throw countError
    
    // Route publique : on dit seulement si la promo a des membres, rien sur eux (ni nom, ni photo, ni nombre)
    return { exists: (count || 0) > 0 }
  }

  // Créer une demande d'accès initiale
  async createAccessRequest(data: {
    school_id: string
    entry_year: string
    first_name: string
    last_name: string
    email: string
    message: string
    wants_ambassador: boolean
  }): Promise<AccessRequest> {
    
    // Vérifier que l'email n'est pas déjà utilisé
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()
    
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé')
    }
    
    // Vérifier aussi dans access_requests
    const { data: existingRequest } = await supabase
      .from('access_requests')
      .select('id')
      .eq('email', data.email)
      .eq('status', 'pending')
      .maybeSingle()
    
    if (existingRequest) {
      throw new Error('Une demande est déjà en attente pour cet email')
    }
    
    // Valider l'année d'entrée selon established_year de l'école
    const { data: school } = await supabase
      .from('schools')
      .select('established_year')
      .eq('id', data.school_id)
      .single()
    
    if (school) {
      const entryYearNum = parseInt(data.entry_year, 10)
      const minYear = school.established_year || 1950
      
      if (entryYearNum < minYear) {
        throw new Error(
          school.established_year 
            ? `Cette école a été créée en ${school.established_year}. L'année minimale est ${school.established_year}.`
            : 'Année d\'entrée invalide'
        )
      }
    }
    
    const { data: request, error } = await supabase
      .from('access_requests')
      .insert({
        school_id: data.school_id,
        entry_year: data.entry_year,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        message: data.message,
        wants_ambassador: data.wants_ambassador,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    
    return request as AccessRequest
  }
  
  // Créer le compte d'un nouveau membre (appelé par invitations.redeem, qui gère le code).
  // Le trigger handle_new_user écrit la fiche et les réglages de confidentialité dans la
  // même transaction : si l'un échoue, aucun compte n'est créé et le module rend le code.
  async createMemberAccount(
    grant: Grant,
    identity: { first_name: string; last_name: string; email: string; password: string }
  ): Promise<string> {
    const { data, error } = await supabase.auth.admin.createUser({
      email: identity.email,
      password: identity.password,
      email_confirm: true,
      // Identité seulement : le trigger n'accorde aucun droit depuis les métadonnées
      user_metadata: {
        first_name: identity.first_name,
        last_name: identity.last_name,
        school_id: grant.promo.schoolId,
        entry_year: grant.promo.entryYear,
      },
    })

    if (error || !data.user) {
      if (error?.code === 'email_exists' || /already been registered/i.test(error?.message ?? '')) {
        throw new Error('Un compte existe déjà avec cet email')
      }
      logger.error('Error creating member account:', error)
      throw new Error("Impossible de créer le compte. Vérifiez l'école et l'année choisies, puis réessayez.")
    }

    return data.user.id
  }

  // Demander un code quand la promo a déjà des membres : la demande va aux administrateurs (demandes d'accès),
  // qui transmettent un code. Aucun membre n'est révélé au visiteur.
  async requestCodeFromPeer(data: {
    school_id: string
    entry_year: string
    first_name: string
    last_name: string
    email: string
    message: string
  }): Promise<AccessRequest> {
    return this.createAccessRequest({ ...data, wants_ambassador: false })
  }
}

export const registrationService = new RegistrationService()

