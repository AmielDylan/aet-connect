'use client'

import { Suspense } from 'react'
import { Demande } from '@/components/registration/demande'

// useSearchParams (école et année reprises de l'adresse) exige une frontière Suspense
export default function RequestAccessPage() {
  return (
    <Suspense fallback={null}>
      <Demande genre="acces" />
    </Suspense>
  )
}
