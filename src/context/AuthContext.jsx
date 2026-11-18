import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FILIALES } from '../config/filiales'
import { authService } from '../services/authService'
import { filialesService } from '../services/filialesService'
import { jetons } from '../services/jetons'

const AuthContext = createContext(null)

function estIdFilialeApi(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

function estSlugStatique(id) {
  return typeof id === 'string' && /^dayo-/i.test(id)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => authService.getSession())
  const [loading, setLoading] = useState(() => authService.canRestoreSession())
  const [filialeCourante, setFilialeCouranteState] = useState(() => {
    const stockee = jetons.filiale()
    if (estSlugStatique(stockee)) {
      jetons.setFiliale(null)
      return null
    }
    return stockee
  })
  const [filialesDisponibles, setFilialesDisponibles] = useState([])

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

  const appliquerFiliale = useCallback((filialeId) => {
    const valeur = filialeId || null
    setFilialeCouranteState(valeur)
    jetons.setFiliale(valeur)
  }, [])

  useEffect(() => {
    if (!user) {
      setFilialesDisponibles([])
      return
    }

    if (user.filialeId) {
      setFilialesDisponibles([])
      if (filialeCourante !== user.filialeId) {
        appliquerFiliale(user.filialeId)
      }
      return
    }

    // Nettoyage immédiat des anciens identifiants statiques (ex: "dayo-benin")
    // qui provoquent des erreurs backend lorsque transmis en X-Filiale-Id.
    if (estSlugStatique(jetons.filiale())) {
      appliquerFiliale(null)
    }

    let annule = false
    ;(async () => {
      try {
        const liste = await filialesService.lister()
        if (annule) return
        setFilialesDisponibles(Array.isArray(liste) ? liste : [])

        const ids = new Set((liste || []).map((filiale) => filiale.id))
        const stockee = jetons.filiale()
        if (stockee && ids.has(stockee)) {
          appliquerFiliale(stockee)
          return
        }
        // Vue groupe par défaut (pas d'en-tête X-Filiale-Id) pour éviter les erreurs
        // de périmètre ; l'utilisateur peut choisir une filiale dans le sélecteur.
        appliquerFiliale(null)
      } catch {
        if (annule) return
        setFilialesDisponibles(FILIALES.map((filiale) => ({ ...filiale })))
        const stockee = jetons.filiale()
        if (!stockee || estSlugStatique(stockee) || !estIdFilialeApi(stockee)) {
          appliquerFiliale(null)
        }
      }
    })()

    return () => {
      annule = true
    }
  }, [user, appliquerFiliale]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const changerMotDePasse = useCallback(async (payload) => {
    const result = await authService.changerMotDePasse(payload)
    setSession(authService.getSession())
    return result
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    jetons.setFiliale(null)
    setFilialeCouranteState(null)
    setFilialesDisponibles([])
    setSession(null)
  }, [])

  const changerFiliale = useCallback((filialeId) => {
    appliquerFiliale(filialeId || null)
  }, [appliquerFiliale])

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
      changerMotDePasse,
      logout,
      filialeCourante,
      filialesDisponibles,
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
      changerMotDePasse,
      logout,
      filialeCourante,
      filialesDisponibles,
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
