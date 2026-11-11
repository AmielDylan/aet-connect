import type { Metadata } from 'next'
import { ShellEtoffe } from '@/components/auth/auth-shells'
import { ResetPasswordForm } from '@/components/auth/password-forms'

export const metadata: Metadata = {
  title: 'Nouveau mot de passe · AET Connect',
  description: 'Choisir un nouveau mot de passe.',
}

export default function ResetPasswordPage() {
  return (
    <ShellEtoffe>
      <ResetPasswordForm />
    </ShellEtoffe>
  )
}
