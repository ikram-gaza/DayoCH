import axios from 'axios'
import { generateSecret, verifyTOTP, buildOtpauthUri } from '../utils/totp'

// URL de base de l'API backend (à configurer selon l'environnement)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Tant que le backend n'est pas branché, un mock local est utilisé par défaut.
// Passer VITE_USE_MOCK_AUTH=false pour appeler la vraie API.
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH !== 'false'

const SESSION_KEY = 'dayoch_session_v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Comptes de démonstration : l'identifiant saisi détermine le rôle.
// (mot de passe ignoré en mode mock)
const MOCK_USERS = {
  'super_admin': {
    id: 1, nom: 'KOTCHOFA', prenom: 'Boris',
    email: 'boris.kotchofa@dayo.africa', matricule: 'DG-001',
    role: 'super_admin', filiale: 'Dayo Group', poste: 'Directeur Général',
  },
  'admin': {
    id: 1, nom: 'KOTCHOFA', prenom: 'Boris',
    email: 'boris.kotchofa@dayo.africa', matricule: 'DG-001',
    role: 'super_admin', filiale: 'Dayo Group', poste: 'Directeur Général',
  },
  'manager': {
    id: 2, nom: 'DIALLO', prenom: 'Amadou',
    email: 'amadou.diallo@dayo.africa', matricule: 'BEN-001',
    role: 'manager', filiale: 'Dayo Bénin', poste: 'Directeur Capital Humain',
  },
  'employe': {
    id: 5, nom: 'TRAORE', prenom: 'Aïcha',
    email: 'aicha.traore@dayo.africa', matricule: 'BFA-001',
    role: 'employe', filiale: 'Dayo Burkina Faso', poste: 'Chargée de Clientèle',
  },
  'stock': {
    id: 8, nom: 'COULIBALY', prenom: 'Ibrahim',
    email: 'ibrahim.coulibaly@dayo.africa', matricule: 'BEN-002',
    role: 'gestionnaire_stock', filiale: 'Dayo Bénin', poste: 'Gestionnaire de stock',
  },
}

const MOCK_USER = MOCK_USERS.super_admin

const PRIVILEGED_ROLES = ['super_admin', 'manager']

// ── Persistance de session ──
function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Stockage indisponible : on continue en mémoire
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('token')
}

function persistAuthenticated(user, token) {
  const session = { user, pendingUser: null, token: token || null }
  writeSession(session)
  if (token) localStorage.setItem('token', token)
  return session
}

// ── Secrets TOTP (mode mock) ──
const TWO_FA_KEY = 'dayoch_2fa_secrets_v1'
const PENDING_2FA_KEY = 'dayoch_2fa_pending_v1'

function userKey(user) {
  return (user?.email || user?.matricule || String(user?.id || '')).toLowerCase()
}

function readSecrets() {
  try {
    return JSON.parse(localStorage.getItem(TWO_FA_KEY)) || {}
  } catch {
    return {}
  }
}

function writeSecrets(secrets) {
  try {
    localStorage.setItem(TWO_FA_KEY, JSON.stringify(secrets))
  } catch {
    // Stockage indisponible : on continue sans persister
  }
}

function getSecret(user) {
  return readSecrets()[userKey(user)] || null
}

function setSecret(user, secret) {
  const secrets = readSecrets()
  if (secret) secrets[userKey(user)] = secret
  else delete secrets[userKey(user)]
  writeSecrets(secrets)
}

function readPendingSecrets() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_2FA_KEY)) || {}
  } catch {
    return {}
  }
}

function writePendingSecrets(secrets) {
  try {
    localStorage.setItem(PENDING_2FA_KEY, JSON.stringify(secrets))
  } catch {
    // Stockage indisponible : on continue sans persister
  }
}

function getPendingSecret(user) {
  return readPendingSecrets()[userKey(user)] || null
}

function setPendingSecret(user, secret) {
  const secrets = readPendingSecrets()
  if (secret) secrets[userKey(user)] = secret
  else delete secrets[userKey(user)]
  writePendingSecrets(secrets)
}

function clearPendingSecret(user) {
  setPendingSecret(user, null)
}

// Service d'authentification
export const authService = {
  isMock: USE_MOCK,
  getSession: readSession,
  saveSession: writeSession,

  // Connexion avec email ou matricule + mot de passe
  login: async (identifier, password) => {
    if (!USE_MOCK) {
      const { data } = await api.post('/auth/login', { identifier, password })

      // Le backend peut demander une vérification 2FA
      if (data.requires2FA) {
        const rawPending = data.pendingUser || data.user || null
        const requiresSetup = Boolean(data.requiresSetup)
        const pendingUser = requiresSetup
          ? { ...rawPending, requiresSetup: true, setupSecret: data.secret }
          : rawPending
        writeSession({ user: null, pendingUser, token: null })
        return { requires2FA: true, requiresSetup, user: null, pendingUser }
      }

      const session = persistAuthenticated(data.user, data.token)
      return { requires2FA: false, ...session }
    }

    // ── Mode mock ──
    await delay(900)
    if (!identifier?.trim() || !password?.trim()) {
      throw new Error('Identifiant ou mot de passe incorrect.')
    }

    const cle = identifier.trim().toLowerCase()
    const base = MOCK_USERS[cle] ||
      Object.values(MOCK_USERS).find((u) => u.email.toLowerCase() === cle || u.matricule.toLowerCase() === cle) ||
      MOCK_USER

    const storedSecret = getSecret(base)
    const mandatory = PRIVILEGED_ROLES.includes(base.role)
    const twoFactorEnabled = mandatory || cle === '2fa' || Boolean(storedSecret)
    const user = { ...base, twoFactorEnabled }

    if (twoFactorEnabled) {
      const requiresSetup = !storedSecret

      let setupSecret = null
      if (requiresSetup) {
        // Conserver le même secret tant qu'il n'a pas été validé : évite
        // qu'un nouveau QR invalide le code déjà scanné dans 2FAS.
        setupSecret = getPendingSecret(base)
        if (!setupSecret) {
          const currentSession = readSession()
          const sameUser =
            currentSession?.pendingUser &&
            userKey(currentSession.pendingUser) === userKey(base)
          setupSecret = sameUser ? currentSession.pendingUser.setupSecret : null
        }
        if (!setupSecret) setupSecret = generateSecret()
        setPendingSecret(base, setupSecret)
      }

      const pendingUser = requiresSetup
        ? { ...user, requiresSetup: true, setupSecret }
        : { ...user, requiresSetup: false }
      writeSession({ user: null, pendingUser, token: null })
      return { requires2FA: true, requiresSetup, user: null, pendingUser }
    }

    const session = persistAuthenticated(user, `mock-token-${user.id}`)
    return { requires2FA: false, ...session }
  },

  // Vérification du code 2FA
  verify2FA: async (code) => {
    if (!USE_MOCK) {
      const session = readSession()
      const { data } = await api.post('/auth/verify-2fa', {
        userId: session?.pendingUser?.id,
        code,
      })

      if (data.token) {
        const authenticated = persistAuthenticated(data.user, data.token)
        return { success: true, ...authenticated }
      }
      return { success: false }
    }

    // ── Mode mock ──
    await delay(700)
    const session = readSession()
    if (!session?.pendingUser) {
      throw new Error('Session 2FA expirée. Veuillez vous reconnecter.')
    }
    const pending = session.pendingUser
    const secret = pending.setupSecret || getSecret(pending)
    if (!secret || !(await verifyTOTP(secret, code))) {
      return { success: false }
    }

    if (pending.setupSecret) {
      setSecret(pending, pending.setupSecret)
      clearPendingSecret(pending)
    }

    const user = { ...pending, twoFactorEnabled: true }
    delete user.requiresSetup
    delete user.setupSecret
    const authenticated = persistAuthenticated(user, `mock-token-${user.id}`)
    return { success: true, ...authenticated }
  },

  // ── Double authentification TOTP (2FAS, etc.) ──
  prepare2FA: async (user) => {
    if (!USE_MOCK) {
      const { data } = await api.post('/auth/2fa/setup', { userId: user?.id })
      return { secret: data.secret, otpauthUri: data.otpauthUri }
    }

    const secret = generateSecret()
    return {
      secret,
      otpauthUri: buildOtpauthUri({
        secret,
        accountName: user?.email || user?.matricule || 'utilisateur',
      }),
    }
  },

  refreshSetup: async (user) => {
    if (!USE_MOCK) {
      const { data } = await api.post('/auth/2fa/setup', { userId: user?.id })
      return { secret: data.secret, otpauthUri: data.otpauthUri }
    }

    const secret = generateSecret()
    setPendingSecret(user, secret)
    const session = readSession()
    if (session?.pendingUser) {
      writeSession({
        ...session,
        pendingUser: { ...session.pendingUser, setupSecret: secret },
      })
    }
    return {
      secret,
      otpauthUri: buildOtpauthUri({
        secret,
        accountName: user?.email || user?.matricule || 'utilisateur',
      }),
    }
  },

  enable2FA: async (user, secret, code) => {
    if (!USE_MOCK) {
      const { data } = await api.post('/auth/2fa/enable', { userId: user?.id, secret, code })
      return Boolean(data?.success)
    }

    if (!(await verifyTOTP(secret, code))) return false
    setSecret(user, secret)
    return true
  },

  disable2FA: async (user) => {
    if (!USE_MOCK) {
      await api.post('/auth/2fa/disable', { userId: user?.id })
      return
    }
    setSecret(user, null)
    clearPendingSecret(user)
  },

  has2FA: (user) => Boolean(getSecret(user)),

  // Mise à jour des données utilisateur dans la session
  updateUser: (updates) => {
    const session = readSession()
    if (!session?.user) return null
    const next = { ...session, user: { ...session.user, ...updates } }
    writeSession(next)
    return next
  },

  // Déconnexion
  logout: async () => {
    if (!USE_MOCK) {
      try {
        await api.post('/auth/logout')
      } catch {
        // Token déjà invalide : on nettoie quand même la session locale
      }
    }
    clearSession()
  },
}

export default api
