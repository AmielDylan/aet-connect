export interface InvitationCode {
  id?: string // Optionnel car le backend ne le retourne pas toujours
  code: string
  school_id?: string // Optionnel car le backend ne le retourne pas toujours
  school_name: string
  entry_year?: string // Optionnel car le backend ne le retourne pas toujours
  max_uses: number
  current_uses: number
  created_at: string
  expires_at: string | null
  is_revoked?: boolean // Optionnel, utilise is_active à la place
  is_active?: boolean // Utilisé par le backend
}

export interface GenerateCodeData {
  school_id?: string // Optionnel car le backend utilise l'utilisateur connecté
  entry_year?: string // Optionnel car le backend utilise l'utilisateur connecté
  max_uses?: number
  expires_at?: string
}

export interface GenerateCodeResponse {
  success: boolean
  code: string
  codes_remaining: number
}

