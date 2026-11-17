import { useQuery } from '@tanstack/react-query';

import { apiFiliales } from './api';

export const clesFiliales = {
  tout: ['filiales'] as const,
  liste: () => [...clesFiliales.tout, 'liste'] as const,
};

/** Liste des filiales, pour un compte de niveau groupe uniquement. */
export function useFiliales(actif: boolean) {
  return useQuery({
    queryKey: clesFiliales.liste(),
    queryFn: apiFiliales.lister,
    enabled: actif,
    staleTime: 10 * 60_000,
  });
}
