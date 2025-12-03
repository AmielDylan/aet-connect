'use client'

// ═══════════════════════════════════════════════════
// SIDEBAR COMPONENT
// Navigation latérale
// ═══════════════════════════════════════════════════

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { LayoutDashboard, User, School, X } from 'lucide-react'

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

        <Separator className="my-4" />

        <div className="px-3 text-xs text-muted-foreground">
          <p>Annuaire Panafricain</p>
          <p>Anciens Enfants de Troupe</p>
        </div>
      </ScrollArea>
    </div>
  )
}

