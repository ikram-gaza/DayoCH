import { createContext, useContext, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Session persistée dans localStorage : { user, pendingUser, token }
  const [session, setSession] = useState(() => authService.getSession())

  const user = session?.user ?? null
  const pendingUser = session?.pendingUser ?? null // utilisateur en attente de 2FA

  // Connexion avec identifiant + mot de passe
  const login = async (identifier, password) => {
    const result = await authService.login(identifier, password)
    setSession(authService.getSession())
    return result
  }

  // Validation du code 2FA
  const verify2FA = async (code) => {
    const result = await authService.verify2FA(code)
    setSession(authService.getSession())
    return result.success
  }

  // Régénère le QR code de configuration 2FA en attente
  const refresh2FASetup = async () => {
    const result = await authService.refreshSetup(pendingUser)
    setSession(authService.getSession())
    return result
  }

  // Mise à jour du profil utilisateur
  const updateUser = (updatedData) => {
    const next = authService.updateUser(updatedData)
    if (next) setSession(next)
  }

  // Déconnexion
  const logout = async () => {
    await authService.logout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, pendingUser, login, verify2FA, refresh2FASetup, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
