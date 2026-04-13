'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrength } from '@/components/profile/password-strength'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import type { PasswordValidation } from '@/types/profile'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validation, setValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsReady(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  const validatePassword = (password: string) => {
    setValidation({
      minLength:      password.length >= 8,
      hasUppercase:   /[A-Z]/.test(password),
      hasLowercase:   /[a-z]/.test(password),
      hasNumber:      /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password),
    })
  }

  const isValid = Object.values(validation).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || newPassword !== confirmPassword) return
    setIsLoading(true)
    setError(null)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) {
        setError(updateError.message)
      } else {
        setSuccess(true)
        setTimeout(() => router.push('/login'), 3000)
      }
    } catch {
      setError('Une erreur inattendue est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#242424] mb-4">
          <span className="text-sm font-bold text-white leading-none">AET</span>
        </div>
        <h1 className="font-cal text-[28px] text-[#111111]">Nouveau mot de passe</h1>
        <p className="mt-1.5 text-sm text-[#898989]">Choisissez un mot de passe sécurisé</p>
      </div>

      {/* Card */}
      <div className="rounded-xl bg-white p-6 shadow-cal-card">
        {success ? (
          <div className="flex items-start gap-3 rounded-lg bg-[#f5f5f5] p-4">
            <CheckCircle2 className="h-4 w-4 text-[#242424] shrink-0 mt-0.5" />
            <p className="text-sm text-[#111111]">
              Mot de passe mis à jour avec succès. Redirection vers la connexion…
            </p>
          </div>
        ) : !isReady ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#898989]" />
            <p className="text-sm text-[#898989]">Vérification du lien en cours…</p>
            <p className="text-xs text-[#898989]">
              Le lien a peut-être expiré.{' '}
              <button
                className="underline hover:text-[#111111] transition-colors"
                onClick={() => router.push('/forgot-password')}
              >
                Demander un nouveau lien
              </button>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="new_password" className="text-sm font-medium text-[#111111]">
                Nouveau mot de passe
              </Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); validatePassword(e.target.value) }}
                disabled={isLoading}
                className="h-9 text-sm border-[rgba(34,42,53,0.2)] focus-visible:ring-[#242424]/20"
                required
              />
              <PasswordStrength password={newPassword} validation={validation} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password" className="text-sm font-medium text-[#111111]">
                Confirmer le mot de passe
              </Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                className="h-9 text-sm border-[rgba(34,42,53,0.2)] focus-visible:ring-[#242424]/20"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !isValid || newPassword !== confirmPassword || !confirmPassword}
              className="w-full h-9 rounded-lg bg-[#242424] text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ boxShadow: 'rgba(255,255,255,0.15) 0px 2px 0px inset, rgba(34,42,53,0.20) 0px 1px 3px 0px' }}
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isLoading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
