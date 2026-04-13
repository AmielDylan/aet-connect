'use client'

// ═══════════════════════════════════════════════════
// SIDEBAR COMPONENT
// Navigation latérale
// ═══════════════════════════════════════════════════

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LayoutDashboard, User, School, Users, Ticket, X, BarChart, Clock, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface SidebarProps {
  onClose?: () => void
  isMobile?: boolean
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Annuaire',
    href: '/dashboard/directory',
    icon: Users,
  },
  {
    name: 'Mes codes',
    href: '/dashboard/codes',
    icon: Ticket,
  },
  {
    name: 'Mon Profil',
    href: '/dashboard/profile',
    icon: User,
  },
  {
    name: 'Écoles',
    href: '/dashboard/schools',
    icon: School,
  },
]

export function Sidebar({ onClose, isMobile }: SidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'
  
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.getAdminStats(),
    enabled: isAdmin,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  })

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Mobile close button */}
      {isMobile && (
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                AET
              </span>
            </div>
            <span className="font-semibold">AET Connect</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive && 'bg-secondary font-semibold'
                )}
                asChild
                onClick={isMobile ? onClose : undefined}
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </div>

        {isAdmin && (
          <>
            <Separator className="my-4" />
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Administration
              </h2>
              <div className="space-y-1">
                <Button
                  variant={pathname === '/dashboard/admin' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === '/dashboard/admin' && 'bg-secondary font-semibold'
                  )}
                  asChild
                  onClick={isMobile ? onClose : undefined}
                >
                  <Link href="/dashboard/admin">
                    <BarChart className="mr-2 h-4 w-4" />
                    Vue d'ensemble
                  </Link>
                </Button>
                <Button
                  variant={pathname === '/dashboard/admin/users' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === '/dashboard/admin/users' && 'bg-secondary font-semibold'
                  )}
                  asChild
                  onClick={isMobile ? onClose : undefined}
                >
                  <Link href="/dashboard/admin/users">
                    <Users className="mr-2 h-4 w-4" />
                    Utilisateurs
                  </Link>
                </Button>
                <Button
                  variant={pathname === '/dashboard/admin/schools' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === '/dashboard/admin/schools' && 'bg-secondary font-semibold'
                  )}
                  asChild
                  onClick={isMobile ? onClose : undefined}
                >
                  <Link href="/dashboard/admin/schools">
                    <School className="mr-2 h-4 w-4" />
                    Écoles
                  </Link>
                </Button>
                <Button
                  variant={pathname === '/dashboard/admin/pending' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === '/dashboard/admin/pending' && 'bg-secondary font-semibold'
                  )}
                  asChild
                  onClick={isMobile ? onClose : undefined}
                >
                  <Link href="/dashboard/admin/pending" className="flex items-center w-full">
                    <Clock className="mr-2 h-4 w-4" />
                    <span className="flex-1">Demandes</span>
                    {stats?.overview && 'pendingRequests' in stats.overview && stats.overview.pendingRequests > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {stats.overview.pendingRequests}
                      </Badge>
                    )}
                  </Link>
                </Button>
                <Button
                  variant={pathname === '/dashboard/admin/deletions' ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === '/dashboard/admin/deletions' && 'bg-secondary font-semibold'
                  )}
                  asChild
                  onClick={isMobile ? onClose : undefined}
                >
                  <Link href="/dashboard/admin/deletions" className="flex items-center w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="flex-1">Suppressions</span>
                    {stats?.overview && 'pendingDeletions' in stats.overview && (stats.overview as any).pendingDeletions > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {(stats.overview as any).pendingDeletions}
                      </Badge>
                    )}
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}

        <Separator className="my-4" />

        <div className="px-3 text-xs text-muted-foreground">
          <p>Annuaire Panafricain</p>
          <p>Anciens Enfants de Troupe</p>
        </div>
      </ScrollArea>
    </div>
  )
}

