import { Check, X } from 'lucide-react'
import { PasswordValidation } from '@/types/profile'

interface PasswordStrengthProps {
  password: string
  validation: PasswordValidation
}

export function PasswordStrength({ password, validation }: PasswordStrengthProps) {
  if (!password) return null

  const checks = [
    { label: 'Au moins 8 caractères', valid: validation.minLength },
    { label: 'Une lettre majuscule', valid: validation.hasUppercase },
    { label: 'Une lettre minuscule', valid: validation.hasLowercase },
    { label: 'Un chiffre', valid: validation.hasNumber },
    { label: 'Un caractère spécial (@$!%*?&)', valid: validation.hasSpecialChar },
  ]

  return (
    <div className="space-y-2 mt-2">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-2 text-sm">
          {check.valid ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={check.valid ? 'text-green-600' : 'text-muted-foreground'}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  )
}



