'use client'

import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, User, Menu } from 'lucide-react'
import { toast } from 'sonner'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()

  const handleLogout = async () => {
    try {
      await logout()
      queryClient.clear()
      toast.success('Déconnexion réussie')
      router.push('/login')
    } catch {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
    : 'U'

  return (
    <header className="sticky top-0 z-40 bg-white" style={{ boxShadow: 'rgba(34, 42, 53, 0.08) 0px 0px 0px 1px, rgba(34, 42, 53, 0.05) 0px 1px 3px 0px' }}>
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-8 w-8"
          onClick={onMenuClick}
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#242424]">
            <span className="text-[11px] font-bold text-white leading-none">
              AET
            </span>
          </div>
          <span className="font-cal text-[15px] text-[#111111] hidden sm:inline-block" style={{ letterSpacing: '0.01em' }}>
            AET Connect
          </span>
        </div>

        <div className="flex-1" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full p-0 hover:bg-[#f5f5f5]"
            >
              <Avatar
                className="h-8 w-8"
                key={`avatar-${user?.avatar_url || 'no-avatar'}-${user?.id || 'no-user'}`}
              >
                {user?.avatar_url ? (
                  <AvatarImage
                    src={user.avatar_url}
                    alt={`${user.first_name} ${user.last_name}`}
                  />
                ) : null}
                <AvatarFallback className="bg-[#242424] text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 shadow-cal-card border-0">
            <DropdownMenuLabel className="pb-2">
              <p className="text-sm font-semibold text-[#111111]">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-[#898989] font-normal mt-0.5">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[rgba(34,42,53,0.08)]" />
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/profile')}
              className="cursor-pointer text-sm text-[#111111] hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]"
            >
              <User className="mr-2 h-3.5 w-3.5 text-[#898989]" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[rgba(34,42,53,0.08)]" />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-sm text-destructive hover:bg-[#f5f5f5] focus:bg-[#f5f5f5]"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
