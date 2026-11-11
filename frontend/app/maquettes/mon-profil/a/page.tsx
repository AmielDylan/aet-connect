'use client'

// Proposition A · « L'aperçu » : le formulaire à gauche, chaque réglage de visibilité sous le champ qu'il concerne ;
// à droite, le profil tel que les AET le voient, qui suit chaque frappe. Un seul enregistrement pour le tout.
import { Linkedin, Mail, Phone } from 'lucide-react'
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
  VIE,
  boutonVert,
  lienTexte,
  titre2,
  useBrouillon,
  usePhoto,
  type Infos,
  type Vie,
} from '../commun'

function Apercu({ v, vie, photo }: { v: Infos; vie: Vie; photo: string | null }) {
  const lieu = vie.show_current_location && v.current_city ? `vit à ${v.current_city}` : null
  const contacts = [
    vie.show_email && { icone: Mail, texte: MOI.email },
    vie.show_phone && v.phone && { icone: Phone, texte: v.phone },
    vie.show_linkedin && v.linkedin_url && { icone: Linkedin, texte: 'Son profil LinkedIn' },
  ].filter(Boolean) as { icone: typeof Mail; texte: string }[]
  return (
    <div className={`transition-opacity duration-200 ${vie.show_in_directory ? '' : 'opacity-45'}`}>
      <div className="sur-vert trame trame-sur-vert overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert p-3 text-creme">
        <div className="flex items-start gap-4 p-3">
          <Portrait prenom={v.first_name} nom={v.last_name} src={photo} className="size-20 rounded-2xl rounded-tr-[36px] bg-sable text-xl text-vert" />
          <div className="min-w-0 pt-1">
            {MOI.is_ambassador && <p className="text-sm text-or">Représente sa promo</p>}
            <p className="font-titre text-lg font-bold leading-tight tracking-[-0.02em]">
              {v.first_name || 'Prénom'} {v.last_name || 'Nom'}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-brume">
              <span>{MOI.ecole}</span>
              <Drapeau pays={MOI.pays_ecole} className="h-3 w-auto" />
              {vie.show_entry_year && <span>· promo {MOI.promo}</span>}
              {lieu && <span>· {lieu}</span>}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-3 grid gap-4 rounded-3xl bg-white p-5">
        {vie.show_bio && v.bio ? (
          <p className="line-clamp-4 text-base leading-relaxed text-encre">{v.bio}</p>
        ) : (
          <p className="text-base text-olive">Pas de présentation visible.</p>
        )}
        {contacts.length ? (
          <ul className="grid gap-2">
            {contacts.map(({ icone: Icone, texte }) => (
              <li key={texte} className="flex min-h-10 items-center gap-3 rounded-xl bg-creme px-3 text-sm text-encre">
                <Icone className="size-4 shrink-0 text-vert" aria-hidden="true" />
                <span className="truncate">{texte}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-olive">{v.first_name || 'Ce membre'} n’a pas rendu ses coordonnées visibles.</p>
        )}
      </div>
    </div>
  )
}

export default function PropositionA() {
  const infos = useBrouillon(INFOS)
  const vie = useBrouillon(VIE)
  const p = usePhoto()
  const v = infos.valeur
  const w = vie.valeur
  const bascule = (cle: keyof Vie, label: string) => (
    <Interrupteur id={`vis-${cle}`} label={label} actif={w[cle]} onChange={(x) => vie.setValeur({ ...w, [cle]: x })} />
  )
  const modifie = infos.modifie || vie.modifie
  const etat = infos.etat === 'envoi' || vie.etat === 'envoi' ? 'envoi' : infos.etat === 'fait' || vie.etat === 'fait' ? 'fait' : 'repos'

  return (
    <>
      <EnteteMaquette prenom={infos.enregistre.first_name} nom={infos.enregistre.last_name} photo={p.photo} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Mon profil</h1>
        <p className="mt-3 max-w-[56ch] text-lg leading-relaxed text-olive">
          Ce que vous écrivez ici, vos collègues le retrouvent dans l’annuaire. Sous chaque information, vous choisissez si elle se voit.
        </p>

        <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div className="grid content-start gap-12">
            <section aria-labelledby="photo-a">
              <h2 id="photo-a" className={titre2}>
                Votre photo
              </h2>
              <div className="mt-4 flex items-center gap-5">
                <Portrait prenom={v.first_name} nom={v.last_name} src={p.photo} className="size-24 rounded-2xl rounded-tr-[40px] bg-sable text-2xl text-vert" />
                <div className="grid gap-1">
                  <button type="button" onClick={p.choisir} disabled={p.envoi} className={`${boutonVert} justify-self-start`}>
                    {p.envoi ? 'Envoi…' : p.photo ? 'Changer la photo' : 'Ajouter une photo'}
                  </button>
                  {p.photo && (
                    <button type="button" onClick={p.retirer} className={`${lienTexte} justify-self-start`}>
                      Retirer la photo
                    </button>
                  )}
                  <p className="text-sm text-olive">JPG, PNG ou WebP, 2{N}Mo au plus</p>
                </div>
                {p.champ}
              </div>
              {p.erreur && (
                <p role="alert" className="mt-3 text-sm font-semibold text-alerte">
                  {p.erreur}
                </p>
              )}
            </section>

            <section aria-labelledby="infos-a">
              <h2 id="infos-a" className={titre2}>
                Vos informations
              </h2>
              <div className="mt-5">
                <ChampsInfos
                  v={v}
                  set={infos.setValeur}
                  apres={{
                    lieu: bascule('show_current_location', 'Montrer votre ville'),
                    email: bascule('show_email', 'Montrer votre email'),
                    phone: bascule('show_phone', 'Montrer votre téléphone'),
                    linkedin_url: bascule('show_linkedin', 'Montrer votre LinkedIn'),
                    bio: bascule('show_bio', 'Montrer votre présentation'),
                  }}
                />
              </div>
              <div
                className={`mt-8 ${modifie ? 'sticky bottom-0 z-10 -mx-5 rounded-t-3xl bg-creme px-5 py-4 sm:-mx-6 sm:px-6' : ''}`}
              >
                <Enregistrer
                  modifie={modifie}
                  etat={etat}
                  onEnregistrer={() => {
                    if (infos.modifie) infos.enregistrer()
                    if (vie.modifie) vie.enregistrer()
                  }}
                  onAnnuler={() => {
                    infos.annuler()
                    vie.annuler()
                  }}
                />
              </div>
            </section>

            <section aria-labelledby="mdp-a" className="rounded-3xl bg-white p-6 sm:p-8">
              <h2 id="mdp-a" className={titre2}>
                Mot de passe
              </h2>
              <div className="mt-5">
                <MotDePasse />
              </div>
            </section>

            <section aria-labelledby="quitter-a">
              <h2 id="quitter-a" className={titre2}>
                Quitter AET Connect
              </h2>
              <div className="mt-3">
                <Quitter />
              </div>
            </section>
          </div>

          <aside aria-labelledby="apercu-a" className="lg:sticky lg:top-6 lg:self-start">
            <h2 id="apercu-a" className={titre2}>
              Ce que voient les AET
            </h2>
            <div className="mt-3">
              <Interrupteur
                id="vis-annuaire"
                label="Apparaître dans l’annuaire"
                detail={w.show_in_directory ? 'Vos collègues peuvent vous retrouver' : 'Personne ne peut vous retrouver ni ouvrir votre profil'}
                actif={w.show_in_directory}
                onChange={(x) => vie.setValeur({ ...w, show_in_directory: x })}
              />
            </div>
            <div className="mt-4">
              <Apercu v={v} vie={w} photo={p.photo} />
            </div>
            <div className="mt-4">{bascule('show_entry_year', 'Montrer votre promo')}</div>
          </aside>
        </div>
      </main>
    </>
  )
}
