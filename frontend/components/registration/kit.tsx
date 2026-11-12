'use client'

// Les pièces communes des parcours d'inscription (proposition « La photo de promo », choisie par le client).
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import { PHOTOS } from '@/lib/landing'
import type { School } from '@/types'
import { Brand } from '@/components/landing/site-header'
import { Soleil } from '@/components/landing/soleil'
import { Etapes, type Etape } from './etapes'

export const N = ' '
export const titreClasse = 'font-titre text-[clamp(1.6rem,2.8vw,2.2rem)] font-bold leading-[1.1] tracking-[-0.025em] text-vert text-balance'
export const introClasse = 'mt-3 text-lg leading-relaxed text-olive'
export const champClasse =
  'min-h-12 w-full rounded-xl border-2 border-trait bg-white px-4 text-base text-encre transition-colors duration-200 placeholder:text-olive hover:border-olive focus-visible:border-vert aria-[invalid=true]:border-alerte'

/* ─────────── Mise en page ─────────── */

/** Photo de promo à gauche (en dessous sur mobile), le parcours à droite */
export function InscriptionShell({ etapes, courante, children }: { etapes?: Etape[]; courante?: number; children: React.ReactNode }) {
  return (
    <div className="trame trame-sur-creme grid min-h-svh bg-creme text-encre lg:grid-cols-[0.9fr_1fr]">
      <main className="sur-creme order-1 flex flex-col px-5 pb-10 pt-6 sm:px-10 lg:order-2 lg:justify-center lg:px-16 lg:py-12">
        <div className="mx-auto w-full max-w-[28rem]">
          <Link href="/" className="mb-8 inline-flex text-vert">
            <Brand />
          </Link>
          {etapes && courante && (
            <div className="mb-8">
              <Etapes etapes={etapes} courante={courante} />
            </div>
          )}
          {children}
        </div>
      </main>
      <div className="order-2 p-3 sm:p-4 lg:order-1 lg:p-5">
        <div className="photo-cadre relative h-64 overflow-hidden rounded-3xl rounded-tr-[72px] bg-sable sm:h-80 lg:h-full">
          <Image
            src={PHOTOS.promoGrand.src}
            alt={PHOTOS.promoGrand.alt}
            fill
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="photo-nb object-cover"
            style={{ objectPosition: '50% 55%' }}
          />
          <p className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full bg-creme/90 px-2.5 py-1 text-xs text-olive">
            {PHOTOS.promoGrand.caption}
          </p>
          <p className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-creme px-3 py-2 font-titre text-sm font-semibold tracking-[-0.02em] text-vert">
            <Soleil className="size-5" /> Bienvenue dans la famille
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─────────── Champs ─────────── */

export function Champ({
  id,
  label,
  erreur,
  aide,
  className = '',
  ...props
}: { id: string; label: string; erreur?: string; aide?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  const decrit = [aide ? `${id}-aide` : '', erreur ? `${id}-erreur` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-vert">
        {label}
      </label>
      <input id={id} aria-invalid={erreur ? true : undefined} aria-describedby={decrit} className={`${champClasse} ${className}`} {...props} />
      {aide && (
        <div id={`${id}-aide`} className="text-sm text-olive">
          {aide}
        </div>
      )}
      {erreur && (
        <p id={`${id}-erreur`} className="text-sm text-alerte">
          {erreur}
        </p>
      )}
    </div>
  )
}

export function ZoneTexte({
  id,
  label,
  erreur,
  aide,
  ...props
}: { id: string; label: string; erreur?: string; aide?: React.ReactNode } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const decrit = [aide ? `${id}-aide` : '', erreur ? `${id}-erreur` : ''].filter(Boolean).join(' ') || undefined
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-vert">
        {label}
      </label>
      <textarea
        id={id}
        rows={4}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={decrit}
        className={`${champClasse} min-h-28 resize-y py-3 leading-relaxed`}
        {...props}
      />
      {aide && (
        <div id={`${id}-aide`} className="text-sm text-olive">
          {aide}
        </div>
      )}
      {erreur && (
        <p id={`${id}-erreur`} className="text-sm text-alerte">
          {erreur}
        </p>
      )}
    </div>
  )
}

/** L'école (liste) et l'année d'entrée, côte à côte */
export function EcoleAnnee({
  schools,
  schoolId,
  onSchool,
  year,
  onYear,
  erreur,
}: {
  schools: School[]
  schoolId: string
  onSchool: (v: string) => void
  year: string
  onYear: (v: string) => void
  erreur?: string
}) {
  const reelles = schools.filter((s) => s.acronym)
  const liste = reelles.length ? reelles : schools
  return (
    <div className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="ecole" className="text-sm font-semibold text-vert">
          Votre école
        </label>
        <div className="relative">
          <select
            id="ecole"
            value={schoolId}
            onChange={(e) => onSchool(e.target.value)}
            aria-invalid={erreur && !schoolId ? true : undefined}
            className={`${champClasse} cursor-pointer appearance-none pr-12`}
          >
            <option value="">Choisir une école</option>
            {liste.map((s) => (
              <option key={s.id} value={s.id}>
                {s.acronym ? `${s.acronym} · ${s.city} (${s.country})` : `${s.name_fr} (${s.city})`}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-vert" aria-hidden="true" />
        </div>
      </div>
      <Champ
        id="annee"
        label="Année d’entrée"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        placeholder="par exemple 2005"
        value={year}
        onChange={(e) => onYear(e.target.value.replace(/\D/g, ''))}
        className="tabular-nums"
      />
      {erreur && (
        <p role="alert" className="text-sm font-semibold text-alerte">
          {erreur}
        </p>
      )}
    </div>
  )
}

/* ─────────── Mot de passe ─────────── */

// Règles de l'inscription (inchangées) : 8 caractères, une majuscule, une minuscule, un chiffre
export const REGLES_INSCRIPTION = [
  { label: '8 caractères au moins', test: (p: string) => p.length >= 8 },
  { label: 'une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'une minuscule', test: (p: string) => /[a-z]/.test(p) },
  { label: 'un chiffre', test: (p: string) => /\d/.test(p) },
]

export function ReglesMotDePasse({ id, password }: { id: string; password: string }) {
  return (
    <ul id={id} className="grid gap-1 text-sm">
      {REGLES_INSCRIPTION.map((rule) => {
        const ok = rule.test(password)
        return (
          <li key={rule.label} className={`flex items-center gap-2 ${ok ? 'text-vert' : 'text-olive'}`}>
            <span aria-hidden="true" className={`grid size-4 place-items-center rounded-full border ${ok ? 'border-vert bg-vert text-creme' : 'border-trait'}`}>
              {ok && <Check className="size-3" strokeWidth={3} />}
            </span>
            {rule.label}
            <span className="sr-only">{ok ? ' : respectée' : ' : à respecter'}</span>
          </li>
        )
      })}
    </ul>
  )
}

/* ─────────── Actions et messages ─────────── */

export function Bouton({ pending, children, ...props }: { pending?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte disabled:opacity-60"
      {...props}
    >
      {pending && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

/** Retour à l'étape précédente : un lien discret, pas un second bouton */
export function Retour({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="justify-self-start text-base text-encre transition-colors duration-200 hover:text-terre hover:underline">
      {children}
    </button>
  )
}

export function Erreur({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="text-sm font-semibold text-alerte">
      {children}
    </div>
  )
}

/** Une information confirmée (code valable, promo trouvée) */
export function Confirme({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-vert/10 px-3 py-1.5 text-sm text-vert">
      <Check className="size-4 shrink-0" aria-hidden="true" /> {children}
    </p>
  )
}

/** Lien en ligne dans une question (« Pas encore de code ? Le demander »), seul sur sa ligne */
export function Question({ question, href, children }: { question: string; href: string; children: React.ReactNode }) {
  return (
    <div className="grid">
      <span className="text-sm text-olive">{question}</span>
      <Link href={href} className="justify-self-start text-base text-encre transition-colors duration-200 hover:text-terre hover:underline">
        {children}
      </Link>
    </div>
  )
}

/** Message d'erreur lisible à partir d'une erreur d'API */
export function messageApi(error: unknown, defaut: string): string {
  const m = error instanceof Error ? error.message : ''
  if (/fetch|network|Failed to/i.test(m)) return `La connexion n’a pas abouti. Votre réseau est peut-être instable${N}: vous pouvez réessayer dans un instant.`
  if (/déjà en attente/i.test(m)) return `Une demande est déjà en attente pour cette adresse${N}: l’équipe AET Connect vous répondra bientôt.`
  if (/déjà utilisé/i.test(m)) return `Cette adresse a déjà un compte${N}: vous pouvez vous connecter.`
  return m || defaut
}
