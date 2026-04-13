// ═══════════════════════════════════════════════════
// TYPES AET CONNECT - Correspondance exacte avec l'API
// Backend: http://localhost:3001
// Documentation: https://github.com/AmielDylan/AET-Connect
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// SCHOOL ENTITY
// ═══════════════════════════════════════════════════

export interface School {
  id: string
  name_fr: string
  name_en: string | null
  country: string
  city: string
  established_year: number | null
  is_active: boolean
  logo_url?: string | null
  description?: string | null
  website?: string | null
  created_at?: string
  updated_at?: string
}

export interface SchoolWithStats extends School {
  total_members: number
  total_ambassadors: number
  total_events: number
}

export interface SchoolStatistics {
  school_id: string
  school_name: string
  statistics: {
    total_members: number
    total_ambassadors: number
    total_events_organized: number
    total_codes_generated: number
    by_entry_year: Array<{ year: string; count: number }>
    by_current_country: Array<{ country: string; count: number }>
    growth_trend: Array<{ month: string; new_members: number }>
  }
}

// ═══════════════════════════════════════════════════
// USER ENTITY
// ═══════════════════════════════════════════════════

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'alumni' | 'moderator' | 'admin'
  school_id: string | null
  school_name?: string // ✅ Ajouter cette propriété
  entry_year: string | null
  current_city: string | null
  current_country: string | null
  bio: string | null
  phone: string | null
  linkedin_url: string | null
  avatar_url: string | null
  is_ambassador: boolean
  is_active: boolean
  password_hash?: string // Optionnel (pas toujours exposé dans les réponses API)
  max_codes_allowed: number | null
  school?: School | null // Optionnel et nullable
  privacy?: UserPrivacySettings | null
  events_participated?: number
  codes_generated?: number
  created_at: string
  updated_at: string
}

export interface UserPrivacySettings {
  show_email: boolean
  show_phone: boolean
  show_current_location: boolean
  show_bio: boolean
  show_linkedin: boolean
  show_entry_year: boolean
  show_in_directory: boolean
}

export interface UserPrivacy {
  id: string
  user_id: string
  show_email: boolean
  show_phone: boolean
  show_current_location: boolean
  show_bio: boolean
  show_linkedin: boolean
  show_entry_year: boolean
  show_in_directory: boolean
  created_at: string
  updated_at: string
}

// UserWithSchool pour les cas où school est garanti non-null
export interface UserWithSchool extends Omit<User, 'school'> {
  school: School // Non-nullable
}

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: 'alumni' | 'moderator' | 'admin'
  school_id: string | null
  entry_year: string | null
  current_city: string | null
  current_country: string | null
  bio: string | null
  phone: string | null
  linkedin_url: string | null
  avatar_url: string | null
  is_ambassador: boolean
  is_active: boolean
  password_hash: string
  max_codes_allowed: number | null
  school?: School | null
  privacy: UserPrivacy
  events_participated?: number
  codes_generated?: number
  created_at: string
  updated_at: string
}

export interface PublicUserProfile {
  id: string
  first_name: string
  last_name: string
  school?: {
    id: string
    name_fr: string
    country: string
  } | null
  entry_year?: string | null
  current_city?: string | null
  current_country?: string | null
  bio?: string | null
  linkedin_url?: string | null
  email?: string | null
  phone?: string | null
  avatar_url?: string | null
  is_ambassador: boolean
  events_participated?: number
  codes_generated?: number
}

// ═══════════════════════════════════════════════════
// AUTH RESPONSES
// ═══════════════════════════════════════════════════

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user: {
    id: string
    email: string
    first_name: string
    last_name: string
    role: 'alumni' | 'moderator' | 'admin'
    is_ambassador: boolean
    school_id: string | null
    entry_year: string
  }
  access_token: string
  refresh_token: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface RefreshTokenResponse {
  success: boolean
  access_token: string
  refresh_token: string
}

// ═══════════════════════════════════════════════════
// ADMIN STATS
// ═══════════════════════════════════════════════════

export interface AdminStats {
  overview: {
    totalUsers: number
    newUsers: number
    totalSchools: number
    totalCodes: number
    usedCodes: number
    pendingRequests: number
    totalRequests: number
    approvedRequests: number
    pendingDeletions: number
  }
  roles: Record<string, number>
  schools: Record<string, number>
}

// ═══════════════════════════════════════════════════
// DELETION REQUEST
// ═══════════════════════════════════════════════════

export interface DeletionRequest {
  id: string
  user_id: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  processed_at: string | null
  processed_by_admin_id: string | null
  users?: {
    id: string
    first_name: string
    last_name: string
    email: string
    schools?: { id: string; name_fr: string; acronym: string | null } | null
  } | null
}

// ═══════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled'

export interface Event {
  id: string
  title: string
  description: string | null
  event_date: string
  event_end_date: string
  city: string
  country: string
  address: string | null
  latitude: number | null
  longitude: number | null
  max_participants: number | null
  status: EventStatus
  created_by_user_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EventWithDetails extends Event {
  creator?: {
    id: string
    first_name: string
    last_name: string
    is_ambassador: boolean
  }
  participant_count?: number
  is_registered?: boolean
  participants?: Array<{
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
  }>
}

export interface CreateEventRequest {
  title: string
  description?: string
  event_date: string
  event_end_date: string
  city: string
  country: string
  address?: string
  latitude?: number
  longitude?: number
  max_participants?: number
  status?: EventStatus
}

export interface UpdateEventRequest {
  title?: string
  description?: string
  event_date?: string
  event_end_date?: string
  city?: string
  country?: string
  address?: string
  latitude?: number
  longitude?: number
  max_participants?: number
  status?: EventStatus
  is_active?: boolean
}

// ═══════════════════════════════════════════════════
// REGISTRATION
// ═══════════════════════════════════════════════════

export interface CheckSchoolPromoRequest {
  school_id: string
  entry_year: string
}

export interface CheckSchoolPromoResponse {
  exists: boolean
  has_ambassador: boolean
  ambassador_info: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
  } | null
  member_count: number
}

export interface RequestInitialAccessRequest {
  school_id: string
  entry_year: string
  first_name: string
  last_name: string
  email: string
  message: string
  wants_ambassador: boolean
}

export interface VerifyInvitationCodeRequest {
  code: string
  school_id: string
  entry_year: string
}

export interface VerifyInvitationCodeResponse {
  valid: boolean
  code_id?: string
  message: string
  school_id?: string
  entry_year?: string
  school_name?: string
}

export interface CompleteRegistrationRequest {
  invitation_code: string
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface CompleteRegistrationResponse {
  success: boolean
  user_id: string
  message: string
}

export interface RequestCodeFromPeerRequest {
  school_id: string
  entry_year: string
  first_name: string
  last_name: string
  message: string
}

export interface RequestCodeFromPeerResponse {
  success: boolean
  recipient_name: string
  message: string
}

// ═══════════════════════════════════════════════════
// CODES
// ═══════════════════════════════════════════════════

export interface InvitationCode {
  id: string
  code: string
  school_id: string
  entry_year: string
  created_by_user_id: string
  is_admin_code: boolean
  max_uses: number
  current_uses: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface GenerateCodeResponse {
  success: boolean
  code: string
  codes_remaining: number
}

export interface MyCodesResponse {
  codes: InvitationCode[]
  total: number
}

// ═══════════════════════════════════════════════════
// SCHOOLS RESPONSES
// ═══════════════════════════════════════════════════

export interface SchoolsResponse {
  schools: SchoolWithStats[]
  total: number
}

// ═══════════════════════════════════════════════════
// USERS RESPONSES
// ═══════════════════════════════════════════════════

export interface UsersResponse {
  users: PublicUserProfile[]
  total?: number
}

export interface UpdateProfileRequest {
  first_name?: string
  last_name?: string
  current_city?: string
  current_country?: string
  bio?: string
  phone?: string
  linkedin_url?: string
  avatar_url?: string
}

export interface UpdatePrivacyRequest {
  show_email?: boolean
  show_phone?: boolean
  show_current_location?: boolean
  show_bio?: boolean
  show_linkedin?: boolean
  show_entry_year?: boolean
  show_in_directory?: boolean
}

// ═══════════════════════════════════════════════════
// API ERROR
// ═══════════════════════════════════════════════════

export interface ApiError {
  error: string
  message?: string
  details?: unknown
}

// ═══════════════════════════════════════════════════
// GENERIC API RESPONSE WRAPPER
// ═══════════════════════════════════════════════════

export interface ApiResponse<T> {
  data?: T
  message?: string
  success?: boolean
}

// ═══════════════════════════════════════════════════
// DASHBOARD TYPES
// ═══════════════════════════════════════════════════

export interface DashboardStats {
  myPromoCount: number
  mySchoolCount: number
  totalNetworkCount: number
}

export interface RecentMember {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  created_at: string
}

// ═══════════════════════════════════════════════════
// PROFILE TYPES
// ═══════════════════════════════════════════════════

export * from './profile'

// ═══════════════════════════════════════════════════
// UTILITY TYPES
// ═══════════════════════════════════════════════════

export type UserRole = User['role']
