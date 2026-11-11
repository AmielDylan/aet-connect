'use client'

// Maquettes de « Mon profil » : un membre fictif, et les pièces que les trois propositions partagent
// (interrupteur, photo, formulaires). Rien n'est envoyé : tout reste dans la page.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, Eye, EyeOff, Loader2, Search } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'
import { Champ, ZoneTexte } from '@/components/registration/kit'

export const N = ' '
export const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'
export const boutonVert =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte disabled:opacity-50'
export const boutonCreme =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors duration-200 hover:bg-white disabled:opacity-50'
export const lienTexte = 'inline-flex min-h-11 items-center text-base text-encre transition-colors duration-200 hover:text-terre hover:underline underline-offset-4'
const champClasse =
  'min-h-12 w-full rounded-xl border-2 border-trait bg-white px-4 text-base text-encre transition-colors duration-200 placeholder:text-olive hover:border-olive focus-visible:border-vert'

/* ─────────── Le membre fictif ─────────── */

export type Infos = {
  first_name: string
  last_name: string
  phone: string
  linkedin_url: string
  current_city: string
  current_country: string
  bio: string
}
export type Vie = {
  show_in_directory: boolean
  show_email: boolean
  show_phone: boolean
  show_current_location: boolean
  show_linkedin: boolean
  show_bio: boolean
  show_entry_year: boolean
}

export const MOI = {
  email: 'koffi.mensah@exemple.com',
  ecole: 'EMPT Bingerville',
  pays_ecole: 'Côte d’Ivoire',
  promo: '2005',
  is_ambassador: true,
}
export const INFOS: Infos = {
  first_name: 'Koffi',
  last_name: 'Mensah',
  phone: '+225 07 00 00 00 00',
  linkedin_url: 'https://www.linkedin.com/in/exemple',
  current_city: 'Abidjan',
  current_country: 'Côte d’Ivoire',
  bio: 'Officier de réserve et ingénieur en génie civil. J’ai gardé de l’école le goût des chantiers bien tenus. Toujours partant pour aider un collègue de la promo.',
}
export const VIE: Vie = {
  show_in_directory: true,
  show_email: true,
  show_phone: false,
  show_current_location: true,
  show_linkedin: true,
  show_bio: true,
  show_entry_year: true,
}
export const PAYS = ['Bénin', 'Burkina Faso', 'Cameroun', 'Côte d’Ivoire', 'France', 'Gabon', 'Mali', 'Niger', 'Sénégal', 'Tchad', 'Togo']

/** Ce que chaque réglage montre ou masque, dans l'ordre où le profil l'affiche */
export const REGLAGES: { cle: Exclude<keyof Vie, 'show_in_directory'>; label: string; detail: string }[] = [
  { cle: 'show_entry_year', label: 'Votre promo', detail: 'L’année d’entrée à l’école' },
  { cle: 'show_current_location', label: 'Votre ville', detail: 'La ville et le pays où vous vivez' },
  { cle: 'show_bio', label: 'En quelques mots', detail: 'Votre présentation' },
  { cle: 'show_email', label: 'Votre email', detail: 'Pour qu’on puisse vous écrire' },
  { cle: 'show_phone', label: 'Votre téléphone', detail: 'Pour qu’on puisse vous appeler' },
  { cle: 'show_linkedin', label: 'Votre LinkedIn', detail: 'Votre parcours professionnel' },
]

/** L'état d'un formulaire : modifié depuis le dernier enregistrement, et un enregistrement simulé */
export function useBrouillon<T>(initial: T) {
  const [enregistre, setEnregistre] = useState(initial)
  const [valeur, setValeur] = useState(initial)
  const [brut, setEtat] = useState<'repos' | 'envoi' | 'fait'>('repos')
  const modifie = JSON.stringify(valeur) !== JSON.stringify(enregistre)
  // « Enregistré » s'efface dès la modification suivante
  const etat = brut === 'fait' && modifie ? 'repos' : brut
  const enregistrer = () => {
    setEtat('envoi')
    setTimeout(() => {
      setEnregistre(valeur)
      setEtat('fait')
    }, 700)
  }
  return { valeur, setValeur, enregistre, modifie, etat, enregistrer, annuler: () => setValeur(enregistre) }
}

/* ─────────── En-tête statique de l'espace ─────────── */

export function EnteteMaquette({ prenom, nom, photo }: { prenom: string; nom: string; photo?: string | null }) {
  return (
    <>
      <div className="bg-terre px-4 py-2 text-center text-sm text-creme">Maquette · rien n’est enregistré</div>
      <header className="sur-creme">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <span className="text-vert">
            <Brand />
          </span>
          <nav className="hidden items-center gap-7 lg:flex">
            {['Accueil', 'Annuaire', 'Mes codes', 'Écoles'].map((l) => (
              <Link key={l} href="#" className="inline-flex min-h-11 items-center text-base text-encre">
                {l}
              </Link>
            ))}
          </nav>
          <span className="hidden items-center gap-2 lg:flex">
            <span className="grid size-11 place-items-center text-vert">
              <Search className="size-5" aria-hidden="true" />
            </span>
            <Portrait prenom={prenom} nom={nom} src={photo} className="size-9 rounded-full bg-vert text-xs text-creme" />
            <span className="text-base text-vert underline decoration-terre decoration-2 underline-offset-8">{prenom}</span>
          </span>
          <span className="text-base text-vert lg:hidden">Menu</span>
        </div>
      </header>
    </>
  )
}

/* ─────────── Interrupteur ─────────── */

/** Un réglage visible / masqué : la ligne entière est la cible, l'état est dit en toutes lettres */
export function Interrupteur({
  id,
  label,
  detail,
  actif,
  onChange,
  surVert = false,
}: {
  id: string
  label: string
  detail?: string
  actif: boolean
  onChange: (v: boolean) => void
  surVert?: boolean
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className={`block text-base ${surVert ? 'text-creme' : 'text-encre'}`}>{label}</span>
        {detail && <span className={`block text-sm ${surVert ? 'text-brume' : 'text-olive'}`}>{detail}</span>}
      </label>
      <span className="flex shrink-0 items-center gap-3">
        <span aria-hidden="true" className={`w-14 text-right text-sm ${surVert ? 'text-brume' : 'text-olive'}`}>
          {actif ? 'Visible' : 'Masqué'}
        </span>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={actif}
          onClick={() => onChange(!actif)}
          className={`relative h-8 w-14 rounded-full transition-colors duration-200 ${
            actif ? (surVert ? 'bg-creme' : 'bg-vert') : surVert ? 'bg-creme/25' : 'bg-sable'
          }`}
        >
          <span
            className={`absolute top-1 size-6 rounded-full transition-[left] duration-200 motion-reduce:transition-none ${
              actif ? `left-7 ${surVert ? 'bg-vert' : 'bg-creme'}` : `left-1 ${surVert ? 'bg-creme' : 'bg-white'}`
            }`}
          />
        </button>
      </span>
    </div>
  )
}

/* ─────────── Photo ─────────── */

/** Choisir une photo (jpg, png ou webp, 2 Mo au plus) ou la retirer ; la vraie version l'envoie au stockage */
export function usePhoto() {
  const [photo, setPhoto] = useState<string | null>(null)
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const choisir = () => input.current?.click()
  const champ = (
    <input
      ref={input}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      className="sr-only"
      tabIndex={-1}
      aria-hidden="true"
      onChange={(e) => {
        const f = e.target.files?.[0]
        e.target.value = ''
        if (!f) return
        if (!f.type.startsWith('image/')) return setErreur('Ce fichier n’est pas une image.')
        if (f.size > 2 * 1024 * 1024) return setErreur(`Cette photo dépasse 2${N}Mo. Une image plus légère fera l’affaire.`)
        setErreur('')
        setEnvoi(true)
        setTimeout(() => {
          setPhoto(URL.createObjectURL(f))
          setEnvoi(false)
        }, 600)
      }}
    />
  )
  return { photo, erreur, envoi, choisir, retirer: () => setPhoto(null), champ }
}

/* ─────────── Formulaires ─────────── */

export function Liste({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-vert">
        {label}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${champClasse} cursor-pointer appearance-none pr-12`}>
          <option value="">Aucun</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-vert" aria-hidden="true" />
      </div>
    </div>
  )
}

/** Identité, lieu, coordonnées et présentation ; `apres` place un élément (un réglage) sous un champ */
export function ChampsInfos({
  v,
  set,
  apres = {},
  sansBio = false,
}: {
  v: Infos
  set: (v: Infos) => void
  apres?: Partial<Record<'lieu' | 'bio' | 'email' | 'phone' | 'linkedin_url', React.ReactNode>>
  sansBio?: boolean
}) {
  const maj = (k: keyof Infos) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set({ ...v, [k]: e.target.value })
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ id="prenom" label="Prénom" autoComplete="given-name" value={v.first_name} onChange={maj('first_name')} />
        <Champ id="nom" label="Nom" autoComplete="family-name" value={v.last_name} onChange={maj('last_name')} />
      </div>
      <div className="grid gap-2">
        <div className="grid gap-5 sm:grid-cols-2">
          <Champ id="ville" label="Ville où vous vivez" autoComplete="address-level2" value={v.current_city} onChange={maj('current_city')} />
          <Liste id="pays" label="Pays" value={v.current_country} onChange={(p) => set({ ...v, current_country: p })} options={PAYS} />
        </div>
        {apres.lieu}
      </div>
      <div className="grid gap-2">
        <Champ
          id="email"
          label="Email"
          value={MOI.email}
          readOnly
          className="cursor-default border-sable! bg-creme! text-olive!"
          aide="C’est l’adresse de connexion : l’équipe AET Connect peut la changer pour vous."
        />
        {apres.email}
      </div>
      <div className="grid gap-2">
        <Champ id="tel" label="Téléphone" type="tel" autoComplete="tel" placeholder="+225 07 00 00 00 00" value={v.phone} onChange={maj('phone')} />
        {apres.phone}
      </div>
      <div className="grid gap-2">
        <Champ
          id="linkedin"
          label="LinkedIn"
          type="url"
          inputMode="url"
          spellCheck={false}
          placeholder="https://www.linkedin.com/in/…"
          value={v.linkedin_url}
          onChange={maj('linkedin_url')}
        />
        {apres.linkedin_url}
      </div>
      {!sansBio && (
        <div className="grid gap-2">
          <ZoneTexte
            id="bio"
            label="En quelques mots"
            maxLength={500}
            placeholder="Votre métier, votre parcours depuis l’école, ce que vous pouvez apporter aux collègues…"
            value={v.bio}
            onChange={maj('bio')}
            aide={<span className="tabular-nums">{v.bio.length}/500</span>}
          />
          {apres.bio}
        </div>
      )}
    </div>
  )
}

/** Le bouton d'enregistrement d'un formulaire et son retour ; « Annuler » n'apparaît qu'après une modification */
export function Enregistrer({
  modifie,
  etat,
  onEnregistrer,
  onAnnuler,
  libelle = 'Enregistrer',
  fait = 'Enregistré',
}: {
  modifie: boolean
  etat: 'repos' | 'envoi' | 'fait'
  onEnregistrer: () => void
  onAnnuler: () => void
  libelle?: string
  fait?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <button type="button" onClick={onEnregistrer} disabled={!modifie || etat === 'envoi'} className={boutonVert}>
        {etat === 'envoi' && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
        {etat === 'envoi' ? 'Enregistrement…' : libelle}
      </button>
      {modifie && etat !== 'envoi' && (
        <button type="button" onClick={onAnnuler} className={lienTexte}>
          Annuler les changements
        </button>
      )}
      <p aria-live="polite" className="text-base text-vert">
        {etat === 'fait' && !modifie && (
          <span className="inline-flex items-center gap-2">
            <Check className="size-[18px]" aria-hidden="true" /> {fait}
          </span>
        )}
      </p>
    </div>
  )
}

/* ─────────── Mot de passe ─────────── */

// Règles du changement de mot de passe (celles du serveur) : celles de l'inscription, plus un caractère spécial
const REGLES = [
  { label: '8 caractères au moins', test: (p: string) => p.length >= 8 },
  { label: 'une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'une minuscule', test: (p: string) => /[a-z]/.test(p) },
  { label: 'un chiffre', test: (p: string) => /\d/.test(p) },
  { label: 'un caractère spécial (@$!%*?&)', test: (p: string) => /[@$!%*?&]/.test(p) },
]

function ChampSecret({ id, label, value, onChange, autoComplete, decrit }: { id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string; decrit?: string }) {
  const [voir, setVoir] = useState(false)
  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-vert">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={voir ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={decrit}
          className={`${champClasse} pr-14`}
        />
        <button
          type="button"
          onClick={() => setVoir(!voir)}
          aria-pressed={voir}
          aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-vert hover:text-terre"
        >
          {voir ? <EyeOff className="size-[18px]" aria-hidden="true" /> : <Eye className="size-[18px]" aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

export function MotDePasse() {
  const [ancien, setAncien] = useState('')
  const [nouveau, setNouveau] = useState('')
  const [confirme, setConfirme] = useState('')
  const [etat, setEtat] = useState<'repos' | 'envoi' | 'fait'>('repos')
  const [erreur, setErreur] = useState('')
  const valide = REGLES.every((r) => r.test(nouveau))
  const envoyer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ancien) return setErreur('Il manque votre mot de passe actuel.')
    if (!valide) return setErreur('Le nouveau mot de passe ne respecte pas encore toutes les règles.')
    if (nouveau !== confirme) return setErreur('Les deux nouveaux mots de passe ne sont pas identiques.')
    setErreur('')
    setEtat('envoi')
    setTimeout(() => {
      setAncien('')
      setNouveau('')
      setConfirme('')
      setEtat('fait')
    }, 700)
  }
  return (
    <form onSubmit={envoyer} noValidate className="grid gap-5">
      <ChampSecret id="mdp-actuel" label="Mot de passe actuel" autoComplete="current-password" value={ancien} onChange={setAncien} />
      <div className="grid gap-2">
        <ChampSecret id="mdp-nouveau" label="Nouveau mot de passe" autoComplete="new-password" value={nouveau} onChange={setNouveau} decrit="mdp-regles" />
        <ul id="mdp-regles" className="grid gap-1 text-sm sm:grid-cols-2">
          {REGLES.map((r) => {
            const ok = r.test(nouveau)
            return (
              <li key={r.label} className={`flex items-center gap-2 ${ok ? 'text-vert' : 'text-olive'}`}>
                <span aria-hidden="true" className={`grid size-4 place-items-center rounded-full border ${ok ? 'border-vert bg-vert text-creme' : 'border-trait'}`}>
                  {ok && <Check className="size-3" strokeWidth={3} />}
                </span>
                {r.label}
                <span className="sr-only">{ok ? ' : respectée' : ' : à respecter'}</span>
              </li>
            )
          })}
        </ul>
      </div>
      <ChampSecret id="mdp-confirme" label="Le nouveau, une seconde fois" autoComplete="new-password" value={confirme} onChange={setConfirme} />
      {erreur && (
        <p role="alert" className="text-sm font-semibold text-alerte">
          {erreur}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <button type="submit" disabled={etat === 'envoi'} className={boutonVert}>
          {etat === 'envoi' && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
          {etat === 'envoi' ? 'Changement…' : 'Changer le mot de passe'}
        </button>
        <p aria-live="polite" className="text-base text-vert">
          {etat === 'fait' && (
            <span className="inline-flex items-center gap-2">
              <Check className="size-[18px]" aria-hidden="true" /> Votre mot de passe a changé
            </span>
          )}
        </p>
      </div>
    </form>
  )
}

/* ─────────── Quitter AET Connect ─────────── */

export function Quitter({ compact = false }: { compact?: boolean }) {
  const [ouvert, setOuvert] = useState(false)
  const [raison, setRaison] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (ouvert) dialog.current?.showModal()
    else dialog.current?.close()
  }, [ouvert])
  return (
    <div>
      {!compact && (
        <p className="max-w-[56ch] text-base leading-relaxed text-olive">
          Vous pouvez demander la suppression de votre compte. L’équipe AET Connect l’examine avant de l’effectuer ; vos informations sont alors effacées
          définitivement.
        </p>
      )}
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className={`${compact ? '' : 'mt-3'} inline-flex min-h-11 items-center text-base text-alerte underline-offset-4 transition-colors hover:underline`}
      >
        Demander la suppression de mon compte
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOuvert(false)}
        className="sur-creme m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl rounded-tr-[56px] bg-creme p-6 text-encre backdrop:bg-encre/50 sm:p-8"
      >
        <h2 className="font-titre text-xl font-semibold tracking-[-0.02em] text-vert">Quitter AET Connect{N}?</h2>
        <p className="mt-3 text-base leading-relaxed text-olive">
          Votre demande part vers l’équipe AET Connect, et vous êtes déconnecté aussitôt. Une fois la suppression faite, votre profil disparaît de l’annuaire
          et vos informations sont effacées.
        </p>
        <div className="mt-5">
          <ZoneTexte
            id="raison"
            label="Ce qui vous fait partir (facultatif)"
            maxLength={500}
            rows={3}
            value={raison}
            onChange={(e) => setRaison(e.target.value)}
            aide={<span className="tabular-nums">{raison.length}/500</span>}
          />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={() => setOuvert(false)}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-alerte px-7 text-base font-semibold text-creme transition-colors hover:bg-alerte/90"
          >
            Envoyer la demande
          </button>
          <button type="button" onClick={() => setOuvert(false)} className={lienTexte}>
            Rester
          </button>
        </div>
      </dialog>
    </div>
  )
}
