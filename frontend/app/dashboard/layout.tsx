'use client'

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

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#242424]" />
          <p className="mt-3 text-sm text-[#898989]">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar — Desktop */}
      <aside
        className="hidden w-60 shrink-0 md:block"
        style={{ boxShadow: 'rgba(34, 42, 53, 0.08) 1px 0px 0px 0px' }}
      >
        <Sidebar />
      </aside>

      {/* Sidebar — Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            className="absolute left-0 top-0 h-full w-60 bg-white"
            style={{ boxShadow: 'rgba(34, 42, 53, 0.12) 4px 0px 16px 0px' }}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} isMobile />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-white px-4 py-6 sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
