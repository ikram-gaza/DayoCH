import { useAuth } from '../context/AuthContext'

export function usePerimetre() {
  return useAuth().perimetre
}
