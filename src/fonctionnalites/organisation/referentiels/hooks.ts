import { useQuery } from '@tanstack/react-query';

import { usePerimetre } from '@/shared/auth/useAuth';

import { apiDepartements } from '../departements/api';
import { apiServices } from '../services/api';

/**
 * Referentiels partages par tous les formulaires et filtres.
 *
 * Une seule cle par referentiel dans toute l application : creer un
 * departement (etape 3.1) n a qu UNE cle a invalider pour que tous les
 * menus deroulants se mettent a jour.
 */
export const clesReferentiels = {
  tout: ['referentiel'] as const,
  departements: (perimetre: string) => [...clesReferentiels.tout, 'departements', perimetre] as const,
  services: (perimetre: string, departementIds: string) =>
    [...clesReferentiels.tout, 'services', perimetre, departementIds] as const,
};

/** Un referentiel bouge rarement : cinq minutes sans nouvel appel. */
const FRAICHEUR = 5 * 60_000;

export function useDepartementsReferentiel() {
  const perimetre = usePerimetre();
  return useQuery({
    queryKey: clesReferentiels.departements(perimetre),
    queryFn: apiDepartements.referentiel,
    staleTime: FRAICHEUR,
  });
}

export function useServicesReferentiel(departementIds?: string) {
  const perimetre = usePerimetre();
  return useQuery({
    queryKey: clesReferentiels.services(perimetre, departementIds ?? ''),
    queryFn: () => apiServices.referentiel(departementIds),
    staleTime: FRAICHEUR,
  });
}
