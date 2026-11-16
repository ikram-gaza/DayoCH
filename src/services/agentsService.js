import { USE_MOCK_DATA } from '../config/donnees'
import { FILIALES } from '../config/filiales'
import { DEPARTEMENTS, SERVICES, agentMock, ecrireAgentsMock, historiqueMock, lireAgentsMock, mettreAJourAgentMock } from '../config/agentsDemo'
import { exporterTableau } from '../utils/export'
import { api, lire, telecharger, televerser } from './apiClient'

function normaliserTexte(valeur) {
  return String(valeur || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function valeurFiltre(filtres, cle) {
  return filtres?.[cle] === undefined || filtres?.[cle] === '' ? null : filtres[cle]
}

function correspondPerimetre(agent, perimetre) {
  if (!perimetre || perimetre === 'groupe') return true
  return agent.filialeId === perimetre || agent.filialeIds?.includes(perimetre)
}

function filtrerEtTrier(filtres = {}, perimetre = 'groupe') {
  const recherche = normaliserTexte(filtres.recherche)
  const actif = valeurFiltre(filtres, 'actif')
  const avecCompte = valeurFiltre(filtres, 'avecCompte')
  const avecEmail = valeurFiltre(filtres, 'avecEmail')
  const estGerant = valeurFiltre(filtres, 'estGerant')
  const sansService = valeurFiltre(filtres, 'sansService')
  const sansDepartement = valeurFiltre(filtres, 'sansDepartement')
  const departementIds = valeurFiltre(filtres, 'departementIds')?.split(',').filter(Boolean) || []
  const serviceIds = valeurFiltre(filtres, 'serviceIds')?.split(',').filter(Boolean) || []

  const resultat = lireAgentsMock().filter((agent) => {
    if (!correspondPerimetre(agent, perimetre)) return false

    if (recherche) {
      const contenu = normaliserTexte(
        [agent.matricule, agent.nom, agent.prenom, agent.fonction, agent.email]
          .filter(Boolean)
          .join(' '),
      )
      if (!contenu.includes(recherche)) return false
    }

    if (filtres.matricule && !normaliserTexte(agent.matricule).includes(normaliserTexte(filtres.matricule))) return false
    if (filtres.fonction && !normaliserTexte(agent.fonction).includes(normaliserTexte(filtres.fonction))) return false
    if (actif !== null && String(Boolean(agent.actif)) !== actif) return false
    if (avecCompte !== null && String(Boolean(agent.userId)) !== avecCompte) return false
    if (avecEmail !== null && String(Boolean(agent.email)) !== avecEmail) return false
    if (estGerant !== null && String(Boolean(agent.estGerant)) !== estGerant) return false
    if (sansService === 'true' && agent.service) return false
    if (sansDepartement === 'true' && agent.departement) return false
    if (departementIds.length && !departementIds.includes(agent.departement?.id)) return false
    if (serviceIds.length && !serviceIds.includes(agent.service?.id)) return false
    if (filtres.embaucheDu && (!agent.dateEmbauche || agent.dateEmbauche < filtres.embaucheDu)) return false
    if (filtres.embaucheAu && (!agent.dateEmbauche || agent.dateEmbauche > filtres.embaucheAu)) return false

    return true
  })

  const triPar = filtres.triPar || 'nom'
  const sens = filtres.sortOrder === 'DESC' ? -1 : 1
  const valeurTri = (agent) => {
    if (triPar === 'nom') return `${agent.nom || ''} ${agent.prenom || ''}`
    if (triPar === 'departement') return agent.departement?.nom || ''
    if (triPar === 'service') return agent.service?.nom || ''
    return agent[triPar] || ''
  }

  return resultat.sort((a, b) => {
    const valeurA = valeurTri(a)
    const valeurB = valeurTri(b)
    if (typeof valeurA === 'number' && typeof valeurB === 'number') return (valeurA - valeurB) * sens
    return String(valeurA).localeCompare(String(valeurB), 'fr', { sensitivity: 'base' }) * sens
  })
}

function paginer(agents, filtres) {
  const page = Math.max(1, Number(filtres.page) || 1)
  const limit = Math.max(1, Math.min(200, Number(filtres.limit) || 20))
  const total = agents.length
  const pages = Math.max(1, Math.ceil(total / limit))
  const pageCourante = Math.min(page, pages)

  return {
    items: agents.slice((pageCourante - 1) * limit, pageCourante * limit),
    total,
    page: pageCourante,
    limit,
    pages,
  }
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
    nomComplet: `${agent.prenom} ${agent.nom}`,
    fonction: agent.fonction || '',
    departement: agent.departement?.nom || '',
    service: agent.service?.nom || '',
    dateEmbauche: agent.dateEmbauche || '',
    compte: agent.userId ? 'Oui' : 'Non',
    statut: agent.actif ? 'Actif' : 'Sorti',
  }))
}

function nomFiliale(id) {
  return FILIALES.find((filiale) => filiale.id === id)?.nom || 'Groupe Dayo'
}

function fichierVersDataUrl(fichier) {
  return new Promise((resolve, reject) => {
    const lecteur = new FileReader()
    lecteur.onload = () => resolve(lecteur.result)
    lecteur.onerror = () => reject(new Error('Lecture du fichier impossible.'))
    lecteur.readAsDataURL(fichier)
  })
}

export const apiAgents = {
  lister: async (filtres = {}, perimetre = 'groupe') => {
    if (!USE_MOCK_DATA) return lire('/organisation/agents', filtres)
    return paginer(filtrerEtTrier(filtres, perimetre), filtres)
  },

  detail: async (id) => {
    if (!USE_MOCK_DATA) return lire(`/organisation/agents/${id}`)
    const agent = agentMock(id)
    if (!agent) throw new Error('Agent introuvable.')
    return agent
  },

  historique: async (id) => {
    if (!USE_MOCK_DATA) return lire(`/organisation/agents/${id}/historique`)
    return historiqueMock(id)
  },

  muter: async (id, corps) => {
    if (!USE_MOCK_DATA) {
      const { data } = await api.patch(`/organisation/agents/${id}/mutation`, corps)
      return data
    }
    const agent = agentMock(id)
    if (!agent) throw new Error('Agent introuvable.')
    const departement = corps.departementId
      ? DEPARTEMENTS.find((item) => item.id === corps.departementId) || null
      : agent.departement
    const service = corps.serviceId
      ? SERVICES.find((item) => item.id === corps.serviceId) || null
      : agent.service
    const misAJour = mettreAJourAgentMock(id, {
      departement,
      service,
      fonction: corps.fonction || agent.fonction,
      historique: [
        {
          id: `${id}-${Date.now()}`,
          fonction: corps.fonction || agent.fonction,
          departement: departement?.nom || null,
          service: service?.nom || null,
          estGerant: agent.estGerant,
          dateDebut: corps.dateEffet || new Date().toISOString().slice(0, 10),
          dateFin: null,
          enCours: true,
          dureeMois: 0,
          motif: corps.nature || 'MUTATION',
          commentaire: corps.motif || null,
        },
        ...(agent.historique || []).map((item) => ({ ...item, enCours: false, dateFin: corps.dateEffet || new Date().toISOString().slice(0, 10) })),
      ],
    })
    return misAJour
  },

  envoyerPhoto: async (id, fichier) => {
    if (!USE_MOCK_DATA) return televerser(`/organisation/agents/${id}/photo`, fichier)
    const dataUrl = await fichierVersDataUrl(fichier)
    return mettreAJourAgentMock(id, {
      photoFichier: `photo-${id}.png`,
      photoUrl: dataUrl,
      photoMajAt: new Date().toISOString(),
    })
  },

  envoyerSignatureFichier: async (id, fichier) => {
    if (!USE_MOCK_DATA) return televerser(`/organisation/agents/${id}/signature/fichier`, fichier)
    const dataUrl = await fichierVersDataUrl(fichier)
    return mettreAJourAgentMock(id, {
      signatureFichier: `signature-${id}.png`,
      signatureUrl: dataUrl,
      signatureMajAt: new Date().toISOString(),
    })
  },

  enregistrerSignatureTracee: async (id, dataUrl) => {
    if (!USE_MOCK_DATA) {
      const { data } = await api.put(`/organisation/agents/${id}/signature`, { dataUrl })
      return data
    }
    return mettreAJourAgentMock(id, {
      signatureFichier: `signature-${id}.png`,
      signatureUrl: dataUrl,
      signatureMajAt: new Date().toISOString(),
    })
  },

  exporter: async (filtres = {}, format = 'csv', perimetre = 'groupe') => {
    if (!USE_MOCK_DATA) return telecharger('/organisation/agents/export', { ...filtres, format })
    const agents = filtrerEtTrier({ ...filtres, page: '1', limit: '200' }, perimetre)
    exporterTableau({
      nom: `agents-${nomFiliale(perimetre).toLowerCase().replaceAll(' ', '-')}`,
      titre: 'Liste des agents',
      colonnes: colonnesAgents(),
      lignes: lignesAgents(agents),
      format,
    })
  },

  exporterCarriere: async (id, format = 'csv') => {
    if (!USE_MOCK_DATA) return telecharger(`/organisation/agents/${id}/historique/export`, { format })
    const agent = agentMock(id)
    if (!agent) throw new Error('Agent introuvable.')
    exporterTableau({
      nom: `carriere-${agent.matricule}`,
      titre: `Carrière de ${agent.prenom} ${agent.nom}`,
      colonnes: [
        { cle: 'fonction', libelle: 'Fonction' },
        { cle: 'departement', libelle: 'Département' },
        { cle: 'service', libelle: 'Service' },
        { cle: 'debut', libelle: 'Début' },
        { cle: 'fin', libelle: 'Fin' },
        { cle: 'motif', libelle: 'Motif' },
      ],
      lignes: (agent.historique || []).map((item) => ({
        fonction: item.fonction || '',
        departement: item.departement || '',
        service: item.service || '',
        debut: item.dateDebut || '',
        fin: item.dateFin || 'En cours',
        motif: item.motif || '',
      })),
      format,
    })
  },

  referentiels: async () => {
    if (!USE_MOCK_DATA) {
      const [departements, services] = await Promise.all([
        lire('/organisation/departements', { limit: 200, sortBy: 'nom', sortOrder: 'ASC' }),
        lire('/organisation/services', { limit: 200, sortBy: 'nom', sortOrder: 'ASC' }),
      ])
      return { departements: departements.items || departements, services: services.items || services }
    }
    return { departements: DEPARTEMENTS, services: SERVICES }
  },

  agentsPourTrombinoscope: async (filtres = {}, toutesFiliales = true, perimetre = 'groupe') => {
    const actif = filtres.actif === 'all' ? null : filtres.actif
    if (!USE_MOCK_DATA) return lire('/organisation/trombinoscope', { ...filtres, actif })
    const agents = filtrerEtTrier(
      { ...filtres, actif, page: '1', limit: '200' },
      toutesFiliales ? 'groupe' : perimetre,
    )
    const recherche = normaliserTexte(filtres.recherche)
    const avecPhoto = filtres.avecPhoto === 'true'

    return FILIALES.map((filiale) => {
      const membres = agents.filter(
        (agent) =>
          agent.filialeIds?.includes(filiale.id) &&
          (!avecPhoto || agent.photoFichier || agent.photoUrl) &&
          (!recherche ||
            normaliserTexte(
              [agent.nom, agent.prenom, agent.matricule, agent.fonction].filter(Boolean).join(' '),
            ).includes(recherche)),
      )

      return {
        filialeId: filiale.id,
        code: filiale.code,
        nom: filiale.nom,
        pays: filiale.pays,
        effectif: membres.length,
        avecPhoto: membres.filter((agent) => agent.photoFichier || agent.photoUrl).length,
        agents: membres.map((agent) => ({
          id: agent.id,
          matricule: agent.matricule,
          nom: agent.nom,
          prenom: agent.prenom,
          nomComplet: `${agent.prenom} ${agent.nom}`,
          fonction: agent.fonction,
          email: agent.email,
          telephone: agent.telephone,
          departement: agent.departement?.nom || null,
          service: agent.service?.nom || null,
          estGerant: agent.estGerant,
          aPhoto: Boolean(agent.photoFichier || agent.photoUrl),
          aSignature: Boolean(agent.signatureFichier || agent.signatureUrl),
          photoUrl: agent.photoUrl,
        })),
      }
    }).filter((groupe) => groupe.effectif > 0)
  },

  exporterTrombinoscope: async (filtres = {}, format = 'csv', toutesFiliales = true, perimetre = 'groupe') => {
    const actif = filtres.actif === 'all' ? null : filtres.actif
    if (!USE_MOCK_DATA) return telecharger('/organisation/trombinoscope/export', { ...filtres, actif, format })
    const groupes = await apiAgents.agentsPourTrombinoscope(filtres, toutesFiliales, perimetre)
    const lignes = groupes.flatMap((groupe) =>
      groupe.agents.map((agent) => ({
        ...agent,
        filiale: groupe.nom,
        nomComplet: `${agent.prenom} ${agent.nom}`,
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
  },
}

export const agentsMock = {
  lire: lireAgentsMock,
  ecrire: ecrireAgentsMock,
  agent: agentMock,
  historique: historiqueMock,
}
