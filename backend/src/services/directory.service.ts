import { supabase } from '@/config/database'
import { HttpError } from '@/utils/http'
import { accentFree, plainSearchTerm } from '@/utils/search'

// Annuaire des membres. Qui apparaît et quels champs sont visibles : décidé par la vue
// directory_entries (migration directory_visibility). Ce module ne fait que filtrer,
// paginer et mettre en forme ; il ne contient aucune règle de confidentialité.

export interface DirectoryQuery {
  search?: string
  school_id?: string
  entry_year?: string
  country?: string
  city?: string
  is_ambassador?: boolean
  limit?: number
  offset?: number
}

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

function toMember(row: any): DirectoryMember {
  return {
    id: row.id,
    first_name: row.first_name,
    last_name: row.last_name,
    avatar_url: row.avatar_url,
    is_ambassador: row.is_ambassador,
    school: row.school_id
      ? { id: row.school_id, name_fr: row.school_name, country: row.school_country, acronym: row.school_acronym, flag: row.school_flag }
      : null,
    entry_year: row.entry_year,
    current_city: row.current_city,
    current_country: row.current_country,
    bio: row.bio,
    linkedin_url: row.linkedin_url,
    email: row.email,
    phone: row.phone
  }
}

export async function listMembers(q: DirectoryQuery): Promise<{ users: DirectoryMember[]; total: number }> {
  const limit = Math.min(Math.max(q.limit ?? 20, 1), 100)
  const offset = Math.max(q.offset ?? 0, 0)

  let query = supabase.from('directory_entries').select('*', { count: 'exact' })
  if (q.school_id) query = query.eq('school_id', q.school_id)
  if (q.entry_year) query = query.eq('entry_year', q.entry_year)
  if (q.country) query = query.eq('school_country', q.country)
  if (q.is_ambassador !== undefined) query = query.eq('is_ambassador', q.is_ambassador)

  const city = plainSearchTerm(q.city)
  if (city) query = query.ilike('current_city', `%${city}%`)
  const search = accentFree(plainSearchTerm(q.search))
  if (search) query = query.ilike('search_text', `%${search}%`)

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .order('id')
    .range(offset, offset + limit - 1)
  if (error) throw error

  return { users: (data ?? []).map(toMember), total: count ?? 0 }
}

/** Profil d'un membre tel que l'annuaire le montre. 404 s'il est masqué, inactif ou inconnu. */
export async function memberProfile(id: string): Promise<DirectoryMember> {
  const { data, error } = await supabase.from('directory_entries').select('*').eq('id', id).maybeSingle()
  if (error && error.code !== '22P02') throw error // 22P02 : identifiant mal formé
  if (!data) throw new HttpError(404, 'Membre introuvable')
  return toMember(data)
}

const distinctSorted = (values: (string | null)[], desc = false) => {
  const unique = [...new Set(values.filter((v): v is string => !!v))]
  return unique.sort((a, b) => (desc ? b.localeCompare(a) : a.localeCompare(b, 'fr')))
}

/** Années d'entrée visibles dans l'annuaire (éventuellement pour une école). */
export async function visibleYears(schoolId?: string): Promise<string[]> {
  let query = supabase.from('directory_entries').select('entry_year').not('entry_year', 'is', null)
  if (schoolId) query = query.eq('school_id', schoolId)
  const { data, error } = await query
  if (error) throw error
  return distinctSorted((data ?? []).map((r) => r.entry_year), true)
}

/** Villes visibles dans l'annuaire (membres visibles qui montrent leur ville). */
export async function visibleCities(): Promise<string[]> {
  const { data, error } = await supabase.from('directory_entries').select('current_city').not('current_city', 'is', null)
  if (error) throw error
  return distinctSorted((data ?? []).map((r) => r.current_city?.trim() || null))
}
