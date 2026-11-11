'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

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

  const validationError = (schoolId: string, entryYear: string): string | null => {
    if (!schoolId) return 'Il manque votre école.'
    if (!/^\d{4}$/.test(entryYear)) return 'L’année d’entrée s’écrit sur quatre chiffres, par exemple 2005.'
    const year = parseInt(entryYear, 10)
    const school = schools.find((s) => s.id === schoolId)
    const min = school?.established_year ?? 1950
    if (year < min) {
      return school?.established_year
        ? `Cette école a ouvert en ${min} : l’année d’entrée commence à ${min}.`
        : `L’année d’entrée commence à ${min}.`
    }
    if (year > new Date().getFullYear() + 1) return `L’année d’entrée va jusqu’à ${new Date().getFullYear() + 1}.`
    return null
  }

  return {
    error,
    isPending: check.isPending,
    join: (schoolId: string, entryYear: string) => {
      const problem = validationError(schoolId, entryYear.trim())
      setError(problem ?? '')
      if (!problem) check.mutate({ schoolId, entryYear: entryYear.trim() })
    },
  }
}
