import type { Metadata } from 'next'
import { ShellEtoffe } from '@/components/auth/auth-shells'
import { ForgotPasswordForm } from '@/components/auth/password-forms'

export const metadata: Metadata = {
  title: 'Mot de passe oublié · AET Connect',
  description: 'Recevoir un lien pour choisir un nouveau mot de passe.',
}

export default function ForgotPasswordPage() {
  return (
    <ShellEtoffe>
      <ForgotPasswordForm />
    </ShellEtoffe>
  )
}
