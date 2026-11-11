'use client'

// Proposition C · « Le carnet » : une page de réglages calme, comme « L'étoffe ». Un en-tête court (vignette,
// nom, promo), puis quatre onglets ; une seule chose à la fois, un panneau blanc à la fois.
import { useRef, useState } from 'react'
import { Drapeau } from '@/components/landing/drapeau'
import { LienFleche } from '@/components/landing/lien-fleche'
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
  boutonVert,
  lienTexte,
  titre2,
  useBrouillon,
  usePhoto,
} from '../commun'

const ONGLETS = [
  { id: 'infos', label: 'Mes informations' },
  { id: 'vie', label: 'Ce que voient les AET' },
  { id: 'mdp', label: 'Mot de passe' },
  { id: 'compte', label: 'Mon compte' },
] as const
type Onglet = (typeof ONGLETS)[number]['id']

export default function PropositionC() {
  const infos = useBrouillon(INFOS)
  const vie = useBrouillon(VIE)
  const p = usePhoto()
  const [onglet, setOnglet] = useState<Onglet>('infos')
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})
  const s = infos.enregistre
  const w = vie.valeur

  // Flèches du clavier entre les onglets (motif ARIA « tabs »)
  const clavier = (e: React.KeyboardEvent, i: number) => {
    const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
    if (!d) return
    e.preventDefault()
    const suivant = ONGLETS[(i + d + ONGLETS.length) % ONGLETS.length].id
    setOnglet(suivant)
    refs.current[suivant]?.focus()
  }

  return (
    <>
      <EnteteMaquette prenom={s.first_name} nom={s.last_name} photo={p.photo} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <header className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <Portrait prenom={s.first_name} nom={s.last_name} src={p.photo} className="size-20 rounded-2xl rounded-tr-[36px] bg-vert text-xl text-creme" />
          <div className="min-w-0 flex-1">
            <h1 className="font-titre text-[clamp(1.75rem,3vw,2.4rem)] font-bold leading-[1.1] tracking-[-0.025em] text-vert">Mon profil</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-base text-olive">
              <span>
                {s.first_name} {s.last_name}
              </span>
              <span>· {MOI.ecole}</span>
              <Drapeau pays={MOI.pays_ecole} className="h-3.5 w-auto" />
              <span>· promo {MOI.promo}</span>
            </p>
          </div>
          <LienFleche href="#" visible className="basis-full sm:basis-auto">
            Voir mon profil
          </LienFleche>
        </header>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
          <div role="tablist" aria-label="Mon profil" aria-orientation="vertical" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:grid lg:content-start lg:overflow-visible lg:px-0">
            {ONGLETS.map((o, i) => {
              const actif = onglet === o.id
              return (
                <button
                  key={o.id}
                  ref={(el) => {
                    refs.current[o.id] = el
                  }}
                  id={`onglet-${o.id}`}
                  role="tab"
                  type="button"
                  aria-selected={actif}
                  aria-controls={`panneau-${o.id}`}
                  tabIndex={actif ? 0 : -1}
                  onClick={() => setOnglet(o.id)}
                  onKeyDown={(e) => clavier(e, i)}
                  className={`inline-flex min-h-12 shrink-0 items-center whitespace-nowrap rounded-full px-5 text-base transition-colors duration-200 lg:justify-start ${
                    actif ? 'bg-vert text-creme' : 'text-encre hover:text-terre'
                  }`}
                >
                  {o.label}
                </button>
              )
            })}
          </div>

          <div
            id={`panneau-${onglet}`}
            role="tabpanel"
            aria-labelledby={`onglet-${onglet}`}
            tabIndex={0}
            className="max-w-3xl rounded-3xl rounded-tr-[56px] bg-white p-6 sm:p-10"
          >
            {onglet === 'infos' && (
              <div className="grid gap-10">
                <div className="flex flex-wrap items-center gap-5">
                  <Portrait prenom={s.first_name} nom={s.last_name} src={p.photo} className="size-28 rounded-[1.25rem] rounded-tr-[44px] bg-sable text-3xl text-vert" />
                  <div className="grid gap-1">
                    <p className="text-sm font-semibold text-vert">Votre photo</p>
                    <div className="flex flex-wrap items-center gap-x-5">
                      <button type="button" onClick={p.choisir} disabled={p.envoi} className={boutonVert}>
                        {p.envoi ? 'Envoi…' : p.photo ? 'Changer la photo' : 'Ajouter une photo'}
                      </button>
                      {p.photo && (
                        <button type="button" onClick={p.retirer} className={lienTexte}>
                          Retirer
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-olive">Un portrait où l’on vous reconnaît. JPG, PNG ou WebP, 2{N}Mo au plus.</p>
                    {p.erreur && (
                      <p role="alert" className="text-sm font-semibold text-alerte">
                        {p.erreur}
                      </p>
                    )}
                  </div>
                  {p.champ}
                </div>
                <ChampsInfos v={infos.valeur} set={infos.setValeur} />
                <Enregistrer modifie={infos.modifie} etat={infos.etat} onEnregistrer={infos.enregistrer} onAnnuler={infos.annuler} />
              </div>
            )}

            {onglet === 'vie' && (
              <div>
                <h2 className={titre2}>Ce que voient les AET</h2>
                <p className="mt-2 max-w-[52ch] text-base leading-relaxed text-olive">
                  Votre nom et votre école se voient toujours{N}: c’est ainsi que vos collègues vous retrouvent. Le reste, vous le montrez si vous le souhaitez.
                </p>
                <div className="mt-6 rounded-2xl bg-creme p-4">
                  <Interrupteur
                    id="c-annuaire"
                    label="Apparaître dans l’annuaire"
                    detail={w.show_in_directory ? 'Vos collègues peuvent vous retrouver' : 'Personne ne peut vous retrouver ni ouvrir votre profil'}
                    actif={w.show_in_directory}
                    onChange={(x) => vie.setValeur({ ...w, show_in_directory: x })}
                  />
                </div>
                <div className={`mt-4 grid gap-2 px-4 transition-opacity ${w.show_in_directory ? '' : 'opacity-50'}`}>
                  {REGLAGES.map((r) => (
                    <Interrupteur key={r.cle} id={`c-${r.cle}`} label={r.label} detail={r.detail} actif={w[r.cle]} onChange={(x) => vie.setValeur({ ...w, [r.cle]: x })} />
                  ))}
                </div>
                <div className="mt-8">
                  <Enregistrer modifie={vie.modifie} etat={vie.etat} onEnregistrer={vie.enregistrer} onAnnuler={vie.annuler} libelle="Enregistrer ces choix" />
                </div>
              </div>
            )}

            {onglet === 'mdp' && (
              <div>
                <h2 className={titre2}>Mot de passe</h2>
                <p className="mt-2 text-base text-olive">Votre mot de passe actuel, puis le nouveau, deux fois.</p>
                <div className="mt-6 max-w-md">
                  <MotDePasse />
                </div>
              </div>
            )}

            {onglet === 'compte' && (
              <div className="grid gap-10">
                <div>
                  <h2 className={titre2}>Votre adresse de connexion</h2>
                  <p className="mt-2 text-lg text-encre">{MOI.email}</p>
                  <p className="mt-1 text-base text-olive">L’équipe AET Connect peut la changer pour vous.</p>
                </div>
                <div>
                  <h2 className={titre2}>Quitter AET Connect</h2>
                  <div className="mt-3">
                    <Quitter />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
