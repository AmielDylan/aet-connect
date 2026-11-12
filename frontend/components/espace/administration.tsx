'use client'

// Briques des pages de l'administration : filtre par statut, choix de l'ambassadeur, message à transmettre.
import { useId, useState } from 'react'
import { Check, Copy } from 'lucide-react'

export const N = ' '
export const boutonVert =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte disabled:opacity-60'
/** Le bouton qui confirme un geste sans retour (refuser une demande) : plein, en alerte */
export const boutonAlerte =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-alerte px-7 text-base font-semibold text-white transition-colors duration-200 hover:bg-alerte/90 disabled:opacity-60'
export const lienAlerte = 'inline-flex min-h-11 items-center text-base text-alerte underline-offset-4 hover:underline'
export const lienSimple = 'inline-flex min-h-11 items-center text-base text-encre transition-colors hover:text-terre'

/** « aujourd'hui », « hier », « il y a 5 jours » */
export function depuis(date: string) {
  const jours = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000))
  return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(-jours, 'day')
}

/** « de Fatou », « d’Ibrahim » */
export const de = (mot: string) => (/^[aeiouyhâàéèêîïôûAEIOUYHÂÀÉÈÊÎÏÔÛ]/.test(mot) ? `d’${mot}` : `de ${mot}`)

export const nomComplet = (p: { first_name: string | null; last_name: string | null }) => [p.first_name, p.last_name].filter(Boolean).join(' ')

/* ─────────── Filtre par statut ─────────── */

/** Un choix parmi quelques statuts, chacun avec son nombre */
export function Filtres<T extends string>({
  options,
  valeur,
  onChange,
}: {
  options: { valeur: T; texte: string; n?: number }[]
  valeur: T
  onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label="Afficher" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-sable/60 p-1">
      {options.map((o) => {
        const actif = valeur === o.valeur
        return (
          <button
            key={o.valeur}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => onChange(o.valeur)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm transition-colors sm:gap-2 sm:px-4 ${
              actif ? 'bg-white font-semibold text-vert' : 'text-encre hover:text-terre'
            }`}
          >
            {o.texte}
            {o.n !== undefined && <span className="tabular-nums text-olive">{o.n}</span>}
          </button>
        )
      })}
    </div>
  )
}

/* ─────────── Nommer ambassadeur ─────────── */

/** Un seul ambassadeur par promo : sans ambassadeur, l'interrupteur ; sinon, qui l'est déjà */
export function ChoixAmbassadeur({
  annee,
  souhaite,
  actuel,
  actif,
  onChange,
}: {
  annee: string
  souhaite: boolean
  actuel: { first_name: string | null; last_name: string | null } | null
  actif: boolean
  onChange: (v: boolean) => void
}) {
  // Le détail d'une demande peut être rendu deux fois (mobile et grand écran) : un identifiant par rendu
  const id = useId()
  if (actuel) {
    return (
      <p className="text-base text-olive">
        {nomComplet(actuel)} représente la promo {annee}.
        {souhaite && ' La personne proposait de le faire.'}
      </p>
    )
  }
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-creme px-4 py-2">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-base text-encre">Nommer ambassadeur de sa promo</span>
        <span className="block text-sm text-olive">
          {souhaite ? 'La personne l’a proposé. ' : ''}La promo {annee} n’en a pas encore. 15 invitations au lieu de 3.
        </span>
      </label>
      <span className="flex shrink-0 items-center gap-3">
        <span aria-hidden="true" className="w-8 text-right text-sm text-olive">
          {actif ? 'Oui' : 'Non'}
        </span>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={actif}
          onClick={() => onChange(!actif)}
          className={`relative h-8 w-14 rounded-full transition-colors duration-200 ${actif ? 'bg-vert' : 'bg-sable'}`}
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

/* ─────────── Le message à transmettre ─────────── */

function BoutonCopier({ texte, libelle, className }: { texte: string; libelle: string; className: string }) {
  const [etat, setEtat] = useState<'repos' | 'copie' | 'echec'>('repos')
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        navigator.clipboard
          .writeText(texte)
          .then(() => setEtat('copie'))
          .catch(() => setEtat('echec'))
          .finally(() => setTimeout(() => setEtat('repos'), 2500))
      }}
    >
      {etat === 'copie' ? <Check className="size-[18px]" aria-hidden="true" /> : <Copy className="size-[18px]" aria-hidden="true" />}
      <span aria-live="polite">{etat === 'copie' ? 'Copié' : etat === 'echec' ? 'Copie impossible, sélectionnez le texte' : libelle}</span>
    </button>
  )
}

/** Après l'acceptation : le code, et le message prêt à envoyer (ou déjà parti par email) */
export function MessageATransmettre({
  prenom,
  email,
  code,
  message,
  envoye,
}: {
  prenom: string
  email: string
  code: string
  message: string
  envoye: boolean
}) {
  return (
    <div>
      <p className="text-base text-olive">
        {envoye
          ? `Le message est parti par email à ${prenom} (${email}).`
          : `Aucun email ne part encore tout seul : envoyez ce message à ${prenom}, par email (${email}) ou WhatsApp.`}
      </p>
      <p className="mt-4 font-titre text-2xl font-semibold tracking-[0.04em] text-vert">{code}</p>
      <pre className="mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-creme p-4 font-texte text-sm leading-relaxed text-encre">{message}</pre>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <BoutonCopier texte={message} libelle="Copier le message" className={boutonVert} />
        <BoutonCopier texte={code} libelle="Copier le code" className={`${lienSimple} gap-2`} />
      </div>
    </div>
  )
}
