'use client'

// ═══════════════════════════════════════════════════
// DASHBOARD LAYOUT
// Layout protégé avec Header + Sidebar
// ═══════════════════════════════════════════════════

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Redirect to login if not authenticated (preserve current path as redirect)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [isAuthenticated, isLoading, router])

  // Show loader while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect is in progress)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 border-r md:block">
        <Sidebar />
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r bg-background">
            <Sidebar onClose={() => setSidebarOpen(false)} isMobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

