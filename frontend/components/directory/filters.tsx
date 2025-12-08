'use client'

import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import { apiClient } from '@/lib/api'
import type { DirectoryFilters } from '@/types/directory'

const countryFlags: Record<string, string> = {
  'Bénin': '🇧🇯',
  'Burkina Faso': '🇧🇫',
  'Côte d\'Ivoire': '🇨🇮',
  'Gabon': '🇬🇦',
  'Mali': '🇲🇱',
  'Niger': '🇳🇪',
  'Sénégal': '🇸🇳',
  'Togo': '🇹🇬',
}

interface FiltersProps {
  filters: DirectoryFilters
  onFilterChange: (key: keyof DirectoryFilters, value: string | null) => void
  onClearFilters: () => void
}

export function Filters({ filters, onFilterChange, onClearFilters }: FiltersProps) {
  const hasActiveFilters = 
    filters.school_id || filters.entry_year || filters.country

  // Charger les écoles
  const { data: schoolsData } = useQuery({
    queryKey: ['filter-schools'],
    queryFn: () => apiClient.getSchools(),
  })

  // Charger les promotions (dépend de l'école sélectionnée)
  const { data: yearsData } = useQuery({
    queryKey: ['filter-years', filters.school_id],
    queryFn: () => apiClient.getFilterYears(filters.school_id || undefined),
  })

  // Charger les pays
  const { data: countriesData } = useQuery({
    queryKey: ['filter-countries'],
    queryFn: () => apiClient.getFilterCountries(),
  })

  const schools = schoolsData?.schools || []
  const years = yearsData?.years || []
  const countries = countriesData?.countries || []

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* École */}
      <Select
        value={filters.school_id || 'all'}
        onValueChange={(value) => {
          onFilterChange('school_id', value === 'all' ? null : value)
          // Reset année quand on change d'école
          onFilterChange('entry_year', null)
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Toutes les écoles" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les écoles</SelectItem>
          {schools.map((school) => (
            <SelectItem key={school.id} value={school.id}>
              {school.name_fr}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Promotion */}
      <Select
        value={filters.entry_year || 'all'}
        onValueChange={(value) =>
          onFilterChange('entry_year', value === 'all' ? null : value)
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Toutes les promos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les promotions</SelectItem>
          {years.map((year: string) => (
            <SelectItem key={year} value={year}>
              Promotion {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Pays */}
      <Select
        value={filters.country || 'all'}
        onValueChange={(value) =>
          onFilterChange('country', value === 'all' ? null : value)
        }
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue>
            {filters.country && filters.country !== 'all' 
              ? `${countryFlags[filters.country] || ''} ${filters.country}`
              : 'Tous les pays'
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les pays</SelectItem>
          {countries.map((country: string) => (
            <SelectItem key={country} value={country}>
              {countryFlags[country] || ''} {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
        >
          <X className="mr-2 h-4 w-4" />
          Réinitialiser
        </Button>
      )}
    </div>
  )
}

