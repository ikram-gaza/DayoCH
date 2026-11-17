import { createContext, useContext, useEffect, useState } from 'react'
import { authService, surSessionPerdue } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession())
  const [loading, setLoading] = useState(() => authService.canRestoreSession())

  useEffect(() => {
    let actif = true

    if (authService.canRestoreSession()) {
      authService
        .restoreSession()
        .then((restored) => {
          if (actif) setSession(restored)
        })
        .catch(() => {
          if (actif) setSession(null)
        })
        .finally(() => {
          if (actif) setLoading(false)
        })
    }

    const unsubscribe = surSessionPerdue(() => {
      if (actif) setSession(null)
    })

    return () => {
      actif = false
      unsubscribe()
    }
  }, [])

  const user = session?.user ?? null
  const pendingUser = session?.pendingUser ?? null

  const login = async (identifier, password) => {
    const result = await authService.login(identifier, password)
    setSession(authService.getSession())
    return result
  }

  const verify2FA = async (code) => {
    const result = await authService.verify2FA(code)
    setSession(authService.getSession())
    return result.success
  }

  const refresh2FASetup = async () => {
    const result = await authService.refreshSetup(pendingUser)
    setSession(authService.getSession())
    return result
  }

  const updateUser = (updatedData) => {
    const next = authService.updateUser(updatedData)
    if (next) setSession(next)
  }

  const mettreAJourProfil = async (updatedData) => {
    const utilisateur = await authService.mettreAJourProfil(updatedData)
    setSession(authService.getSession())
    return utilisateur
  }

  const changerMotDePasse = async (payload) => {
    const ok = await authService.changerMotDePasse(payload)
    setSession(authService.getSession())
    return ok
  }

  const logout = async () => {
    await authService.logout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ user, pendingUser, loading, login, verify2FA, refresh2FASetup, updateUser, mettreAJourProfil, changerMotDePasse, logout }}>
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
