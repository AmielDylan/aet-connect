'use client'

// Le profil d'un membre · proposition B « Le bandeau ».
// Le bandeau a une hauteur fixe dès la tablette : c'est le portrait qui la donne, jamais le texte. Le texte est
// donc ramassé (le lien et « Représente sa promo » sur une ligne ; école, promo et ville sur une autre ; le nom
// sur deux lignes au plus), quelles que soient les informations que le membre a choisi de montrer.
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Mail } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Portrait } from '@/components/espace/portrait'
import { Coordonnees } from '@/components/espace/coordonnees'

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

function Retour() {
  return (
    <Link href="/dashboard/directory" className="group inline-flex min-h-11 items-center gap-1.5 text-base text-encre transition-colors hover:text-terre">
      <ArrowLeft className="size-[18px] transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
      Retour à l’annuaire
    </Link>
  )
}

export default function ProfilMembre() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: p, isLoading, isError } = useQuery({ queryKey: ['public-profile', id], queryFn: () => apiClient.getUserById(id) })

  const schoolId = p?.school?.id
  const { data: promo } = useQuery({
    queryKey: ['profil-promo', schoolId, p?.entry_year],
    queryFn: () => apiClient.getMembers({ school_id: schoolId, entry_year: p!.entry_year!, limit: 7 }),
    enabled: !!schoolId && !!p?.entry_year,
  })

  if (isLoading) {
    return (
      <div aria-hidden="true">
        <div className="h-11" />
        <div className="mt-4 h-[22rem] animate-pulse rounded-3xl rounded-tr-[76px] bg-sable/60" />
      </div>
    )
  }

  if (isError || !p) {
    return (
      <div>
        <Retour />
        <div className="mt-6 rounded-3xl bg-white p-8 text-center sm:p-12">
          <h1 className="font-titre text-2xl font-semibold tracking-[-0.02em] text-vert">Ce profil est introuvable</h1>
          <p className="mx-auto mt-3 max-w-[48ch] text-base leading-relaxed text-olive">
            La personne l’a peut-être masqué de l’annuaire, ou il n’existe plus. Vous pouvez la retrouver par sa promo dans l’annuaire.
          </p>
        </div>
      </div>
    )
  }

  const moi = user?.id === p.id
  const memePromo = !!schoolId && user?.school_id === schoolId && user?.entry_year === p.entry_year
  const relation = moi ? 'Votre profil' : memePromo ? 'Votre collègue de promotion' : user?.school_id && user.school_id === schoolId ? 'De votre école' : null
  const enTete = [relation, p.is_ambassador ? 'Représente sa promo' : null].filter(Boolean).join(' · ')
  const ecole = p.school ? p.school.acronym || p.school.name_fr : ''
  const collegues = (promo?.users ?? []).filter((m) => m.id !== p.id).slice(0, 6)
  const totalPromo = promo?.total ?? 0
  const promoHref = `/dashboard/directory?school=${schoolId}&year=${p.entry_year}`

  return (
    <div>
      <Retour />

      {/* Bandeau : hauteur fixe dès md (le portrait la donne) ; coin haut droit 76px, portrait concentrique 64px */}
      <section className="sur-vert trame trame-sur-vert mt-4 grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme md:h-[22rem] md:grid-cols-[1fr_auto] md:rounded-tr-[76px] lg:h-[24rem]">
        <div className="flex min-h-0 min-w-0 flex-col justify-center gap-4 px-6 py-8 sm:px-10 lg:px-12">
          {enTete && <p className="text-base text-or">{enTete}</p>}
          <h1 className="font-titre md:line-clamp-2 text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            {p.first_name} {p.last_name}
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 text-base text-brume lg:text-lg">
            {ecole && <span>{ecole}</span>}
            {p.school?.country && <Drapeau pays={p.school.country} className="h-3.5 w-auto" />}
            {p.entry_year && <span>· promo {p.entry_year}</span>}
            {p.current_city && <span>· vit à {p.current_city}</span>}
          </p>
          {moi ? (
            <Link
              href="/dashboard/profile"
              className="inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors hover:bg-white"
            >
              Modifier mon profil
            </Link>
          ) : (
            p.email && (
              <a
                href={`mailto:${p.email}`}
                className="inline-flex min-h-12 items-center gap-2 self-start rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors hover:bg-white"
              >
                <Mail className="size-[18px]" aria-hidden="true" /> Lui écrire
              </a>
            )
          )}
        </div>
        <div className="md:m-3 md:h-[calc(100%-1.5rem)]">
          <Portrait
            prenom={p.first_name}
            nom={p.last_name}
            src={p.avatar_url}
            className="aspect-[4/3] w-full bg-sable text-7xl text-vert md:aspect-square md:h-full md:w-auto md:rounded-[1.25rem] md:rounded-tr-[64px]"
          />
        </div>
      </section>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-10">
          {p.bio && (
            <section aria-labelledby="mots">
              <h2 id="mots" className={titre2}>
                En quelques mots
              </h2>
              <p className="mt-3 max-w-[60ch] whitespace-pre-line text-lg leading-relaxed text-encre">{p.bio}</p>
            </section>
          )}
          {collegues.length > 0 && (
            <section aria-labelledby="promo">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <h2 id="promo" className={titre2}>
                  {moi ? 'Votre promo' : 'Sa promo'}
                </h2>
                <LienFleche href={promoHref} visible>
                  Voir les {totalPromo}
                </LienFleche>
              </div>
              <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {collegues.map((c) => (
                  <li key={c.id}>
                    <Link href={`/profile/${c.id}`} className="group block">
                      <Portrait
                        prenom={c.first_name}
                        nom={c.last_name}
                        src={c.avatar_url}
                        className="aspect-square w-full rounded-2xl bg-sable text-lg text-vert transition-colors group-hover:bg-vert group-hover:text-creme"
                      />
                      <span className="mt-2 block truncate text-sm text-encre group-hover:text-terre">{c.first_name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <section aria-labelledby="coordonnees" className="content-start rounded-3xl bg-white p-6 sm:p-8">
          <h2 id="coordonnees" className={titre2}>
            Coordonnées
          </h2>
          <div className="mt-4">
            <Coordonnees prenom={p.first_name} email={p.email} phone={p.phone} linkedin={p.linkedin_url} />
          </div>
        </section>
      </div>
    </div>
  )
}
