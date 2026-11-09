export interface UserPrivacySettings {
  show_email: boolean
  show_phone: boolean
  show_current_location: boolean
  show_bio: boolean
  show_linkedin: boolean
  show_entry_year: boolean
  show_in_directory: boolean
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

