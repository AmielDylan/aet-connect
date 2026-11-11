'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { promoError } from '@/lib/promo'
import type { VerifyInvitationCodeResponse } from '@/types'
import { useAuth } from '@/hooks/use-auth'
import {
  Bouton,
  Champ,
  Confirme,
  EcoleAnnee,
  Erreur,
  InscriptionShell,
  N,
  Question,
  REGLES_INSCRIPTION,
  ReglesMotDePasse,
  Retour,
  introClasse,
  messageApi,
  titreClasse,
} from '@/components/registration/kit'

const ETAPES = [{ titre: 'Votre code' }, { titre: 'Vos informations' }, { titre: 'Bienvenue' }]

function WithCodeContent() {
  const params = useSearchParams()
  const codeFromUrl = params.get('code')?.trim() || ''
  const schoolParam = params.get('school')
  const yearParam = params.get('year')
  const { user, logout } = useAuth()
  const [etape, setEtape] = useState(1)

  // Une inscription se fait déconnecté : si un membre est connecté sur cet appareil, on le déconnecte
  useEffect(() => {
    if (user) logout()
  }, [user, logout])

  // Étape 1 : le code
  const [code, setCode] = useState(codeFromUrl)
  const [codeErreur, setCodeErreur] = useState('')
  const [verifie, setVerifie] = useState<VerifyInvitationCodeResponse | null>(null)
  // Code universel (émis par un administrateur) : la personne choisit son école et son année
  const [schoolId, setSchoolId] = useState('')
  const [year, setYear] = useState('')

  const universel = !!verifie?.universal
  const { data: schoolsData } = useQuery({ queryKey: ['schools'], queryFn: () => apiClient.getSchools(), enabled: universel })
  const schools = schoolsData?.schools ?? []

  const appliquer = (data: VerifyInvitationCodeResponse) => {
    setVerifie(data)
    setCode(data.code ?? code)
    setCodeErreur('')
    setEtape(2)
  }

  const verifier = useMutation({
    mutationFn: (valeur: string) => apiClient.verifyInvitationCode({ code: valeur }),
    onSuccess: (data) => (data.valid ? appliquer(data) : setCodeErreur(data.message || 'Ce code n’est pas valable.')),
    onError: (error) => setCodeErreur(messageApi(error, 'Nous n’arrivons pas à vérifier ce code pour le moment.')),
  })

  // Le code arrive par un lien : on le vérifie tout de suite
  useEffect(() => {
    if (!codeFromUrl) return
    apiClient
      .verifyCodeInfo(codeFromUrl)
      .then(appliquer)
      .catch((error) => setCodeErreur(messageApi(error, 'Ce code n’est pas valable.')))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeFromUrl])

  // Étape 2 : les informations
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [erreurApi, setErreurApi] = useState('')

  const inscrire = useMutation({
    mutationFn: () =>
      apiClient.completeRegistration({
        invitation_code: code,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        ...(universel ? { school_id: schoolId, entry_year: year } : {}),
      }),
    onSuccess: () => setEtape(3),
    onError: (error) => setErreurApi(messageApi(error, 'Votre compte n’a pas pu être créé. Vous pouvez réessayer dans un instant.')),
  })

  function onCode(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return setCodeErreur('Il manque votre code d’invitation.')
    setCodeErreur('')
    verifier.mutate(code.trim())
  }

  function onInscription(e: React.FormEvent) {
    e.preventDefault()
    setErreurApi('')
    const e2: Record<string, string> = {}
    if (firstName.trim().length < 2) e2.prenom = 'Il manque votre prénom.'
    if (lastName.trim().length < 2) e2.nom = 'Il manque votre nom.'
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e2.email = email.trim() ? 'Cette adresse email semble incomplète.' : 'Il manque votre adresse email.'
    if (!REGLES_INSCRIPTION.every((r) => r.test(password))) e2.password = 'Le mot de passe ne remplit pas encore toutes les règles.'
    if (confirmation !== password) e2.confirmation = 'Les deux mots de passe ne sont pas identiques.'
    if (universel) {
      const p = promoError(schools, schoolId, year)
      if (p) e2.promo = p
    }
    setErreurs(e2)
    if (Object.keys(e2).length === 0) inscrire.mutate()
  }

  const demanderUnCode = schoolParam && yearParam ? `/register/request-code?school=${schoolParam}&year=${yearParam}` : '/register/request-code'

  return (
    <InscriptionShell etapes={ETAPES} courante={etape}>
      {etape === 1 && (
        <div>
          <h1 className={titreClasse}>Rejoindre votre promo avec un code</h1>
          <p className={introClasse}>Le code reçu d’un collègue de promotion vous rattache directement à votre promo.</p>
          <form onSubmit={onCode} noValidate className="mt-8 grid gap-5">
            <Champ
              id="code"
              label="Code d’invitation"
              placeholder="AET-XXXX-XXXX"
              autoComplete="off"
              spellCheck={false}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="font-semibold uppercase tracking-[0.08em]"
            />
            {codeErreur && <Erreur>{codeErreur}</Erreur>}
            <Bouton pending={verifier.isPending}>{verifier.isPending ? 'Vérification…' : 'Vérifier le code'}</Bouton>
          </form>
          <div className="mt-8">
            <Question question={`Pas encore de code${N}?`} href={demanderUnCode}>
              Le demander pour ma promo
            </Question>
          </div>
        </div>
      )}

      {etape === 2 && verifie && (
        <div>
          {universel ? (
            <Confirme>Code valable</Confirme>
          ) : (
            <Confirme>
              Code valable · {verifie.school_name}, promo {verifie.entry_year}
            </Confirme>
          )}
          <h1 className={titreClasse}>Vos informations</h1>
          <p className={introClasse}>Elles servent à créer votre compte. Vous choisirez ensuite ce que les autres voient.</p>
          {verifie.grants_ambassador && (
            <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-base leading-relaxed text-olive">
              Vous serez l’ambassadeur ou l’ambassadrice de votre promo{N}: vous pourrez inviter jusqu’à 15 collègues.
            </p>
          )}
          <form onSubmit={onInscription} noValidate className="mt-8 grid gap-5">
            {universel && (
              <EcoleAnnee schools={schools} schoolId={schoolId} onSchool={setSchoolId} year={year} onYear={setYear} erreur={erreurs.promo} />
            )}
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
            <Champ
              id="password"
              label="Mot de passe"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aide={<ReglesMotDePasse id="regles" password={password} />}
              erreur={erreurs.password}
            />
            <Champ
              id="confirmation"
              label="Confirmation"
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              erreur={erreurs.confirmation}
            />
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
            <Bouton pending={inscrire.isPending}>{inscrire.isPending ? 'Création du compte…' : 'Créer mon compte'}</Bouton>
            <Retour onClick={() => setEtape(1)}>Revenir au code</Retour>
          </form>
        </div>
      )}

      {etape === 3 && (
        <div aria-live="polite">
          <h1 className={titreClasse}>Bienvenue dans la famille</h1>
          <p className={introClasse}>
            Votre compte est créé. Vous pouvez vous connecter dès maintenant avec <strong className="font-semibold text-encre">{email.trim()}</strong> et
            votre mot de passe.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-vert px-7 text-base font-semibold text-creme transition-colors duration-200 hover:bg-vert-carte"
          >
            Me connecter
          </Link>
        </div>
      )}
    </InscriptionShell>
  )
}

// useSearchParams exige une frontière Suspense (sinon le build de production échoue)
export default function RegisterWithCodePage() {
  return (
    <Suspense fallback={null}>
      <WithCodeContent />
    </Suspense>
  )
}
