import { generateSecret, verifyTOTP, buildOtpauthUri } from '../utils/totp'
import { reprendreSession, surSessionPerdue } from './apiClient'
import { apiAuth } from './apiAuth'
import { jetons } from './jetons'
import { normaliserUtilisateur } from './authMappers'

const USE_MOCK = false

const SESSION_KEY = 'dayoch_session_v1'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Comptes de démonstration : l'identifiant saisi détermine le rôle.
// (mot de passe ignoré en mode mock)
const MOCK_USERS = {
  'super_admin': {
    id: 1, nom: 'KOTCHOFA', prenom: 'Boris',
    email: 'boris.kotchofa@dayo.africa', matricule: 'DG-001',
    role: 'super_admin', filiale: 'Dayo Group', filialeId: null, poste: 'Directeur Général',
  },
  'admin': {
    id: 1, nom: 'KOTCHOFA', prenom: 'Boris',
    email: 'boris.kotchofa@dayo.africa', matricule: 'DG-001',
    role: 'super_admin', filiale: 'Dayo Group', filialeId: null, poste: 'Directeur Général',
  },
  'manager': {
    id: 2, nom: 'DIALLO', prenom: 'Amadou',
    email: 'amadou.diallo@dayo.africa', matricule: 'BEN-001',
    role: 'manager', filiale: 'Dayo Bénin', filialeId: 'dayo-benin', poste: 'Directeur Capital Humain',
  },
  'employe': {
    id: 5, nom: 'TRAORE', prenom: 'Aïcha',
    email: 'aicha.traore@dayo.africa', matricule: 'BFA-001',
    role: 'employe', filiale: 'Dayo Burkina Faso', filialeId: 'dayo-burkina', poste: 'Chargée de Clientèle',
  },
  'stock': {
    id: 8, nom: 'COULIBALY', prenom: 'Ibrahim',
    email: 'ibrahim.coulibaly@dayo.africa', matricule: 'BEN-002',
    role: 'gestionnaire_stock', filiale: 'Dayo Bénin', filialeId: 'dayo-benin', poste: 'Gestionnaire de stock',
  },
}

const MOCK_USER = MOCK_USERS.super_admin

const PRIVILEGED_ROLES = ['super_admin', 'manager']

// ── Persistance de session ──
function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (session.user) session.user = normaliserUtilisateur(session.user)
    return session
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
  jetons.clear()
}

function persistAuthenticated(user, tokens = {}) {
  if (tokens.accessToken || tokens.refreshToken) {
    jetons.save(tokens.accessToken, tokens.refreshToken)
  }
  const session = { user, pendingUser: null }
  writeSession(session)
  return session
}

async function finaliserConnexion(data) {
  const accessToken = data.accessToken || data.token || null
  const refreshToken = data.refreshToken || null
  if (accessToken) jetons.save(accessToken, refreshToken)

  let user = normaliserUtilisateur(data.utilisateur || data.user || data, data)
  const profil = await apiAuth.profil().catch(() => null)
  if (profil) user = { ...user, ...profil }

  return persistAuthenticated(user)
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

  canRestoreSession: () => !USE_MOCK && Boolean(jetons.refresh()),

  restoreSession: async () => {
    if (USE_MOCK) return readSession()
    if (!jetons.refresh()) return readSession()

    const ok = await reprendreSession()
    if (!ok) {
      clearSession()
      return null
    }

    const profil = await apiAuth.profil().catch(() => null)
    if (!profil) {
      clearSession()
      return null
    }

    const session = { user: profil, pendingUser: null }
    writeSession(session)
    return session
  },

  onSessionLost: (callback) => surSessionPerdue(callback),

  // Connexion avec email ou matricule + mot de passe
  login: async (identifier, password) => {
    if (!USE_MOCK) {
      const data = await apiAuth.connexion(identifier, password)
      const challengeToken = data.challengeToken || null
      const requires2FA = Boolean(data.twoFactorRequired || data.requires2FA || challengeToken)

      if (requires2FA) {
        const setupSecret = data.secret || data.setupSecret || null
        const requiresSetup = Boolean(
          (data.requiresSetup || data.twoFactorSetupRequired) && setupSecret,
        )
        const base = normaliserUtilisateur(data.utilisateur || data.user || {}, data)
        const pendingUser = {
          ...base,
          challengeToken,
          requiresSetup,
          setupSecret,
          qrCodeDataUrl: data.qrCodeDataUrl || null,
          otpauthUri: data.otpauthUrl || data.otpauthUri || null,
        }
        writeSession({ user: null, pendingUser })
        return { requires2FA: true, requiresSetup, user: null, pendingUser, challengeToken }
      }

      const session = await finaliserConnexion(data)
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
    const user = normaliserUtilisateur({ ...base, twoFactorEnabled })

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
      writeSession({ user: null, pendingUser })
      return { requires2FA: true, requiresSetup, user: null, pendingUser }
    }

    const session = persistAuthenticated(user)
    return { requires2FA: false, ...session }
  },

  // Vérification du code 2FA
  verify2FA: async (code) => {
    if (!USE_MOCK) {
      const session = readSession()
      const challengeToken = session?.pendingUser?.challengeToken

      if (!challengeToken) {
        throw new Error('Session 2FA expirée. Veuillez vous reconnecter.')
      }

      const data = await apiAuth.verifier2fa(challengeToken, code)
      if (!data?.accessToken && !data?.token) return { success: false }

      const authenticated = await finaliserConnexion(data)
      return { success: true, ...authenticated }
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
    const authenticated = persistAuthenticated(user)
    return { success: true, ...authenticated }
  },

  // ── Double authentification TOTP (2FAS, etc.) ──
  prepare2FA: async (user) => {
    if (!USE_MOCK) {
      const data = await apiAuth.preparer2FA()
      return {
        secret: data.secret,
        otpauthUri: data.otpauthUrl || data.otpauthUri,
        qrCodeDataUrl: data.qrCodeDataUrl,
      }
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
      const data = await apiAuth.preparer2FA()
      const result = {
        secret: data.secret,
        otpauthUri: data.otpauthUrl || data.otpauthUri,
        qrCodeDataUrl: data.qrCodeDataUrl || null,
      }
      const session = readSession()
      if (session?.pendingUser) {
        writeSession({
          ...session,
          pendingUser: {
            ...session.pendingUser,
            setupSecret: result.secret,
            qrCodeDataUrl: result.qrCodeDataUrl,
            otpauthUri: result.otpauthUri || null,
            requiresSetup: true,
          },
        })
      }
      return result
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
      const data = await apiAuth.activer2FA(code)
      return { ok: true, codesDeSecours: data?.codesDeSecours || null }
    }

    if (!(await verifyTOTP(secret, code))) return { ok: false }
    setSecret(user, secret)
    return { ok: true, codesDeSecours: null }
  },

  disable2FA: async (user, credentials = {}) => {
    if (!USE_MOCK) {
      const { password, codeTotp } = credentials
      if (!password || !codeTotp) throw new Error('Le mot de passe et le code 2FA sont requis.')
      await apiAuth.desactiver2FA(password, codeTotp)
      return
    }
    setSecret(user, null)
    clearPendingSecret(user)
  },

  changerMotDePasse: async ({ ancien, nouveau }) => {
    if (!USE_MOCK) {
      await apiAuth.changerMotDePasse(ancien, nouveau)
      authService.updateUser({ doitChangerMotDePasse: false })
      return true
    }
    await delay(500)
    authService.updateUser({ doitChangerMotDePasse: false })
    return true
  },

  has2FA: (user) => (USE_MOCK ? Boolean(getSecret(user)) : Boolean(user?.twoFactorEnabled)),

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
      const refresh = jetons.refresh()
      if (refresh) await apiAuth.deconnexion(refresh).catch(() => null)
    }
    clearSession()
  },
}
