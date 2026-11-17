import { useQuery } from '@tanstack/react-query';

import { useAuth, usePerimetre } from '@/shared/auth/useAuth';

import { apiPilotage } from './api';

export const clesPilotage = {
  tout: ['pilotage'] as const,
  tableauDeBord: (perimetre: string) => [...clesPilotage.tout, 'tableau-de-bord', perimetre] as const,
  /**
   * Le menu depend du COMPTE (roles, permissions), pas de la filiale : la cle
   * porte donc l identifiant de l utilisateur. Le cache est en plus vide a
   * chaque connexion et deconnexion (contexte-auth.tsx) : double protection.
   */
  modules: (utilisateurId: string) => [...clesPilotage.tout, 'modules', utilisateurId] as const,
};

export function useTableauDeBord() {
  const perimetre = usePerimetre();
  return useQuery({
    queryKey: clesPilotage.tableauDeBord(perimetre),
    queryFn: apiPilotage.tableauDeBord,
  });
}

export function useModules() {
  const { utilisateur } = useAuth();
  return useQuery({
    queryKey: clesPilotage.modules(utilisateur?.id ?? 'anonyme'),
    queryFn: apiPilotage.modules,
    enabled: Boolean(utilisateur),
    staleTime: 5 * 60_000,
  });
}
