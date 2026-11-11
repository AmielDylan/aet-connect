'use client'

// Proposition B · « Le bandeau » : le même bandeau que le profil d'un membre (votre portrait, votre nom, votre promo),
// avec la photo à changer sur place ; dessous, vos informations à gauche, ce que voient les AET à droite.
import Link from 'next/link'
import { ArrowRight, Camera } from 'lucide-react'
import { Drapeau } from '@/components/landing/drapeau'
import { Portrait } from '@/components/espace/portrait'
import {
  ChampsInfos,
  EnteteMaquette,
  Enregistrer,
  INFOS,
  Interrupteur,
  MOI,
  MotDePasse,
  N,
  Quitter,
  REGLAGES,
  VIE,
  boutonCreme,
  titre2,
  useBrouillon,
  usePhoto,
} from '../commun'

export default function PropositionB() {
  const infos = useBrouillon(INFOS)
  const vie = useBrouillon(VIE)
  const p = usePhoto()
  const s = infos.enregistre
  const w = vie.valeur

  const actionsPhoto = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
      <button type="button" onClick={p.choisir} disabled={p.envoi} className={boutonCreme}>
        <Camera className="size-[18px]" aria-hidden="true" />
        {p.envoi ? 'Envoi…' : p.photo ? 'Changer la photo' : 'Ajouter une photo'}
      </button>
      {p.photo && (
        <button type="button" onClick={p.retirer} className="inline-flex min-h-11 items-center text-base text-creme underline-offset-4 hover:text-or hover:underline">
          Retirer
        </button>
      )}
    </div>
  )

  return (
    <>
      <EnteteMaquette prenom={s.first_name} nom={s.last_name} photo={p.photo} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        {/* Bandeau : hauteur fixe dès md, comme le profil d'un membre ; coin 76px, portrait concentrique 64px */}
        <section className="sur-vert trame trame-sur-vert grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme md:h-[22rem] md:grid-cols-[1fr_auto] md:rounded-tr-[76px] lg:h-[24rem]">
          <div className="flex min-h-0 min-w-0 flex-col justify-center gap-4 px-6 py-8 sm:px-10 lg:px-12">
            <Portrait prenom={s.first_name} nom={s.last_name} src={p.photo} className="size-24 rounded-2xl rounded-tr-[36px] bg-sable text-2xl text-vert md:hidden" />
            <p className="text-base text-or">Votre profil{MOI.is_ambassador && ' · Représente sa promo'}</p>
            <h1 className="font-titre text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.05] tracking-[-0.03em] md:line-clamp-2">
              {s.first_name} {s.last_name}
            </h1>
            <p className="flex flex-wrap items-center gap-x-2 text-base text-brume lg:text-lg">
              <span>{MOI.ecole}</span>
              <Drapeau pays={MOI.pays_ecole} className="h-3.5 w-auto" />
              <span>· promo {MOI.promo}</span>
              {s.current_city && <span>· vit à {s.current_city}</span>}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-7 gap-y-2">
              {actionsPhoto}
              <Link href="#" className="group inline-flex min-h-11 items-center gap-1.5 text-base text-creme transition-colors hover:text-or">
                Voir mon profil comme les AET
                <ArrowRight className="size-[18px] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </div>
            {p.erreur && (
              <p role="alert" className="text-sm font-semibold text-or">
                {p.erreur}
              </p>
            )}
            {p.champ}
          </div>
          <div className="hidden md:m-3 md:block md:h-[calc(100%-1.5rem)]">
            <button type="button" onClick={p.choisir} className="group relative block h-full" aria-hidden="true" tabIndex={-1}>
              <Portrait
                prenom={s.first_name}
                nom={s.last_name}
                src={p.photo}
                className="aspect-square h-full w-auto rounded-[1.25rem] rounded-tr-[64px] bg-sable text-7xl text-vert"
              />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-creme px-3 py-1.5 text-sm text-vert opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="size-4" aria-hidden="true" /> Changer
              </span>
            </button>
          </div>
        </section>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <section aria-labelledby="infos-b" className="self-start rounded-3xl bg-white p-6 sm:p-8">
            <h2 id="infos-b" className={titre2}>
              Vos informations
            </h2>
            <p className="mt-2 text-base text-olive">
              Votre école et votre promo viennent de votre inscription.
            </p>
            <div className="mt-6">
              <ChampsInfos v={infos.valeur} set={infos.setValeur} />
            </div>
            <div className="mt-8">
              <Enregistrer modifie={infos.modifie} etat={infos.etat} onEnregistrer={infos.enregistrer} onAnnuler={infos.annuler} />
            </div>
          </section>

          <div className="grid content-start gap-10">
            <section aria-labelledby="vie-b" className="rounded-3xl bg-white p-6 sm:p-8">
              <h2 id="vie-b" className={titre2}>
                Ce que voient les AET
              </h2>
              <p className="mt-2 text-base leading-relaxed text-olive">Votre nom et votre école se voient toujours{N}: c’est ainsi qu’on vous retrouve.</p>
              <div className="mt-5 rounded-2xl bg-creme p-4">
                <Interrupteur
                  id="b-annuaire"
                  label="Apparaître dans l’annuaire"
                  detail={w.show_in_directory ? 'Vos collègues peuvent vous retrouver' : 'Personne ne peut vous retrouver'}
                  actif={w.show_in_directory}
                  onChange={(x) => vie.setValeur({ ...w, show_in_directory: x })}
                />
              </div>
              <div className={`mt-4 grid gap-2 transition-opacity ${w.show_in_directory ? '' : 'opacity-50'}`}>
                {REGLAGES.map((r) => (
                  <Interrupteur key={r.cle} id={`b-${r.cle}`} label={r.label} detail={r.detail} actif={w[r.cle]} onChange={(x) => vie.setValeur({ ...w, [r.cle]: x })} />
                ))}
              </div>
              <div className="mt-6">
                <Enregistrer modifie={vie.modifie} etat={vie.etat} onEnregistrer={vie.enregistrer} onAnnuler={vie.annuler} libelle="Enregistrer ces choix" />
              </div>
            </section>

            <section aria-labelledby="mdp-b" className="rounded-3xl bg-white p-6 sm:p-8">
              <h2 id="mdp-b" className={titre2}>
                Mot de passe
              </h2>
              <div className="mt-5">
                <MotDePasse />
              </div>
            </section>

            <section aria-labelledby="quitter-b" className="px-2">
              <h2 id="quitter-b" className={titre2}>
                Quitter AET Connect
              </h2>
              <div className="mt-3">
                <Quitter />
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}
