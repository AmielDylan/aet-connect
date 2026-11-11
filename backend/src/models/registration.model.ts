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

// Route publique : seulement l'existence de la promo, rien sur ses membres
export interface CheckSchoolPromoResponse {
  exists: boolean
}

