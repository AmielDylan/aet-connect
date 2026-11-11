'use client'

// « Mon profil » · proposition B « Le bandeau » : le même bandeau que le profil d'un membre (votre portrait, votre
// nom, votre promo), avec la photo à changer sur place ; dessous, vos informations à gauche, ce que voient les AET,
// le mot de passe et le départ à droite. Le grand portrait n'apparaît qu'à partir de lg : sur tablette, il prenait
// la moitié du bandeau ; jusque-là, une vignette précède le nom.
import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Camera, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { useCurrentMember, useMemberCache } from '@/hooks/use-current-member'
import { Drapeau } from '@/components/landing/drapeau'
import { Portrait } from '@/components/espace/portrait'
import { messageApi } from '@/components/registration/kit'
import {
  ChampsInfos,
  Enregistrer,
  Interrupteur,
  MotDePasse,
  N,
  Quitter,
  REGLAGES,
  boutonCreme,
  usePhotoProfil,
  verifierInfos,
  type Etat,
  type Infos,
  type Vie,
} from '@/components/espace/mon-profil'
import type { User } from '@/types'

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'
const PRIVACY_KEY = ['user', 'privacy'] as const

const infosDe = (m: User): Infos => ({
  first_name: m.first_name ?? '',
  last_name: m.last_name ?? '',
  phone: m.phone ?? '',
  linkedin_url: m.linkedin_url ?? '',
  current_city: m.current_city ?? '',
  current_country: m.current_country ?? '',
  bio: m.bio ?? '',
})
const memes = (a: object, b: object) => JSON.stringify(a) === JSON.stringify(b)

export default function MonProfil() {
  const { member, isLoading } = useCurrentMember()
  const cache = useMemberCache()
  const queryClient = useQueryClient()
  const { logout } = useAuth()
  const photo = usePhotoProfil(member)

  // Les brouillons : null tant que rien n'a été modifié, la valeur enregistrée fait alors foi
  const [brouillon, setBrouillon] = useState<Infos | null>(null)
  const [etatInfos, setEtatInfos] = useState<Etat>('repos')
  const [erreurInfos, setErreurInfos] = useState('')
  const [tente, setTente] = useState(false)

  const { data: privacy, isError: privacyEnErreur } = useQuery({
    queryKey: PRIVACY_KEY,
    queryFn: () => apiClient.getPrivacySettings(),
    enabled: !!member,
  })
  const [vieBrouillon, setVieBrouillon] = useState<Vie | null>(null)
  const [etatVie, setEtatVie] = useState<Etat>('repos')
  const [erreurVie, setErreurVie] = useState('')

  if (isLoading || !member) {
    return (
      <div aria-hidden="true">
        <div className="h-[18rem] animate-pulse rounded-3xl rounded-tr-[56px] bg-sable/60 lg:h-[24rem] lg:rounded-tr-[76px]" />
        <div className="mt-12 grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div className="h-[36rem] animate-pulse rounded-3xl bg-sable/40" />
          <div className="h-[28rem] animate-pulse rounded-3xl bg-sable/40" />
        </div>
      </div>
    )
  }

  const enregistrees = infosDe(member)
  const v = brouillon ?? enregistrees
  const infosModifiees = brouillon !== null && !memes(brouillon, enregistrees)
  const erreurs = tente ? verifierInfos(v) : {}

  const vie: Vie | null = vieBrouillon ?? (privacy ? { ...privacy } : null)
  const vieModifiee = !!vieBrouillon && !!privacy && !memes(vieBrouillon, privacy)

  const ecole = member.school ? member.school.acronym || member.school.name_fr : ''
  const majInfos = (x: Infos) => {
    setBrouillon(x)
    setEtatInfos('repos')
    setErreurInfos('')
  }
  const majVie = (x: Vie) => {
    setVieBrouillon(x)
    setEtatVie('repos')
    setErreurVie('')
  }

  const enregistrerInfos = async (e: React.FormEvent) => {
    e.preventDefault()
    setTente(true)
    if (Object.keys(verifierInfos(v)).length) return
    setEtatInfos('envoi')
    setErreurInfos('')
    const envoi = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x.trim()])) as Infos
    try {
      await apiClient.updateProfile(envoi)
      // L'en-tête et cette page lisent le même cache : mis à jour aussitôt, puis rechargé
      cache.patch(Object.fromEntries(Object.entries(envoi).map(([k, x]) => [k, x === '' && k !== 'first_name' && k !== 'last_name' ? null : x])))
      cache.refresh()
      setBrouillon(null)
      setTente(false)
      setEtatInfos('fait')
    } catch (err) {
      setErreurInfos(messageApi(err, 'Vos informations n’ont pas pu être enregistrées. Vous pouvez réessayer dans un instant.'))
      setEtatInfos('repos')
    }
  }

  const enregistrerVie = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vieBrouillon) return
    setEtatVie('envoi')
    setErreurVie('')
    try {
      const r = await apiClient.updatePrivacySettings(vieBrouillon)
      queryClient.setQueryData(PRIVACY_KEY, r ?? vieBrouillon)
      setVieBrouillon(null)
      setEtatVie('fait')
    } catch (err) {
      setErreurVie(messageApi(err, 'Vos choix n’ont pas pu être enregistrés. Vous pouvez réessayer dans un instant.'))
      setEtatVie('repos')
    }
  }

  const texteBoutonPhoto = photo.envoi === 'ajout' ? 'Envoi…' : member.avatar_url ? 'Changer la photo' : 'Ajouter une photo'

  return (
    <div>
      {/* Bandeau : hauteur fixe dès lg (le portrait la donne) ; coin haut droit 76px, portrait concentrique 64px */}
      <section className="sur-vert trame trame-sur-vert grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme lg:h-[24rem] lg:grid-cols-[1fr_auto] lg:rounded-tr-[76px]">
        <div className="flex min-h-0 min-w-0 flex-col justify-center gap-4 px-6 py-8 sm:px-10 lg:px-12">
          <Portrait
            prenom={member.first_name}
            nom={member.last_name}
            src={member.avatar_url}
            className="size-24 rounded-2xl rounded-tr-[36px] bg-sable text-2xl text-vert lg:hidden"
          />
          <p className="text-base text-or">Votre profil{member.is_ambassador && ' · Représente sa promo'}</p>
          <h1 className="font-titre text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] lg:line-clamp-2">
            {member.first_name} {member.last_name}
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 text-base text-brume lg:text-lg">
            {ecole && <span>{ecole}</span>}
            {member.school?.country && <Drapeau pays={member.school.country} className="h-3.5 w-auto" />}
            {member.entry_year && <span>· promo {member.entry_year}</span>}
            {member.current_city && <span>· vit à {member.current_city}</span>}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-7 gap-y-2">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
              <button type="button" onClick={photo.choisir} disabled={!!photo.envoi} className={boutonCreme}>
                {photo.envoi === 'ajout' ? (
                  <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />
                ) : (
                  <Camera className="size-[18px]" aria-hidden="true" />
                )}
                {texteBoutonPhoto}
              </button>
              {member.avatar_url && (
                <button
                  type="button"
                  onClick={photo.retirer}
                  disabled={!!photo.envoi}
                  className="inline-flex min-h-11 items-center text-base text-creme underline-offset-4 transition-colors hover:text-or hover:underline disabled:opacity-60"
                >
                  {photo.envoi === 'retrait' ? 'Retrait…' : 'Retirer la photo'}
                </button>
              )}
            </div>
            <Link href={`/profile/${member.id}`} className="group inline-flex min-h-11 items-center gap-1.5 text-base text-creme transition-colors hover:text-or">
              Voir mon profil comme les AET
              <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <p className="text-sm text-brume">JPG, PNG ou WebP, 2{N}Mo au plus</p>
          {photo.erreur && (
            <p role="alert" className="text-sm font-semibold text-or">
              {photo.erreur}
            </p>
          )}
          {photo.champ}
        </div>
        {/* Cadre carré fixe (24rem - 2 × 12px) : une photo en paysage garde sa place, elle est recadrée */}
        <div className="hidden lg:m-3 lg:block lg:size-[22.5rem]">
          <button type="button" onClick={photo.choisir} className="group relative block size-full" aria-hidden="true" tabIndex={-1}>
            <Portrait
              prenom={member.first_name}
              nom={member.last_name}
              src={member.avatar_url}
              className="size-full rounded-[1.25rem] rounded-tr-[64px] bg-sable text-7xl text-vert"
            />
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-creme px-3 py-1.5 text-sm text-vert opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="size-4" aria-hidden="true" /> {member.avatar_url ? 'Changer' : 'Ajouter'}
            </span>
          </button>
        </div>
      </section>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="infos" className="self-start rounded-3xl bg-white p-6 sm:p-8">
          <h2 id="infos" className={titre2}>
            Vos informations
          </h2>
          <p className="mt-2 text-base text-olive">Votre école et votre promo viennent de votre inscription.</p>
          <form onSubmit={enregistrerInfos} noValidate className="sur-creme mt-6 grid gap-8">
            <ChampsInfos v={v} set={majInfos} email={member.email} erreurs={erreurs} />
            <Enregistrer
              modifie={infosModifiees}
              etat={etatInfos}
              erreur={erreurInfos}
              onAnnuler={() => {
                setBrouillon(null)
                setTente(false)
                setErreurInfos('')
              }}
            />
          </form>
        </section>

        <div className="grid content-start gap-10">
          <section aria-labelledby="visibilite" className="rounded-3xl bg-white p-6 sm:p-8">
            <h2 id="visibilite" className={titre2}>
              Ce que voient les AET
            </h2>
            <p className="mt-2 text-base leading-relaxed text-olive">Votre nom et votre école se voient toujours{N}: c’est ainsi qu’on vous retrouve.</p>
            {vie ? (
              <form onSubmit={enregistrerVie} className="sur-creme">
                <div className="mt-5 rounded-2xl bg-creme p-4">
                  <Interrupteur
                    id="show_in_directory"
                    label="Apparaître dans l’annuaire"
                    detail={vie.show_in_directory ? 'Vos collègues peuvent vous retrouver' : 'Personne ne peut vous retrouver ni ouvrir votre profil'}
                    actif={vie.show_in_directory}
                    onChange={(x) => majVie({ ...vie, show_in_directory: x })}
                  />
                </div>
                <div className={`mt-4 grid gap-2 transition-opacity ${vie.show_in_directory ? '' : 'opacity-50'}`}>
                  {REGLAGES.map((r) => (
                    <Interrupteur key={r.cle} id={r.cle} label={r.label} detail={r.detail} actif={vie[r.cle]} onChange={(x) => majVie({ ...vie, [r.cle]: x })} />
                  ))}
                </div>
                <div className="mt-6">
                  <Enregistrer
                    modifie={vieModifiee}
                    etat={etatVie}
                    erreur={erreurVie}
                    libelle="Enregistrer ces choix"
                    onAnnuler={() => {
                      setVieBrouillon(null)
                      setErreurVie('')
                    }}
                  />
                </div>
              </form>
            ) : privacyEnErreur ? (
              <p className="mt-5 text-base text-olive">Vos choix n’ont pas pu être chargés. Vous pouvez recharger la page dans un instant.</p>
            ) : (
              <div className="mt-5 h-72 animate-pulse rounded-2xl bg-sable/40" aria-hidden="true" />
            )}
          </section>

          <section aria-labelledby="mot-de-passe" className="rounded-3xl bg-white p-6 sm:p-8">
            <h2 id="mot-de-passe" className={titre2}>
              Mot de passe
            </h2>
            <div className="mt-5">
              <MotDePasse />
            </div>
          </section>

          <section aria-labelledby="quitter" className="px-2">
            <h2 id="quitter" className={titre2}>
              Quitter AET Connect
            </h2>
            <div className="mt-3">
              <Quitter
                onEnvoye={async () => {
                  await logout()
                  window.location.href = '/login'
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
