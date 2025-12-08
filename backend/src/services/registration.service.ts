import { supabase } from '@/config/database'
// bcrypt supprimé - plus nécessaire avec Supabase Auth
import {
  CheckSchoolPromoResponse,
  AccessRequest,
  User,
  InvitationCode,
  VerifyInvitationCodeResponse
} from '@/models/registration.model'

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
    
    const exists = (count || 0) > 0
    
    if (!exists) {
      return {
        exists: false,
        has_ambassador: false,
        ambassador_info: null,
        member_count: 0
      }
    }
    
    // Chercher l'ambassadeur
    const { data: ambassador } = await supabase
      .from('users')
      .select('id, first_name, last_name, avatar_url')
      .eq('school_id', school_id)
      .eq('entry_year', entry_year)
      .eq('is_ambassador', true)
      .eq('is_active', true)
      .limit(1)
      .single()
    
    return {
      exists: true,
      has_ambassador: !!ambassador,
      ambassador_info: ambassador || null,
      member_count: count || 0
    }
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
  
  // Vérifier un code d'invitation
  async verifyInvitationCode(
    code: string,
    school_id: string,
    entry_year: string
  ): Promise<VerifyInvitationCodeResponse> {
    
    // Récupérer le code avec le nom de l'école
    const { data: invCode, error } = await supabase
      .from('invitation_codes')
      .select(`
        *,
        schools:school_id (
          name_fr
        )
      `)
      .eq('code', code)
      .eq('is_active', true)
      .single()
    
    if (error || !invCode) {
      return { 
        valid: false, 
        message: 'Code invalide ou inexistant. Vérifiez le code fourni par votre ambassadeur.' 
      }
    }
    
    // Vérifier expiration
    if (invCode.expires_at && new Date(invCode.expires_at) < new Date()) {
      return { 
        valid: false, 
        message: 'Ce code a expiré. Contactez votre ambassadeur pour obtenir un nouveau code.' 
      }
    }
    
    // Vérifier nombre d'utilisations
    if (invCode.current_uses >= invCode.max_uses) {
      return { 
        valid: false, 
        message: 'Ce code a atteint son nombre maximum d\'utilisations. Contactez votre ambassadeur pour obtenir un nouveau code.' 
      }
    }
    
    // ═══════════════════════════════════════════════════
    // LOGIQUE PRINCIPALE : Vérifier école + promo
    // ═══════════════════════════════════════════════════
    
    // CAS 1 : Code admin AET Connect → Aucune restriction
    if (invCode.is_admin_code) {
      return { 
        valid: true, 
        code_id: invCode.id, 
        message: 'Code admin valide pour toutes les écoles et promotions',
        school_id: invCode.school_id,
        entry_year: invCode.entry_year,
        school_name: invCode.schools?.name_fr
      }
    }
    
    // CAS 2 : Code membre/ambassadeur → Vérifier correspondance exacte
    
    // Vérification école
    if (invCode.school_id !== school_id) {
      const schoolName = invCode.schools?.name_fr || 'spécifiée'
      return { 
        valid: false, 
        message: `Ce code ne correspond pas à l'école sélectionnée. Vérifiez les informations fournies par votre ambassadeur ou contactez-le pour confirmation.`
      }
    }
    
    // Vérification année
    if (invCode.entry_year !== entry_year) {
      return { 
        valid: false, 
        message: `Ce code ne correspond pas à l'année d'entrée sélectionnée. Vérifiez votre année d'entrée ou contactez votre ambassadeur pour confirmation.`
      }
    }
    
    // Code valide
    return { 
      valid: true, 
      code_id: invCode.id, 
      message: 'Code valide',
      school_id: invCode.school_id,
      entry_year: invCode.entry_year,
      school_name: invCode.schools?.name_fr
    }
  }
  
  // Finaliser l'inscription
  async completeRegistration(data: {
    invitation_code: string
    first_name: string
    last_name: string
    email: string
    password: string
  }): Promise<{ user_id: string }> {
    
    // 1. Récupérer le code
    const { data: invCode, error: codeError } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('code', data.invitation_code)
      .single()
    
    if (codeError || !invCode) {
      throw new Error('Code invalide')
    }

    // Vérifier que le code n'est pas déjà utilisé
    if (invCode.current_uses >= invCode.max_uses) {
      throw new Error('Ce code a déjà été utilisé')
    }

    // Vérifier que le code est actif
    if (!invCode.is_active) {
      throw new Error('Ce code a été révoqué')
    }

    // Vérifier expiration si applicable
    if (invCode.expires_at && new Date(invCode.expires_at) < new Date()) {
      throw new Error('Ce code a expiré')
    }
    
    // 2. Vérifier que l'email n'existe pas déjà (SANS API Admin)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .maybeSingle() // ✅ maybeSingle() pour éviter erreur si pas trouvé
    
    if (existingUser) {
      throw new Error('Un compte existe déjà avec cet email')
    }
    
    // 3. Créer l'utilisateur avec signUp standard (PAS d'API Admin)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          school_id: invCode.school_id,
          entry_year: invCode.entry_year,
          role: 'alumni',
          is_ambassador: false,
          is_active: true,
          max_codes_allowed: 3,
        },
      },
    })
    
    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Erreur lors de la création du compte')
    }

    // Le trigger SQL handle_new_user() créera automatiquement l'entrée dans public.users
    
    // 4. Marquer le code comme utilisé AVEC l'utilisateur et la date
    const { error: updateError } = await supabase
      .from('invitation_codes')
      .update({ 
        current_uses: invCode.current_uses + 1,
        used_by_user_id: authData.user.id, // ✅ Ajouter
        used_at: new Date().toISOString(), // ✅ Ajouter
      })
      .eq('id', invCode.id)
    
    if (updateError) {
      console.error('Error updating code usage:', updateError)
      // Ne pas faire échouer l'inscription si l'incrémentation échoue
    }
    
    return { user_id: authData.user.id }
  }
  
  // Demander un code à un ambassadeur/membre
  async requestCodeFromPeer(data: {
    school_id: string
    entry_year: string
    first_name: string
    last_name: string
    message: string
  }): Promise<{ recipient_name: string }> {
    
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
    
    // Chercher l'ambassadeur ou un membre actif
    const { data: recipient } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('school_id', data.school_id)
      .eq('entry_year', data.entry_year)
      .eq('is_active', true)
      .order('is_ambassador', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    
    if (!recipient) {
      throw new Error('Aucun membre trouvé pour cette promo')
    }
    
    // TODO: Envoyer email/notification au recipient
    // emailService.sendCodeRequestNotification(recipient, data)
    
    return {
      recipient_name: `${recipient.first_name} ${recipient.last_name}`
    }
  }
}

export const registrationService = new RegistrationService()

