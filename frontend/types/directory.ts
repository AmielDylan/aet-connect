export interface DirectoryFilters {
  search: string
  school_id: string | null
  entry_year: string | null
  country: string | null
  city: string | null
}

export interface DirectoryMember {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar_url: string | null
  school_name: string
  entry_year: string
  current_city: string | null
  current_country: string | null
  is_ambassador: boolean
  bio: string | null
}

export type ViewMode = 'grid' | 'list'



