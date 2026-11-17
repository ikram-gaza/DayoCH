import { useQuery } from '@tanstack/react-query';

import { usePerimetre } from '@/shared/auth/useAuth';

import { apiTrombinoscope } from './api';
import type { FiltresTrombinoscope } from './types';

export const clesTrombinoscope = {
  tout: ['trombinoscope'] as const,
  liste: (perimetre: string, filtres: FiltresTrombinoscope) =>
    [...clesTrombinoscope.tout, perimetre, filtres] as const,
};

export function useTrombinoscope(filtres: FiltresTrombinoscope) {
  const perimetre = usePerimetre();

  return useQuery({
    queryKey: clesTrombinoscope.liste(perimetre, filtres),
    queryFn: () => apiTrombinoscope.lister(filtres),
    // Un annuaire bouge peu dans une journee : cinq minutes sans nouvelle
    // requete evitent de rappeler l API a chaque aller-retour entre ecrans.
    staleTime: 5 * 60_000,
  });
}
