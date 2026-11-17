import axios from 'axios'
import { generateSecret, verifyTOTP, buildOtpauthUri } from '../utils/totp'

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')
const USE_MOCK = import.meta.env.VITE_USE_MOCK_AUTH !== 'false'

const SESSION_KEY = 'dayoch_session_v1'
const REFRESH_KEY = 'dayopi.refreshToken'
const LEGACY_TOKEN_KEY = 'token'
const TWO_FA_KEY = 'dayoch_2fa_secrets_v1'
const PENDING_2FA_KEY = 'dayoch_2fa_pending_v1'

const ROLES_UI = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_FILIALE: 'super_admin',
  GERANT: 'manager',
  RESPONSABLE_STOCK: 'gestionnaire_stock',
  RESPONSABLE_SERVICE: 'manager',
  AGENT: 'employe',
}

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN_FILIALE: 'Administrateur filiale',
  GERANT: 'Gérant',
  RESPONSABLE_STOCK: 'Responsable stock',
  RESPONSABLE_SERVICE: 'Responsable service',
  AGENT: 'Agent',
  super_admin: 'Super administrateur',
  manager: 'Manager',
  employe: 'Employé',
  gestionnaire_stock: 'Gestionnaire stock',
}

const ROLE_BACKEND_PAR_UI = {
  super_admin: 'SUPER_ADMIN',
  manager: 'GERANT',
  employe: 'AGENT',
  gestionnaire_stock: 'RESPONSABLE_STOCK',
}

const ORDRE_ROLES = [
  'SUPER_ADMIN',
  'ADMIN_FILIALE',
  'GERANT',
  'RESPONSABLE_SERVICE',
  'RESPONSABLE_STOCK',
  'AGENT',
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let accessToken = null
let sessionCourante = null
const abonnesSessionPerdue = new Set()

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
})

export function surSessionPerdue(abonne) {
  abonnesSessionPerdue.add(abonne)
  return () => abonnesSessionPerdue.delete(abonne)
}

function notifierSessionPerdue() {
  abonnesSessionPerdue.forEach((abonne) => abonne())
}

function lireStockage(cle) {
  try {
    return localStorage.getItem(cle)
  } catch {
    return null
  }
}

function ecrireStockage(cle, valeur) {
  try {
    if (valeur === null || valeur === undefined) localStorage.removeItem(cle)
    else localStorage.setItem(cle, valeur)
  } catch {
    return
  }
}

function lireJson(cle) {
  try {
    const raw = lireStockage(cle)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function ecrireJson(cle, valeur) {
  ecrireStockage(cle, valeur ? JSON.stringify(valeur) : null)
}

function lireSessionStockee() {
  return lireJson(SESSION_KEY)
}

function definirSession(session) {
  sessionCourante = session
  if (USE_MOCK) ecrireJson(SESSION_KEY, session)
}

function getSession() {
  if (sessionCourante) return sessionCourante
  return USE_MOCK ? lireSessionStockee() : null
}

function effacerSession() {
  sessionCourante = null
  accessToken = null
  ecrireStockage(SESSION_KEY, null)
  ecrireStockage(REFRESH_KEY, null)
  ecrireStockage(LEGACY_TOKEN_KEY, null)
}

function persistAuthenticated(user, tokens = {}) {
  const acces = tokens.accessToken || tokens.token || null
  if (acces) accessToken = acces
  if (tokens.refreshToken) ecrireStockage(REFRESH_KEY, tokens.refreshToken)
  if (USE_MOCK && acces) ecrireStockage(LEGACY_TOKEN_KEY, acces)
  const session = { user, pendingUser: null, token: acces }
  definirSession(session)
  return session
}

function normaliserUtilisateur(brut = {}, extra = {}) {
  const rolesBruts = Array.isArray(brut.roles)
    ? brut.roles
    : brut.role
      ? [brut.role]
      : []
  const roles = rolesBruts
    .map((role) => (typeof role === 'string' ? role : role?.code))
    .filter(Boolean)
  const roleBackend = ORDRE_ROLES.find((role) => roles.includes(role)) || roles[0] || 'AGENT'
  const nomComplet = brut.nomComplet || `${brut.prenom || ''} ${brut.nom || ''}`.trim()
  const morceaux = nomComplet.split(/\s+/).filter(Boolean)
  const filiale = brut.filiale && typeof brut.filiale === 'object' ? brut.filiale : null
  const brutFlag = brut.doitChangerMotDePasse ?? brut.mustChangePassword ?? brut.passwordChangeRequired ??
    brut.forceChangePassword ?? brut.must_change_password ?? brut.requirePasswordChange ??
    brut.mustResetPassword ?? brut.changementMotDePasseRequis ?? brut.changementMotDePasseObligatoire ??
    brut.premiereConnexion ?? brut.firstLogin ??
    extra.doitChangerMotDePasse ?? extra.mustChangePassword ?? extra.passwordChangeRequired ?? extra.forceChangePassword ??
    extra.requirePasswordChange ?? extra.mustResetPassword ?? extra.changementMotDePasseRequis ??
    extra.changementMotDePasseObligatoire ?? extra.premiereConnexion ?? extra.firstLogin
  const doitChangerMotDePasse = [false, 'false', 0, '0', 'False', null, undefined].includes(brutFlag)
    ? false
    : Boolean(brutFlag)
  const nom = brut.nom || morceaux.slice(1).join(' ') || ''
  const prenom = brut.prenom || morceaux[0] || ''

  return {
    ...brut,
    nom,
    prenom,
    nomComplet: nomComplet || `${prenom} ${nom}`.trim(),
    email: brut.email || null,
    matricule: brut.matricule || '',
    telephone: brut.telephone || brut.agent?.telephone || '',
    filiale: filiale?.nom || (typeof brut.filiale === 'string' ? brut.filiale : '') || brut.filialeId || '',
    filialeId: brut.filialeId ?? filiale?.id ?? null,
    poste: brut.poste || brut.agent?.poste || brut.agent?.fonction || '',
    fonction: brut.fonction || brut.agent?.fonction || brut.poste || '',
    agentId: brut.agentId ?? brut.agent?.id ?? null,
    serviceId: brut.serviceId ?? brut.agent?.serviceId ?? null,
    role: ROLES_UI[roleBackend] || 'employe',
    roleBackend,
    roleLabel: ROLE_LABELS[roleBackend] || roleBackend,
    roles,
    permissions: Array.isArray(brut.permissions) ? brut.permissions : [],
    estGerant: Boolean(brut.estGerant),
    doitChangerMotDePasse,
    twoFactorEnabled: Boolean(brut.twoFactorEnabled ?? brut.twoFactorActif ?? brut.isTwoFactorEnabled),
  }
}

function enrichirUtilisateurMock(user) {
  const roleBackend = ROLE_BACKEND_PAR_UI[user.role] || 'AGENT'
  return {
    ...user,
    roleBackend,
    roleLabel: ROLE_LABELS[user.role] || roleBackend,
    roles: [roleBackend],
    permissions: [],
  }
}

api.interceptors.request.use((config) => {
  const token = accessToken || lireStockage(LEGACY_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let rafraichissementEnCours = null

async function rafraichir() {
  const refresh = lireStockage(REFRESH_KEY)
  if (!refresh) return false

  rafraichissementEnCours ??= (async () => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken: refresh })
      const acces = data.accessToken || data.token
      if (!acces) return false
      accessToken = acces
      if (data.refreshToken) ecrireStockage(REFRESH_KEY, data.refreshToken)
      return true
    } catch {
      return false
    } finally {
      rafraichissementEnCours = null
    }
  })()

  return rafraichissementEnCours
}

api.interceptors.response.use(
  (reponse) => reponse,
  async (echec) => {
    if (!axios.isAxiosError(echec) || !echec.config) throw echec

    const config = echec.config
    const url = config.url || ''
    const sansRafraichissement = /\/auth\/(login|refresh|logout|2fa\/verifier)/.test(url)

    if (echec.response?.status === 401 && !config._rejoue && !sansRafraichissement) {
      config._rejoue = true
      if (await rafraichir()) return api.request(config)
      effacerSession()
      notifierSessionPerdue()
    }

    throw echec
  },
)

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

function userKey(user) {
  return (user?.email || user?.matricule || String(user?.id || '')).toLowerCase()
}

function getSecret(user) {
  return lireJson(TWO_FA_KEY)?.[userKey(user)] || null
}

function setSecret(user, secret) {
  const secrets = lireJson(TWO_FA_KEY) || {}
  if (secret) secrets[userKey(user)] = secret
  else delete secrets[userKey(user)]
  ecrireJson(TWO_FA_KEY, secrets)
}

function getPendingSecret(user) {
  return lireJson(PENDING_2FA_KEY)?.[userKey(user)] || null
}

function setPendingSecret(user, secret) {
  const secrets = lireJson(PENDING_2FA_KEY) || {}
  if (secret) secrets[userKey(user)] = secret
  else delete secrets[userKey(user)]
  ecrireJson(PENDING_2FA_KEY, secrets)
}

function clearPendingSecret(user) {
  setPendingSecret(user, null)
}

export const authService = {
  isMock: USE_MOCK,
  getSession,
  canRestoreSession: () => !USE_MOCK && Boolean(lireStockage(REFRESH_KEY)),
  restoreSession: async () => {
    if (USE_MOCK) return getSession()

    try {
      if (!(await rafraichir())) throw new Error('Session non reprise.')
      const { data } = await api.get('/auth/profil')
      const user = normaliserUtilisateur(data.utilisateur || data.user || data, data)
      definirSession({ user, pendingUser: null, token: accessToken })
      return getSession()
    } catch {
      effacerSession()
      return null
    }
  },
  saveSession: definirSession,

  login: async (identifier, password) => {
    if (!USE_MOCK) {
      const { data } = await api.post('/auth/login', { identifiant: identifier, password })

      if (data.twoFactorRequired || data.requires2FA) {
        const pendingUser = {
          challengeToken: data.challengeToken || null,
          requiresSetup: Boolean(data.requiresSetup),
          setupSecret: data.secret || null,
          email: identifier,
        }
        definirSession({ user: null, pendingUser, token: null })
        return { requires2FA: true, requiresSetup: pendingUser.requiresSetup, user: null, pendingUser }
      }

      const user = normaliserUtilisateur(data.utilisateur || data.user || data, data)
      const session = persistAuthenticated(user, {
        accessToken: data.accessToken || data.token,
        refreshToken: data.refreshToken,
      })
      return { requires2FA: false, ...session }
    }

    await delay(900)
    if (!identifier?.trim() || !password?.trim()) {
      throw new Error('Identifiant ou mot de passe incorrect.')
    }

    const cle = identifier.trim().toLowerCase()
    const base = MOCK_USERS[cle] ||
      Object.values(MOCK_USERS).find((u) => u.email.toLowerCase() === cle || u.matricule.toLowerCase() === cle) ||
      MOCK_USER
    const utilisateur = enrichirUtilisateurMock(base)

    const storedSecret = getSecret(utilisateur)
    const mandatory = PRIVILEGED_ROLES.includes(utilisateur.role)
    const twoFactorEnabled = mandatory || cle === '2fa' || Boolean(storedSecret)
    const user = { ...utilisateur, twoFactorEnabled }

    if (twoFactorEnabled) {
      const requiresSetup = !storedSecret
      let setupSecret = null

      if (requiresSetup) {
        setupSecret = getPendingSecret(utilisateur)
        if (!setupSecret) {
          const currentSession = getSession()
          const sameUser =
            currentSession?.pendingUser &&
            userKey(currentSession.pendingUser) === userKey(utilisateur)
          setupSecret = sameUser ? currentSession.pendingUser.setupSecret : null
        }
        if (!setupSecret) setupSecret = generateSecret()
        setPendingSecret(utilisateur, setupSecret)
      }

      const pendingUser = requiresSetup
        ? { ...user, requiresSetup: true, setupSecret }
        : { ...user, requiresSetup: false }
      definirSession({ user: null, pendingUser, token: null })
      return { requires2FA: true, requiresSetup, user: null, pendingUser }
    }

    const session = persistAuthenticated(user, { accessToken: `mock-token-${user.id}` })
    return { requires2FA: false, ...session }
  },

  verify2FA: async (code) => {
    if (!USE_MOCK) {
      const pending = getSession()?.pendingUser
      if (!pending?.challengeToken) {
        throw new Error('Session 2FA expirée. Veuillez vous reconnecter.')
      }

      try {
        const { data } = await api.post('/auth/2fa/verifier', {
          challengeToken: pending.challengeToken,
          codeTotp: code,
        })
        const user = normaliserUtilisateur(data.utilisateur || data.user || data, data)
        const session = persistAuthenticated(user, {
          accessToken: data.accessToken || data.token,
          refreshToken: data.refreshToken,
        })
        return { success: true, ...session }
      } catch (echec) {
        if ([400, 401, 422].includes(echec?.response?.status)) return { success: false }
        throw echec
      }
    }

    await delay(700)
    const session = getSession()
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
    const authenticated = persistAuthenticated(user, { accessToken: `mock-token-${user.id}` })
    return { success: true, ...authenticated }
  },

  prepare2FA: async (user) => {
    if (!USE_MOCK) {
      const { data } = await api.post('/auth/2fa/preparer')
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
      const { data } = await api.post('/auth/2fa/preparer')
      return {
        secret: data.secret,
        otpauthUri: data.otpauthUrl || data.otpauthUri,
        qrCodeDataUrl: data.qrCodeDataUrl,
      }
    }

    const secret = generateSecret()
    setPendingSecret(user, secret)
    const session = getSession()
    if (session?.pendingUser) {
      definirSession({
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
      try {
        const { data } = await api.post('/auth/2fa/activer', { codeTotp: code })
        authService.updateUser({ twoFactorEnabled: true })
        return { ok: true, codesDeSecours: data?.codesDeSecours || null }
      } catch (echec) {
        if ([400, 401, 422].includes(echec?.response?.status)) return { ok: false }
        throw echec
      }
    }

    if (!(await verifyTOTP(secret, code))) return { ok: false }
    setSecret(user, secret)
    return { ok: true, codesDeSecours: null }
  },

  disable2FA: async (user, credentials = {}) => {
    if (!USE_MOCK) {
      const { password, codeTotp } = credentials
      if (!password || !codeTotp) {
        throw new Error('Le mot de passe et le code 2FA sont requis.')
      }
      await api.post('/auth/2fa/desactiver', { password, codeTotp })
      authService.updateUser({ twoFactorEnabled: false })
      return true
    }

    setSecret(user, null)
    clearPendingSecret(user)
    return true
  },

  has2FA: (user) => (USE_MOCK ? Boolean(getSecret(user)) : Boolean(user?.twoFactorEnabled)),

  updateUser: (updates) => {
    const session = getSession()
    if (!session?.user) return null
    const next = { ...session, user: { ...session.user, ...updates } }
    definirSession(next)
    return next
  },

  mettreAJourProfil: async (updates = {}) => {
    if (!USE_MOCK) {
      throw new Error('La mise à jour du profil n’est pas disponible sur l’API actuelle.')
    }

    await delay(500)
    return authService.updateUser(updates)?.user || null
  },

  changerMotDePasse: async ({ ancien, nouveau }) => {
    if (!USE_MOCK) {
      await api.post('/auth/mot-de-passe/changer', {
        ancienPassword: ancien,
        nouveauPassword: nouveau,
      })
      authService.updateUser({ doitChangerMotDePasse: false })
      return true
    }

    await delay(500)
    authService.updateUser({ doitChangerMotDePasse: false })
    return true
  },

  logout: async () => {
    if (!USE_MOCK) {
      const refresh = lireStockage(REFRESH_KEY)
      try {
        if (refresh) await api.post('/auth/logout', { refreshToken: refresh })
      } catch (echec) {
        void echec
      }
    }
    effacerSession()
  },
}

export default api
