'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { SearchBar } from '@/components/directory/search-bar'
import { Filters } from '@/components/directory/filters'
import { ViewToggle } from '@/components/directory/view-toggle'
import { MemberCard } from '@/components/directory/member-card'
import { MemberList } from '@/components/directory/member-list'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { DirectoryFilters, ViewMode } from '@/types/directory'

const MEMBERS_PER_PAGE = 20

export default function DirectoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<DirectoryFilters>({
    search: '',
    school_id: null,
    entry_year: null,
    country: null,
  })

  // Debounce search (attendre 500ms après la dernière frappe)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 500)

    return () => clearTimeout(timeout)
  }, [filters.search])

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
    setPage(1) // Reset page quand on recherche
  }

  const handleFilterChange = (
    key: keyof DirectoryFilters,
    value: string | null
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1) // Reset page
  }

  const handleClearFilters = () => {
    setFilters({
      search: '',
      school_id: null,
      entry_year: null,
      country: null,
    })
    setDebouncedSearch('')
    setPage(1)
  }

  // Fetch members
  const { data, isLoading, error } = useQuery({
    queryKey: ['members', debouncedSearch, filters.school_id, filters.entry_year, filters.country, page],
    queryFn: () =>
      apiClient.getMembers({
        search: debouncedSearch,
        school_id: filters.school_id || undefined,
        entry_year: filters.entry_year || undefined,
        country: filters.country || undefined,
        limit: MEMBERS_PER_PAGE,
        offset: (page - 1) * MEMBERS_PER_PAGE,
      }),
  })

  const members = data?.users || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / MEMBERS_PER_PAGE)

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Annuaire AET</h1>
          <p className="text-muted-foreground">
            {total} membre{total > 1 ? 's' : ''} dans le réseau
          </p>
        </div>

        {/* Barre de recherche + Toggle vue */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <SearchBar
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
          <ViewToggle mode={viewMode} onModeChange={setViewMode} />
        </div>

        {/* Filtres */}
        <Filters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Liste/Grid des membres */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            Erreur lors du chargement des membres
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Aucun membre trouvé
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <MemberList members={members} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 pt-6">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Précédent
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                Page {page} sur {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

