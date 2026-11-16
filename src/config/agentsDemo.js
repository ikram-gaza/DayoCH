import { FILIALES } from './filiales'
import { MOCK_EMPLOYEES } from './organigrammeDemo'

const STORAGE_KEY = 'dayoch_agents_v1'

const DATES_EMBAUCHE = {
  1: '2018-01-15',
  2: '2020-03-02',
  3: '2021-06-14',
  4: '2022-09-05',
  5: '2019-11-04',
  6: '2024-02-12',
  7: '2023-08-21',
}

const SITUATIONS = {
  1: { departement: 'Direction Générale', service: 'Direction' },
  2: { departement: 'Capital Humain', service: 'Ressources Humaines' },
  3: { departement: 'Direction Générale', service: 'Direction' },
  4: { departement: 'Commercial', service: 'Ventes' },
  5: { departement: 'Direction Générale', service: 'Direction' },
  6: { departement: 'Commercial', service: 'Clientèle' },
  7: { departement: 'Direction Générale', service: 'Direction' },
}

const DEPARTEMENTS = [
  { id: 'dept-direction', nom: 'Direction Générale' },
  { id: 'dept-capital-humain', nom: 'Capital Humain' },
  { id: 'dept-commercial', nom: 'Commercial' },
]

const SERVICES = [
  { id: 'serv-direction', nom: 'Direction', departementId: 'dept-direction' },
  { id: 'serv-rh', nom: 'Ressources Humaines', departementId: 'dept-capital-humain' },
  { id: 'serv-ventes', nom: 'Ventes', departementId: 'dept-commercial' },
  { id: 'serv-clientele', nom: 'Clientèle', departementId: 'dept-commercial' },
]

function filialeId(nom) {
  return FILIALES.find((filiale) => filiale.nom === nom)?.id || null
}

function referenceDepartement(nom) {
  return DEPARTEMENTS.find((departement) => departement.nom === nom) || null
}

function referenceService(nom) {
  return SERVICES.find((service) => service.nom === nom) || null
}

function dureeEnMois(debut, fin = null) {
  const dateDebut = new Date(debut)
  const dateFin = fin ? new Date(fin) : new Date()
  if (Number.isNaN(dateDebut.getTime()) || Number.isNaN(dateFin.getTime())) return 0
  return Math.max(
    0,
    (dateFin.getFullYear() - dateDebut.getFullYear()) * 12 +
      (dateFin.getMonth() - dateDebut.getMonth()),
  )
}

function historiqueAgent(agent) {
  const actuelle = {
    id: `${agent.id}-actuelle`,
    fonction: agent.fonction,
    departement: agent.departement?.nom || null,
    service: agent.service?.nom || null,
    estGerant: agent.estGerant,
    dateDebut: agent.dateEmbauche,
    dateFin: null,
    enCours: true,
    dureeMois: dureeEnMois(agent.dateEmbauche),
    motif: 'EMBAUCHE',
    commentaire: null,
  }

  if (Number(agent.id) !== 4) return [actuelle]

  return [
    actuelle,
    {
      id: `${agent.id}-precedente`,
      fonction: 'Chargé de Clientèle',
      departement: 'Commercial',
      service: 'Clientèle',
      estGerant: false,
      dateDebut: '2022-09-05',
      dateFin: '2024-04-30',
      enCours: false,
      dureeMois: dureeEnMois('2022-09-05', '2024-04-30'),
      motif: 'PROMOTION',
      commentaire: 'Évolution vers le management commercial',
    },
  ]
}

const AGENTS_INITIAUX = MOCK_EMPLOYEES.map((employe) => {
  const situation = SITUATIONS[employe.id] || SITUATIONS[1]
  const departement = referenceDepartement(situation.departement)
  const service = referenceService(situation.service)
  const agent = {
    id: String(employe.id),
    matricule: employe.matricule,
    nom: employe.nom,
    prenom: employe.prenom,
    email: employe.email || null,
    telephone: employe.telephone || null,
    fonction: employe.poste || null,
    dateEmbauche: DATES_EMBAUCHE[employe.id] || '2023-01-02',
    dateSortie: null,
    estGerant: /Directeur|Directrice/.test(employe.poste || ''),
    actif: true,
    userId: employe.id === 6 ? null : `user-${employe.id}`,
    photoFichier: null,
    photoUrl: null,
    photoMajAt: null,
    signatureFichier: null,
    signatureUrl: null,
    signatureMajAt: null,
    departement,
    service,
    filiale: employe.filiale,
    filialeId: filialeId(employe.filiale),
    filiales: employe.filiales,
    filialeIds: employe.filiales.map(filialeId).filter(Boolean),
  }

  return { ...agent, historique: historiqueAgent(agent) }
})

let memoire = null

function agentsInitiaux() {
  return AGENTS_INITIAUX.map((agent) => ({ ...agent, historique: [...agent.historique] }))
}

export function lireAgentsMock() {
  if (memoire) return memoire
  try {
    const brut = localStorage.getItem(STORAGE_KEY)
    if (brut) {
      memoire = JSON.parse(brut)
      return memoire
    }
  } catch {
    memoire = agentsInitiaux()
    return memoire
  }

  memoire = agentsInitiaux()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoire))
  } catch {
    // stockage indisponible
  }
  return memoire
}

export function ecrireAgentsMock(agents) {
  memoire = agents
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents))
  } catch {
    // stockage indisponible
  }
}

export function mettreAJourAgentMock(id, updates) {
  const agents = lireAgentsMock()
  const misAJour = agents.map((agent) =>
    String(agent.id) === String(id) ? { ...agent, ...updates } : agent,
  )
  ecrireAgentsMock(misAJour)
  return misAJour.find((agent) => String(agent.id) === String(id)) || null
}

export function agentMock(id) {
  return lireAgentsMock().find((agent) => String(agent.id) === String(id)) || null
}

export function historiqueMock(id) {
  return agentMock(id)?.historique || []
}

export { DEPARTEMENTS, SERVICES }
