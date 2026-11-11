'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useJoinPromo } from '@/hooks/use-join-promo'
import { Bouton, EcoleAnnee, InscriptionShell, N, Question, introClasse, titreClasse } from '@/components/registration/kit'

// Rejoindre sa promo : école et année d'entrée, puis le bon parcours (code ou demande d'accès),
// avec la même logique que le formulaire de l'accueil.
export default function RegisterPage() {
  const [schoolId, setSchoolId] = useState('')
  const [year, setYear] = useState('')
  const { data } = useQuery({ queryKey: ['schools'], queryFn: () => apiClient.getSchools() })
  const schools = data?.schools ?? []
  const { join, error, isPending } = useJoinPromo(schools)

  return (
    <InscriptionShell>
      <h1 className={titreClasse}>Rejoindre votre promo</h1>
      <p className={introClasse}>
        Avec votre école et votre année d’entrée, nous regardons si des collègues de votre promo sont déjà inscrits, et nous vous
        indiquons la marche à suivre.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          join(schoolId, year)
        }}
        noValidate
        className="mt-8 grid gap-5"
      >
        <EcoleAnnee schools={schools} schoolId={schoolId} onSchool={setSchoolId} year={year} onYear={setYear} erreur={error} />
        <Bouton pending={isPending}>{isPending ? 'Vérification…' : 'Trouver ma promo'}</Bouton>
      </form>
      <div className="mt-8">
        <Question question={`Un collègue de promotion vous a envoyé un code${N}?`} href="/register/with-code">
          Entrer mon code
        </Question>
      </div>
    </InscriptionShell>
  )
}
