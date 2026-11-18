import { useQuery } from '@tanstack/react-query'
import { usePerimetre } from './usePerimetre'
import { apiPilotage } from '../services/pilotageService'

export function usePilotage() {
  const perimetre = usePerimetre()

  return useQuery({
    queryKey: ['pilotage', 'tableau-de-bord', perimetre],
    queryFn: () => apiPilotage.tableauDeBord(),
  })
}
