'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { LienFleche } from '@/components/landing/lien-fleche'

const field =
  'min-h-12 w-full rounded-xl border-2 border-trait bg-white px-4 text-base text-encre transition-colors duration-200 hover:border-olive focus-visible:border-vert'
const label = 'text-sm font-semibold text-vert'
const button =
  'mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte disabled:opacity-60'
const titre = 'font-titre text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.025em] text-vert text-balance'
const intro = 'mt-3 text-lg leading-relaxed text-olive'

const N = ' '
const networkMessage = `L’envoi n’a pas abouti. Votre réseau est peut-être instable${N}: vous pouvez réessayer dans un instant.`

/* ─────────── Mot de passe oublié ─────────── */

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [sentTo, setSentTo] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const value = email.trim()
    if (!value) return setError('Il manque l’adresse email de votre compte.')
    if (!/^\S+@\S+\.\S+$/.test(value)) return setError('Cette adresse email semble incomplète.')
    setPending(true)
    try {
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(value, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (sendError) {
        // Par sécurité, on ne dit jamais si l'adresse existe : seuls le délai et le réseau sont signalés
        if (/rate limit|security purposes|seconds/i.test(sendError.message)) {
          setError(`Un lien vient déjà de partir${N}: vous pourrez en demander un autre dans une minute.`)
        } else if (/fetch|network/i.test(sendError.message)) {
          setError(networkMessage)
        } else {
          setSentTo(value)
        }
      } else {
        setSentTo(value)
      }
    } catch {
      setError(networkMessage)
    } finally {
      setPending(false)
    }
  }

  if (sentTo) {
    return (
      <div aria-live="polite">
        <h1 className={titre}>Le lien est en route</h1>
        <p className={intro}>
          Si un compte existe avec l’adresse <strong className="font-semibold text-encre">{sentTo}</strong>, un email vous attend
          avec un lien pour choisir un nouveau mot de passe.
        </p>
        <p className="mt-4 text-base leading-relaxed text-olive">
          Il peut mettre quelques minutes à arriver. S’il tarde, il s’est peut-être glissé dans les courriers indésirables.
        </p>
        <div className="mt-8 grid gap-2">
          <LienFleche href="/login" className="justify-self-start">
            Revenir à la connexion
          </LienFleche>
          <button
            type="button"
            onClick={() => setSentTo('')}
            className="justify-self-start text-base text-encre transition-colors duration-200 hover:text-terre hover:underline"
          >
            Ce n’est pas la bonne adresse{N}? La modifier
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className={titre}>Mot de passe oublié{N}?</h1>
      <p className={intro}>
        Cela arrive à tout le monde. Avec l’adresse email de votre compte, nous vous envoyons un lien pour en choisir un nouveau.
      </p>
      <form onSubmit={onSubmit} noValidate className="sur-creme mt-8 grid gap-5">
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
            aria-describedby={error ? 'oubli-erreur' : undefined}
            className={`${field} placeholder:text-olive`}
          />
        </div>
        {error && (
          <p id="oubli-erreur" role="alert" className="text-sm font-semibold text-alerte">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className={button}>
          {pending && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
          {pending ? 'Envoi…' : 'Recevoir le lien'}
        </button>
      </form>
      <div className="mt-8">
        <LienFleche href="/login">Revenir à la connexion</LienFleche>
      </div>
    </div>
  )
}

/* ─────────── Nouveau mot de passe ─────────── */

// Les mêmes règles que sur le profil
const RULES = [
  { label: '8 caractères au moins', test: (p: string) => p.length >= 8 },
  { label: 'une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'une minuscule', test: (p: string) => /[a-z]/.test(p) },
  { label: 'un chiffre', test: (p: string) => /\d/.test(p) },
  { label: 'un caractère spécial parmi @ $ ! % * ? &', test: (p: string) => /[@$!%*?&]/.test(p) },
]

type ResetState = 'verification' | 'expire' | 'formulaire' | 'reussi'

/** Le lien de Supabase revient avec une erreur dans l'adresse quand il a expiré ou déjà servi */
function linkErrorInUrl(): boolean {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, '') + '&' + window.location.search.replace(/^\?/, ''))
  return Boolean(params.get('error') || params.get('error_code'))
}

const noSubscribe = () => () => {}

export function ResetPasswordForm({ apercu }: { apercu?: ResetState }) {
  const [rawState, setState] = useState<ResetState>(apercu ?? 'verification')
  // Lu comme une source externe (l'adresse), sans setState dans un effet
  const linkError = useSyncExternalStore(noSubscribe, linkErrorInUrl, () => false)
  const state: ResetState = !apercu && linkError && rawState !== 'reussi' ? 'expire' : rawState
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (apercu || linkError) return
    let settled = false
    const ready = () => {
      settled = true
      setState((s) => (s === 'verification' ? 'formulaire' : s))
    }
    const { data } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'PASSWORD_RECOVERY' || session) ready()
    })
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => session && ready())
    // Sans session au bout de quelques secondes, le lien n'est plus valable
    const timer = window.setTimeout(() => {
      if (!settled) setState((s) => (s === 'verification' ? 'expire' : s))
    }, 6000)
    return () => {
      data.subscription.unsubscribe()
      window.clearTimeout(timer)
    }
  }, [apercu, linkError])

  const passed = RULES.map((r) => r.test(password))
  const valid = passed.every(Boolean)
  const mismatch = confirmation.length > 0 && confirmation !== password

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!valid) return setError('Le mot de passe ne remplit pas encore toutes les règles ci-dessus.')
    if (confirmation !== password) return setError('Les deux mots de passe ne sont pas identiques.')
    if (apercu) return setState('reussi')
    setPending(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (!updateError) return setState('reussi')
      const message = updateError.message
      if (/different from the old|same_password/i.test(message)) {
        setError(`C’est déjà votre mot de passe actuel${N}: il en faut un différent.`)
      } else if (/session|jwt|expired|missing/i.test(message)) {
        setState('expire')
      } else if (/weak|pwned|leaked/i.test(message)) {
        setError(`Ce mot de passe est trop courant${N}: il en faut un plus personnel.`)
      } else {
        setError(networkMessage)
      }
    } catch {
      setError(networkMessage)
    } finally {
      setPending(false)
    }
  }

  if (state === 'verification') {
    return (
      <div aria-live="polite" className="flex items-center gap-3 text-lg text-olive">
        <Loader2 className="size-5 animate-spin text-vert" aria-hidden="true" />
        Nous vérifions votre lien…
      </div>
    )
  }

  if (state === 'expire') {
    return (
      <div>
        <h1 className={titre}>Ce lien n’est plus valable</h1>
        <p className={intro}>
          Un lien de réinitialisation ne sert qu’une fois et n’est valable qu’un temps. Un nouveau lien ne prend qu’un instant.
        </p>
        <div className="mt-8">
          <LienFleche href="/forgot-password">Recevoir un nouveau lien</LienFleche>
        </div>
      </div>
    )
  }

  if (state === 'reussi') {
    return (
      <div aria-live="polite">
        <h1 className={titre}>C’est fait</h1>
        <p className={intro}>Votre nouveau mot de passe est enregistré, et vous êtes connecté.</p>
        <Link href="/dashboard" className={`${button} mt-8`}>
          Accéder à mon espace
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className={titre}>Un nouveau mot de passe</h1>
      <p className={intro}>Il vous servira dès votre prochaine connexion.</p>
      <form onSubmit={onSubmit} noValidate className="sur-creme mt-8 grid gap-5">
        <div className="grid gap-2">
          <label htmlFor="nouveau" className={label}>
            Nouveau mot de passe
          </label>
          <div className="relative">
            <input
              id="nouveau"
              name="new-password"
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="regles"
              className={`${field} pr-14`}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? 'Masquer les mots de passe' : 'Afficher les mots de passe'}
              aria-pressed={show}
              className="absolute right-1.5 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg text-olive transition-colors hover:bg-creme hover:text-vert"
            >
              {show ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
            </button>
          </div>
          {/* Les règles se cochent au fil de la saisie */}
          <ul id="regles" className="mt-1 grid gap-1 text-sm">
            {RULES.map((rule, i) => (
              <li key={rule.label} className={`flex items-center gap-2 ${passed[i] ? 'text-vert' : 'text-olive'}`}>
                <span
                  aria-hidden="true"
                  className={`grid size-4 place-items-center rounded-full border ${passed[i] ? 'border-vert bg-vert text-creme' : 'border-trait'}`}
                >
                  {passed[i] && <Check className="size-3" strokeWidth={3} />}
                </span>
                {rule.label}
                <span className="sr-only">{passed[i] ? ' : respectée' : ' : à respecter'}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-2">
          <label htmlFor="confirmation" className={label}>
            Confirmation
          </label>
          <input
            id="confirmation"
            name="confirm-password"
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            aria-invalid={mismatch || undefined}
            aria-describedby={mismatch ? 'confirmation-erreur' : undefined}
            className={field}
          />
          {mismatch && (
            <p id="confirmation-erreur" className="text-sm text-alerte">
              Les deux mots de passe ne sont pas identiques.
            </p>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm font-semibold text-alerte">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className={button}>
          {pending && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
          {pending ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
        </button>
      </form>
    </div>
  )
}
