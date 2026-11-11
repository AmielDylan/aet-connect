'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

/** N'accepte qu'un chemin interne : jamais une adresse externe (pas de redirection ouverte) */
export function safeRedirect(value: string | null): string {
  if (!value) return '/dashboard'
  const path = (() => {
    try {
      return decodeURIComponent(value)
    } catch {
      return value
    }
  })()
  return path.startsWith('/') && !path.startsWith('//') && !path.startsWith('/\\') ? path : '/dashboard'
}

/** Message lisible pour une erreur de connexion Supabase */
function loginErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : ''
  if (/invalid login credentials/i.test(message)) return 'Cet email et ce mot de passe ne correspondent à aucun compte. Un oubli\u00A0? Le lien «\u00A0Mot de passe oublié\u00A0» est là pour ça.'
  if (/email not confirmed/i.test(message)) return 'Votre adresse email n’est pas encore confirmée\u00A0: le lien de confirmation vous attend dans votre boîte mail.'
  if (/too many|rate limit/i.test(message)) return 'Beaucoup de tentatives d’affilée\u00A0: mieux vaut patienter une minute avant de réessayer.'
  return 'La connexion n’a pas abouti. Votre réseau est peut-être instable\u00A0: vous pouvez réessayer dans un instant.'
}

type Tone = 'clair' | 'vert'

// Le formulaire de connexion, commun à toutes les mises en page.
// tone="clair" : posé sur crème ou blanc ; tone="vert" : posé sur le vert profond.
export function LoginForm({ tone = 'clair' }: { tone?: Tone }) {
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const redirect = safeRedirect(searchParams.get('redirect'))

  const vert = tone === 'vert'
  const label = `text-sm font-semibold ${vert ? 'text-creme' : 'text-vert'}`
  const field =
    'min-h-12 w-full rounded-xl border-2 border-trait bg-white px-4 text-base text-encre transition-colors duration-200 hover:border-olive focus-visible:border-vert'
  const lien = vert ? 'text-creme hover:text-or focus-visible:text-or' : 'text-encre hover:text-terre focus-visible:text-terre'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Il manque l’adresse email de votre compte.')
    if (!password) return setError('Il manque votre mot de passe.')
    setPending(true)
    try {
      await login(email.trim(), password)
      window.location.href = redirect
    } catch (err) {
      setError(loginErrorMessage(err))
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className={`grid gap-5 ${vert ? 'sur-vert' : 'sur-creme'}`}>
      <div className="grid gap-2">
        <label htmlFor="email" className={label}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="prenom.nom@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'connexion-erreur' : undefined}
          className={`${field} placeholder:text-olive`}
        />
      </div>

      <div className="grid gap-2">
        <div className="flex items-baseline justify-between gap-4">
          <label htmlFor="password" className={label}>
            Mot de passe
          </label>
          <Link href="/forgot-password" className={`text-sm transition-colors duration-200 hover:underline ${lien}`}>
            Mot de passe oublié{' '}?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'connexion-erreur' : undefined}
            className={`${field} pr-14`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-olive transition-colors hover:bg-creme hover:text-vert"
          >
            {showPassword ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {error && (
        <p id="connexion-erreur" role="alert" className={`text-sm font-semibold ${vert ? 'text-or' : 'text-alerte'}`}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full px-7 text-base font-semibold transition-colors duration-200 disabled:opacity-70 ${
          vert ? 'bg-creme text-vert hover:bg-white' : 'bg-vert text-creme hover:bg-vert-carte'
        }`}
      >
        {pending && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}

/** Les deux chemins pour qui n'a pas encore de compte. Chaque lien est seul sur sa ligne (lisible sans soulignement). */
export function NotYetMember({ tone = 'clair' }: { tone?: Tone }) {
  const vert = tone === 'vert'
  const muted = vert ? 'text-brume' : 'text-olive'
  const lien = vert ? 'text-creme hover:text-or focus-visible:text-or' : 'text-encre hover:text-terre focus-visible:text-terre'
  const items = [
    { question: 'Pas encore membre\u00A0?', label: 'Rejoindre ma promo', href: '/#rejoindre' },
    { question: 'Un collègue de promotion vous a envoyé un code\u00A0?', label: 'Entrer mon code', href: '/register/with-code' },
  ]
  return (
    <ul className="grid gap-4">
      {items.map((item) => (
        <li key={item.href} className="grid">
          <span className={`text-sm ${muted}`}>{item.question}</span>
          <Link href={item.href} className={`justify-self-start text-base transition-colors duration-200 hover:underline ${lien}`}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
