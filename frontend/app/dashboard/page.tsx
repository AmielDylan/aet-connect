'use client';

// ═══════════════════════════════════════════════════
// DASHBOARD PAGE
// Dashboard adaptatif : Alumni ou Admin selon rôle
// ═══════════════════════════════════════════════════

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  TicketCheck,
  School,
  Users,
  RefreshCw,
  UserCheck,
  Network,
  AlertCircle,
} from 'lucide-react'

// ═══════════════════════════════════════════════════
// ALUMNI DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════

function AlumniDashboard() {
  const { user } = useAuth()
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => apiClient.getDashboardStats(),
    enabled: !!user,
  })
  
  const { data: recentMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: () => apiClient.getDashboardRecentMembers(),
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const isLimitReached = (user.codes_generated || 0) >= (user.max_codes_allowed || 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenue, {user.first_name} !
        </h1>
        <p className="text-muted-foreground mt-1">
          {user.school?.name_fr} - Promotion {user.entry_year}
        </p>
      </div>

      {/* Stats Cards */}
      {statsLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-3">
          <StatsCard
            title="Ma Promotion"
            value={stats.myPromoCount}
            description="membres de ma promotion"
            icon={Users}
            iconColor="text-blue-600"
          />
          <StatsCard
            title="Mon École"
            value={stats.mySchoolCount}
            description="anciens de mon école"
            icon={School}
            iconColor="text-green-600"
          />
          <StatsCard
            title="Réseau AET"
            value={stats.totalNetworkCount}
            description="membres au total"
            icon={Network}
            iconColor="text-purple-600"
          />
        </div>
      ) : null}

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button 
            disabled={isLimitReached}
            onClick={() => window.location.href = '/dashboard/codes'}
          >
            <TicketCheck className="mr-2 h-4 w-4" />
            {isLimitReached
              ? `Limite atteinte (${user.codes_generated}/${user.max_codes_allowed})`
              : 'Générer un code'}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard/profile'}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Mettre à jour mon profil
          </Button>
        </CardContent>
      </Card>

      {/* Nouveaux membres */}
      <Card>
        <CardHeader>
          <CardTitle>Nouveaux membres de ma promotion</CardTitle>
        </CardHeader>
        <CardContent>
          {membersLoading ? (
            <div className="flex justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : !recentMembers || recentMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun nouveau membre pour le moment
            </p>
          ) : (
            <div className="space-y-3">
              {recentMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={`${member.first_name} ${member.last_name}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserCheck className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Inscrit il y a {Math.floor((Date.now() - new Date(member.created_at).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </p>
                  </div>
                </div>
              ))}
              <Button 
                variant="link" 
                className="w-full"
                onClick={() => window.location.href = '/dashboard/directory'}
              >
                Voir tous les membres →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// ADMIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════

function AdminDashboard() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.getAdminStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-2 h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

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
              {error instanceof Error ? error.message : 'Impossible de charger les statistiques'}
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

  if (!stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Aucune donnée disponible</p>
      </div>
    );
  }

  // Extraire les valeurs avec des fallbacks sécurisés
  const overview = stats?.overview || {}
  const roles = stats?.roles || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">Vue d&apos;ensemble de la plateforme AET Connect</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Utilisateurs"
          value={overview.totalUsers || 0}
          description={`+${overview.newUsers || 0} cette semaine`}
          icon={Users}
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Total Écoles"
          value={overview.totalSchools || 0}
          description="écoles enregistrées"
          icon={School}
          iconColor="text-green-600"
        />
        <StatsCard
          title="Codes Générés"
          value={overview.totalCodes || 0}
          description={`${overview.usedCodes || 0} utilisés`}
          icon={TicketCheck}
          iconColor="text-purple-600"
        />
        <StatsCard
          title="Codes Utilisés"
          value={overview.usedCodes || 0}
          description={`${overview.totalCodes > 0 
            ? Math.round((overview.usedCodes / overview.totalCodes) * 100)
            : 0}% de taux d'utilisation`}
          icon={UserCheck}
          iconColor="text-orange-600"
        />
      </div>

      {/* Users by Role Card */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par Rôle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(roles).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize">{role}</span>
                </div>
                <Badge variant="secondary">{count as number}</Badge>
              </div>
            ))}
            {Object.keys(roles).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune donnée disponible
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN DASHBOARD - ROLE DETECTION
// ═══════════════════════════════════════════════════

export default function DashboardPage() {
  const { user } = useAuth();

  // Show admin dashboard if user is admin
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  // Show alumni dashboard for everyone else
  return <AlumniDashboard />;
}
