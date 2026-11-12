'use client'

// Maquettes des demandes de suppression de compte : des demandes fictives, à la forme de
// GET /api/admin/deletion-requests, et un état local qui imite la suppression et le refus.
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { Brand } from '@/components/landing/site-header'
import { Portrait } from '@/components/espace/portrait'

export { Drapeau } from '@/components/landing/drapeau'
export { Filtres, N, boutonAlerte, boutonVert, depuis, lienSimple } from '@/components/espace/administration'

export const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

export type Statut = 'pending' | 'approved' | 'rejected'
export type Suppression = {
  id: string
  /** null une fois le compte supprimé : la demande reste comme trace */
  membre: { prenom: string; nom: string; email: string; ecole: string; pays: string; promo: string; role: 'alumni' | 'admin'; arrivee: string } | null
  requester_name: string
  requester_email: string
  reason: string | null
  status: Statut
  created_at: string
  processed_at: string | null
}

const il = (jours: number, heures = 0) => new Date(Date.now() - jours * 86_400_000 - heures * 3_600_000).toISOString()
const DEPART: Suppression[] = [
  {
    id: 's1', requester_name: 'Yao Kouassi', requester_email: 'yao.kouassi@exemple.ci', reason: 'Je n’utilise plus le site, et je préfère que mes coordonnées n’y restent pas.',
    membre: { prenom: 'Yao', nom: 'Kouassi', email: 'yao.kouassi@exemple.ci', ecole: 'PMB', pays: 'Bénin', promo: '2001', role: 'alumni', arrivee: il(60) },
    status: 'pending', created_at: il(0, 5), processed_at: null,
  },
  {
    id: 's2', requester_name: 'Awa Ndiaye', requester_email: 'awa.ndiaye@exemple.sn', reason: null,
    membre: { prenom: 'Awa', nom: 'Ndiaye', email: 'awa.ndiaye@exemple.sn', ecole: 'PMS', pays: 'Sénégal', promo: '2010', role: 'alumni', arrivee: il(40) },
    status: 'pending', created_at: il(2), processed_at: null,
  },
  {
    id: 's3', requester_name: 'Fatou Sow', requester_email: 'fatou.sow@exemple.sn', reason: 'Je change d’adresse email, je referai un compte.',
    membre: { prenom: 'Fatou', nom: 'Sow', email: 'fatou.sow@exemple.sn', ecole: 'LMJF-GMK', pays: 'Bénin', promo: '2014', role: 'admin', arrivee: il(280) },
    status: 'pending', created_at: il(4), processed_at: null,
  },
  { id: 's4', requester_name: 'Paul Agbo', requester_email: 'paul.agbo@exemple.bj', reason: 'Plus d’intérêt.', membre: null, status: 'approved', created_at: il(12), processed_at: il(11) },
  { id: 's5', requester_name: 'Rokia Traoré', requester_email: 'rokia.traore@exemple.ml', reason: null, membre: null, status: 'approved', created_at: il(25), processed_at: il(24) },
  {
    id: 's6', requester_name: 'Serge Kouamé', requester_email: 'serge.kouame@exemple.ci', reason: 'Erreur, je voulais seulement masquer mon téléphone.',
    membre: { prenom: 'Serge', nom: 'Kouamé', email: 'serge.kouame@exemple.ci', ecole: 'EMPT', pays: 'Côte d’Ivoire', promo: '2003', role: 'alumni', arrivee: il(150) },
    status: 'rejected', created_at: il(30), processed_at: il(30),
  },
]

export type Filtre = Statut | 'all'

/** Les demandes et ce qu'on en fait, en mémoire */
export function useSuppressions() {
  const [demandes, setDemandes] = useState(DEPART)
  const maj = (id: string, p: Partial<Suppression>) => setDemandes((l) => l.map((d) => (d.id === id ? { ...d, ...p } : d)))
  return {
    demandes,
    compte: (f: Filtre) => (f === 'all' ? demandes.length : demandes.filter((d) => d.status === f).length),
    supprimer: (id: string) => maj(id, { status: 'approved', membre: null, processed_at: new Date().toISOString() }),
    garder: (id: string) => maj(id, { status: 'rejected', processed_at: new Date().toISOString() }),
  }
}
export type Etat = ReturnType<typeof useSuppressions>

export const optionsFiltre = (e: Etat) => [
  { valeur: 'pending' as Filtre, texte: 'En attente', n: e.compte('pending') },
  { valeur: 'approved' as Filtre, texte: 'Comptes supprimés', n: e.compte('approved') },
  { valeur: 'rejected' as Filtre, texte: 'Comptes gardés', n: e.compte('rejected') },
  { valeur: 'all' as Filtre, texte: 'Toutes', n: e.compte('all') },
]

/** Ce qu'il advient d'une demande traitée, en quelques mots */
export const issue = (d: Suppression) => (d.status === 'approved' ? 'Compte supprimé' : d.status === 'rejected' ? 'Compte gardé' : 'En attente')

/* ─────────── La décision ─────────── */

/**
 * « Supprimer le compte » (plein, en alerte, après confirmation) ou « Garder le compte ».
 * Le compte d'un administrateur ne se supprime pas ici : il faut d'abord lui retirer ses droits.
 */
export function Decision({ d, e, surVert = false }: { d: Suppression; e: Etat; surVert?: boolean }) {
  const [confirme, setConfirme] = useState<null | 'supprimer' | 'garder'>(null)
  const texte = surVert ? 'text-creme' : 'text-encre'
  const lien = `inline-flex min-h-11 items-center text-base ${surVert ? 'text-creme hover:text-or' : 'text-encre hover:text-terre'}`
  if (d.status !== 'pending') return null
  if (d.membre?.role === 'admin') {
    return (
      <div className="grid gap-2">
        <p className={`text-base ${surVert ? 'text-brume' : 'text-olive'}`}>
          C’est un compte administrateur : retirez-lui d’abord ses droits (page des membres) pour pouvoir le supprimer.
        </p>
        <div className="flex flex-wrap items-center gap-x-6">
          <Link href="#" className={lien}>
            Ouvrir la page des membres
          </Link>
          <button type="button" className={lien} onClick={() => e.garder(d.id)}>
            Garder le compte
          </button>
        </div>
      </div>
    )
  }
  if (confirme === 'supprimer') {
    return (
      <div className={`rounded-2xl p-4 ${surVert ? 'bg-creme/10' : 'bg-creme'}`}>
        <p className={`text-base ${texte}`}>
          Supprimer le compte de {d.requester_name}
          {' '}? Sa fiche disparaît de l’annuaire et ses codes encore valables sont révoqués. La demande reste dans l’historique. On ne peut pas revenir en
          arrière.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            className="inline-flex min-h-12 items-center rounded-full bg-alerte px-7 text-base font-semibold text-white hover:bg-alerte/90"
            onClick={() => e.supprimer(d.id)}
          >
            Supprimer le compte
          </button>
          <button type="button" className={lien} onClick={() => setConfirme(null)}>
            Annuler
          </button>
        </div>
      </div>
    )
  }
  if (confirme === 'garder') {
    return (
      <div className={`rounded-2xl p-4 ${surVert ? 'bg-creme/10' : 'bg-creme'}`}>
        <p className={`text-base ${texte}`}>
          Garder le compte{' '}? La demande est classée et le compte reste actif. Aucun message ne part : pensez à prévenir {d.membre?.prenom ?? d.requester_name} ({d.requester_email}).
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <button
            type="button"
            className={`inline-flex min-h-12 items-center rounded-full px-7 text-base font-semibold ${surVert ? 'bg-creme text-vert hover:bg-white' : 'bg-vert text-creme hover:bg-vert-carte'}`}
            onClick={() => e.garder(d.id)}
          >
            Garder le compte
          </button>
          <button type="button" className={lien} onClick={() => setConfirme(null)}>
            Annuler
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <button
        type="button"
        className="inline-flex min-h-12 items-center rounded-full bg-alerte px-7 text-base font-semibold text-white hover:bg-alerte/90"
        onClick={() => setConfirme('supprimer')}
      >
        Supprimer le compte
      </button>
      <button type="button" className={lien} onClick={() => setConfirme('garder')}>
        Garder le compte
      </button>
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
              {attente > 0 && <span className="rounded-full bg-terre px-2 py-0.5 text-xs font-semibold tabular-nums text-creme no-underline">{attente}</span>}
              <ChevronDown className="size-4" aria-hidden="true" />
            </span>
          </nav>
          <span className="hidden items-center gap-2 lg:flex">
            <Portrait prenom="Koffi" nom="Mensah" className="size-9 rounded-full bg-vert text-xs text-creme" />
            <span className="text-base">Koffi</span>
          </span>
          <span className="text-base text-vert lg:hidden">Menu</span>
        </div>
      </header>
    </>
  )
}
