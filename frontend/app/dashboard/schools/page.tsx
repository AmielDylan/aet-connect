'use client';

// ═══════════════════════════════════════════════════
// SCHOOLS PAGE
// Liste de toutes les écoles militaires africaines
// ═══════════════════════════════════════════════════

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  School as SchoolIcon,
  MapPin,
  Users,
  Award,
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import type { SchoolWithStats } from '@/types';

function SchoolCard({ school }: { school: SchoolWithStats }) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <SchoolIcon className="h-5 w-5 text-primary" />
            <span className="line-clamp-2">{school.name_fr}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{school.country}</span>
          {school.city && <span className="text-muted-foreground">• {school.city}</span>}
        </div>

        {/* Established Year */}
        {school.established_year && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Fondée en {school.established_year}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {school.total_members || 0} membres
          </Badge>
          {school.total_ambassadors > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
              <Award className="h-3 w-3" />
              {school.total_ambassadors} ambassadeurs
            </Badge>
          )}
        </div>

        {/* English Name if different */}
        {school.name_en && school.name_en !== school.name_fr && (
          <p className="text-xs text-muted-foreground italic">
            {school.name_en}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SchoolsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['schools'],
    queryFn: () => apiClient.getSchools(),
  });

  // Filter schools based on search
  const filteredSchools = data?.schools.filter((school) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      school.name_fr.toLowerCase().includes(query) ||
      school.name_en?.toLowerCase().includes(query) ||
      school.country.toLowerCase().includes(query) ||
      school.city.toLowerCase().includes(query)
    );
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Erreur de chargement</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Impossible de charger les écoles'}
            </p>
            <Button onClick={() => refetch()} variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || data.schools.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <SchoolIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Aucune école trouvée</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Écoles Militaires Africaines
        </h1>
        <p className="text-muted-foreground">
          Découvrez les établissements de formation militaire à travers l&apos;Afrique
        </p>
      </div>

      {/* Stats Badge */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-base">
          {data.total} écoles enregistrées
        </Badge>
        {filteredSchools && filteredSchools.length !== data.total && (
          <Badge variant="outline">
            {filteredSchools.length} résultat{filteredSchools.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Rechercher par nom, pays ou ville..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Schools Grid */}
      {filteredSchools && filteredSchools.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchools.map((school) => (
            <SchoolCard key={school.id} school={school} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Aucune école ne correspond à votre recherche
            </p>
            <Button
              variant="link"
              onClick={() => setSearchQuery('')}
              className="mt-2"
            >
              Réinitialiser la recherche
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
