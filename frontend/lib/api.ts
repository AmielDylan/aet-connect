// ═══════════════════════════════════════════════════
// API CLIENT - AET CONNECT
// Client HTTP pour communiquer avec le backend
// Toutes les requêtes vers le vrai backend
// ═══════════════════════════════════════════════════

import { supabase } from './supabase'

import type { 
  User,
  UserProfile,
  UserPrivacy,
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
  async getPrivacySettings(): Promise<UserPrivacy> {
    return this.fetch<UserPrivacy>('/api/users/me/privacy')
  }

  /**
   * Update user privacy settings
   * PATCH /api/users/me/privacy
   */
  async updatePrivacySettings(data: UpdatePrivacyRequest): Promise<UserPrivacy> {
    return this.fetch<UserPrivacy>('/api/users/me/privacy', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
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
  async generateCode(): Promise<GenerateCodeResponse> {
    return this.fetch<GenerateCodeResponse>('/api/codes/generate', {
      method: 'POST',
    })
  }

  /**
   * Get my invitation codes
   * GET /api/codes/my-codes
   */
  async getMyCodes(): Promise<MyCodesResponse> {
    return this.fetch<MyCodesResponse>('/api/codes/my-codes')
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
}

// ═══════════════════════════════════════════════════
// EXPORT SINGLETON INSTANCE
// ═══════════════════════════════════════════════════

export const apiClient = new ApiClient()

