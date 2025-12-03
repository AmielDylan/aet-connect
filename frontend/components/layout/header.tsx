'use client'

// ═══════════════════════════════════════════════════
// HEADER COMPONENT
// En-tête avec logo et menu utilisateur
// ═══════════════════════════════════════════════════

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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
      
      // IMPORTANT: Invalider tout le cache React Query
      queryClient.clear()
      
      toast.success('Déconnexion réussie')
      router.push('/login')
    } catch {
      toast.error('Erreur lors de la déconnexion')
    }
  }

  // Get user initials for avatar
  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
    : 'U'

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              AET
            </span>
          </div>
          <span className="hidden font-semibold sm:inline-block">
            AET Connect
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/dashboard/profile')}
              className="cursor-pointer"
            >
              <User className="mr-2 h-4 w-4" />
              Mon profil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

