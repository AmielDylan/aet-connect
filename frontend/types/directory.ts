export interface DirectoryFilters {
  search: string
  school_id: string | null
  entry_year: string | null
  country: string | null
  city: string | null
}

/** Un membre tel que l'annuaire le montre (forme de la réponse de GET /api/users) */
export interface DirectoryMember {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  is_ambassador: boolean
  school: { id: string; name_fr: string; country: string; acronym: string | null; flag: string | null } | null
  entry_year: string | null
  current_city: string | null
  current_country: string | null
  bio: string | null
  linkedin_url: string | null
  email: string | null
  phone: string | null
}

/** « EMPT », ou le nom complet quand l'école n'a pas de sigle */
export const ecoleCourte = (m: Pick<DirectoryMember, 'school'>) => m.school?.acronym || m.school?.name_fr || ''
