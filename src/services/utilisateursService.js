import api from './authService'
import { FILIALES } from '../config/filiales'

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export const ROLES_UTILISATEUR = {
  employe: { label: 'Employé', color: '#a16207', bg: '#fef9c3' },
  manager: { label: 'Manager', color: '#16a34a', bg: '#dcfce7' },
  gestionnaire_stock: { label: 'Gestionnaire stock', color: '#7c3aed', bg: '#f3e8ff' },
  super_admin: { label: 'Super administrateur', color: '#007FE1', bg: '#E5F2FD' },
}

export const ROLES_BACKEND = {
  SUPER_ADMIN: { label: 'Super administrateur', color: '#007FE1', bg: '#E5F2FD', ui: 'super_admin' },
  ADMIN_FILIALE: { label: 'Administrateur filiale', color: '#0369a1', bg: '#e0f2fe', ui: 'super_admin' },
  GERANT: { label: 'Gérant', color: '#16a34a', bg: '#dcfce7', ui: 'manager' },
  RESPONSABLE_STOCK: { label: 'Responsable stock', color: '#7c3aed', bg: '#f3e8ff', ui: 'gestionnaire_stock' },
  RESPONSABLE_SERVICE: { label: 'Responsable service', color: '#0f766e', bg: '#ccfbf1', ui: 'manager' },
  AGENT: { label: 'Agent', color: '#a16207', bg: '#fef9c3', ui: 'employe' },
}

export const STATUTS_UTILISATEUR = {
  actif: { label: 'Actif', color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
  inactif: { label: 'Inactif', color: '#57534e', bg: '#f5f5f4', dot: '#a8a29e' },
}

export const FILIALES_UTILISATEUR = [
  { nom: 'Dayo Group', code: 'DG' },
  ...FILIALES.map((f) => ({ nom: f.nom, code: f.code })),
]

const STORAGE_KEY = 'dayoch_utilisateurs_v2'
const ROLE_ORDER = [
  'SUPER_ADMIN',
  'ADMIN_FILIALE',
  'GERANT',
  'RESPONSABLE_SERVICE',
  'RESPONSABLE_STOCK',
  'AGENT',
]

const INITIAL_UTILISATEURS = []

export function infoRole(role) {
  const code = typeof role === 'string' ? role : role?.code
  return ROLES_BACKEND[code] || ROLES_UTILISATEUR[code] || {
    label: code || '—',
    color: '#57534e',
    bg: '#f5f5f4',
  }
}

export function messageErreur(error) {
  const data = error?.response?.data
  const message = data?.message || data?.error || error?.message
  return Array.isArray(message) ? message.join(' ') : message || 'Une erreur est survenue.'
}

function lireTout() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch {
    return INITIAL_UTILISATEURS
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_UTILISATEURS))
  } catch {
    return INITIAL_UTILISATEURS
  }
  return INITIAL_UTILISATEURS
}

function ecrireTout(liste) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(liste))
  } catch {
    return
  }
}

const nomComplet = (u) => `${u.prenom || ''} ${u.nom || ''}`.trim()

function genererMatricule(liste, filiale) {
  const config = FILIALES_UTILISATEUR.find((f) => f.nom === filiale || String(f.id) === String(filiale))
  const prefix = config?.code || 'DAY'
  const numeros = liste
    .filter((u) => u.matricule?.startsWith(`${prefix}-`))
    .map((u) => parseInt(String(u.matricule).split('-')[1], 10))
    .filter((n) => !Number.isNaN(n))
  const suivant = (numeros.length ? Math.max(...numeros) : 0) + 1
  return `${prefix}-${String(suivant).padStart(3, '0')}`
}

function extraireListe(data) {
  if (Array.isArray(data)) return data
  const source = data?.data ?? data
  if (Array.isArray(source)) return source
  for (const cle of ['items', 'utilisateurs', 'users', 'resultats', 'results', 'records']) {
    if (Array.isArray(source?.[cle])) return source[cle]
  }
  return []
}

function extraireObjet(data) {
  if (!data || typeof data !== 'object') return {}
  return data.utilisateur || data.user || data.data || data
}

function codeRole(role) {
  if (typeof role === 'string') return role
  return role?.code || role?.role?.code || role?.nom || null
}

function normaliserUtilisateur(brut = {}) {
  const agent = brut.agent || {}
  const filialeBrute = brut.filiale ?? agent.filiale
  const filiale = filialeBrute && typeof filialeBrute === 'object' ? filialeBrute : null
  const rolesSource = brut.roles ?? brut.roleCodes ?? brut.role ?? brut.roleCode
  const roles = (Array.isArray(rolesSource) ? rolesSource : [rolesSource])
    .map(codeRole)
    .filter(Boolean)
  const role = ROLE_ORDER.find((item) => roles.includes(item)) || roles[0] || 'AGENT'
  const nomCompletBrut = brut.nomComplet || agent.nomComplet || ''
  const morceaux = nomCompletBrut.split(/\s+/).filter(Boolean)
  const nom = brut.nom || agent.nom || morceaux.slice(1).join(' ') || ''
  const prenom = brut.prenom || agent.prenom || morceaux[0] || ''
  const actif = brut.actif !== false && String(brut.statut || '').toLowerCase() !== 'inactif'
  const statut = actif ? 'actif' : 'inactif'

  return {
    ...brut,
    id: brut.id ?? brut.userId ?? brut.utilisateurId ?? null,
    nom,
    prenom,
    email: brut.email || '',
    telephone: brut.telephone || agent.telephone || '',
    matricule: brut.matricule || agent.matricule || '',
    poste: brut.poste || agent.poste || agent.fonction || brut.fonction || '',
    filiale: filiale?.nom || (typeof filialeBrute === 'string' ? filialeBrute : '') || '',
    filialeId: brut.filialeId ?? agent.filialeId ?? filiale?.id ?? null,
    role,
    roleUi: ROLES_BACKEND[role]?.ui || role,
    roleLabel: infoRole(role).label,
    roles,
    actif,
    statut,
    twoFactorEnabled: Boolean(
      brut.twoFactorEnabled ?? brut.twoFactorActif ?? brut.doubleAuthentificationActive,
    ),
    dateEmbauche: brut.dateEmbauche || agent.dateEmbauche || '',
    dernierAcces: brut.dernierAcces || brut.lastLoginAt || null,
    managerId: brut.managerId ?? agent.managerId ?? brut.manager?.id ?? null,
  }
}

function payloadCommun(data) {
  const payload = {
    email: data.email?.trim() || undefined,
    nom: data.nom?.trim(),
    prenom: data.prenom?.trim(),
    telephone: data.telephone?.trim() || undefined,
    filialeId: data.filialeId || undefined,
    roleCodes: data.role ? [data.role] : (Array.isArray(data.roleCodes) ? data.roleCodes : undefined),
    actif: data.statut ? data.statut === 'actif' : data.actif,
  }
  Object.keys(payload).forEach((cle) => {
    if (payload[cle] === undefined || payload[cle] === '') delete payload[cle]
  })
  if (payload.email === undefined) delete payload.email
  return payload
}

function rolesDisponiblesParDefaut() {
  const source = USE_MOCK_DATA ? ROLES_UTILISATEUR : ROLES_BACKEND
  return Object.entries(source).map(([code, info]) => ({ code, ...info }))
}

export const utilisateursService = {
  isMock: USE_MOCK_DATA,
  getRolesDisponibles: rolesDisponiblesParDefaut,
  getFilialesDisponibles: () => FILIALES_UTILISATEUR.map((f) => ({ ...f })),
  getAll: () => lireTout(),

  lister: async () => {
    if (USE_MOCK_DATA) return lireTout().map(normaliserUtilisateur)
    const { data } = await api.get('/users')
    return extraireListe(data).map(normaliserUtilisateur)
  },

  listerRoles: async () => {
    if (USE_MOCK_DATA) return rolesDisponiblesParDefaut()
    try {
      const { data } = await api.get('/rbac/roles')
      const roles = extraireListe(data)
        .map((role) => {
          const code = codeRole(role)
          if (!code) return null
          const info = infoRole(code)
          return { code, label: role?.libelle || role?.label || role?.nom || info.label, color: info.color, bg: info.bg }
        })
        .filter(Boolean)
      return roles.length ? roles : rolesDisponiblesParDefaut()
    } catch {
      return rolesDisponiblesParDefaut()
    }
  },

  listerFiliales: async () => {
    if (USE_MOCK_DATA) return FILIALES_UTILISATEUR.map((f) => ({ ...f }))
    try {
      const { data } = await api.get('/filiales', { params: { sortOrder: 'ASC' } })
      const filiales = extraireListe(data)
        .map((filiale) => ({
          id: filiale.id,
          nom: filiale.nom || filiale.libelle,
          code: filiale.code,
        }))
        .filter((filiale) => filiale.nom)
      return filiales.length ? filiales : FILIALES_UTILISATEUR.map((f) => ({ ...f }))
    } catch {
      return FILIALES_UTILISATEUR.map((f) => ({ ...f }))
    }
  },

  getById: (id) => lireTout().find((u) => String(u.id) === String(id)) || null,

  getEquipe: (manager) => {
    const liste = lireTout().map(normaliserUtilisateur)
    if (!manager) return []
    const autres = liste.filter((u) => String(u.id) !== String(manager.id))
    if (manager.role === 'super_admin' || manager.role === 'SUPER_ADMIN') return autres
    const directs = autres.filter((u) => String(u.managerId) === String(manager.id))
    if (directs.length > 0) return directs
    return autres.filter((u) => u.filiale === manager.filiale)
  },

  emailExiste: (email, excludeId = null, liste = null) => {
    const cible = email?.trim().toLowerCase()
    if (!cible) return false
    const source = liste || lireTout()
    return source.some(
      (u) => u.email?.toLowerCase() === cible && String(u.id) !== String(excludeId),
    )
  },

  creer: async (data) => {
    if (USE_MOCK_DATA) return utilisateursService.creerUtilisateur(data)
    const liste = await utilisateursService.lister().catch(() => [])
    const payload = {
      ...payloadCommun(data),
      matricule: data.matricule?.trim() || genererMatricule(liste, data.filialeId || data.filiale),
      passwordInitial: data.passwordInitial,
    }
    if (!payload.roleCodes) payload.roleCodes = ['AGENT']
    if (payload.actif === undefined) payload.actif = true
    const { data: reponse } = await api.post('/users', payload)
    return normaliserUtilisateur(extraireObjet(reponse))
  },

  modifier: async (id, data) => {
    if (USE_MOCK_DATA) return utilisateursService.modifierUtilisateur(id, data)
    const { data: reponse } = await api.patch(`/users/${id}`, payloadCommun(data))
    return normaliserUtilisateur(extraireObjet(reponse))
  },

  changerStatut: async (id, statut) => {
    if (USE_MOCK_DATA) return utilisateursService.changerStatutLocal(id, statut)
    await api.patch(`/users/${id}`, { actif: statut === 'actif' })
    return true
  },

  basculer2FA: async (_id, _actif) => {
    if (USE_MOCK_DATA) return utilisateursService.basculer2FALocal(_id, _actif)
    throw new Error('La gestion de la double authentification d’un autre utilisateur n’est pas disponible sur l’API actuelle.')
  },

  supprimer: async (id) => {
    if (USE_MOCK_DATA) return utilisateursService.supprimerLocal(id)
    await api.delete(`/users/${id}`)
    return true
  },

  reinitialiserMotDePasse: async (_id) => {
    if (USE_MOCK_DATA) return utilisateursService.genererMotDePasse()
    throw new Error('La réinitialisation directe du mot de passe n’est pas disponible sur l’API /users. Utilisez le flux de demande de réinitialisation.')
  },

  creerUtilisateur: (data) => {
    const liste = lireTout()
    const maintenant = new Date().toISOString()
    const nouvel = normaliserUtilisateur({
      id: Date.now(),
      nom: data.nom?.trim().toUpperCase(),
      prenom: data.prenom?.trim(),
      email: data.email?.trim().toLowerCase() || '',
      telephone: data.telephone?.trim() || '',
      matricule: data.matricule?.trim() || genererMatricule(liste, data.filiale || data.filialeId),
      roles: [data.role || 'AGENT'],
      filiale: data.filiale || FILIALES_UTILISATEUR[1].nom,
      filialeId: data.filialeId || null,
      managerId: data.managerId ?? null,
      poste: data.poste?.trim() || 'Collaborateur',
      actif: data.statut ? data.statut === 'actif' : true,
      statut: data.statut || 'actif',
      twoFactorEnabled: Boolean(data.twoFactorEnabled),
      dateEmbauche: data.dateEmbauche || maintenant.slice(0, 10),
      dateCreation: maintenant,
      dernierAcces: null,
    })
    ecrireTout([nouvel, ...liste.map(normaliserUtilisateur)])
    return nouvel
  },

  modifierUtilisateur: (id, updates) => {
    const liste = lireTout().map(normaliserUtilisateur)
    const misAJour = liste.map((u) => {
      if (String(u.id) !== String(id)) return u
      return normaliserUtilisateur({
        ...u,
        ...updates,
        nom: updates.nom ? updates.nom.trim().toUpperCase() : u.nom,
        prenom: updates.prenom ? updates.prenom.trim() : u.prenom,
        email: updates.email ? updates.email.trim().toLowerCase() : u.email,
        matricule: updates.matricule?.trim() || u.matricule,
        poste: updates.poste?.trim() || u.poste,
        actif: updates.statut ? updates.statut === 'actif' : (updates.actif ?? u.actif),
        roles: updates.role ? [updates.role] : u.roles,
        dateModification: new Date().toISOString(),
      })
    })
    ecrireTout(misAJour)
    return misAJour.find((u) => String(u.id) === String(id)) || null
  },

  changerStatutLocal: (id, statut) => {
    const misAJour = lireTout().map(normaliserUtilisateur).map((u) =>
      String(u.id) === String(id) ? { ...u, statut, actif: statut === 'actif' } : u,
    )
    ecrireTout(misAJour)
    return misAJour
  },

  basculer2FALocal: (id, actif) => {
    const misAJour = lireTout().map(normaliserUtilisateur).map((u) => {
      if (String(u.id) !== String(id)) return u
      return { ...u, twoFactorEnabled: actif ?? !u.twoFactorEnabled }
    })
    ecrireTout(misAJour)
    return misAJour
  },

  supprimerLocal: (id) => {
    const misAJour = lireTout().map(normaliserUtilisateur).filter((u) => String(u.id) !== String(id))
    ecrireTout(misAJour)
    return misAJour
  },

  genererMotDePasse: () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
    let motDePasse = 'A1!'
    for (let i = 0; i < 9; i += 1) {
      motDePasse += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return motDePasse
  },

  getStats: (liste = lireTout().map(normaliserUtilisateur)) => {
    return {
      total: liste.length,
      actifs: liste.filter((u) => u.actif !== false && u.statut === 'actif').length,
      inactifs: liste.filter((u) => u.actif === false || u.statut !== 'actif').length,
      deuxFA: liste.filter((u) => u.twoFactorEnabled).length,
      managers: liste.filter((u) =>
        ['manager', 'super_admin', 'GERANT', 'ADMIN_FILIALE', 'RESPONSABLE_SERVICE'].includes(u.role),
      ).length,
    }
  },

  getNomComplet: nomComplet,
}
