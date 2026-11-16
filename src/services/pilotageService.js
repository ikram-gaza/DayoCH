import { USE_MOCK_DATA } from '../config/donnees'
import { FILIALES } from '../config/filiales'
import { lireAgentsMock } from '../config/agentsDemo'
import { lire } from './apiClient'

const MODULES = [
  { cle: 'agents', libelle: 'Agents', description: 'Effectif, fiches et parcours professionnels.', chemin: '/agents', permission: 'agent:read', roles: null },
  { cle: 'trombinoscope', libelle: 'Trombinoscope', description: 'Annuaire illustré du groupe.', chemin: '/trombinoscope', permission: 'trombinoscope:read', roles: null },
  { cle: 'conges', libelle: 'Congés', description: 'Demandes, soldes et planning.', chemin: '/conges', permission: null, roles: ['employe', 'manager', 'super_admin'] },
  { cle: 'fournitures', libelle: 'Fournitures', description: 'Demandes de matériel et suivi.', chemin: '/fournitures', permission: null, roles: ['employe', 'manager', 'super_admin'] },
  { cle: 'stock', libelle: 'Stock', description: 'Inventaire, traçabilité et alertes.', chemin: '/stock', permission: null, roles: ['gestionnaire_stock', 'super_admin'] },
  { cle: 'organigramme', libelle: 'Organigramme', description: 'Structure hiérarchique du groupe.', chemin: '/organigramme', permission: 'organigramme:read', roles: null },
  { cle: 'utilisateurs', libelle: 'Utilisateurs', description: 'Comptes et droits de connexion.', chemin: '/utilisateurs', permission: null, roles: ['super_admin'] },
]

function agentsDuPerimetre(perimetre) {
  return lireAgentsMock().filter(
    (agent) => agent.actif && (!perimetre || perimetre === 'groupe' || agent.filialeId === perimetre || agent.filialeIds?.includes(perimetre)),
  )
}

function moduleAccessible(module, role, permissions) {
  if (module.permission) return permissions.includes(module.permission) || role === 'super_admin'
  if (module.roles) return module.roles.includes(role)
  return true
}

function tableauDeBordMock(perimetre, role, permissions) {
  const agents = agentsDuPerimetre(perimetre)
  const effectif = agents.length
  const avecPhoto = agents.filter((agent) => agent.photoFichier || agent.photoUrl).length
  const sansCompte = agents.filter((agent) => !agent.userId).length
  const sansEmail = agents.filter((agent) => !agent.email).length
  const gerants = agents.filter((agent) => agent.estGerant).length
  const pourcentagePhotos = effectif ? Math.round((avecPhoto / effectif) * 100) : 0
  const libelle = perimetre && perimetre !== 'groupe'
    ? FILIALES.find((filiale) => filiale.id === perimetre)?.nom || 'Filiale'
    : 'Groupe Dayo'

  const pointsAttention = []
  if (sansCompte > 0) {
    pointsAttention.push({ niveau: 'alerte', message: `${sansCompte} agent(s) sans compte de connexion.`, chemin: '/agents?avecCompte=false' })
  }
  if (sansEmail > 0) {
    pointsAttention.push({ niveau: 'info', message: `${sansEmail} agent(s) sans adresse email.`, chemin: '/agents?avecEmail=false' })
  }
  if (effectif - avecPhoto > 0) {
    pointsAttention.push({ niveau: 'info', message: `${effectif - avecPhoto} agent(s) sans photo au trombinoscope.`, chemin: '/trombinoscope' })
  }

  return {
    perimetre: { filialeId: perimetre === 'groupe' ? null : perimetre, libelle },
    indicateurs: [
      { cle: 'effectif', libelle: 'Effectif actif', valeur: effectif, precision: `${gerants} gérant(s)` },
      { cle: 'photos', libelle: 'Couverture photo', valeur: pourcentagePhotos, precision: `${avecPhoto} sur ${effectif} agents` },
      { cle: 'sans_compte', libelle: 'Sans compte', valeur: sansCompte, precision: 'Connexion impossible' },
      { cle: 'sans_email', libelle: 'Sans email', valeur: sansEmail, precision: 'Contacts incomplets' },
      { cle: 'gerants', libelle: 'Gérants', valeur: gerants, precision: 'Direction de filiale' },
      { cle: 'filiales', libelle: 'Filiales couvertes', valeur: new Set(agents.flatMap((agent) => agent.filialeIds || [])).size, precision: 'Sur le périmètre' },
    ],
    effectifParFiliale: FILIALES.map((filiale) => {
      const membres = agents.filter((agent) => agent.filialeId === filiale.id)
      return {
        code: filiale.code,
        nom: filiale.nom,
        effectif: membres.length,
        avecPhoto: membres.filter((agent) => agent.photoFichier || agent.photoUrl).length,
      }
    }).filter((filiale) => filiale.effectif > 0),
    pointsAttention,
    modules: MODULES.map((module) => ({
      ...module,
      disponible: moduleAccessible(module, role, permissions),
    })),
  }
}

export const apiPilotage = {
  tableauDeBord: async (perimetre = 'groupe', role = 'employe', permissions = []) => {
    if (!USE_MOCK_DATA) return lire('/pilotage/tableau-de-bord')
    return tableauDeBordMock(perimetre, role, permissions)
  },

  modules: async (role = 'employe', permissions = []) => {
    if (!USE_MOCK_DATA) return lire('/pilotage/modules')
    return MODULES.map((module) => ({
      ...module,
      disponible: moduleAccessible(module, role, permissions),
    }))
  },
}
