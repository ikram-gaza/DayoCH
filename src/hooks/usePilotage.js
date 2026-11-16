import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../context/AuthContext'
import { usePerimetre } from './usePerimetre'
import { apiPilotage } from '../services/pilotageService'

export function usePilotage() {
  const perimetre = usePerimetre()
  const { user } = useAuth()

  return useQuery({
    queryKey: ['pilotage', 'tableau-de-bord', perimetre],
    queryFn: () =>
      apiPilotage.tableauDeBord(
        perimetre,
        user?.role,
        Array.isArray(user?.permissions) ? user.permissions : [],
      ),
  })
}
