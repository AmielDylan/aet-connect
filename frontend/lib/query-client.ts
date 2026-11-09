import { QueryClient } from '@tanstack/react-query'
import { HttpError } from '@/lib/api'

/**
 * Une erreur 4xx (non connecté, interdit, introuvable) ne changera pas en réessayant :
 * on l'affiche tout de suite. Erreur réseau ou 5xx : un seul nouvel essai.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof HttpError && error.status >= 400 && error.status < 500) return false
  return failureCount < 1
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry },
      mutations: { retry: false }
    }
  })
}
