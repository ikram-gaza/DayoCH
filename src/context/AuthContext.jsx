import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [pendingUser, setPendingUser] = useState(null) // utilisateur en attente de 2FA

  // Connexion avec identifiant + mot de passe
  const login = (userData) => {
    // Si l'utilisateur a activé la 2FA, on le met en attente
    if (userData.twoFactorEnabled) {
      setPendingUser(userData)
      return { requires2FA: true }
    }
    setUser(userData)
    return { requires2FA: false }
  }

  // Validation du code 2FA
  const verify2FA = (code) => {
    // TODO: valider le code avec l'API backend
    // Pour l'instant on simule une validation réussie
    if (code.length === 6) {
      setUser(pendingUser)
      setPendingUser(null)
      return true
    }
    return false
  }

  // Mise à jour du profil utilisateur
  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }))
  }

  // Déconnexion
  const logout = () => {
    setUser(null)
    setPendingUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, pendingUser, login, verify2FA, updateUser, logout }}>
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
