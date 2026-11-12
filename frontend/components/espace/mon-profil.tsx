'use client'

// Les pièces de « Mon profil » (proposition B « Le bandeau ») : l'interrupteur de visibilité, la photo,
// les informations, le mot de passe et la demande de départ.
import { useEffect, useRef, useState } from 'react'
import { Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { uploadAvatar, deleteAvatar } from '@/lib/supabase-storage'
import { COUNTRY_FLAGS } from '@/lib/countries'
import { useMemberCache } from '@/hooks/use-current-member'
import { Champ, REGLES_INSCRIPTION, ZoneTexte, messageApi } from '@/components/registration/kit'
import type { UserPrivacySettings } from '@/types'

export const N = ' '
export const boutonVert =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte disabled:opacity-50'
export const boutonCreme =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors duration-200 hover:bg-white disabled:opacity-50'
const lienTexte = 'inline-flex min-h-11 items-center text-base text-encre underline-offset-4 transition-colors duration-200 hover:text-terre hover:underline'
const champClasse =
  'min-h-12 w-full rounded-xl border-2 border-trait bg-white px-4 text-base text-encre transition-colors duration-200 placeholder:text-olive hover:border-olive focus-visible:border-vert'

export type Etat = 'repos' | 'envoi' | 'fait'

/* ─────────── Visibilité ─────────── */

export type Vie = Omit<UserPrivacySettings, never>

/** Ce que chaque réglage montre ou masque, dans l'ordre où le profil l'affiche */
// La promo n'y figure pas : elle se voit toujours, c'est ainsi que les AET se retrouvent
export const REGLAGES: { cle: Exclude<keyof Vie, 'show_in_directory' | 'show_entry_year'>; label: string; detail: string }[] = [
  { cle: 'show_current_location', label: 'Votre ville', detail: 'La ville et le pays où vous vivez' },
  { cle: 'show_bio', label: 'En quelques mots', detail: 'Votre présentation' },
  { cle: 'show_email', label: 'Votre email', detail: 'Pour qu’on puisse vous écrire' },
  { cle: 'show_phone', label: 'Votre téléphone', detail: 'Pour qu’on puisse vous appeler' },
  { cle: 'show_linkedin', label: 'Votre LinkedIn', detail: 'Votre parcours professionnel' },
]

/** Un réglage visible / masqué : le libellé est cliquable, l'état est dit en toutes lettres */
export function Interrupteur({
  id,
  label,
  detail,
  actif,
  onChange,
  disabled,
}: {
  id: string
  label: string
  detail?: string
  actif: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-base text-encre">{label}</span>
        {detail && <span className="block text-sm text-olive">{detail}</span>}
      </label>
      <span className="flex shrink-0 items-center gap-3">
        <span aria-hidden="true" className="w-14 text-right text-sm text-olive">
          {actif ? 'Visible' : 'Masqué'}
        </span>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={actif}
          disabled={disabled}
          onClick={() => onChange(!actif)}
          className={`relative h-8 w-14 rounded-full transition-colors duration-200 disabled:opacity-50 ${actif ? 'bg-vert' : 'bg-sable'}`}
        >
          <span
            className={`absolute top-1 size-6 rounded-full transition-[left] duration-200 motion-reduce:transition-none ${
              actif ? 'left-7 bg-creme' : 'left-1 bg-white'
            }`}
          />
        </button>
      </span>
    </div>
  )
}

/* ─────────── Enregistrer ─────────── */

/** Le bouton d'un formulaire et son retour ; « Annuler les changements » n'apparaît qu'après une modification */
export function Enregistrer({
  modifie,
  etat,
  onAnnuler,
  libelle = 'Enregistrer',
  erreur,
}: {
  modifie: boolean
  etat: Etat
  onAnnuler: () => void
  libelle?: string
  erreur?: string
}) {
  return (
    <div className="grid gap-3">
      {erreur && (
        <p role="alert" className="text-sm font-semibold text-alerte">
          {erreur}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <button type="submit" disabled={!modifie || etat === 'envoi'} className={boutonVert}>
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
              <Check className="size-[18px]" aria-hidden="true" /> Enregistré
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

/* ─────────── Informations ─────────── */

export type Infos = {
  first_name: string
  last_name: string
  phone: string
  linkedin_url: string
  current_city: string
  current_country: string
  bio: string
}

// Pays proposés : ceux des écoles, et ceux où vivent souvent les AET ; on peut en écrire un autre
const PAYS = [...Object.keys(COUNTRY_FLAGS), 'Allemagne', 'Belgique', 'Canada', 'États-Unis', 'France', 'Royaume-Uni', 'Suisse'].sort((a, b) =>
  a.localeCompare(b, 'fr'),
)

/** Ce qui manque ou ne va pas, champ par champ (mêmes limites que le serveur) */
export function verifierInfos(v: Infos): Partial<Record<keyof Infos, string>> {
  const e: Partial<Record<keyof Infos, string>> = {}
  if (v.first_name.trim().length < 2) e.first_name = 'Il manque votre prénom.'
  if (v.last_name.trim().length < 2) e.last_name = 'Il manque votre nom.'
  if (v.phone.trim().length > 20) e.phone = 'Ce numéro est trop long : 20 caractères au plus.'
  const l = v.linkedin_url.trim()
  if (l && !/^https?:\/\/\S+\.\S+/i.test(l)) e.linkedin_url = 'Il manque le début de l’adresse : https://www.linkedin.com/in/…'
  return e
}

export function ChampsInfos({
  v,
  set,
  email,
  erreurs,
}: {
  v: Infos
  set: (v: Infos) => void
  email: string
  erreurs: Partial<Record<keyof Infos, string>>
}) {
  const maj = (k: keyof Infos) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set({ ...v, [k]: e.target.value })
  return (
    <div className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ id="first_name" label="Prénom" autoComplete="given-name" value={v.first_name} onChange={maj('first_name')} erreur={erreurs.first_name} />
        <Champ id="last_name" label="Nom" autoComplete="family-name" value={v.last_name} onChange={maj('last_name')} erreur={erreurs.last_name} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Champ id="current_city" label="Ville où vous vivez" autoComplete="address-level2" maxLength={100} value={v.current_city} onChange={maj('current_city')} />
        <Champ id="current_country" label="Pays" list="pays-liste" autoComplete="country-name" maxLength={100} value={v.current_country} onChange={maj('current_country')} />
        <datalist id="pays-liste">
          {PAYS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      </div>
      <Champ
        id="email"
        label="Email"
        value={email}
        readOnly
        className="cursor-default border-sable! bg-creme! text-olive!"
        aide="C’est l’adresse de connexion : l’équipe AET Connect peut la changer pour vous."
      />
      <Champ id="phone" label="Téléphone" type="tel" autoComplete="tel" placeholder="+225 07 00 00 00 00" value={v.phone} onChange={maj('phone')} erreur={erreurs.phone} />
      <Champ
        id="linkedin_url"
        label="LinkedIn"
        type="url"
        inputMode="url"
        spellCheck={false}
        placeholder="https://www.linkedin.com/in/…"
        value={v.linkedin_url}
        onChange={maj('linkedin_url')}
        erreur={erreurs.linkedin_url}
      />
      <ZoneTexte
        id="bio"
        label="En quelques mots"
        maxLength={500}
        placeholder="Votre métier, votre parcours depuis l’école, ce que vous pouvez apporter aux collègues…"
        value={v.bio}
        onChange={maj('bio')}
        aide={<span className="tabular-nums">{v.bio.length}/500</span>}
      />
    </div>
  )
}

/* ─────────── Photo ─────────── */

/**
 * Ajouter, changer ou retirer sa photo. La nouvelle photo est enregistrée avant que l'ancienne soit effacée du
 * stockage ; « Retirer » efface l'adresse en base même si l'image ne se charge plus.
 */
export function usePhotoProfil(member: { id: string; avatar_url: string | null } | null) {
  const cache = useMemberCache()
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState<'ajout' | 'retrait' | null>(null)
  const input = useRef<HTMLInputElement>(null)

  const effacerAncienne = (url: string | null) => {
    if (member && url) deleteAvatar(member.id, url).catch(() => {})
  }

  const ajouter = async (f: File) => {
    if (!member) return
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return setErreur('Cette image n’est pas au bon format : JPG, PNG ou WebP.')
    if (f.size > 2 * 1024 * 1024) return setErreur(`Cette photo dépasse 2${N}Mo. Une image plus légère fera l’affaire.`)
    setErreur('')
    setEnvoi('ajout')
    const ancienne = member.avatar_url
    try {
      const url = await uploadAvatar(member.id, f)
      await apiClient.updateProfile({ avatar_url: url })
      cache.patch({ avatar_url: url })
      effacerAncienne(ancienne)
    } catch (e) {
      setErreur(messageApi(e, 'La photo n’a pas pu être enregistrée. Vous pouvez réessayer dans un instant.'))
    } finally {
      setEnvoi(null)
    }
  }

  const retirer = async () => {
    if (!member?.avatar_url) return
    setErreur('')
    setEnvoi('retrait')
    const ancienne = member.avatar_url
    try {
      // null : efface l'adresse (undefined disparaîtrait du JSON)
      await apiClient.updateProfile({ avatar_url: null })
      cache.patch({ avatar_url: null })
      effacerAncienne(ancienne)
    } catch (e) {
      setErreur(messageApi(e, 'La photo n’a pas pu être retirée. Vous pouvez réessayer dans un instant.'))
    } finally {
      setEnvoi(null)
    }
  }

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
        if (f) ajouter(f)
      }}
    />
  )
  return { erreur, envoi, choisir: () => input.current?.click(), retirer, champ }
}

/* ─────────── Mot de passe ─────────── */

// Les mêmes règles qu'à l'inscription (le serveur applique les mêmes)
const REGLES = REGLES_INSCRIPTION

function ChampSecret({
  id,
  label,
  value,
  onChange,
  autoComplete,
  decrit,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  autoComplete: string
  decrit?: string
}) {
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
          className="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-vert transition-colors hover:text-terre"
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
  const [etat, setEtat] = useState<Etat>('repos')
  const [erreur, setErreur] = useState('')

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ancien) return setErreur('Il manque votre mot de passe actuel.')
    if (!REGLES.every((r) => r.test(nouveau))) return setErreur('Le nouveau mot de passe ne respecte pas encore toutes les règles.')
    if (nouveau !== confirme) return setErreur('Les deux nouveaux mots de passe ne sont pas identiques.')
    setErreur('')
    setEtat('envoi')
    try {
      await apiClient.changePassword(ancien, nouveau)
      setAncien('')
      setNouveau('')
      setConfirme('')
      setEtat('fait')
    } catch (err) {
      const m = err instanceof Error ? err.message : ''
      setErreur(/incorrect/i.test(m) ? 'Le mot de passe actuel ne correspond pas.' : messageApi(err, 'Le mot de passe n’a pas pu être changé.'))
      setEtat('repos')
    }
  }

  return (
    <form onSubmit={envoyer} noValidate className="sur-creme grid gap-5">
      <ChampSecret id="old_password" label="Mot de passe actuel" autoComplete="current-password" value={ancien} onChange={setAncien} />
      <div className="grid gap-2">
        <ChampSecret
          id="new_password"
          label="Nouveau mot de passe"
          autoComplete="new-password"
          value={nouveau}
          onChange={(v) => {
            setNouveau(v)
            if (etat === 'fait') setEtat('repos')
          }}
          decrit="mdp-regles"
        />
        <ul id="mdp-regles" className="grid gap-1 text-sm">
          {REGLES.map((r) => {
            const ok = r.test(nouveau)
            return (
              <li key={r.label} className={`flex items-center gap-2 ${ok ? 'text-vert' : 'text-olive'}`}>
                <span aria-hidden="true" className={`grid size-4 shrink-0 place-items-center rounded-full border ${ok ? 'border-vert bg-vert text-creme' : 'border-trait'}`}>
                  {ok && <Check className="size-3" strokeWidth={3} />}
                </span>
                {r.label}
                <span className="sr-only">{ok ? ' : respectée' : ' : à respecter'}</span>
              </li>
            )
          })}
        </ul>
      </div>
      <ChampSecret id="confirm_password" label="Le nouveau, une seconde fois" autoComplete="new-password" value={confirme} onChange={setConfirme} />
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

export function Quitter({ onEnvoye }: { onEnvoye: () => Promise<void> }) {
  const [ouvert, setOuvert] = useState(false)
  const [raison, setRaison] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (ouvert) dialog.current?.showModal()
    else dialog.current?.close()
  }, [ouvert])

  const envoyer = async () => {
    setEnvoi(true)
    setErreur('')
    try {
      await apiClient.requestAccountDeletion(raison.trim() || undefined)
      await onEnvoye()
    } catch (e) {
      const m = e instanceof Error ? e.message : ''
      setErreur(
        /déjà en cours/i.test(m)
          ? 'Une demande est déjà en cours : l’équipe AET Connect s’en occupe.'
          : messageApi(e, 'La demande n’a pas pu partir. Vous pouvez réessayer dans un instant.'),
      )
      setEnvoi(false)
    }
  }

  return (
    <div>
      <p className="max-w-[56ch] text-base leading-relaxed text-olive">
        Vous pouvez demander la suppression de votre compte. L’équipe AET Connect l’examine avant de l’effectuer ; vos informations sont alors effacées
        définitivement.
      </p>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="mt-3 inline-flex min-h-11 items-center text-base text-alerte underline-offset-4 transition-colors hover:underline"
      >
        Demander la suppression de mon compte
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOuvert(false)}
        aria-labelledby="quitter-titre"
        className="sur-creme m-auto w-[min(32rem,calc(100vw-2rem))] rounded-3xl rounded-tr-[56px] bg-creme p-6 text-encre backdrop:bg-encre/50 sm:p-8"
      >
        <h2 id="quitter-titre" className="font-titre text-xl font-semibold tracking-[-0.02em] text-vert">
          Quitter AET Connect{N}?
        </h2>
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
        {erreur && (
          <p role="alert" className="mt-4 text-sm font-semibold text-alerte">
            {erreur}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            onClick={envoyer}
            disabled={envoi}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-alerte px-7 text-base font-semibold text-creme transition-colors hover:bg-alerte/90 disabled:opacity-60"
          >
            {envoi && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
            {envoi ? 'Envoi…' : 'Envoyer la demande'}
          </button>
          <button type="button" onClick={() => setOuvert(false)} disabled={envoi} className={lienTexte}>
            Rester
          </button>
        </div>
      </dialog>
    </div>
  )
}
