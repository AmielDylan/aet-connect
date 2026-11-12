'use client'

// Administration · les membres, proposition C « Le tri » : comme la page des demandes d'accès, la liste à gauche et
// le membre choisi en détail à droite ; on gère sur place (rôle, ambassadeur, suppression). Sur mobile, chaque
// membre se déplie dans la liste, comme une FAQ, et le type de membre se choisit dans une liste déroulante.
import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { useAuth } from '@/hooks/use-auth'
import { apiClient } from '@/lib/api'
import { Drapeau } from '@/components/landing/drapeau'
import { Portrait } from '@/components/espace/portrait'
import { Filtres, N, boutonAlerte, boutonVert, depuis, lienSimple, nomComplet } from '@/components/espace/administration'
import type { AdminMember, AdminMembersPage } from '@/types'

type Role = AdminMember['role']
type Filtre = 'all' | Role | 'ambassadors'

const ROLES: { valeur: Role; texte: string; court: string }[] = [
  { valeur: 'alumni', texte: 'Membre', court: 'Membre' },
  { valeur: 'moderator', texte: 'Modérateur', court: 'Modér.' },
  { valeur: 'admin', texte: 'Administrateur', court: 'Admin.' },
]
const PAR_PAGE = 50
const champ = 'h-14 w-full rounded-full bg-white text-base text-encre outline-none ring-vert/30 focus-visible:ring-2'
const message = (e: unknown) => (e instanceof Error && e.message ? e.message : 'Une erreur est survenue. Réessayez.')
const pluriel = (n: number, un: string, plusieurs: string) => `${n.toLocaleString('fr-FR')} ${n > 1 ? plusieurs : un}`

/** Grand écran : un membre est toujours affiché à droite. Mobile : chaque membre se déplie sur place. */
const grandEcran = () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches

function invitations(m: AdminMember) {
  const n = m.invitations_used
  const sansLimite = m.role === 'admin' || (m.max_codes_allowed ?? 0) >= 999
  return `${pluriel(n, 'invitation', 'invitations')}${sansLimite ? ', sans limite' : ` sur ${m.max_codes_allowed ?? 3}`}`
}

/** Rôle et statut, en quelques mots : « Administrateur · ambassadeur » */
function Statut({ m }: { m: AdminMember }) {
  const morceaux = [m.role !== 'alumni' ? ROLES.find((r) => r.valeur === m.role)?.texte : null, m.is_ambassador ? 'ambassadeur' : null].filter(Boolean)
  if (!morceaux.length) return null
  const texte = morceaux.join(' · ')
  return <span className="text-terre">{texte.charAt(0).toUpperCase() + texte.slice(1)}</span>
}

/* ─────────── Le détail d'un membre ─────────── */

function Detail({ m, moi, entete = true, onSupprime }: { m: AdminMember; moi: boolean; entete?: boolean; onSupprime: () => void }) {
  const queryClient = useQueryClient()
  const idAmbassadeur = useId()
  const [confirme, setConfirme] = useState(false)
  const rafraichir = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
  }
  const role = useMutation({
    mutationFn: (r: Role) => apiClient.updateUserRole(m.id, r),
    onSuccess: rafraichir,
  })
  const ambassadeur = useMutation({
    mutationFn: (v: boolean) => apiClient.updateUserAmbassador(m.id, v),
    onSuccess: rafraichir,
  })
  const supprimer = useMutation({
    mutationFn: () => apiClient.deleteUser(m.id),
    onSuccess: () => {
      onSupprime()
      rafraichir()
    },
  })
  const erreur = role.error ?? ambassadeur.error ?? supprimer.error
  const ecole = m.schools?.acronym || m.schools?.name_fr
  const autreAmbassadeur = m.promo_ambassador && !m.is_ambassador

  return (
    <div className="grid gap-6">
      {entete && (
        <div className="flex items-center gap-4">
          <Portrait
            prenom={m.first_name ?? ''}
            nom={m.last_name ?? ''}
            src={m.avatar_url}
            className="size-16 shrink-0 rounded-2xl rounded-tr-[28px] bg-vert text-lg text-creme"
          />
          <div className="min-w-0">
            <h2 className="font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">
              {nomComplet(m)} {moi && <span className="font-texte text-base font-normal text-olive">· vous</span>}
            </h2>
            {ecole && (
              <p className="flex items-center gap-2 text-base text-encre">
                {ecole} {m.schools?.country && <Drapeau pays={m.schools.country} className="h-3.5 w-auto" />} · promo {m.entry_year}
              </p>
            )}
          </div>
        </div>
      )}

      <dl className="grid gap-x-6 text-base sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-y-2 [&>dt:first-child]:mt-0 [&>dt]:mt-3 [&>dt]:text-sm sm:[&>dt]:mt-0 sm:[&>dt]:text-base">
        <dt className="text-olive">Email</dt>
        <dd className="break-all">{m.email}</dd>
        {m.current_city && (
          <>
            <dt className="text-olive">Vit à</dt>
            <dd>{m.current_city}</dd>
          </>
        )}
        <dt className="text-olive">Arrivée</dt>
        <dd>{depuis(m.created_at)}</dd>
        <dt className="text-olive">Invitations</dt>
        <dd>{invitations(m)}</dd>
      </dl>

      <fieldset>
        <legend className="text-sm text-olive">Rôle</legend>
        <div role="radiogroup" aria-label="Rôle" className="mt-2 flex w-full gap-1 rounded-full bg-sable/60 p-1 lg:inline-flex lg:w-auto">
          {ROLES.map((r) => {
            const actif = m.role === r.valeur
            return (
              <button
                key={r.valeur}
                type="button"
                role="radio"
                aria-checked={actif}
                disabled={(moi && r.valeur !== 'admin') || role.isPending}
                onClick={() => !actif && role.mutate(r.valeur)}
                className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-full px-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 lg:flex-none lg:px-4 ${
                  actif ? 'bg-white font-semibold text-vert disabled:opacity-100' : 'text-encre hover:text-terre'
                }`}
              >
                <span className="lg:hidden">{r.court}</span>
                <span className="hidden lg:inline">{r.texte}</span>
              </button>
            )
          })}
        </div>
        {moi && <p className="mt-2 text-sm text-olive">Vous ne pouvez pas retirer vos propres droits.</p>}
      </fieldset>

      {/* Un seul ambassadeur par promo : si quelqu'un d'autre l'est, l'interrupteur n'apparaît pas */}
      {autreAmbassadeur ? (
        <p className="text-base text-olive">
          {nomComplet(m.promo_ambassador!)} représente la promo {ecole} {m.entry_year}.
        </p>
      ) : (
        <div className="flex min-h-12 items-center justify-between gap-4 rounded-2xl bg-creme px-4 py-2">
          <label htmlFor={idAmbassadeur} className="min-w-0 cursor-pointer">
            <span className="block text-base text-encre">Ambassadeur de sa promo</span>
            <span className="block text-sm text-olive">
              {m.role === 'admin' ? 'Invitations sans limite, comme tout administrateur.' : '15 invitations au lieu de 3.'}
            </span>
          </label>
          <span className="flex shrink-0 items-center gap-3">
            <span aria-hidden="true" className="w-8 text-right text-sm text-olive">
              {m.is_ambassador ? 'Oui' : 'Non'}
            </span>
            <button
              id={idAmbassadeur}
              type="button"
              role="switch"
              aria-checked={m.is_ambassador}
              disabled={ambassadeur.isPending}
              onClick={() => ambassadeur.mutate(!m.is_ambassador)}
              className={`relative h-8 w-14 rounded-full transition-colors duration-200 disabled:opacity-60 ${m.is_ambassador ? 'bg-vert' : 'bg-sable'}`}
            >
              <span
                className={`absolute top-1 size-6 rounded-full transition-[left] duration-200 motion-reduce:transition-none ${
                  m.is_ambassador ? 'left-7 bg-creme' : 'left-1 bg-white'
                }`}
              />
            </button>
          </span>
        </div>
      )}

      {erreur && (
        <p role="alert" className="text-base font-semibold text-alerte">
          {message(erreur)}
        </p>
      )}

      {/* En bas : « Supprimer le compte » à gauche, « Profil » à droite ; la confirmation s'ouvre dessous */}
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          {moi ? (
            <span />
          ) : m.role === 'admin' ? (
            <p className="max-w-[34ch] text-sm text-olive">Pour supprimer ce compte, retirez-lui d’abord ses droits d’administrateur.</p>
          ) : (
            <button
              type="button"
              aria-expanded={confirme}
              className="inline-flex min-h-11 items-center text-base text-alerte underline-offset-4 hover:underline"
              onClick={() => setConfirme(true)}
            >
              Supprimer le compte
            </button>
          )}
          <Link href={`/profile/${m.id}`} className={`${lienSimple} ml-auto gap-1`}>
            Profil
            <ArrowUpRight className="size-[18px]" aria-hidden="true" />
          </Link>
        </div>
        {confirme && !moi && m.role !== 'admin' && (
          <div className="rounded-2xl bg-creme p-4">
            <p className="text-base text-encre">
              Supprimer le compte de {nomComplet(m)}
              {N}? Sa fiche disparaît de l’annuaire et ses codes encore valables sont révoqués. On ne peut pas revenir en arrière.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
              <button type="button" className={boutonAlerte} disabled={supprimer.isPending} onClick={() => supprimer.mutate()}>
                {supprimer.isPending ? 'Suppression…' : 'Supprimer le compte'}
              </button>
              <button type="button" className={lienSimple} onClick={() => setConfirme(false)}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────── La page ─────────── */

export default function Membres() {
  const { isAdmin } = useAdminCheck()
  const { user } = useAuth()
  const [saisie, setSaisie] = useState('')
  const [recherche, setRecherche] = useState('')
  const [ecole, setEcole] = useState('')
  const [filtre, setFiltre] = useState<Filtre>('all')
  const [choisi, setChoisi] = useState<string | null>(null)

  // La recherche part 300 ms après la dernière frappe
  useEffect(() => {
    const t = setTimeout(() => setRecherche(saisie.trim()), 300)
    return () => clearTimeout(t)
  }, [saisie])

  const ecoles = useQuery({
    queryKey: ['schools'],
    queryFn: () => apiClient.getSchools(),
    enabled: isAdmin,
  })
  const liste = useInfiniteQuery({
    queryKey: ['admin-users', recherche, ecole, filtre],
    queryFn: ({ pageParam }) =>
      apiClient.getAdminUsers({
        search: recherche || undefined,
        school_id: ecole || undefined,
        role: filtre === 'all' || filtre === 'ambassadors' ? undefined : filtre,
        is_ambassador: filtre === 'ambassadors' || undefined,
        page: pageParam,
        limit: PAR_PAGE,
      }),
    initialPageParam: 1,
    getNextPageParam: (p: AdminMembersPage) => (p.pagination.page < p.pagination.totalPages ? p.pagination.page + 1 : undefined),
    enabled: isAdmin,
    placeholderData: (avant) => avant,
  })

  if (!isAdmin) return null

  const membres = liste.data?.pages.flatMap((p) => p.users) ?? []
  const nombres = liste.data?.pages[0]?.counts
  const actif = membres.find((m) => m.id === choisi) ?? membres[0]
  const ecoleChoisie = ecoles.data?.schools.find((s) => s.id === ecole)
  const triees = [...(ecoles.data?.schools ?? [])].sort((a, b) => (a.acronym || a.name_fr).localeCompare(b.acronym || b.name_fr, 'fr'))
  const changer =
    <T,>(f: (v: T) => void) =>
    (v: T) => {
      f(v)
      setChoisi(null)
    }

  return (
    <div>
      <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Les membres</h1>
      <p className="mt-3 min-h-7 text-lg text-olive">
        {nombres &&
          `${pluriel(nombres.all, 'membre', 'membres')}${ecoleChoisie ? ` de ${ecoleChoisie.acronym || ecoleChoisie.name_fr}` : recherche ? '' : ' dans le réseau'}${
            recherche ? ` pour «${N}${recherche}${N}»` : ''
          }.`}
      </p>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-3 sm:gap-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Rechercher un membre</span>
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-olive" aria-hidden="true" />
            <input
              type="search"
              value={saisie}
              onChange={(e) => {
                setSaisie(e.target.value)
                setChoisi(null)
              }}
              placeholder="Nom ou email"
              className={`${champ} pl-14 pr-6 placeholder:text-olive`}
            />
          </label>
          <label className="relative sm:w-64">
            <span className="sr-only">École</span>
            <select value={ecole} onChange={(e) => changer(setEcole)(e.target.value)} className={`${champ} appearance-none pl-6 pr-12`}>
              <option value="">Toutes les écoles</option>
              {triees.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.acronym || s.name_fr}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-5 top-1/2 size-5 -translate-y-1/2 text-olive" aria-hidden="true" />
          </label>
        </div>
        <div className="min-w-0">
          <Filtres
            libelle="Type de membre"
            valeur={filtre}
            onChange={changer(setFiltre)}
            options={[
              { valeur: 'all', texte: 'Tous', n: nombres?.all },
              { valeur: 'alumni', texte: 'Membres', n: nombres?.alumni },
              {
                valeur: 'moderator',
                texte: 'Modérateurs',
                n: nombres?.moderator,
              },
              { valeur: 'admin', texte: 'Administrateurs', n: nombres?.admin },
              {
                valeur: 'ambassadors',
                texte: 'Ambassadeurs',
                n: nombres?.ambassadors,
              },
            ]}
          />
        </div>
      </div>

      {liste.isLoading ? (
        <ul className="mt-6 grid gap-2 lg:w-[22rem]" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-16 animate-pulse rounded-2xl bg-sable/50" />
          ))}
        </ul>
      ) : liste.isError ? (
        <div className="mt-6 rounded-3xl bg-white p-8 text-center">
          <p className="text-base text-olive">Les membres n’ont pas pu être chargés.</p>
          <button type="button" onClick={() => liste.refetch()} className={`${boutonVert} mt-4`}>
            Réessayer
          </button>
        </div>
      ) : membres.length === 0 ? (
        <p className="mt-6 rounded-3xl bg-white p-8 text-center text-base text-olive">Aucun membre ne correspond.</p>
      ) : (
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div>
            <ul className="grid grid-cols-[minmax(0,1fr)] content-start gap-2">
              {membres.map((m) => {
                const deplie = m.id === choisi // mobile
                const choisiIci = m.id === actif?.id // grand écran
                return (
                  <li
                    key={m.id}
                    className={`rounded-2xl transition-colors ${deplie ? 'max-lg:bg-white max-lg:ring-2 max-lg:ring-vert' : 'max-lg:bg-white/60'} ${
                      choisiIci ? 'lg:bg-white lg:ring-2 lg:ring-vert' : 'lg:bg-white/60 lg:hover:bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={deplie}
                      onClick={() => setChoisi(grandEcran() ? m.id : deplie ? null : m.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <Portrait
                        prenom={m.first_name ?? ''}
                        nom={m.last_name ?? ''}
                        src={m.avatar_url}
                        className="size-10 shrink-0 rounded-full bg-vert text-sm text-creme"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-vert">
                          {nomComplet(m)}
                          {m.id === user?.id && <span className="font-normal text-olive"> · vous</span>}
                        </span>
                        <span className="block truncate text-sm text-olive">
                          {[m.schools?.acronym || m.schools?.name_fr, m.entry_year].filter(Boolean).join(' · ')}
                          {(m.role !== 'alumni' || m.is_ambassador) && ' · '}
                          <Statut m={m} />
                        </span>
                      </span>
                      <ChevronDown
                        className={`size-5 shrink-0 text-vert transition-transform duration-200 lg:hidden ${deplie ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                    {deplie && (
                      <div className="px-4 pb-5 pt-2 lg:hidden">
                        <Detail m={m} moi={m.id === user?.id} entete={false} onSupprime={() => setChoisi(null)} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
            {liste.hasNextPage && (
              <div className="mt-4 text-center">
                <button type="button" className={boutonVert} disabled={liste.isFetchingNextPage} onClick={() => liste.fetchNextPage()}>
                  {liste.isFetchingNextPage ? 'Chargement…' : 'Voir plus de membres'}
                </button>
              </div>
            )}
          </div>
          <section aria-label="Le membre choisi" className="hidden self-start rounded-3xl bg-white p-8 lg:sticky lg:top-6 lg:block">
            {actif && <Detail key={actif.id} m={actif} moi={actif.id === user?.id} onSupprime={() => setChoisi(null)} />}
          </section>
        </div>
      )}
    </div>
  )
}
