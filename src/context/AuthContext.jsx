import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FILIALES } from '../config/filiales'
import { authService } from '../services/authService'
import { jetons } from '../services/jetons'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession())
  const [loading, setLoading] = useState(() => authService.canRestoreSession())
  const [filialeCourante, setFilialeCourante] = useState(() => jetons.filiale())

  useEffect(() => {
    let active = true

    if (authService.canRestoreSession()) {
      authService
        .restoreSession()
        .then((restored) => {
          if (active) setSession(restored)
        })
        .catch(() => {
          if (active) setSession(null)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }

    const unsubscribe = authService.onSessionLost(() => {
      if (active) setSession(null)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const user = session?.user ?? null
  const pendingUser = session?.pendingUser ?? null
  const estCompteGroupe = Boolean(user && !user.filialeId)

  useEffect(() => {
    if (!user) return

    if (user.filialeId) {
      if (filialeCourante !== user.filialeId) {
        setFilialeCourante(user.filialeId)
        jetons.setFiliale(user.filialeId)
      }
      return
    }

    if (!filialeCourante && FILIALES.length > 0) {
      setFilialeCourante(FILIALES[0].id)
      jetons.setFiliale(FILIALES[0].id)
    }
  }, [user, filialeCourante])

  const login = useCallback(async (identifier, password) => {
    const result = await authService.login(identifier, password)
    setSession(authService.getSession())
    return result
  }, [])

  const verify2FA = useCallback(async (code) => {
    const result = await authService.verify2FA(code)
    setSession(authService.getSession())
    return result.success
  }, [])

  const refresh2FASetup = useCallback(async () => {
    const result = await authService.refreshSetup(pendingUser)
    setSession(authService.getSession())
    return result
  }, [pendingUser])

  const updateUser = useCallback((updatedData) => {
    const next = authService.updateUser(updatedData)
    if (next) setSession(next)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    jetons.setFiliale(null)
    setFilialeCourante(null)
    setSession(null)
  }, [])

  const changerFiliale = useCallback((filialeId) => {
    setFilialeCourante(filialeId || null)
    jetons.setFiliale(filialeId || null)
  }, [])

  const peut = useCallback(
    (permission) => {
      if (!user) return false
      if (user.role === 'super_admin') return true
      return Array.isArray(user.permissions) && user.permissions.includes(permission)
    },
    [user],
  )

  const aRole = useCallback(
    (...roles) => Boolean(user && roles.some((role) => user.roles?.includes(role) || user.role === role)),
    [user],
  )

  const valeur = useMemo(
    () => ({
      user,
      pendingUser,
      loading,
      login,
      verify2FA,
      refresh2FASetup,
      updateUser,
      logout,
      filialeCourante,
      estCompteGroupe,
      perimetre: filialeCourante || user?.filialeId || 'groupe',
      changerFiliale,
      peut,
      aRole,
    }),
    [
      user,
      pendingUser,
      loading,
      login,
      verify2FA,
      refresh2FASetup,
      updateUser,
      logout,
      filialeCourante,
      estCompteGroupe,
      changerFiliale,
      peut,
      aRole,
    ],
  )

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}
