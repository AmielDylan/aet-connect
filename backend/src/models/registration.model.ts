// Types pour le module Registration

export interface AccessRequest {
  id: string
  first_name: string
  last_name: string
  email: string
  school_id: string
  entry_year: string
  message: string | null
  wants_ambassador: boolean
  status: 'pending' | 'approved' | 'rejected'
  invitation_code_id: string | null
  created_at: string
  processed_at: string | null
}

// DTOs (Data Transfer Objects)

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

