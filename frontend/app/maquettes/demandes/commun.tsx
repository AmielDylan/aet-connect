'use client'

// Maquettes de la page des demandes d'accès : des demandes fictives, à la forme de GET /api/admin/access-requests
// (avec promo_ambassador), et un état local qui imite l'acceptation et le refus.
import { useState } from 'react'
import Link from 'next/link'
import { Check, ChevronDown, Copy, Search } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'

export const N = ' '
export const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'
export const boutonVert =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte disabled:opacity-60'
export const boutonCreme =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors duration-200 hover:bg-white disabled:opacity-60'
export const boutonAlerte =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-alerte px-7 text-base font-semibold text-white transition-colors duration-200 hover:bg-alerte/90'
export const lienAlerte = 'inline-flex min-h-11 items-center text-base text-alerte underline-offset-4 hover:underline'

const MOI = { first_name: 'Koffi', last_name: 'Mensah' }

export type Statut = 'pending' | 'approved' | 'rejected'
export type Demande = {
  id: string
  first_name: string
  last_name: string
  email: string
  ecole: string
  ecole_nom: string
  pays: string
  entry_year: string
  message: string | null
  wants_ambassador: boolean
  promo_ambassador: { first_name: string; last_name: string } | null
  status: Statut
  created_at: string
  processed_at: string | null
}

const il = (jours: number, heures = 0) => new Date(Date.now() - jours * 86_400_000 - heures * 3_600_000).toISOString()
const DEPART: Demande[] = [
  {
    id: 'd1', first_name: 'Mariam', last_name: 'Coulibaly', email: 'mariam.coulibaly@exemple.ml', ecole: 'PMK (Kati)', ecole_nom: 'Prytanée militaire de Kati',
    pays: 'Mali', entry_year: '2008', message: 'Personne de ma promo n’est encore inscrit ; je peux rassembler les autres.', wants_ambassador: true,
    promo_ambassador: null, status: 'pending', created_at: il(0, 3), processed_at: null,
  },
  {
    id: 'd2', first_name: 'Ibrahim', last_name: 'Sanogo', email: 'i.sanogo@exemple.bf', ecole: 'PMK', ecole_nom: 'Prytanée militaire de Kadiogo',
    pays: 'Burkina Faso', entry_year: '1999', message: 'J’aimerais aider à animer la promo 1999.', wants_ambassador: true,
    promo_ambassador: { first_name: 'Aminata', last_name: 'Touré' }, status: 'pending', created_at: il(1), processed_at: null,
  },
  {
    id: 'd3', first_name: 'Jean-Baptiste', last_name: 'Ouédraogo', email: 'jb.ouedraogo@exemple.bf', ecole: 'PMK', ecole_nom: 'Prytanée militaire de Kadiogo',
    pays: 'Burkina Faso', entry_year: '1999', message: null, wants_ambassador: false,
    promo_ambassador: { first_name: 'Aminata', last_name: 'Touré' }, status: 'pending', created_at: il(2), processed_at: null,
  },
  {
    id: 'd4', first_name: 'Fatou', last_name: 'Diallo', email: 'fatou.diallo@exemple.sn', ecole: 'PMS', ecole_nom: 'Prytanée militaire de Saint-Louis',
    pays: 'Sénégal', entry_year: '2012', message: 'Un collègue m’a parlé du réseau, mais son code a expiré.', wants_ambassador: false,
    promo_ambassador: null, status: 'pending', created_at: il(5), processed_at: null,
  },
  {
    id: 'd5', first_name: 'Serge', last_name: 'Kouamé', email: 'serge.kouame@exemple.ci', ecole: 'EMPT', ecole_nom: 'École militaire préparatoire technique',
    pays: 'Côte d’Ivoire', entry_year: '2003', message: null, wants_ambassador: false,
    promo_ambassador: null, status: 'approved', created_at: il(9), processed_at: il(8),
  },
  {
    id: 'd6', first_name: 'Awa', last_name: 'Ndiaye', email: 'awa.ndiaye@exemple.sn', ecole: 'PMS', ecole_nom: 'Prytanée militaire de Saint-Louis',
    pays: 'Sénégal', entry_year: '2010', message: 'Promo 2010, section B.', wants_ambassador: false,
    promo_ambassador: null, status: 'approved', created_at: il(12), processed_at: il(11),
  },
  {
    id: 'd7', first_name: 'Paul', last_name: 'Martin', email: 'p.martin@exemple.fr', ecole: 'PMB', ecole_nom: 'Prytanée militaire de Bingerville',
    pays: 'Côte d’Ivoire', entry_year: '2021', message: 'Je voudrais voir le réseau.', wants_ambassador: false,
    promo_ambassador: null, status: 'rejected', created_at: il(15), processed_at: il(14),
  },
]

export type Resultat = { code: string; message: string }

/** Le message que le serveur rédige à l'acceptation (même texte que l'email à venir) */
function messageDe(d: Demande, code: string) {
  const jusquau = new Date(Date.now() + 30 * 86_400_000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  return [
    `Bonjour ${d.first_name},`,
    '',
    `Votre demande d'accès à AET Connect (${d.ecole_nom}, promo ${d.entry_year}) est acceptée.`,
    '',
    `Votre code d'invitation : ${code}`,
    `Il est valable jusqu'au ${jusquau}.`,
    '',
    `Pour vous inscrire : https://aet-connect.vercel.app/register/with-code?code=${code}`,
    '',
    "L'équipe AET Connect",
  ].join('\n')
}

/** Les demandes et ce qu'on en fait, en mémoire */
export function useDemandes() {
  const [demandes, setDemandes] = useState(DEPART)
  const maintenant = () => new Date().toISOString()
  return {
    demandes,
    accepter(id: string, ambassadeur: boolean): Resultat {
      const d = demandes.find((x) => x.id === id)!
      const code = `AET-${ambassadeur ? 'K7QM' : 'R4TX'}-${id.toUpperCase()}9P`
      setDemandes((l) => l.map((x) => (x.id === id ? { ...x, status: 'approved', processed_at: maintenant() } : x)))
      return { code, message: messageDe(d, code) }
    },
    refuser(id: string) {
      setDemandes((l) => l.map((x) => (x.id === id ? { ...x, status: 'rejected', processed_at: maintenant() } : x)))
    },
  }
}

/** « aujourd'hui », « hier », « il y a 5 jours » */
export function depuis(date: string) {
  const jours = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000))
  return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(-jours, 'day')
}

export const nom = (p: { first_name: string; last_name: string }) => `${p.first_name} ${p.last_name}`
/** « de Fatou », « d’Ibrahim » */
export const de = (mot: string) => (/^[aeiouyhâàéèêîïôûAEIOUYHÂÀÉÈÊÎÏÔÛ]/.test(mot) ? `d’${mot}` : `de ${mot}`)

/* ─────────── Filtre par statut ─────────── */

export type Filtre = Statut | 'all'
const FILTRES: [Filtre, string][] = [
  ['pending', 'En attente'],
  ['approved', 'Acceptées'],
  ['rejected', 'Refusées'],
  ['all', 'Toutes'],
]

export function Filtres({ valeur, onChange, demandes }: { valeur: Filtre; onChange: (f: Filtre) => void; demandes: Demande[] }) {
  return (
    <div role="radiogroup" aria-label="Afficher" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-sable/60 p-1">
      {FILTRES.map(([f, texte]) => {
        const n = f === 'all' ? demandes.length : demandes.filter((d) => d.status === f).length
        const actif = valeur === f
        return (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={actif}
            onClick={() => onChange(f)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-sm transition-colors sm:gap-2 sm:px-4 ${
              actif ? 'bg-white font-semibold text-vert' : 'text-encre hover:text-terre'
            }`}
          >
            {texte}
            <span className="tabular-nums text-olive">{n}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ─────────── Nommer ambassadeur ─────────── */

/** Un seul ambassadeur par promo : l'interrupteur est grisé si la promo en a déjà un, et dit qui */
export function ChoixAmbassadeur({
  d,
  actif,
  onChange,
  surVert = false,
}: {
  d: Demande
  actif: boolean
  onChange: (v: boolean) => void
  surVert?: boolean
}) {
  const pris = d.promo_ambassador
  const id = `ambassadeur-${d.id}`
  return (
    <div className="flex min-h-12 items-center justify-between gap-4">
      <label htmlFor={id} className={`min-w-0 ${pris ? '' : 'cursor-pointer'}`}>
        <span className={`block text-base ${surVert ? 'text-creme' : 'text-encre'}`}>Nommer ambassadeur de sa promo</span>
        <span className={`block text-sm ${surVert ? 'text-brume' : 'text-olive'}`}>
          {pris
            ? `${nom(pris)} représente déjà la promo ${d.entry_year}.`
            : d.wants_ambassador
              ? 'La personne l’a proposé. 15 invitations au lieu de 3.'
              : '15 invitations au lieu de 3.'}
        </span>
      </label>
      <span className="flex shrink-0 items-center gap-3">
        <span aria-hidden="true" className={`w-8 text-right text-sm ${surVert ? 'text-brume' : 'text-olive'}`}>
          {actif ? 'Oui' : 'Non'}
        </span>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={actif}
          disabled={!!pris}
          onClick={() => onChange(!actif)}
          className={`relative h-8 w-14 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
            surVert ? (actif ? 'bg-creme' : 'bg-creme/20') : actif ? 'bg-vert' : 'bg-sable'
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

/* ─────────── Le message à transmettre ─────────── */

function BoutonCopier({ texte, libelle, className }: { texte: string; libelle: string; className: string }) {
  const [copie, setCopie] = useState(false)
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        navigator.clipboard?.writeText(texte).catch(() => {})
        setCopie(true)
        setTimeout(() => setCopie(false), 2000)
      }}
    >
      {copie ? <Check className="size-[18px]" aria-hidden="true" /> : <Copy className="size-[18px]" aria-hidden="true" />}
      {copie ? 'Copié' : libelle}
    </button>
  )
}

/** Après l'acceptation : le code, et le message prêt à envoyer par email ou WhatsApp */
export function MessageATransmettre({ d, r, surVert = false, fond = 'creme' }: { d: Demande; r: Resultat; surVert?: boolean; fond?: 'creme' | 'blanc' }) {
  return (
    <div>
      <p className={`text-base ${surVert ? 'text-brume' : 'text-olive'}`}>
        Aucun email ne part encore tout seul : envoyez ce message à {d.first_name}, par email ({d.email}) ou WhatsApp.
      </p>
      <p className={`mt-4 font-titre text-2xl font-semibold tracking-[0.04em] ${surVert ? 'text-or' : 'text-vert'}`}>{r.code}</p>
      <pre
        className={`mt-4 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl p-4 font-texte text-sm leading-relaxed ${
          surVert ? 'bg-creme/10 text-creme' : fond === 'blanc' ? 'bg-white text-encre' : 'bg-creme text-encre'
        }`}
      >
        {r.message}
      </pre>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        <BoutonCopier texte={r.message} libelle="Copier le message" className={surVert ? boutonCreme : boutonVert} />
        <BoutonCopier
          texte={r.code}
          libelle="Copier le code"
          className={`inline-flex min-h-11 items-center gap-2 text-base ${surVert ? 'text-creme hover:text-or' : 'text-encre hover:text-terre'}`}
        />
      </div>
    </div>
  )
}

/* ─────────── En-tête ─────────── */

export function EnteteMaquette({ attente }: { attente: number }) {
  return (
    <>
      <div className="bg-terre px-4 py-2 text-center text-sm text-creme">Maquette · demandes fictives, rien n’est enregistré</div>
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
            <span className="inline-flex min-h-11 items-center gap-2 text-base text-vert underline decoration-terre decoration-2 underline-offset-8">
              Administration
              {attente > 0 && (
                <span className="rounded-full bg-terre px-2 py-0.5 text-xs font-semibold tabular-nums text-creme no-underline">{attente}</span>
              )}
              <ChevronDown className="size-4" aria-hidden="true" />
            </span>
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
