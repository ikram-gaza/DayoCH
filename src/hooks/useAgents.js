import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiAgents } from '../services/agentsService'
import { usePerimetre } from './usePerimetre'

export const clesAgents = {
  tout: ['agents'],
  parPerimetre: (perimetre) => [...clesAgents.tout, perimetre],
  listes: (perimetre) => [...clesAgents.parPerimetre(perimetre), 'liste'],
  liste: (perimetre, filtres) => [...clesAgents.listes(perimetre), filtres],
  detail: (perimetre, id) => [...clesAgents.parPerimetre(perimetre), 'detail', id],
  historique: (perimetre, id) => [...clesAgents.parPerimetre(perimetre), 'historique', id],
  referentiels: (perimetre) => [...clesAgents.parPerimetre(perimetre), 'referentiels'],
  trombinoscope: (perimetre, filtres) => ['trombinoscope', perimetre, filtres],
}

export function useAgents(filtres) {
  const perimetre = usePerimetre()

  return useQuery({
    queryKey: clesAgents.liste(perimetre, filtres),
    queryFn: () => apiAgents.lister(filtres, perimetre),
    placeholderData: keepPreviousData,
  })
}

export function useAgent(id) {
  const perimetre = usePerimetre()

  return useQuery({
    queryKey: clesAgents.detail(perimetre, id || ''),
    queryFn: () => apiAgents.detail(id),
    enabled: Boolean(id),
  })
}

export function useCarriere(id) {
  const perimetre = usePerimetre()

  return useQuery({
    queryKey: clesAgents.historique(perimetre, id || ''),
    queryFn: () => apiAgents.historique(id),
    enabled: Boolean(id),
  })
}

export function useReferentielsAgents() {
  const perimetre = usePerimetre()

  return useQuery({
    queryKey: clesAgents.referentiels(perimetre),
    queryFn: apiAgents.referentiels,
    staleTime: 5 * 60_000,
  })
}

export function useInvalidationAgent(id) {
  const queryClient = useQueryClient()
  const perimetre = usePerimetre()

  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: clesAgents.detail(perimetre, id) }),
      queryClient.invalidateQueries({ queryKey: clesAgents.historique(perimetre, id) }),
      queryClient.invalidateQueries({ queryKey: clesAgents.listes(perimetre) }),
      queryClient.invalidateQueries({ queryKey: ['trombinoscope'] }),
      queryClient.invalidateQueries({ queryKey: ['pilotage'] }),
    ])
}

export function useSignatureTracee(id) {
  const queryClient = useQueryClient()
  const perimetre = usePerimetre()

  return useMutation({
    mutationFn: (dataUrl) => apiAgents.enregistrerSignatureTracee(id, dataUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clesAgents.detail(perimetre, id) })
      queryClient.invalidateQueries({ queryKey: ['trombinoscope'] })
    },
  })
}

export function useEnvoyerPhoto(id) {
  const queryClient = useQueryClient()
  const perimetre = usePerimetre()

  return useMutation({
    mutationFn: (fichier) => apiAgents.envoyerPhoto(id, fichier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clesAgents.detail(perimetre, id) })
      queryClient.invalidateQueries({ queryKey: clesAgents.listes(perimetre) })
      queryClient.invalidateQueries({ queryKey: ['trombinoscope'] })
      queryClient.invalidateQueries({ queryKey: ['pilotage'] })
    },
  })
}

export function useEnvoyerSignature(id) {
  const queryClient = useQueryClient()
  const perimetre = usePerimetre()

  return useMutation({
    mutationFn: (fichier) => apiAgents.envoyerSignatureFichier(id, fichier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clesAgents.detail(perimetre, id) })
      queryClient.invalidateQueries({ queryKey: ['trombinoscope'] })
    },
  })
}

export function useTrombinoscope(filtres, toutesFiliales) {
  const perimetre = usePerimetre()

  return useQuery({
    queryKey: clesAgents.trombinoscope(perimetre, { ...filtres, toutesFiliales }),
    queryFn: () => apiAgents.agentsPourTrombinoscope(filtres, toutesFiliales, perimetre),
    staleTime: 5 * 60_000,
  })
}
