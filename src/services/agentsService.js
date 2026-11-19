import { exporterTableau } from '../utils/export'
import { api, lire, telecharger, televerser } from './apiClient'

function extraireListe(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.items)) return data.data.items
  return []
}

function normaliserPage(data, filtres = {}) {
  const items = extraireListe(data)
  const total = data?.total ?? data?.meta?.total ?? items.length
  const page = (data?.page ?? data?.meta?.page ?? Number(filtres.page)) || 1
  const limit = (data?.limit ?? data?.meta?.limit ?? Number(filtres.limit)) || 20
  const pages = data?.pages ?? data?.meta?.pages ?? Math.max(1, Math.ceil(total / (limit || 1)))
  return { items, total, page, limit, pages }
}

function colonnesAgents() {
  return [
    { cle: 'matricule', libelle: 'Matricule' },
    { cle: 'nomComplet', libelle: 'Agent' },
    { cle: 'fonction', libelle: 'Fonction' },
    { cle: 'departement', libelle: 'Département' },
    { cle: 'service', libelle: 'Service' },
    { cle: 'dateEmbauche', libelle: 'Embauche' },
    { cle: 'compte', libelle: 'Compte' },
    { cle: 'statut', libelle: 'Statut' },
  ]
}

function lignesAgents(agents) {
  return agents.map((agent) => ({
    matricule: agent.matricule,
    nomComplet: `${agent.prenom || ''} ${agent.nom || ''}`.trim() || agent.nomComplet || '',
    fonction: agent.fonction || '',
    departement: agent.departement?.nom || agent.departement || '',
    service: agent.service?.nom || agent.service || '',
    dateEmbauche: agent.dateEmbauche || '',
    compte: agent.userId ? 'Oui' : 'Non',
    statut: agent.actif ? 'Actif' : 'Sorti',
  }))
}

export const apiAgents = {
  lister: async (filtres = {}) => {
    const data = await lire('/organisation/agents', filtres)
    return normaliserPage(data, filtres)
  },

  detail: async (id) => lire(`/organisation/agents/${id}`),

  historique: async (id) => {
    const data = await lire(`/organisation/agents/${id}/historique`)
    return extraireListe(data).length ? extraireListe(data) : data
  },

  muter: async (id, corps) => {
    const { data } = await api.patch(`/organisation/agents/${id}/mutation`, corps)
    return data
  },

  envoyerPhoto: async (id, fichier) => televerser(`/organisation/agents/${id}/photo`, fichier),

  envoyerSignatureFichier: async (id, fichier) => televerser(`/organisation/agents/${id}/signature/fichier`, fichier),

  enregistrerSignatureTracee: async (id, dataUrl) => {
    const { data } = await api.put(`/organisation/agents/${id}/signature`, { dataUrl })
    return data
  },

  exporter: async (filtres = {}, format = 'xlsx') => {
    try {
      await telecharger('/organisation/agents/export', { ...filtres, format })
    } catch {
      const page = await apiAgents.lister({ ...filtres, page: '1', limit: '200' })
      exporterTableau({
        nom: 'agents',
        titre: 'Liste des agents',
        colonnes: colonnesAgents(),
        lignes: lignesAgents(page.items || []),
        format,
      })
    }
  },

  exporterCarriere: async (id, format = 'xlsx') => {
    try {
      await telecharger(`/organisation/agents/${id}/historique/export`, { format })
    } catch {
      const historique = await apiAgents.historique(id)
      const items = Array.isArray(historique) ? historique : extraireListe(historique)
      exporterTableau({
        nom: `carriere-${id}`,
        titre: 'Carrière de l’agent',
        colonnes: [
          { cle: 'fonction', libelle: 'Fonction' },
          { cle: 'departement', libelle: 'Département' },
          { cle: 'service', libelle: 'Service' },
          { cle: 'debut', libelle: 'Début' },
          { cle: 'fin', libelle: 'Fin' },
          { cle: 'motif', libelle: 'Motif' },
        ],
        lignes: items.map((item) => ({
          fonction: item.fonction || '',
          departement: item.departement?.nom || item.departement || '',
          service: item.service?.nom || item.service || '',
          debut: item.dateDebut || '',
          fin: item.dateFin || (item.enCours ? 'En cours' : ''),
          motif: item.motif || '',
        })),
        format,
      })
    }
  },

  referentiels: async () => {
    const [departements, services] = await Promise.all([
      lire('/organisation/departements', { limit: 200, sortBy: 'nom', sortOrder: 'ASC' }).catch(() => []),
      lire('/organisation/services', { limit: 200, sortBy: 'nom', sortOrder: 'ASC' }).catch(() => []),
    ])
    return {
      departements: extraireListe(departements).length ? extraireListe(departements) : (departements.items || departements || []),
      services: extraireListe(services).length ? extraireListe(services) : (services.items || services || []),
    }
  },

  creer: async (corps) => {
    const { data } = await api.post('/organisation/agents', corps)
    return data
  },

  modifier: async (id, corps) => {
    const { data } = await api.patch(`/organisation/agents/${id}`, corps)
    return data
  },

  statistiques: async (filialeId) => lire('/organisation/agents/statistiques', { filialeId }),

  designerGerant: async (id) => {
    const { data } = await api.patch(`/organisation/agents/${id}/designer-gerant`)
    return data
  },

  sortie: async (id) => {
    const { data } = await api.patch(`/organisation/agents/${id}/sortie`)
    return data
  },

  agentsPourTrombinoscope: async (filtres = {}) => {
    const actif = filtres.actif === 'all' ? null : filtres.actif
    const data = await lire('/organisation/trombinoscope', { ...filtres, actif })
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.groupes)) return data.groupes
    if (Array.isArray(data?.data)) return data.data
    return []
  },

  exporterTrombinoscope: async (filtres = {}, format = 'xlsx') => {
    const actif = filtres.actif === 'all' ? null : filtres.actif
    try {
      await telecharger('/organisation/trombinoscope/export', { ...filtres, actif, format })
    } catch {
      const groupes = await apiAgents.agentsPourTrombinoscope(filtres)
      const lignes = (groupes || []).flatMap((groupe) =>
        (groupe.agents || []).map((agent) => ({
          ...agent,
          filiale: groupe.nom,
          nomComplet: `${agent.prenom || ''} ${agent.nom || ''}`.trim(),
        })),
      )
      exporterTableau({
        nom: 'trombinoscope-groupe',
        titre: 'Trombinoscope du groupe',
        colonnes: [
          { cle: 'filiale', libelle: 'Filiale' },
          { cle: 'matricule', libelle: 'Matricule' },
          { cle: 'nomComplet', libelle: 'Agent' },
          { cle: 'fonction', libelle: 'Fonction' },
          { cle: 'departement', libelle: 'Département' },
          { cle: 'service', libelle: 'Service' },
          { cle: 'email', libelle: 'Email' },
          { cle: 'telephone', libelle: 'Téléphone' },
        ],
        lignes,
        format,
      })
    }
  },
}
