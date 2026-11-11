'use client'

// L'accueil de l'espace membre · « La photo de promo » : un bandeau vert avec la photo, la promo en trombinoscope,
// les invitations et le profil, puis le réseau au-delà de la promo.
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { PHOTOS, schoolFacts, type LandingSchool } from '@/lib/landing'
import type { InvitationCode, User } from '@/types'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Drapeau } from '@/components/landing/drapeau'
import { Jauge, Portrait, depuis } from '@/components/espace/portrait'

const N = ' '
const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'
const nombre = (n: number) => n.toLocaleString('fr-FR')

/** « EMPT Bingerville », ou le nom complet quand l'école n'a pas de sigle */
function nomEcole(user: User) {
  const s = user.school
  if (!s) return user.school_name ?? ''
  return s.acronym ? `${s.acronym} ${s.city}` : s.name_fr
}

/** Ce qui manque au profil pour que les collègues vous reconnaissent */
function manquants(user: User) {
  return [!user.avatar_url && 'votre photo', !user.bio && 'quelques mots sur vous', !user.current_city && 'votre ville'].filter(Boolean) as string[]
}
const enumerer = (l: string[]) => (l.length < 2 ? l.join('') : `${l.slice(0, -1).join(', ')} et ${l[l.length - 1]}`)

function etatCode(c: InvitationCode) {
  if (c.status === 'exhausted') return 'Déjà utilisé'
  if (c.status === 'expired') return 'Expiré'
  if (c.status === 'revoked') return 'Révoqué'
  if (c.max_uses > 1 && c.current_uses > 0) return `Utilisé ${c.current_uses} fois sur ${c.max_uses}`
  if (c.expires_at) return `En attente, valable jusqu’au ${new Date(c.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
  return 'En attente'
}

export default function AccueilEspace() {
  const { user } = useAuth()
  const aPromo = !!user?.school_id && !!user?.entry_year

  const { data: stats } = useQuery({ queryKey: ['dashboard', 'stats'], queryFn: () => apiClient.getDashboardStats(), enabled: !!user })
  const { data: recents, isLoading: recentsLoading } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: () => apiClient.getDashboardRecentMembers(),
    enabled: !!user && aPromo,
  })
  const { data: codes, isError: codesEnEchec } = useQuery({ queryKey: ['my-codes'], queryFn: () => apiClient.getMyCodes(), enabled: !!user })
  const { data: ecoles } = useQuery({ queryKey: ['schools'], queryFn: () => apiClient.getSchools() })

  if (!user) return null

  const ecole = nomEcole(user)
  const promo = `/dashboard/directory?school=${user.school_id}&year=${user.entry_year}`
  const photo = PHOTOS.promo
  const total = stats?.myPromoCount ?? 0
  const autres = Math.max(0, total - 1 - (recents?.length ?? 0))
  const reseau = ecoles ? schoolFacts(ecoles.schools as unknown as LandingSchool[]) : null
  const quota = codes?.quota
  const derniersCodes = [...(codes?.codes ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 2)
  const aCompleter = manquants(user)

  return (
    <div>
      {/* Bandeau : coin haut droit exagéré, celui de la photo lui est concentrique (76 = 64 + 12 de marge) */}
      <section className="sur-vert trame trame-sur-vert grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme md:grid-cols-[1.1fr_1fr] md:rounded-tr-[76px]">
        <div className="flex flex-col justify-center gap-6 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          <div>
            <h1 className="font-titre text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em]">Bonjour, {user.first_name}</h1>
            {aPromo && (
              <p className="mt-2 text-base text-brume">
                {ecole} · promo {user.entry_year}
              </p>
            )}
          </div>
          {aPromo && stats && (
            <p className="max-w-[34ch] text-lg leading-relaxed text-brume">
              {total > 1 ? (
                <>
                  Vous êtes <span className="font-semibold text-or">{total}</span> de votre promo à vous être retrouvés ici.
                </>
              ) : (
                <>Vous êtes la première personne de votre promo à rejoindre AET Connect{N}: vos collègues n’attendent que votre invitation.</>
              )}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              href="/dashboard/codes"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors duration-200 hover:bg-white"
            >
              Inviter un collègue
            </Link>
            {aPromo && (
              <Link href={promo} className="inline-flex min-h-11 items-center text-base text-creme transition-colors duration-200 hover:text-or hover:underline">
                Voir toute la promo
              </Link>
            )}
          </div>
        </div>
        <div className="photo-cadre relative min-h-56 md:m-3 md:min-h-72 md:overflow-hidden md:rounded-[1.25rem] md:rounded-tr-[64px]">
          <Image src={photo.src} alt={photo.alt} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="photo-nb object-cover" />
          <p className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-full bg-creme/90 px-2.5 py-1 text-xs text-olive">{photo.caption}</p>
        </div>
      </section>

      {/* Trombinoscope de la promo */}
      {aPromo && (
        <section aria-labelledby="promo" className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 id="promo" className="font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">
              Les derniers arrivés de votre promo
            </h2>
            {total > 1 && (
              <LienFleche href={promo} visible>
                Voir les {total}
              </LienFleche>
            )}
          </div>
          {recentsLoading ? (
            <ul className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <li key={i} className="aspect-square animate-pulse rounded-2xl bg-sable/60" />
              ))}
            </ul>
          ) : recents && recents.length > 0 ? (
            <ul className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-6">
              {recents.map((m) => (
                <li key={m.id}>
                  <Link href={`/profile/${m.id}`} className="group block">
                    <Portrait
                      prenom={m.first_name}
                      nom={m.last_name}
                      src={m.avatar_url}
                      className="aspect-square w-full rounded-2xl bg-sable text-xl text-vert transition-colors duration-200 group-hover:bg-vert group-hover:text-creme sm:text-3xl"
                    />
                    <span className="mt-2 block text-sm text-encre group-hover:text-terre sm:mt-3 sm:text-base">
                      {m.first_name} {m.last_name}
                    </span>
                    <span className="block text-sm text-olive">{depuis(m.created_at)}</span>
                  </Link>
                </li>
              ))}
              {autres > 0 && (
                <li>
                  <Link
                    href={promo}
                    className="grid aspect-square w-full place-items-center rounded-2xl bg-white p-2 text-center text-sm text-olive transition-colors duration-200 hover:text-terre sm:p-4 sm:text-base"
                  >
                    <span>
                      <span className="block font-titre text-xl font-semibold text-vert sm:text-3xl">+{autres}</span>
                      {autres > 1 ? 'autres collègues' : 'autre collègue'}
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-olive">
              Personne d’autre de votre promo n’a encore rejoint AET Connect. Avec vos codes d’invitation, vous pouvez leur ouvrir la porte.
            </p>
          )}
        </section>
      )}

      <div className="mt-14 grid gap-5 md:grid-cols-2">
        {/* Invitations */}
        <section aria-labelledby="invitations" className="rounded-3xl bg-white p-6 sm:p-8">
          <h2 id="invitations" className={titre2}>
            Vos invitations
          </h2>
          {quota && (
            <>
              <p className="mt-3 text-base leading-relaxed text-olive">
                {quota.limit === null
                  ? 'Vous pouvez créer autant de codes que nécessaire.'
                  : `${quota.remaining} ${quota.remaining === 1 ? 'code disponible' : 'codes disponibles'} sur ${quota.limit}`}
              </p>
              {quota.limit !== null && quota.limit > 0 && (
                <div className="mt-4">
                  <Jauge used={quota.used} limit={quota.limit} />
                </div>
              )}
            </>
          )}
          {derniersCodes.length > 0 ? (
            <ul className="mt-6 grid gap-3">
              {derniersCodes.map((c) => (
                <li key={c.id} className="grid gap-0.5 rounded-2xl bg-creme px-4 py-3">
                  <span className="font-semibold tracking-[0.06em] text-vert">{c.code}</span>
                  <span className="text-sm text-olive">{etatCode(c)}</span>
                </li>
              ))}
            </ul>
          ) : codesEnEchec ? (
            <p className="mt-3 text-base leading-relaxed text-olive">Vos codes n’ont pas pu être chargés. Vous pouvez les retrouver sur la page de vos codes.</p>
          ) : (
            codes && <p className="mt-4 text-base leading-relaxed text-olive">Vous n’avez pas encore créé de code.</p>
          )}
          <div className="mt-3">
            <LienFleche href="/dashboard/codes">{derniersCodes.length ? 'Gérer mes codes' : 'Créer un code'}</LienFleche>
          </div>
        </section>

        {/* Profil */}
        <section aria-labelledby="profil" className="rounded-3xl rounded-tr-[64px] bg-white p-6 sm:p-8">
          <h2 id="profil" className={titre2}>
            Votre profil
          </h2>
          <div className="mt-5 flex items-center gap-4">
            <Portrait prenom={user.first_name} nom={user.last_name} src={user.avatar_url} className="size-16 rounded-full bg-vert text-xl text-creme" />
            <div className="min-w-0">
              <p className="truncate text-lg text-encre">
                {user.first_name} {user.last_name}
              </p>
              {aPromo && (
                <p className="text-sm text-olive">
                  {ecole} · promo {user.entry_year}
                </p>
              )}
            </div>
          </div>
          <p className="mt-5 text-base leading-relaxed text-olive">
            {aCompleter.length ? `Il manque encore ${enumerer(aCompleter)}.` : `Votre profil est complet${N}: vos collègues vous reconnaîtront.`}
          </p>
          <div className="mt-2">
            <LienFleche href="/dashboard/profile">{aCompleter.length ? 'Compléter mon profil' : 'Voir mon profil'}</LienFleche>
          </div>
        </section>
      </div>

      {/* Le réseau au-delà de la promo */}
      {stats && (
        <section aria-labelledby="reseau" className="mt-5 rounded-3xl bg-sable/45 p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
            <h2 id="reseau" className={titre2}>
              {aPromo ? 'Au-delà de votre promo' : 'Le réseau AET'}
            </h2>
            <LienFleche href="/dashboard/directory" visible>
              Parcourir l’annuaire
            </LienFleche>
          </div>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            {aPromo && (
              <div className="flex flex-col-reverse gap-1">
                <dt className="flex flex-wrap items-center gap-x-2 text-base text-olive">
                  AET de votre école · {ecole}
                  {user.school?.country && <Drapeau pays={user.school.country} className="h-3.5 w-auto" />}
                </dt>
                <dd className="font-titre text-5xl font-bold tracking-[-0.04em] text-vert tabular-nums">{nombre(stats.mySchoolCount)}</dd>
              </div>
            )}
            <div className="flex flex-col-reverse gap-1">
              <dt className="text-base text-olive">
                AET dans tout le réseau
                {reseau && reseau.count > 0 ? `, ${reseau.count} écoles dans ${reseau.countries} pays` : ''}
              </dt>
              <dd className="font-titre text-5xl font-bold tracking-[-0.04em] text-vert tabular-nums">{nombre(stats.totalNetworkCount)}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  )
}
