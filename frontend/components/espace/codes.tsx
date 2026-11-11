'use client'

// Les pièces de « Mes codes » : partager un code, le révoquer, en créer un (administrateur).
import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronDown, Copy, Loader2, Mail, MessageCircle, Smartphone } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { promoError } from '@/lib/promo'
import type { InvitationCode } from '@/types'

const N = ' '
export const bouton =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte disabled:opacity-60'
export const lien = 'inline-flex min-h-11 items-center gap-2 text-base text-encre transition-colors duration-200 hover:text-terre hover:underline'

export const dateLongue = (d: string, annee = false) =>
  new Date(d).toLocaleDateString('fr-FR', annee ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' })

/** Ce que devient un code, en une phrase */
export function etatCode(c: InvitationCode) {
  if (c.status === 'valid') {
    const usages = c.max_uses > 1 ? `${c.current_uses} inscription${c.current_uses > 1 ? 's' : ''} sur ${c.max_uses}` : 'En attente'
    return c.expires_at ? `${usages}, valable jusqu’au ${dateLongue(c.expires_at)}` : usages
  }
  if (c.status === 'exhausted') return 'Utilisé'
  if (c.status === 'expired') return `Expiré${c.expires_at ? ` le ${dateLongue(c.expires_at)}` : ''}, sans avoir servi`
  return 'Révoqué'
}

/** Le message envoyé à un collègue : entre collègues de promotion, on se tutoie */
function message(c: InvitationCode, notrePromo: boolean) {
  const url = `${window.location.origin}/register/with-code?code=${encodeURIComponent(c.code)}`
  const ecole = c.schools?.name_fr
  const promo = ecole && c.entry_year ? `${notrePromo ? 'notre' : 'la'} promo ${ecole} ${c.entry_year} s’y retrouve` : 'les AET de toutes les écoles s’y retrouvent'
  const validite = c.expires_at ? ` (valable jusqu’au ${dateLongue(c.expires_at)})` : ''
  return (
    `Salut${N}! Je t’invite à rejoindre AET Connect, l’annuaire des Anciens Enfants de Troupe${N}: ${promo}.\n` +
    `Ton code${N}: ${c.code}${validite}.\nTu peux t’inscrire ici${N}: ${url}`
  )
}

/** Copier le message, WhatsApp, email, SMS */
export function Partage({ c, notrePromo }: { c: InvitationCode; notrePromo: boolean }) {
  const [copie, setCopie] = useState<'ok' | 'ko' | null>(null)
  const texte = () => message(c, notrePromo)
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte())
      setCopie('ok')
    } catch {
      setCopie('ko')
    }
    setTimeout(() => setCopie(null), 2500)
  }
  const ouvrir = (url: (t: string) => string) => () => window.open(url(encodeURIComponent(texte())), '_blank', 'noopener,noreferrer')
  const actions = [
    { label: copie === 'ok' ? 'Copié' : copie === 'ko' ? 'Copie impossible' : 'Copier', icon: copie === 'ok' ? Check : Copy, onClick: copier },
    { label: 'WhatsApp', icon: MessageCircle, onClick: ouvrir((t) => `https://wa.me/?text=${t}`) },
    { label: 'Email', icon: Mail, onClick: ouvrir((t) => `mailto:?subject=${encodeURIComponent('Rejoins notre promo sur AET Connect')}&body=${t}`) },
    { label: 'SMS', icon: Smartphone, onClick: ouvrir((t) => `sms:?body=${t}`) },
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label={`Partager le code ${c.code}`}>
      {actions.map((a, i) => {
        const Icon = a.icon
        return (
          <li key={i}>
            <button type="button" onClick={a.onClick} className={`${lien} ${copie === 'ok' && i === 0 ? 'text-vert' : ''}`}>
              <Icon className="size-[18px]" aria-hidden="true" />
              <span aria-live={i === 0 ? 'polite' : undefined}>{a.label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** Révoquer : une confirmation qui dit ce qui se passe, et l'invitation qui revient */
export function Revoquer({ c }: { c: InvitationCode }) {
  const ref = useRef<HTMLDialogElement>(null)
  const queryClient = useQueryClient()
  const revoquer = useMutation({
    mutationFn: () => apiClient.deleteCode(c.id),
    onSuccess: () => {
      ref.current?.close()
      queryClient.invalidateQueries({ queryKey: ['my-codes'] })
    },
  })
  return (
    <>
      <button type="button" onClick={() => ref.current?.showModal()} className="inline-flex min-h-11 items-center text-base text-olive transition-colors hover:text-alerte hover:underline">
        Révoquer
      </button>
      <dialog
        ref={ref}
        aria-labelledby={`revoquer-${c.id}`}
        onClick={(e) => e.target === ref.current && ref.current?.close()}
        className="sur-creme m-auto w-[min(28rem,calc(100%-2rem))] rounded-3xl bg-creme p-6 text-encre shadow-2xl backdrop:bg-vert-nuit/55 sm:p-8"
      >
        <h2 id={`revoquer-${c.id}`} className="font-titre text-xl font-semibold tracking-[-0.02em] text-vert">
          Révoquer le code {c.code}
          {N}?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-olive">
          Il ne pourra plus servir à s’inscrire. L’invitation redevient disponible{N}: vous pourrez créer un autre code.
        </p>
        {revoquer.isError && (
          <p role="alert" className="mt-3 text-base font-semibold text-alerte">
            La révocation n’a pas abouti. Vous pouvez réessayer dans un instant.
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button type="button" onClick={() => revoquer.mutate()} disabled={revoquer.isPending} className={bouton}>
            {revoquer.isPending && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
            Révoquer le code
          </button>
          <button type="button" onClick={() => ref.current?.close()} className={lien}>
            Garder le code
          </button>
        </div>
      </dialog>
    </>
  )
}

const champ = 'min-h-12 w-full rounded-xl border-2 border-trait bg-white px-4 text-base text-encre hover:border-olive focus-visible:border-vert aria-[invalid=true]:border-alerte'

/** Création d'un code par un administrateur : universel, ou pour une école et une promo, et le nombre d'inscriptions */
export function CreationAdmin({ onCree }: { onCree: (code: string) => void }) {
  const queryClient = useQueryClient()
  const [universel, setUniversel] = useState(false)
  const [ecole, setEcole] = useState('')
  const [annee, setAnnee] = useState('')
  const [usages, setUsages] = useState('1')
  const [erreur, setErreur] = useState('')
  const { data } = useQuery({ queryKey: ['schools'], queryFn: () => apiClient.getSchools() })
  const ecoles = data?.schools ?? []

  const creer = useMutation({
    mutationFn: () => {
      const max_uses = Math.min(500, Math.max(1, Number(usages) || 1))
      return apiClient.generateCode(universel ? { universal: true, max_uses } : { school_id: ecole, entry_year: annee, max_uses })
    },
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: ['my-codes'] })
      setEcole('')
      setAnnee('')
      setUsages('1')
      onCree(r.code)
    },
    onError: (e) => setErreur(e instanceof Error && e.message ? e.message : 'Le code n’a pas pu être créé. Vous pouvez réessayer dans un instant.'),
  })

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault()
    setErreur('')
    if (!universel) {
      // Les messages de promoError s'adressent à la personne qui s'inscrit : on les tourne vers l'administrateur
      const p = promoError(ecoles, ecole, annee)?.replace('votre école', 'l’école').replace('votre année d’entrée', 'la promo')
      if (p) return setErreur(p)
    }
    creer.mutate()
  }

  return (
    <form onSubmit={envoyer} noValidate className="grid gap-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={universel} onChange={(e) => setUniversel(e.target.checked)} className="mt-1 size-5 accent-[var(--esp-vert)]" />
        <span className="grid">
          <span className="text-base text-encre">Code universel</span>
          <span className="text-sm text-olive">La personne choisit elle-même son école et sa promo.</span>
        </span>
      </label>
      {!universel && (
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-vert">École</span>
            <span className="relative">
              <select value={ecole} onChange={(e) => setEcole(e.target.value)} className={`${champ} cursor-pointer appearance-none pr-10`}>
                <option value="">Choisir une école</option>
                {ecoles.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.acronym ? `${s.acronym} · ${s.city} (${s.country})` : `${s.name_fr} (${s.city})`}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-vert" aria-hidden="true" />
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-vert">Promo</span>
            <input
              inputMode="numeric"
              maxLength={4}
              placeholder="2005"
              value={annee}
              onChange={(e) => setAnnee(e.target.value.replace(/\D/g, ''))}
              className={`${champ} tabular-nums`}
            />
          </label>
        </div>
      )}
      <label className="grid gap-2 sm:max-w-[14rem]">
        <span className="text-sm font-semibold text-vert">Nombre d’inscriptions</span>
        <input inputMode="numeric" maxLength={3} value={usages} onChange={(e) => setUsages(e.target.value.replace(/\D/g, ''))} className={`${champ} tabular-nums`} />
      </label>
      {erreur && (
        <p role="alert" className="text-base font-semibold text-alerte">
          {erreur}
        </p>
      )}
      <button type="submit" disabled={creer.isPending} className={`${bouton} justify-self-start`}>
        {creer.isPending && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
        Créer le code
      </button>
    </form>
  )
}
