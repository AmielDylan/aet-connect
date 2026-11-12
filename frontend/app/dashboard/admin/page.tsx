'use client'

// Administration · vue d'ensemble, proposition B « Les chiffres » : quatre chiffres en tête, chacun menant à sa
// section ; un panneau vert, les membres par école et par rôle ; puis les demandes d'accès en attente.
// Tous les nombres viennent de GET /api/admin/stats et des demandes en attente.
import { useQuery } from '@tanstack/react-query'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { apiClient } from '@/lib/api'
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import type { AdminStats } from '@/types'

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em]'
const chiffre = 'font-titre text-[2.5rem] font-semibold leading-none tabular-nums tracking-[-0.03em] text-vert'
const nombre = (n: number) => n.toLocaleString('fr-FR')
/** En français, 0 et 1 prennent le singulier */
const accord = (n: number, un: string, plusieurs: string) => (n > 1 ? plusieurs : un)

const ROLES: [string, string, string][] = [
  ['alumni', 'membre', 'membres'],
  ['moderator', 'modérateur', 'modérateurs'],
  ['admin', 'administrateur', 'administrateurs'],
]

type DemandeAcces = {
  id: string
  first_name: string
  last_name: string
  entry_year: string
  wants_ambassador: boolean
  created_at: string
  schools: { name_fr: string; acronym: string | null; country: string } | null
}

/** « aujourd'hui », « hier », « il y a 5 jours » */
function depuis(date: string) {
  const jours = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000))
  return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(-jours, 'day')
}

/** Les membres par école, en barres d'or : la plus grande école donne la longueur */
function Barres({ ecoles }: { ecoles: [string, number][] }) {
  const max = Math.max(1, ...ecoles.map(([, n]) => n))
  return (
    <ul className="grid gap-3">
      {ecoles.map(([ecole, n]) => (
        <li key={ecole} className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm">
          <span className="truncate text-brume" title={ecole}>
            {ecole}
          </span>
          <span className="h-2.5 rounded-full bg-creme/15">
            <span className="block h-full rounded-full bg-or" style={{ width: `${(n / max) * 100}%` }} />
          </span>
          <span className="text-right tabular-nums text-creme">{nombre(n)}</span>
        </li>
      ))}
    </ul>
  )
}

export default function Administration() {
  const { isAdmin } = useAdminCheck()
  const stats = useQuery<AdminStats>({ queryKey: ['admin-stats'], queryFn: () => apiClient.getAdminStats(), enabled: isAdmin })
  const demandes = useQuery<DemandeAcces[]>({
    queryKey: ['access-requests', 'pending'],
    queryFn: () => apiClient.getAccessRequests('pending'),
    enabled: isAdmin,
  })

  if (!isAdmin) return null

  const o = stats.data?.overview
  const tuiles = o
    ? [
        {
          n: o.totalUsers,
          texte: `${accord(o.totalUsers, 'membre', 'membres')}${o.newUsers > 0 ? `, dont ${nombre(o.newUsers)} cette semaine` : ''}`,
          lien: { href: '/dashboard/admin/users', texte: 'Voir' },
        },
        {
          n: o.pendingRequests,
          texte: accord(o.pendingRequests, 'demande d’accès en attente', 'demandes d’accès en attente'),
          lien: { href: '/dashboard/admin/pending', texte: o.pendingRequests > 0 ? 'Répondre' : 'Voir' },
        },
        {
          n: o.pendingDeletions,
          texte: accord(o.pendingDeletions, 'demande de suppression en attente', 'demandes de suppression en attente'),
          lien: { href: '/dashboard/admin/deletions', texte: o.pendingDeletions > 0 ? 'Répondre' : 'Voir' },
        },
        { n: o.usedCodes, texte: `${accord(o.usedCodes, 'code utilisé', 'codes utilisés')} sur ${nombre(o.totalCodes)}`, lien: null },
      ]
    : []
  const ecoles = Object.entries(stats.data?.schools ?? {}) as [string, number][]
  const roles = ROLES.map(([cle, un, plusieurs]) => [stats.data?.roles[cle] ?? 0, un, plusieurs] as const).filter(([n]) => n > 0)
  const enAttente = demandes.data ?? []

  return (
    <div>
      <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Le réseau en chiffres</h1>

      {stats.isLoading ? (
        <div aria-hidden="true">
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <li key={i} className="h-40 animate-pulse rounded-3xl bg-sable/50" />
            ))}
          </ul>
          <div className="mt-10 h-96 animate-pulse rounded-3xl rounded-tr-[56px] bg-sable/50 lg:rounded-tr-[76px]" />
        </div>
      ) : stats.isError || !o ? (
        <div className="mt-8 rounded-3xl bg-white p-8 text-center">
          <p className="text-base text-olive">Les chiffres n’ont pas pu être chargés.</p>
          <button
            type="button"
            onClick={() => stats.refetch()}
            className="mt-4 inline-flex min-h-12 items-center rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors hover:bg-vert-carte"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tuiles.map((t) => (
              <li key={t.texte} className="flex flex-col rounded-3xl bg-white p-4 sm:p-6">
                <p className={chiffre}>{nombre(t.n)}</p>
                <p className="mt-2 text-base text-olive">{t.texte}</p>
                {t.lien && (
                  <div className="mt-auto pt-3">
                    <LienFleche href={t.lien.href} visible>
                      {t.lien.texte}
                      <span className="sr-only">{`\u00a0: ${nombre(t.n)} ${t.texte}`}</span>
                    </LienFleche>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <section className="sur-vert trame trame-sur-vert mt-10 grid gap-10 rounded-3xl rounded-tr-[56px] bg-vert px-6 py-10 text-creme sm:px-10 lg:grid-cols-[1.5fr_1fr] lg:rounded-tr-[76px] lg:px-12">
            <div aria-labelledby="par-ecole" role="group">
              <h2 id="par-ecole" className={titre2}>
                Membres par école
              </h2>
              <div className="mt-5">
                {ecoles.length ? <Barres ecoles={ecoles} /> : <p className="text-base text-brume">Aucun membre pour l’instant.</p>}
              </div>
            </div>
            <div aria-labelledby="par-role" role="group">
              <h2 id="par-role" className={titre2}>
                Par rôle
              </h2>
              <dl className="mt-5 grid gap-5">
                {roles.map(([n, un, plusieurs]) => (
                  <div key={un} className="flex flex-row-reverse items-baseline justify-end gap-3">
                    <dt className="text-base text-brume">{accord(n, un, plusieurs)}</dt>
                    <dd className="font-titre text-3xl font-semibold tabular-nums tracking-[-0.03em] text-or">{nombre(n)}</dd>
                  </div>
                ))}
              </dl>
              {o.totalRequests > 0 && (
                <p className="mt-6 text-base text-brume">
                  {nombre(o.approvedRequests)} {accord(o.approvedRequests, 'demande d’accès acceptée', 'demandes d’accès acceptées')} sur{' '}
                  {nombre(o.totalRequests)}.
                </p>
              )}
            </div>
          </section>
        </>
      )}

      <section aria-labelledby="demandes" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h2 id="demandes" className={`${titre2} text-vert`}>
            Demandes d’accès en attente
          </h2>
          <LienFleche href="/dashboard/admin/pending" visible>
            Toutes les demandes
          </LienFleche>
        </div>
        {demandes.isLoading ? (
          <ul className="mt-5 grid gap-2" aria-hidden="true">
            {Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="h-16 animate-pulse rounded-2xl bg-sable/50" />
            ))}
          </ul>
        ) : demandes.isError ? (
          <p className="mt-5 text-base text-olive">Les demandes n’ont pas pu être chargées.</p>
        ) : enAttente.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-white px-5 py-4 text-base text-olive">Aucune demande en attente.</p>
        ) : (
          <ul className="mt-5 grid gap-2">
            {enAttente.slice(0, 5).map((d) => {
              const ecole = d.schools?.acronym || d.schools?.name_fr
              return (
                <li
                  key={d.id}
                  className="grid gap-x-6 gap-y-1 rounded-2xl bg-white px-5 py-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center"
                >
                  <p className="text-base text-encre">
                    {d.first_name} {d.last_name}
                    {d.wants_ambassador && <span className="block text-sm text-terre sm:ml-2 sm:inline">veut représenter sa promo</span>}
                  </p>
                  <p className="flex flex-wrap items-center gap-x-2 text-base text-olive">
                    {ecole && (
                      <>
                        {ecole} {d.schools?.country && <Drapeau pays={d.schools.country} className="h-3.5 w-auto" />} ·{' '}
                      </>
                    )}
                    {d.entry_year} · {depuis(d.created_at)}
                  </p>
                  <LienFleche href="/dashboard/admin/pending">
                    Répondre
                    <span className="sr-only">
                      {' '}
                      à {d.first_name} {d.last_name}
                    </span>
                  </LienFleche>
                </li>
              )
            })}
          </ul>
        )}
        {enAttente.length > 5 && (
          <p className="mt-3 text-base text-olive">
            Et {nombre(enAttente.length - 5)} {accord(enAttente.length - 5, 'autre', 'autres')}.
          </p>
        )}
      </section>
    </div>
  )
}
