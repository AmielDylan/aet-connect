'use client'

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { StatsCard } from '@/components/dashboard/stats-card'
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

// ─── Alumni ───────────────────────────────────────────────────────────────────

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
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-[#898989]" />
      </div>
    )
  }

  const isLimitReached = (user.codes_generated || 0) >= (user.max_codes_allowed || 3)

  return (
    <div className="max-w-4xl space-y-8">
      {/* Page title */}
      <div>
        <h1 className="font-cal text-[32px] text-[#111111]">
          Bienvenue, {user.first_name} !
        </h1>
        <p className="mt-1 text-sm text-[#898989]">
          {user.school?.name_fr} · Promotion {user.entry_year}
        </p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : stats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatsCard title="Ma Promotion"  value={stats.myPromoCount}      description="membres de ma promotion"  icon={Users} />
          <StatsCard title="Mon École"     value={stats.mySchoolCount}     description="anciens de mon école"     icon={School} />
          <StatsCard title="Réseau AET"    value={stats.totalNetworkCount} description="membres au total"         icon={Network} />
        </div>
      ) : null}

      {/* Actions rapides */}
      <div
        className="rounded-xl bg-white p-5"
        style={{ boxShadow: 'rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px 0px' }}
      >
        <h2 className="font-cal-sm text-base text-[#111111] mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <button
            disabled={isLimitReached}
            onClick={() => window.location.href = '/dashboard/codes'}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#242424] text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{ boxShadow: 'rgba(255,255,255,0.15) 0px 2px 0px inset, rgba(34,42,53,0.20) 0px 1px 3px 0px' }}
          >
            <TicketCheck className="h-4 w-4" />
            {isLimitReached
              ? `Limite atteinte (${user.codes_generated}/${user.max_codes_allowed})`
              : 'Générer un code'}
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/profile'}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-white text-sm font-medium text-[#242424] transition-colors hover:bg-[#f5f5f5] shadow-cal-ring"
          >
            <UserCheck className="h-4 w-4" />
            Mettre à jour mon profil
          </button>
        </div>
      </div>

      {/* Nouveaux membres */}
      <div
        className="rounded-xl bg-white p-5"
        style={{ boxShadow: 'rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px 0px' }}
      >
        <h2 className="font-cal-sm text-base text-[#111111] mb-4">Nouveaux membres de ma promotion</h2>
        {membersLoading ? (
          <div className="flex justify-center py-6">
            <RefreshCw className="h-5 w-5 animate-spin text-[#898989]" />
          </div>
        ) : !recentMembers || recentMembers.length === 0 ? (
          <p className="text-sm text-[#898989] py-4 text-center">
            Aucun nouveau membre pour le moment
          </p>
        ) : (
          <div className="space-y-2">
            {recentMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f5f5f5] transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-[#f5f5f5] flex items-center justify-center overflow-hidden shrink-0">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={`${member.first_name} ${member.last_name}`}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-[#898989]">
                      {member.first_name[0]}{member.last_name[0]}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#111111] truncate">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-xs text-[#898989]">
                    Inscrit il y a {Math.floor((Date.now() - new Date(member.created_at).getTime()) / 86400000)} jours
                  </p>
                </div>
              </div>
            ))}
            <button
              onClick={() => window.location.href = '/dashboard/directory'}
              className="w-full mt-2 text-sm text-[#898989] hover:text-[#111111] transition-colors py-2"
            >
              Voir tous les membres →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Admin ────────────────────────────────────────────────────────────────────

function AdminDashboard() {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiClient.getAdminStats(),
  })

  if (isLoading) {
    return (
      <div className="max-w-4xl space-y-8">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div
          className="w-full max-w-sm rounded-xl bg-white p-6"
          style={{ boxShadow: 'rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px 0px' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm font-semibold text-[#111111]">Erreur de chargement</p>
          </div>
          <p className="text-sm text-[#898989] mb-4">
            {error instanceof Error ? error.message : 'Impossible de charger les statistiques'}
          </p>
          <button
            onClick={() => refetch()}
            className="w-full h-9 rounded-lg bg-white text-sm font-medium text-[#242424] transition-colors hover:bg-[#f5f5f5] shadow-cal-ring flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  const overview = stats?.overview || {}
  const roles    = stats?.roles    || {}

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-cal text-[32px] text-[#111111]">Administration</h1>
        <p className="mt-1 text-sm text-[#898989]">Vue d&apos;ensemble de la plateforme AET Connect</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Utilisateurs"  value={overview.totalUsers || 0} description={`+${overview.newUsers || 0} cette semaine`} icon={Users} />
        <StatsCard title="Écoles"        value={overview.totalSchools || 0} description="écoles enregistrées"                      icon={School} />
        <StatsCard title="Codes générés" value={overview.totalCodes || 0}   description={`${overview.usedCodes || 0} utilisés`}    icon={TicketCheck} />
        <StatsCard
          title="Taux d'utilisation"
          value={`${overview.totalCodes > 0 ? Math.round((overview.usedCodes / overview.totalCodes) * 100) : 0}%`}
          description="des codes utilisés"
          icon={UserCheck}
        />
      </div>

      {/* Répartition rôles */}
      <div
        className="rounded-xl bg-white p-5"
        style={{ boxShadow: 'rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px 0px' }}
      >
        <h2 className="font-cal-sm text-base text-[#111111] mb-4">Répartition par rôle</h2>
        <div className="space-y-3">
          {Object.entries(roles).map(([role, count]) => (
            <div key={role} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <div className="h-2 w-2 rounded-full bg-[#242424]" />
                <span className="text-sm text-[#111111] capitalize">{role}</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-[#f5f5f5] text-[#242424] text-xs font-medium shadow-none"
              >
                {count as number}
              </Badge>
            </div>
          ))}
          {Object.keys(roles).length === 0 && (
            <p className="text-sm text-[#898989] text-center py-4">Aucune donnée disponible</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <AdminDashboard /> : <AlumniDashboard />
}
