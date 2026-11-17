import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { usePerimetre } from '@/shared/auth/useAuth';

import { apiAgents } from './api';
import type { FiltresAgents } from './types';

/**
 * Cles de cache centralisees.
 *
 * Une cle doit contenir TOUT ce qui change la reponse, y compris ce qui
 * voyage dans les en-tetes HTTP : ici le perimetre (la filiale). Sans lui,
 * changer de filiale reafficherait le cache de la precedente — memes filtres,
 * meme cle. Le bug est sournois : les donnees affichees sont vraies, mais ce
 * ne sont pas celles du bon perimetre.
 */
export const clesAgents = {
  tout: ['agents'] as const,
  parPerimetre: (p: string) => [...clesAgents.tout, p] as const,
  listes: (p: string) => [...clesAgents.parPerimetre(p), 'liste'] as const,
  liste: (p: string, filtres: FiltresAgents) => [...clesAgents.listes(p), filtres] as const,
  detail: (p: string, id: string) => [...clesAgents.parPerimetre(p), 'detail', id] as const,
  historique: (p: string, id: string) => [...clesAgents.parPerimetre(p), 'carriere', id] as const,
};

export function useAgents(filtres: FiltresAgents) {
  const perimetre = usePerimetre();

  return useQuery({
    queryKey: clesAgents.liste(perimetre, filtres),
    queryFn: () => apiAgents.lister(filtres),
    // Au changement de page, l ancienne liste reste affichee pendant le
    // chargement : le tableau ne disparait pas sous les yeux de l utilisateur.
    placeholderData: keepPreviousData,
  });
}

export function useAgent(id: string | undefined) {
  const perimetre = usePerimetre();

  return useQuery({
    queryKey: clesAgents.detail(perimetre, id ?? ''),
    queryFn: () => apiAgents.detail(id as string),
    enabled: Boolean(id), // pas de requete vers /agents/undefined
  });
}

export function useCarriere(id: string | undefined) {
  const perimetre = usePerimetre();

  return useQuery({
    queryKey: clesAgents.historique(perimetre, id ?? ''),
    queryFn: () => apiAgents.historique(id as string),
    enabled: Boolean(id),
  });
}

/**
 * Apres une ecriture, on INVALIDE plutot que de modifier le cache a la main :
 * le serveur reste la source de verite, et il calcule des champs que le front
 * ne sait pas deviner (duree, statut, references).
 */
export function useInvalidationAgent(id: string) {
  const queryClient = useQueryClient();
  const perimetre = usePerimetre();

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clesAgents.detail(perimetre, id) }),
      queryClient.invalidateQueries({ queryKey: clesAgents.historique(perimetre, id) }),
      queryClient.invalidateQueries({ queryKey: clesAgents.listes(perimetre) }),
    ]);
}

export function useSignatureTracee(id: string) {
  const invalider = useInvalidationAgent(id);

  return useMutation({
    mutationFn: (dataUrl: string) => apiAgents.enregistrerSignatureTracee(id, dataUrl),
    onSuccess: () => invalider(),
  });
}
