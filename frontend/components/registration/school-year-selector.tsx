'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { School } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Loader2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SchoolYearSelectorProps {
  // New props format
  year?: string
  setYear?: (v: string) => void
  schools?: School[]
  selectedSchoolId?: string | null
  isLoading?: boolean
  error?: string | null
  onSchoolChange?: (schoolId: string) => void
  // Legacy props format (for backward compatibility)
  selectedSchool?: string
  selectedYear?: string
  onYearChange?: (year: string) => void
}

export function SchoolYearSelector({
  year,
  setYear,
  schools,
  selectedSchoolId,
  isLoading = false,
  error = null,
  onSchoolChange,
  // Legacy props
  selectedSchool,
  selectedYear,
  onYearChange,
}: SchoolYearSelectorProps) {
  const { data: schoolsData, isLoading: isLoadingSchools } = useQuery({
    queryKey: ['schools'],
    queryFn: () => apiClient.getSchools(),
  })

  const [yearError, setYearError] = useState('')

  // Support both new and legacy props
  const currentYear = year ?? selectedYear ?? ''
  const setCurrentYear = setYear ?? onYearChange ?? (() => {})
  const currentSchoolId = selectedSchoolId ?? selectedSchool ?? null
  const handleSchoolChange = onSchoolChange ?? (() => {})

  // Utiliser les écoles passées en props ou celles du query
  const availableSchools = useMemo(() => {
    return schools && schools.length > 0 
      ? schools 
      : (schoolsData?.schools || [])
  }, [schools, schoolsData?.schools])

  // Récupérer l'école sélectionnée pour avoir established_year
  const currentSchool = useMemo(() => {
    return availableSchools.find((school: School) => school.id === currentSchoolId)
  }, [availableSchools, currentSchoolId])

  // Année minimale basée sur established_year ou 1950 par défaut
  const minYear = currentSchool?.established_year || 1950

  // Validation fonction avec established_year (DO NOT MODIFY)
  const validateYear = (yearValue: string): boolean => {
    const yearNum = parseInt(yearValue, 10)
    const currentYearValue = new Date().getFullYear()

    if (!/^\d{4}$/.test(yearValue)) {
      setYearError('Format invalide (YYYY requis)')
      return false
    }

    if (yearNum < minYear) {
      if (currentSchool?.established_year) {
        setYearError(`Cette école a été créée en ${currentSchool.established_year}. L'année minimale est ${currentSchool.established_year}.`)
      } else {
        setYearError(`Année minimale : ${minYear}`)
      }
      return false
    }

    if (yearNum > currentYearValue + 1) {
      setYearError(`Année doit être au maximum ${currentYearValue + 1}`)
      return false
    }

    setYearError('')
    return true
  }

  // Déterminer le placeholder selon l'état
  const getPlaceholder = () => {
    if (isLoading) {
      return 'Chargement…'
    }
    if (!currentSchoolId) {
      return 'Sélectionnez d\'abord une école'
    }
    return `Année d'entrée (min : ${minYear})`
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Sélection école */}
        <div className="space-y-2">
          <Label htmlFor="school">
            École militaire <span className="text-destructive">*</span>
          </Label>
          {isLoadingSchools ? (
            <div className="flex items-center justify-center h-10 border rounded-md">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Select 
              value={currentSchoolId || ''} 
              onValueChange={handleSchoolChange}
              disabled={isLoading}
            >
              <SelectTrigger id="school" className={error ? 'border-destructive' : ''}>
                <SelectValue placeholder="Sélectionnez votre école" />
              </SelectTrigger>
              <SelectContent>
                {availableSchools.map((school: School) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.name_fr} ({school.country})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Input année avec validation dynamique */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="year">
              Année d&apos;entrée <span className="text-destructive">*</span>
            </Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>L&apos;année minimale dépend de l&apos;année de création de l&apos;école.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="relative">
            <Input
              id="year"
              type="text"
              placeholder={getPlaceholder()}
              value={currentYear}
              onChange={(e) => {
                const value = e.target.value
                setCurrentYear(value)
                if (value.length === 4) {
                  validateYear(value)
                } else {
                  setYearError('')
                }
              }}
              className={cn(
                error || yearError ? 'border-destructive' : '',
                (isLoading || !currentSchoolId) ? 'opacity-60 cursor-not-allowed' : ''
              )}
              maxLength={4}
              disabled={isLoading || !currentSchoolId}
              required
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
          {(yearError || error) && (
            <p className="text-xs text-destructive">{yearError || error}</p>
          )}
          {!yearError && !error && (
            <p className="text-xs text-muted-foreground">
              {currentSchool?.established_year 
                ? `Format : YYYY (minimum ${minYear}, créée en ${currentSchool.established_year})`
                : `Format : YYYY (minimum ${minYear})`}
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
