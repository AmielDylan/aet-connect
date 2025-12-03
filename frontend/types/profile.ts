export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  current_city?: string
  current_country?: string
  bio?: string
  avatar_url?: string | null
}

export interface ChangePasswordData {
  old_password: string
  new_password: string
  confirm_password: string
}

export interface PasswordValidation {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}



