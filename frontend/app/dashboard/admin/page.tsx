'use client'

import { useAdminCheck } from '@/hooks/use-admin-check'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdminBarChart } from '@/components/charts/admin-bar-chart'
import { AdminPieChart } from '@/components/charts/admin-pie-chart'
import { Users, School, Ticket, UserCheck, Loader2, Clock } from 'lucide-react'
import Link from 'next/link'
import type { AdminStats } from '@/types'

export default function AdminDashboard() {
  const { isAdmin } = useAdminCheck()

  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.getAdminStats(),
    enabled: isAdmin,
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  const overview = stats?.overview || {
    totalUsers: 0,
    newUsers: 0,
    totalSchools: 0,
    totalCodes: 0,
    usedCodes: 0,
    pendingRequests: 0,
    totalRequests: 0,
    approvedRequests: 0,
  }
  const roles = stats?.roles || {}
  const schools = stats?.schools || {}

  // Préparer les données pour les graphiques
  const rolesData = Object.entries(roles).map(([role, count]) => ({
    role: role === 'alumni' ? 'Alumni' : role === 'moderator' ? 'Modérateur' : 'Admin',
    count: count as number
  }))

  const schoolsData = Object.entries(schools).map(([school, count]) => ({
    school,
    count: count as number
  }))

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Administration</h1>

      {/* Stats overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{overview.newUsers} cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Écoles
            </CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalSchools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Codes Générés
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalCodes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Codes Utilisés
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.usedCodes}</div>
            <p className="text-xs text-muted-foreground">
              {overview.totalCodes > 0
                ? Math.round((overview.usedCodes / overview.totalCodes) * 100)
                : 0}% de taux d'utilisation
            </p>
          </CardContent>
        </Card>

        {/* Carte Demandes en attente */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demandes en attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.pendingRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.totalRequests || 0} demandes au total
            </p>
            <Link href="/dashboard/admin/pending">
              <Button variant="link" className="px-0 mt-2 h-auto">
                Voir les demandes →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Répartition par rôle et écoles */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-8">
        <AdminPieChart data={rolesData} />
        <AdminBarChart data={schoolsData} />
      </div>
    </div>
  )
}

