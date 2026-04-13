// ═══════════════════════════════════════════════════
// API CLIENT - AET CONNECT
// Client HTTP pour communiquer avec le backend
// Toutes les requêtes vers le vrai backend
// ═══════════════════════════════════════════════════

import { supabase } from './supabase'

import type { 
  User,
  UserProfile,
  UserPrivacySettings,
  AdminStats, 
  SchoolsResponse,
  SchoolWithStats,
  SchoolStatistics,
  PublicUserProfile,
  UpdateProfileRequest,
  UpdatePrivacyRequest,
  Event,
  EventWithDetails,
  CreateEventRequest,
  UpdateEventRequest,
  GenerateCodeResponse,
  MyCodesResponse,
  CheckSchoolPromoRequest,
  CheckSchoolPromoResponse,
  RequestInitialAccessRequest,
  VerifyInvitationCodeRequest,
  VerifyInvitationCodeResponse,
  CompleteRegistrationRequest,
  CompleteRegistrationResponse,
  RequestCodeFromPeerRequest,
  RequestCodeFromPeerResponse,
  ApiError,
  DashboardStats,
  RecentMember
} from '@/types'
import type { DirectoryMember } from '@/types/directory'

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }

  // ═══════════════════════════════════════════════════
  // GENERIC FETCH WRAPPER
  // ═══════════════════════════════════════════════════

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Récupérer le token depuis Supabase Auth
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle non-2xx responses
      if (!response.ok) {
        let errorData: ApiError
        
        try {
          errorData = await response.json()
        } catch {
          // If JSON parsing fails, create a generic error
          errorData = {
            error: `HTTP ${response.status}: ${response.statusText}`,
            message: `HTTP ${response.status}: ${response.statusText}`,
          }
        }
        
        throw new Error(errorData.message || errorData.error || 'Une erreur est survenue')
      }

      // Parse JSON response
      return await response.json()
    } catch (error) {
      // Re-throw if already an Error
      if (error instanceof Error) {
        throw error
      }
      // Otherwise create a generic connection error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  // ═══════════════════════════════════════════════════
  // AUTH ENDPOINTS
  // ═══════════════════════════════════════════════════
  // Note: Login/logout/refresh sont maintenant gérés par Supabase Auth côté client
  // Ces méthodes ont été supprimées car Supabase gère l'authentification nativement

  /**
   * Get current authenticated user
   * GET /api/auth/me
   * Returns User with optional school field (singulier, cohérent avec getMyProfile())
   */
  async getMe(): Promise<User> {
    return this.fetch<User>('/api/auth/me')
  }

  // ═══════════════════════════════════════════════════
  // USER ENDPOINTS
  // ═══════════════════════════════════════════════════

  /**
   * Get current user profile (same as getMe but explicit endpoint)
   * GET /api/users/me
   * Note: Returns UserProfile which includes privacy: UserPrivacy
   */
  async getUserProfile(): Promise<UserProfile> {
    return this.fetch<UserProfile>('/api/users/me')
  }

  /**
   * Update current user profile
   * PATCH /api/users/me
   * Note: Returns UserProfile which includes privacy: UserPrivacy
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    return this.fetch<UserProfile>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Change user password
   * PATCH /api/users/me/password
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<{
    success: boolean
    message: string
  }> {
    return this.fetch<{ success: boolean; message: string }>(
      '/api/users/me/password',
      {
        method: 'PATCH',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      }
    )
  }

  /**
   * Get user privacy settings
   * GET /api/users/me/privacy
   */
  async getPrivacySettings(): Promise<UserPrivacySettings> {
    return this.fetch<UserPrivacySettings>('/api/users/me/privacy')
  }

  /**
   * Update user privacy settings
   * PATCH /api/users/me/privacy
   */
  async updatePrivacySettings(data: UpdatePrivacyRequest): Promise<UserPrivacySettings> {
    const response = await this.fetch<{ success: boolean; privacy: UserPrivacySettings; message: string }>('/api/users/me/privacy', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return response.privacy
  }

  /**
   * Get public user profile by ID
   * GET /api/users/:id
   */
  async getUserById(userId: string): Promise<PublicUserProfile> {
    return this.fetch<PublicUserProfile>(`/api/users/${userId}`)
  }

  /**
   * Get users directory (filtered by privacy)
   * GET /api/users
   */
  async getUsers(params?: {
    school_id?: string
    entry_year?: string
    country?: string
    city?: string
    is_ambassador?: boolean
    search?: string
    limit?: number
    offset?: number
  }): Promise<PublicUserProfile[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const query = queryParams.toString()
    return this.fetch<PublicUserProfile[]>(`/api/users${query ? `?${query}` : ''}`)
  }

  // ═══════════════════════════════════════════════════
  // ADMIN ENDPOINTS
  // ═══════════════════════════════════════════════════

  /**
   * Get admin statistics (requires admin role)
   * GET /api/admin/stats
   */
  async getAdminStats(): Promise<AdminStats> {
    return this.fetch<AdminStats>('/api/admin/stats')
  }

  /**
   * Get admin users list (requires admin role)
   * GET /api/admin/users
   */
  async getAdminUsers(params?: {
    search?: string
    role?: string
    school_id?: string
    is_ambassador?: boolean
    page?: number
    limit?: number
  }): Promise<{ users: any[]; pagination: any }> {
    const queryParams = new URLSearchParams()
    if (params?.search) queryParams.append('search', params.search)
    if (params?.role) queryParams.append('role', params.role)
    if (params?.school_id) queryParams.append('school_id', params.school_id)
    if (params?.is_ambassador) queryParams.append('is_ambassador', 'true')
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    return this.fetch<{ users: any[]; pagination: any }>(`/api/admin/users?${queryParams}`)
  }

  /**
   * Update user role (requires admin role)
   * PATCH /api/admin/users/:id/role
   */
  async updateUserRole(userId: string, role: string): Promise<any> {
    const response = await this.fetch(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    })
    return response
  }

  /**
   * Update user ambassador status (requires admin role)
   * PATCH /api/admin/users/:id/ambassador
   */
  async updateUserAmbassador(userId: string, is_ambassador: boolean): Promise<any> {
    const response = await this.fetch(`/api/admin/users/${userId}/ambassador`, {
      method: 'PATCH',
      body: JSON.stringify({ is_ambassador })
    })
    return response
  }

  /**
   * Delete user (requires admin role)
   * DELETE /api/admin/users/:id
   */
  async deleteUser(userId: string): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Get admin schools list (requires admin role)
   * GET /api/admin/schools
   */
  async getAdminSchools(): Promise<any[]> {
    return this.fetch<any[]>('/api/admin/schools')
  }

  /**
   * Create school (requires admin role)
   * POST /api/admin/schools
   */
  async createSchool(data: any): Promise<any> {
    return this.fetch<any>('/api/admin/schools', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * Update school (requires admin role)
   * PATCH /api/admin/schools/:id
   */
  async updateSchool(id: string, data: any): Promise<any> {
    return this.fetch<any>(`/api/admin/schools/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  /**
   * Delete school (requires admin role)
   * DELETE /api/admin/schools/:id
   */
  async deleteSchool(id: string): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/api/admin/schools/${id}`, {
      method: 'DELETE'
    })
  }

  /**
   * Get access requests (requires admin role)
   * GET /api/admin/access-requests
   */
  async getAccessRequests(status: string = 'pending'): Promise<any[]> {
    return this.fetch<any[]>(`/api/admin/access-requests?status=${status}`)
  }

  /**
   * Approve access request (requires admin role)
   * POST /api/admin/access-requests/:id/approve
   */
  async approveAccessRequest(id: string): Promise<{ success: boolean; code: string; email: string }> {
    return this.fetch<{ success: boolean; code: string; email: string }>(`/api/admin/access-requests/${id}/approve`, {
      method: 'POST'
    })
  }

  /**
   * Reject access request (requires admin role)
   * POST /api/admin/access-requests/:id/reject
   */
  async rejectAccessRequest(id: string, reason?: string): Promise<{ success: boolean }> {
    return this.fetch<{ success: boolean }>(`/api/admin/access-requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  /**
   * Request account deletion (authenticated user)
   * POST /api/users/me/deletion-request
   */
  async requestAccountDeletion(reason?: string): Promise<{ success: boolean; message: string }> {
    return this.fetch<{ success: boolean; message: string }>('/api/users/me/deletion-request', {
      method: 'POST',
      body: JSON.stringify({ reason })
    })
  }

  /**
   * Get deletion requests (requires admin role)
   * GET /api/admin/deletion-requests
   */
  async getDeletionRequests(status: string = 'pending'): Promise<any[]> {
    return this.fetch<any[]>(`/api/admin/deletion-requests?status=${status}`)
  }

  /**
   * Approve deletion request (requires admin role)
   * POST /api/admin/deletion-requests/:id/approve
   */
  async approveDeletionRequest(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetch<{ success: boolean; message: string }>(`/api/admin/deletion-requests/${id}/approve`, {
      method: 'POST'
    })
  }

  /**
   * Reject deletion request (requires admin role)
   * POST /api/admin/deletion-requests/:id/reject
   */
  async rejectDeletionRequest(id: string): Promise<{ success: boolean; message: string }> {
    return this.fetch<{ success: boolean; message: string }>(`/api/admin/deletion-requests/${id}/reject`, {
      method: 'POST'
    })
  }

  /**
   * Get public user profile (no auth required)
   * GET /api/users/profile/:id
   */
  async getPublicProfile(userId: string): Promise<any> {
    // Cette route est publique, pas besoin d'authentification
    const response = await fetch(`${this.baseURL}/api/users/profile/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Utilisateur non trouvé')
      }
      throw new Error('Erreur lors du chargement du profil')
    }
    
    return response.json()
  }

  // ═══════════════════════════════════════════════════
  // SCHOOLS ENDPOINTS
  // ═══════════════════════════════════════════════════

  /**
   * Get all schools with aggregated stats
   * GET /api/schools
   */
  async getSchools(params?: {
    country?: string
    is_active?: boolean
  }): Promise<SchoolsResponse> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const query = queryParams.toString()
    return this.fetch<SchoolsResponse>(`/api/schools${query ? `?${query}` : ''}`)
  }

  /**
   * Get school by ID
   * GET /api/schools/:id
   */
  async getSchoolById(schoolId: string): Promise<SchoolWithStats> {
    return this.fetch<SchoolWithStats>(`/api/schools/${schoolId}`)
  }

  /**
   * Get school detailed statistics
   * GET /api/schools/:id/stats
   */
  async getSchoolStats(schoolId: string): Promise<SchoolStatistics> {
    return this.fetch<SchoolStatistics>(`/api/schools/${schoolId}/stats`)
  }

  // ═══════════════════════════════════════════════════
  // EVENTS ENDPOINTS
  // ═══════════════════════════════════════════════════

  /**
   * Get events list
   * GET /api/events
   */
  async getEvents(params?: {
    country?: string
    city?: string
    date_from?: string
    date_to?: string
    status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
    created_by?: string
    limit?: number
    offset?: number
  }): Promise<EventWithDetails[]> {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value))
        }
      })
    }
    const query = queryParams.toString()
    return this.fetch<EventWithDetails[]>(`/api/events${query ? `?${query}` : ''}`)
  }

  /**
   * Get event by ID
   * GET /api/events/:id
   */
  async getEventById(eventId: string): Promise<EventWithDetails> {
    return this.fetch<EventWithDetails>(`/api/events/${eventId}`)
  }

  /**
   * Create event
   * POST /api/events
   */
  async createEvent(data: CreateEventRequest): Promise<Event> {
    return this.fetch<Event>('/api/events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update event
   * PATCH /api/events/:id
   */
  async updateEvent(eventId: string, data: UpdateEventRequest): Promise<Event> {
    return this.fetch<Event>(`/api/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete event
   * DELETE /api/events/:id
   */
  async deleteEvent(eventId: string): Promise<void> {
    await this.fetch<void>(`/api/events/${eventId}`, {
      method: 'DELETE',
    })
  }

  /**
   * Register to event
   * POST /api/events/:id/register
   */
  async registerToEvent(eventId: string): Promise<void> {
    await this.fetch<void>(`/api/events/${eventId}/register`, {
      method: 'POST',
    })
  }

  /**
   * Unregister from event
   * DELETE /api/events/:id/unregister
   */
  async unregisterFromEvent(eventId: string): Promise<void> {
    await this.fetch<void>(`/api/events/${eventId}/unregister`, {
      method: 'DELETE',
    })
  }

  /**
   * Get event participants
   * GET /api/events/:id/participants
   */
  async getEventParticipants(eventId: string) {
    return this.fetch<Array<{
      id: string
      first_name: string
      last_name: string
      avatar_url: string | null
    }>>(`/api/events/${eventId}/participants`)
  }

  // ═══════════════════════════════════════════════════
  // CODES ENDPOINTS
  // ═══════════════════════════════════════════════════

  /**
   * Generate invitation code
   * POST /api/codes/generate
   */
  async generateCode(data?: { school_id?: string; entry_year?: string }): Promise<GenerateCodeResponse> {
    return this.fetch<GenerateCodeResponse>('/api/codes/generate', {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * Get my invitation codes
   * GET /api/codes/my-codes
   */
  async getMyCodes(): Promise<MyCodesResponse> {
    return this.fetch<MyCodesResponse>('/api/codes/my-codes')
  }

  /**
   * Verify an invitation code and get its info (no auth required)
   * GET /api/codes/verify/:code
   */
  async verifyCodeInfo(code: string): Promise<{
    code: string
    school_id: string
    school_name: string
    entry_year: string
    valid: boolean
  }> {
    const response = await fetch(
      `${this.baseURL}/api/codes/verify/${code}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Code invalide')
    }

    return response.json()
  }

  /**
   * Delete an invitation code
   * DELETE /api/codes/:id
   */
  async deleteCode(codeId: string): Promise<void> {
    await this.fetch(`/api/codes/${codeId}`, {
      method: 'DELETE',
    })
  }

  // Récupérer l'historique des codes utilisés
  async getCodesHistory(): Promise<{ codes: Array<{
    id: string
    code: string
    school_name: string
    entry_year: string
    created_at: string
    used_at: string
    used_by: {
      id: string
      first_name: string
      last_name: string
      email: string
    } | null
  }> }> {
    return this.fetch('/api/codes/history')
  }

  // ═══════════════════════════════════════════════════
  // REGISTRATION ENDPOINTS
  // ═══════════════════════════════════════════════════

  /**
   * Vérifier si une école/promo existe
   * POST /api/register/check-school-promo
   */
  async checkSchoolPromo(
    data: CheckSchoolPromoRequest
  ): Promise<CheckSchoolPromoResponse> {
    return this.fetch<CheckSchoolPromoResponse>('/api/register/check-school-promo', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Demander un accès initial (première inscription d'une promo)
   * POST /api/register/request-initial-access
   */
  async requestInitialAccess(
    data: RequestInitialAccessRequest
  ): Promise<{ success: boolean; request_id: string; message: string }> {
    return this.fetch<{ success: boolean; request_id: string; message: string }>(
      '/api/register/request-initial-access',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  }

  /**
   * Vérifier la validité d'un code d'invitation
   * POST /api/register/verify-invitation-code
   */
  async verifyInvitationCode(
    data: VerifyInvitationCodeRequest
  ): Promise<VerifyInvitationCodeResponse> {
    return this.fetch<VerifyInvitationCodeResponse>('/api/register/verify-invitation-code', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Finaliser l'inscription avec un code valide
   * POST /api/register/complete-registration
   */
  async completeRegistration(
    data: CompleteRegistrationRequest
  ): Promise<CompleteRegistrationResponse> {
    return this.fetch<CompleteRegistrationResponse>('/api/register/complete-registration', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Demander un code d'invitation à un pair/ambassadeur
   * POST /api/register/request-code-from-peer
   */
  async requestCodeFromPeer(
    data: RequestCodeFromPeerRequest
  ): Promise<RequestCodeFromPeerResponse> {
    return this.fetch<RequestCodeFromPeerResponse>('/api/register/request-code-from-peer', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // ═══════════════════════════════════════════════════
  // DASHBOARD ENDPOINTS
  // ═══════════════════════════════════════════════════

  /**
   * Get dashboard stats
   * GET /api/dashboard/stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return this.fetch<DashboardStats>('/api/dashboard/stats')
  }

  /**
   * Get recent members of my promotion
   * GET /api/dashboard/recent
   */
  async getDashboardRecentMembers(): Promise<RecentMember[]> {
    return this.fetch<RecentMember[]>('/api/dashboard/recent')
  }

  /**
   * Get members directory with filters
   * GET /api/users
   */
  async getMembers(params: {
    search?: string
    school_id?: string
    entry_year?: string
    country?: string
    city?: string
    limit?: number
    offset?: number
  }): Promise<{ users: DirectoryMember[]; total: number }> {
    const searchParams = new URLSearchParams()
    
    if (params.search) searchParams.append('search', params.search)
    if (params.school_id) searchParams.append('school_id', params.school_id)
    if (params.entry_year) searchParams.append('entry_year', params.entry_year)
    if (params.country) searchParams.append('country', params.country)
    if (params.city) searchParams.append('city', params.city)
    if (params.limit) searchParams.append('limit', params.limit.toString())
    if (params.offset) searchParams.append('offset', params.offset.toString())

    const response = await this.fetch<{ users: User[]; total: number }>(
      `/api/users?${searchParams.toString()}`
    )
    
    // Mapper User[] vers DirectoryMember[]
    const members: DirectoryMember[] = response.users.map((user) => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar_url: user.avatar_url,
      school_name: user.school?.name_fr || 'Non spécifiée',
      entry_year: user.entry_year || 'N/A',
      current_city: user.current_city,
      current_country: user.current_country,
      is_ambassador: user.is_ambassador,
      bio: user.bio,
    }))

    return {
      users: members,
      total: response.total,
    }
  }

  /**
   * Get filter years (entry years)
   * GET /api/users/filters/years
   */
  async getFilterYears(schoolId?: string): Promise<{ years: string[] }> {
    const query = schoolId ? `?school_id=${schoolId}` : ''
    return this.fetch<{ years: string[] }>(`/api/users/filters/years${query}`)
  }

  /**
   * Get filter cities
   * GET /api/users/filters/cities
   */
  async getFilterCities(): Promise<{ cities: string[] }> {
    return this.fetch<{ cities: string[] }>('/api/users/filters/cities')
  }

  /**
   * Get filter countries
   * GET /api/users/filters/countries
   */
  async getFilterCountries(): Promise<{ countries: string[] }> {
    return this.fetch<{ countries: string[] }>('/api/users/filters/countries')
  }
}

// ═══════════════════════════════════════════════════
// EXPORT SINGLETON INSTANCE
// ═══════════════════════════════════════════════════

const apiClient = new ApiClient()

export { apiClient }

