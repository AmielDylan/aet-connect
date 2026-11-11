'use client'

// Maquettes de « Mes codes » : données réalistes (forme de l'API) et pièces partagées.
// Temporaire : supprimé une fois la proposition choisie et intégrée.
import { useRef, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, Copy, Mail, MessageCircle, Search, Share2, Smartphone } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'

export type Statut = 'valid' | 'exhausted' | 'expired' | 'revoked'
export type CodeMaquette = {
  id: string
  code: string
  status: Statut
  created_at: string
  expires_at: string
  used_by?: { first_name: string; last_name: string; used_at: string }
}

export const MOI = { first_name: 'Koffi', last_name: 'Mensah', ecole: 'EMPT Bingerville', promo: '2005' }
export const QUOTA = { limit: 3, used: 2, remaining: 1 }

export const CODES: CodeMaquette[] = [
  { id: '1', code: 'AET-M4RT-2HWB', status: 'valid', created_at: '2026-10-31', expires_at: '2026-11-30' },
  {
    id: '2',
    code: 'AET-7K2P-Q9XD',
    status: 'exhausted',
    created_at: '2026-10-20',
    expires_at: '2026-11-19',
    used_by: { first_name: 'Aïcha', last_name: 'Traoré', used_at: '2026-11-08' },
  },
  {
    id: '3',
    code: 'AET-B8QN-5TZC',
    status: 'exhausted',
    created_at: '2026-09-02',
    expires_at: '2026-10-02',
    used_by: { first_name: 'Moussa', last_name: 'Keïta', used_at: '2026-09-05' },
  },
  { id: '4', code: 'AET-J3VX-8LRM', status: 'expired', created_at: '2026-08-10', expires_at: '2026-09-09' },
]

export const date = (d: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) =>
  new Date(d).toLocaleDateString('fr-FR', opts)

export const etat = (c: CodeMaquette) =>
  c.status === 'valid'
    ? `En attente, valable jusqu’au ${date(c.expires_at)}`
    : c.status === 'exhausted'
      ? `Utilisé par ${c.used_by?.first_name} ${c.used_by?.last_name}, le ${date(c.used_by!.used_at)}`
      : c.status === 'expired'
        ? `Expiré le ${date(c.expires_at)}, sans avoir servi`
        : 'Révoqué'

export const lienInvitation = (code: string) =>
  `${typeof window !== 'undefined' ? window.location.origin : 'https://aet-connect.vercel.app'}/register/with-code?code=${code}`

/** Le message envoyé à un collègue de promotion : entre collègues, on se tutoie */
export const message = (code: string, expires: string) =>
  `Salut ! Je t’invite à rejoindre AET Connect, l’annuaire des Anciens Enfants de Troupe : notre promo ${MOI.ecole} ${MOI.promo} s’y retrouve.\n` +
  `Ton code : ${code} (valable jusqu’au ${date(expires)}).\nTu peux t’inscrire ici : ${lienInvitation(code)}`

export const bouton =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte disabled:opacity-60'
export const lien = 'inline-flex min-h-11 items-center gap-2 text-base text-encre transition-colors duration-200 hover:text-terre hover:underline'

/** Copier le lien, WhatsApp, email, SMS (et le partage du téléphone quand il existe) */
export function Partage({ c, compact = false }: { c: CodeMaquette; compact?: boolean }) {
  const [copie, setCopie] = useState(false)
  const texte = message(c.code, c.expires_at)
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte)
      setCopie(true)
      setTimeout(() => setCopie(false), 2500)
    } catch {
      /* presse-papier refusé : le lien reste visible */
    }
  }
  const actions = [
    { label: copie ? 'Message copié' : 'Copier le message', icon: copie ? Check : Copy, onClick: copier },
    { label: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(texte)}` },
    { label: 'Email', icon: Mail, href: `mailto:?subject=${encodeURIComponent('Rejoins notre promo sur AET Connect')}&body=${encodeURIComponent(texte)}` },
    { label: 'SMS', icon: Smartphone, href: `sms:?body=${encodeURIComponent(texte)}` },
  ]
  return (
    <ul className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-x-5 gap-y-1'}`} aria-label={`Partager le code ${c.code}`}>
      {actions.map((a) => {
        const Icon = a.icon
        const contenu = (
          <>
            <Icon className="size-[18px]" aria-hidden="true" />
            <span className={compact ? 'sr-only' : ''}>{a.label}</span>
          </>
        )
        const classe = compact
          ? 'grid size-11 place-items-center rounded-full text-vert transition-colors hover:bg-sable/60 hover:text-terre'
          : `${lien} ${a.label === 'Message copié' ? 'text-vert' : ''}`
        return (
          <li key={a.label}>
            {a.href ? (
              <a href={a.href} target="_blank" rel="noopener noreferrer" className={classe} title={compact ? a.label : undefined}>
                {contenu}
              </a>
            ) : (
              <button type="button" onClick={a.onClick} className={classe} title={compact ? a.label : undefined} aria-live="polite">
                {contenu}
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Révoquer : une confirmation qui dit ce qui se passe, et l'invitation qui revient */
export function Revoquer({ c }: { c: CodeMaquette }) {
  const ref = useRef<HTMLDialogElement>(null)
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
          Révoquer le code {c.code}{' '}?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-olive">
          Il ne pourra plus servir à s’inscrire. L’invitation redevient disponible : vous pourrez créer un autre code.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button type="button" onClick={() => ref.current?.close()} className={bouton}>
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

/** Création d'un code par un administrateur : universel, ou pour une école et une promo */
export function FormAdmin() {
  const [universel, setUniversel] = useState(false)
  const champ =
    'min-h-12 w-full rounded-xl border-2 border-trait bg-white px-4 text-base text-encre hover:border-olive focus-visible:border-vert'
  return (
    <div className="grid gap-4">
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
              <select className={`${champ} cursor-pointer appearance-none pr-10`} defaultValue="">
                <option value="">Choisir une école</option>
                <option>EMPT · Bingerville (Côte d’Ivoire)</option>
                <option>PMS · Saint-Louis (Sénégal)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-vert" aria-hidden="true" />
            </span>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-vert">Promo</span>
            <input inputMode="numeric" placeholder="2005" className={`${champ} tabular-nums`} />
          </label>
        </div>
      )}
      <label className="grid gap-2 sm:max-w-[14rem]">
        <span className="text-sm font-semibold text-vert">Nombre d’inscriptions</span>
        <input inputMode="numeric" defaultValue="1" className={`${champ} tabular-nums`} />
      </label>
    </div>
  )
}

/** L'en-tête de l'espace, en version statique pour les maquettes (l'en-tête réel demande une session) */
export function EnteteMaquette({ admin, setAdmin }: { admin: boolean; setAdmin: (v: boolean) => void }) {
  return (
    <>
      <div className="bg-terre px-4 py-2 text-center text-sm text-creme">
        Maquette ·{' '}
        <button type="button" onClick={() => setAdmin(!admin)} className="underline underline-offset-4">
          {admin ? 'Voir en membre' : 'Voir en administrateur'}
        </button>
      </div>
      <header className="sur-creme">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <span className="text-vert">
            <Brand />
          </span>
          <nav className="hidden items-center gap-7 lg:flex">
            {['Accueil', 'Annuaire', 'Mes codes', 'Écoles'].map((l) => (
              <Link
                key={l}
                href="#"
                className={`inline-flex min-h-11 items-center text-base ${l === 'Mes codes' ? 'text-vert underline decoration-terre decoration-2 underline-offset-8' : 'text-encre'}`}
              >
                {l}
              </Link>
            ))}
          </nav>
          <span className="hidden items-center gap-2 lg:flex">
            <span className="grid size-11 place-items-center text-vert">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <Portrait prenom={MOI.first_name} nom={MOI.last_name} className="size-9 rounded-full bg-vert text-xs text-creme" />
            <span className="text-base">{MOI.first_name}</span>
          </span>
          <span className="text-base text-vert lg:hidden">Menu</span>
        </div>
      </header>
    </>
  )
}

/** Quand toutes les invitations sont prises : ce qui les libère, sans reproche */
export function Limite({ surVert = false }: { surVert?: boolean }) {
  return (
    <p className={`text-base leading-relaxed ${surVert ? 'text-brume' : 'text-olive'}`}>
      Vos {QUOTA.limit} invitations sont en cours ou utilisées. Un code qui expire ou que vous révoquez sans qu’il ait servi vous en rend une.
    </p>
  )
}

export { Share2 }
