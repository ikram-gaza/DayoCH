import { QueryClient } from '@tanstack/react-query'
import { ErreurApi } from './apiClient'

export function creerQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (nombreEchecs, erreur) => {
          if (erreur instanceof ErreurApi && erreur.status > 0 && erreur.status < 500) return false
          return nombreEchecs < 2
        },
      },
      mutations: { retry: false },
    },
  })
}
