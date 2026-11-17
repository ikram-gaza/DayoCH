import { useQuery } from '@tanstack/react-query';

import { usePerimetre } from '@/shared/auth/useAuth';

import { apiOrganigramme } from './api';
import type { FiltresOrganigramme } from './types';

export const clesOrganigramme = {
  tout: ['organigramme'] as const,
  arbre: (perimetre: string, filtres: FiltresOrganigramme) =>
    [...clesOrganigramme.tout, perimetre, filtres] as const,
};

export function useOrganigramme(filtres: FiltresOrganigramme) {
  const perimetre = usePerimetre();
  return useQuery({
    queryKey: clesOrganigramme.arbre(perimetre, filtres),
    queryFn: () => apiOrganigramme.arbre(filtres),
  });
}
