'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { promoError } from '@/lib/promo'
import { LienFleche } from '@/components/landing/lien-fleche'
import { Bouton, Champ, Confirme, EcoleAnnee, Erreur, InscriptionShell, N, Retour, ZoneTexte, introClasse, messageApi, titreClasse } from './kit'

// Les deux demandes, qui ne diffèrent que par leur condition et leur destination :
// - « code » : la promo a déjà des membres ; la demande va aux administrateurs, qui transmettent un code ;
// - « acces » : personne de la promo n'est inscrit ; un administrateur valide et transmet un code.
type Genre = 'code' | 'acces'

const ETAPES = [{ titre: 'Votre promo' }, { titre: 'Votre demande' }, { titre: 'C’est envoyé' }]

const TEXTES = {
  code: {
    titre: 'Demander un code pour votre promo',
    intro: 'Avec votre école et votre année d’entrée, nous vérifions que des collègues de votre promo sont déjà inscrits.',
    confirme: 'Des collègues de votre promo sont déjà inscrits',
    demande: 'Elle arrive à l’équipe AET Connect, qui vous transmet un code d’invitation pour votre promo, à l’adresse que vous indiquez.',
    envoye: 'Dès qu’elle l’aura validée, elle vous écrira avec votre code d’invitation à l’adresse',
    autre: {
      texte: `Personne de cette promo n’est encore inscrit${N}: vous pouvez demander l’accès, et ouvrir la voie pour votre promo.`,
      lien: 'Demander l’accès',
      chemin: '/register/request-access',
    },
  },
  acces: {
    titre: 'Demander l’accès pour votre promo',
    intro: 'Quand personne de votre promo n’est encore inscrit, un administrateur étudie votre demande et vous transmet un code d’invitation.',
    confirme: 'Personne de votre promo n’est encore inscrit',
    demande: 'Un administrateur l’étudie, puis vous écrit avec votre code d’invitation, à l’adresse que vous indiquez.',
    envoye: 'Dès qu’un administrateur l’aura validée, il vous écrira avec votre code d’invitation à l’adresse',
    autre: {
      texte: `Des collègues de cette promo sont déjà inscrits${N}: vous pouvez demander un code pour la rejoindre.`,
      lien: 'Demander un code',
      chemin: '/register/request-code',
    },
  },
} as const

export function Demande({ genre }: { genre: Genre }) {
  const t = TEXTES[genre]
  const params = useSearchParams()
  const [etape, setEtape] = useState(1)

  // Étape 1 : la promo (reprise de l'adresse quand on vient d'un autre parcours)
  const [schoolId, setSchoolId] = useState(params.get('school') ?? '')
  const [year, setYear] = useState(params.get('year') ?? '')
  const [promoErreur, setPromoErreur] = useState('')
  const [autreParcours, setAutreParcours] = useState(false)
  const { data: schoolsData } = useQuery({ queryKey: ['schools'], queryFn: () => apiClient.getSchools() })
  const schools = schoolsData?.schools ?? []

  const verifier = useMutation({
    mutationFn: () => apiClient.checkSchoolPromo({ school_id: schoolId, entry_year: year }),
    onSuccess: (data) => {
      const bonParcours = genre === 'code' ? data.exists : !data.exists
      setAutreParcours(!bonParcours)
      if (bonParcours) setEtape(2)
    },
    onError: (error) => setPromoErreur(messageApi(error, 'Nous n’arrivons pas à vérifier votre promo pour le moment.')),
  })

  function onPromo(e?: React.FormEvent) {
    e?.preventDefault()
    setAutreParcours(false)
    const p = promoError(schools, schoolId, year)
    setPromoErreur(p ?? '')
    if (!p) verifier.mutate()
  }

  // École et année déjà dans l'adresse : on vérifie dès que les écoles sont là
  const auto = useRef(false)
  useEffect(() => {
    if (auto.current || !schools.length || !params.get('school') || !params.get('year')) return
    auto.current = true
    onPromo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schools.length])

  // Étape 2 : la demande
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [ambassadeur, setAmbassadeur] = useState(false)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [erreurApi, setErreurApi] = useState('')

  const envoyer = useMutation({
    mutationFn: () => {
      const base = {
        school_id: schoolId,
        entry_year: year,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        message: message.trim(),
      }
      return genre === 'code' ? apiClient.requestCodeFromPeer(base) : apiClient.requestInitialAccess({ ...base, wants_ambassador: ambassadeur })
    },
    onSuccess: () => setEtape(3),
    onError: (error) => setErreurApi(messageApi(error, 'Votre demande n’a pas pu partir. Vous pouvez réessayer dans un instant.')),
  })

  function onDemande(e: React.FormEvent) {
    e.preventDefault()
    setErreurApi('')
    const e2: Record<string, string> = {}
    if (firstName.trim().length < 2) e2.prenom = 'Il manque votre prénom.'
    if (lastName.trim().length < 2) e2.nom = 'Il manque votre nom.'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e2.email = email.trim() ? 'Cette adresse email semble incomplète.' : 'Il manque votre adresse email.'
    if (message.trim().length < 10) e2.message = 'Quelques mots de plus pour vous présenter (10 caractères au moins).'
    setErreurs(e2)
    if (Object.keys(e2).length === 0) envoyer.mutate()
  }

  const query = schoolId && year ? `?school=${schoolId}&year=${year}` : ''

  return (
    <InscriptionShell etapes={ETAPES} courante={etape}>
      {etape === 1 && (
        <div>
          <h1 className={titreClasse}>{t.titre}</h1>
          <p className={introClasse}>{t.intro}</p>
          <form onSubmit={onPromo} noValidate className="mt-8 grid gap-5">
            <EcoleAnnee schools={schools} schoolId={schoolId} onSchool={setSchoolId} year={year} onYear={setYear} erreur={promoErreur} />
            {autreParcours && (
              <div role="status" className="grid gap-1 rounded-2xl bg-white px-4 py-3">
                <p className="text-base leading-relaxed text-olive">{t.autre.texte}</p>
                <LienFleche href={`${t.autre.chemin}${query}`} className="justify-self-start">
                  {t.autre.lien}
                </LienFleche>
              </div>
            )}
            <Bouton pending={verifier.isPending}>{verifier.isPending ? 'Vérification…' : 'Continuer'}</Bouton>
          </form>
        </div>
      )}

      {etape === 2 && (
        <div>
          <Confirme>{t.confirme}</Confirme>
          <h1 className={titreClasse}>Votre demande</h1>
          <p className={introClasse}>{t.demande}</p>
          <form onSubmit={onDemande} noValidate className="mt-8 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
              <Champ id="prenom" label="Prénom" autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} erreur={erreurs.prenom} />
              <Champ id="nom" label="Nom" autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} erreur={erreurs.nom} />
            </div>
            <Champ
              id="email"
              label="Email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              placeholder="prenom.nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              erreur={erreurs.email}
            />
            <ZoneTexte
              id="message"
              label="Quelques mots pour vous présenter"
              maxLength={500}
              placeholder="Votre école, votre promo, ce que vous devenez…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aide={`${message.trim().length} / 500 caractères, 10 au moins`}
              erreur={erreurs.message}
            />
            {genre === 'acces' && (
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-4 py-3">
                <input
                  type="checkbox"
                  checked={ambassadeur}
                  onChange={(e) => setAmbassadeur(e.target.checked)}
                  className="mt-1 size-5 shrink-0 accent-[var(--esp-vert)]"
                />
                <span className="grid gap-0.5">
                  <span className="text-base text-encre">Je veux bien devenir l’ambassadeur ou l’ambassadrice de ma promo</span>
                  <span className="text-sm text-olive">Un ambassadeur peut inviter jusqu’à 15 collègues, un membre 3.</span>
                </span>
              </label>
            )}
            {erreurApi && (
              <Erreur>
                {erreurApi}
                {/déjà un compte/.test(erreurApi) && (
                  <>
                    {' '}
                    <Link href="/login" className="underline">
                      Se connecter
                    </Link>
                  </>
                )}
              </Erreur>
            )}
            <Bouton pending={envoyer.isPending}>{envoyer.isPending ? 'Envoi…' : 'Envoyer ma demande'}</Bouton>
            <Retour onClick={() => setEtape(1)}>Revenir à la promo</Retour>
          </form>
        </div>
      )}

      {etape === 3 && (
        <div aria-live="polite">
          <h1 className={titreClasse}>C’est envoyé</h1>
          <p className={introClasse}>
            L’équipe AET Connect a bien reçu votre demande. {t.envoye} <strong className="font-semibold text-encre">{email.trim()}</strong>.
          </p>
          <p className="mt-4 text-base leading-relaxed text-olive">Avec ce code, il vous suffira de créer votre compte.</p>
          <div className="mt-8">
            <LienFleche href="/">Revenir à l’accueil</LienFleche>
          </div>
        </div>
      )}
    </InscriptionShell>
  )
}
