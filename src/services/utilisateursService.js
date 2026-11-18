import { api } from './apiClient'
import { FILIALES } from '../config/filiales'

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

const ROLE_ORDER = [
  'SUPER_ADMIN',
  'ADMIN_FILIALE',
  'GERANT',
  'RESPONSABLE_SERVICE',
  'RESPONSABLE_STOCK',
  'AGENT',
]

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

const nomComplet = (u) => `${u.prenom || ''} ${u.nom || ''}`.trim()

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
  return Object.entries(ROLES_BACKEND).map(([code, info]) => ({ code, ...info }))
}

export const utilisateursService = {
  isMock: false,
  getRolesDisponibles: rolesDisponiblesParDefaut,
  getFilialesDisponibles: () => FILIALES_UTILISATEUR.map((f) => ({ ...f })),

  lister: async () => {
    const { data } = await api.get('/users')
    return extraireListe(data).map(normaliserUtilisateur)
  },

  listerRoles: async () => {
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

  getEquipe: async (manager) => {
    const liste = await utilisateursService.lister()
    if (!manager) return []
    const autres = liste.filter((u) => String(u.id) !== String(manager.id))
    if (manager.role === 'super_admin' || manager.role === 'SUPER_ADMIN') return autres
    const directs = autres.filter((u) => String(u.managerId) === String(manager.id))
    if (directs.length > 0) return directs
    return autres.filter((u) => u.filiale === manager.filiale || String(u.filialeId) === String(manager.filialeId))
  },

  emailExiste: (email, excludeId = null, liste = []) => {
    const cible = email?.trim().toLowerCase()
    if (!cible) return false
    return liste.some(
      (u) => u.email?.toLowerCase() === cible && String(u.id) !== String(excludeId),
    )
  },

  creer: async (data) => {
    const payload = {
      ...payloadCommun(data),
      matricule: data.matricule?.trim(),
      passwordInitial: data.passwordInitial,
    }
    if (!payload.roleCodes) payload.roleCodes = ['AGENT']
    if (payload.actif === undefined) payload.actif = true
    const { data: reponse } = await api.post('/users', payload)
    return normaliserUtilisateur(extraireObjet(reponse))
  },

  modifier: async (id, data) => {
    const { data: reponse } = await api.patch(`/users/${id}`, payloadCommun(data))
    return normaliserUtilisateur(extraireObjet(reponse))
  },

  changerStatut: async (id, statut) => {
    await api.patch(`/users/${id}`, { actif: statut === 'actif' })
    return true
  },

  basculer2FA: async () => {
    throw new Error('La gestion de la double authentification d’un autre utilisateur n’est pas disponible sur l’API actuelle.')
  },

  supprimer: async (id) => {
    await api.delete(`/users/${id}`)
    return true
  },

  reinitialiserMotDePasse: async () => {
    throw new Error('La réinitialisation directe du mot de passe n’est pas disponible sur l’API /users. Utilisez le flux de demande de réinitialisation.')
  },

  getStats: (liste = []) => {
    return {
      total: liste.length,
      actifs: liste.filter((u) => u.actif !== false && u.statut === 'actif').length,
      inactifs: liste.filter((u) => u.actif === false || u.statut !== 'actif').length,
      deuxFA: liste.filter((u) => u.twoFactorEnabled).length,
      managers: liste.filter((u) =>
        ['manager', 'super_admin', 'GERANT', 'ADMIN_FILIALE', 'RESPONSABLE_SERVICE', 'SUPER_ADMIN'].includes(u.role),
      ).length,
    }
  },

  getNomComplet: nomComplet,
}
