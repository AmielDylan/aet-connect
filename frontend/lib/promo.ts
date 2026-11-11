// Validation d'une promo (école + année d'entrée), partagée par l'accueil et les parcours d'inscription.
// L'année maximale est l'année en cours, comme le vérifie le backend.

type SchoolLike = { id: string; established_year: number | null }

const N = ' '

export function promoError(schools: SchoolLike[], schoolId: string, entryYear: string): string | null {
  if (!schoolId) return 'Il manque votre école.'
  const value = entryYear.trim()
  if (!value) return 'Il manque votre année d’entrée.'
  if (!/^\d{4}$/.test(value)) return 'L’année d’entrée s’écrit sur quatre chiffres, par exemple 2005.'
  const year = parseInt(value, 10)
  const school = schools.find((s) => s.id === schoolId)
  const min = school?.established_year ?? 1950
  if (year < min) {
    return school?.established_year
      ? `Cette école a ouvert en ${min}${N}: l’année d’entrée commence à ${min}.`
      : `L’année d’entrée commence à ${min}.`
  }
  const max = new Date().getFullYear()
  if (year > max) return `L’année d’entrée va jusqu’à ${max}.`
  return null
}
