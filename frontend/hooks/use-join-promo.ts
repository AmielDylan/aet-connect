'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { promoError } from '@/lib/promo'

type SchoolLike = { id: string; established_year: number | null }

/**
 * Rejoindre sa promo : école + année d'entrée, puis le bon parcours.
 * La promo a déjà des membres → inscription avec un code ; sinon → demande d'accès.
 * Partagé par la page d'accueil et /register.
 */
export function useJoinPromo(schools: SchoolLike[]) {
  const router = useRouter()
  const [error, setError] = useState('')

  const check = useMutation({
    mutationFn: (promo: { schoolId: string; entryYear: string }) =>
      apiClient.checkSchoolPromo({ school_id: promo.schoolId, entry_year: promo.entryYear }),
    onSuccess: (data, promo) => {
      const query = `school=${promo.schoolId}&year=${promo.entryYear}`
      router.push(data.exists ? `/register/with-code?${query}` : `/register/request-access?${query}`)
    },
    onError: () => setError('Nous n’arrivons pas à vérifier votre promo pour le moment. Vous pouvez réessayer dans un instant.'),
  })

  return {
    error,
    isPending: check.isPending,
    join: (schoolId: string, entryYear: string) => {
      const problem = promoError(schools, schoolId, entryYear)
      setError(problem ?? '')
      if (!problem) check.mutate({ schoolId, entryYear: entryYear.trim() })
    },
  }
}
