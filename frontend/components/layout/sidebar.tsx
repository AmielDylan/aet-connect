'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, LayoutDashboard, User, School, Users, Ticket, BarChart, Clock, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface SidebarProps {
  onClose?: () => void
  isMobile?: boolean
}

const navigation = [
  { name: 'Dashboard',   href: '/dashboard',           icon: LayoutDashboard },
  { name: 'Annuaire',    href: '/dashboard/directory', icon: Users },
  { name: 'Mes codes',   href: '/dashboard/codes',     icon: Ticket },
  { name: 'Mon Profil',  href: '/dashboard/profile',   icon: User },
  { name: 'Écoles',      href: '/dashboard/schools',   icon: School },
]

export function Sidebar({ onClose, isMobile }: SidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.getAdminStats(),
    enabled: isAdmin,
    refetchInterval: 30000,
  })

  const isActive = (href: string) => pathname === href

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Mobile header */}
      {isMobile && (
        <div className="flex h-14 items-center justify-between px-4" style={{ boxShadow: 'rgba(34, 42, 53, 0.08) 0px -1px 0px 0px inset' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#242424]">
              <span className="text-[11px] font-bold text-white leading-none">AET</span>
            </div>
            <span className="font-cal text-[15px] text-[#111111]" style={{ letterSpacing: '0.01em' }}>
              AET Connect
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navigation.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-[#f5f5f5] text-[#111111] font-medium'
                  : 'text-[#898989] hover:bg-[#f5f5f5] hover:text-[#111111]'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#242424]' : 'text-[#898989]')} />
              {item.name}
            </Link>
          )
        })}

        {isAdmin && (
          <>
            {/* Separator with label */}
            <div className="pt-4 pb-1 px-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#898989]">
                Administration
              </p>
            </div>

            {[
              { name: "Vue d'ensemble", href: '/dashboard/admin',         icon: BarChart },
              { name: 'Utilisateurs',   href: '/dashboard/admin/users',   icon: Users },
              { name: 'Écoles',         href: '/dashboard/admin/schools', icon: School },
            ].map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                    active
                      ? 'bg-[#f5f5f5] text-[#111111] font-medium'
                      : 'text-[#898989] hover:bg-[#f5f5f5] hover:text-[#111111]'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[#242424]' : 'text-[#898989]')} />
                  {item.name}
                </Link>
              )
            })}

            {/* Demandes with badge */}
            <Link
              href="/dashboard/admin/pending"
              onClick={isMobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive('/dashboard/admin/pending')
                  ? 'bg-[#f5f5f5] text-[#111111] font-medium'
                  : 'text-[#898989] hover:bg-[#f5f5f5] hover:text-[#111111]'
              )}
            >
              <Clock className={cn('h-4 w-4 shrink-0', isActive('/dashboard/admin/pending') ? 'text-[#242424]' : 'text-[#898989]')} />
              <span className="flex-1">Demandes</span>
              {stats?.overview && 'pendingRequests' in stats.overview && (stats.overview.pendingRequests as number) > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                  {stats.overview.pendingRequests as number}
                </Badge>
              )}
            </Link>

            {/* Suppressions with badge */}
            <Link
              href="/dashboard/admin/deletions"
              onClick={isMobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive('/dashboard/admin/deletions')
                  ? 'bg-[#f5f5f5] text-[#111111] font-medium'
                  : 'text-[#898989] hover:bg-[#f5f5f5] hover:text-[#111111]'
              )}
            >
              <Trash2 className={cn('h-4 w-4 shrink-0', isActive('/dashboard/admin/deletions') ? 'text-[#242424]' : 'text-[#898989]')} />
              <span className="flex-1">Suppressions</span>
              {stats?.overview && 'pendingDeletions' in stats.overview && (stats.overview as any).pendingDeletions > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-[10px]">
                  {(stats.overview as any).pendingDeletions}
                </Badge>
              )}
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3" style={{ boxShadow: 'rgba(34, 42, 53, 0.08) 0px 1px 0px 0px inset' }}>
        <p className="text-[11px] text-[#898989]">Annuaire Panafricain</p>
        <p className="text-[11px] text-[#898989]">Anciens Enfants de Troupe</p>
      </div>
    </div>
  )
}
