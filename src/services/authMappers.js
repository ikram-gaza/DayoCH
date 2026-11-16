import { FILIALES } from '../config/filiales'
import { permissionsPourRoles } from '../config/permissions'

const ROLE_PRIORITY = ['super_admin', 'manager', 'gestionnaire_stock', 'employe']

const ROLE_MAP = {
  SUPER_ADMIN: 'super_admin',
  ADMIN_FILIALE: 'super_admin',
  GERANT: 'manager',
  RESPONSABLE_SERVICE: 'manager',
  RESPONSABLE_STOCK: 'gestionnaire_stock',
  AGENT: 'employe',
}

function codeRole(role) {
  if (!role) return null
  if (typeof role === 'string') return role
  return role.code || role.codeRole || role.nom || null
}

export function normaliserUtilisateur(brut = {}) {
  const rolesBruts = Array.isArray(brut.roles) ? brut.roles : brut.role ? [brut.role] : []
  const roles = rolesBruts
    .map(codeRole)
    .filter(Boolean)
    .map((role) => ROLE_MAP[role] || String(role).toLowerCase())
    .filter(Boolean)

  const role = ROLE_PRIORITY.find((candidat) => roles.includes(candidat)) || 'employe'
  const nomComplet = brut.nomComplet || [brut.prenom, brut.nom].filter(Boolean).join(' ')
  const morceaux = nomComplet.trim().split(/\s+/).filter(Boolean)
  const prenom = brut.prenom || morceaux[0] || ''
  const nom = brut.nom || morceaux.slice(1).join(' ') || ''
  const filiale =
    brut.filiale?.nom ||
    brut.filialeNom ||
    (typeof brut.filiale === 'string' ? brut.filiale : '') ||
    'Groupe Dayo'
  const filialeConnue = FILIALES.find((candidate) => candidate.nom === filiale)
  const filialeId = brut.filialeId ?? brut.filiale?.id ?? filialeConnue?.id ?? null
  const permissions = permissionsPourRoles(roles, Array.isArray(brut.permissions) ? brut.permissions : [])

  return {
    id: brut.id ?? brut.userId ?? brut.matricule ?? brut.email ?? '',
    nom,
    prenom,
    email: brut.email || '',
    matricule: brut.matricule || '',
    role,
    roles,
    permissions,
    filiale,
    filialeId,
    poste: brut.poste || brut.fonction || '',
    telephone: brut.telephone || brut.telephoneMobile || '',
    photo: brut.photo || brut.photoUrl || null,
    twoFactorEnabled: Boolean(brut.twoFactorEnabled),
    statut: brut.statut || 'actif',
    managerId: brut.managerId ?? null,
    estGerant: Boolean(brut.estGerant),
    doitChangerMotDePasse: Boolean(brut.doitChangerMotDePasse),
  }
}
