/**
 * Service de gestion des Congés & Absences pour le Groupe Dayo
 */

export const TYPES_CONGES = [
  {
    id: 'conge_paye',
    label: 'Congé payé (CP)',
    code: 'CP',
    color: '#007FE1',
    bg: '#E5F2FD',
    quotaAnnuel: 26,
    requiresProof: false,
    description: 'Congés annuels payés acquis au titre de l\'année de référence.',
  },
  {
    id: 'rtt',
    label: 'RTT / Récupération',
    code: 'RTT',
    color: '#16a34a',
    bg: '#dcfce7',
    quotaAnnuel: 6,
    requiresProof: false,
    description: 'Journées de récupération de temps de travail ou heures supplémentaires.',
  },
  {
    id: 'maladie',
    label: 'Congé maladie',
    code: 'MAL',
    color: '#dc2626',
    bg: '#FEF2F1',
    quotaAnnuel: null,
    requiresProof: true,
    description: 'Arrêt de travail prescrit par un médecin. Certificat requis sous 48h.',
  },
  {
    id: 'evenement_familial',
    label: 'Événement familial',
    code: 'EF',
    color: '#7c3aed',
    bg: '#f3e8ff',
    quotaAnnuel: 5,
    requiresProof: true,
    description: 'Mariage, naissance, décès d\'un proche (justificatif nécessaire).',
  },
  {
    id: 'maternite_paternite',
    label: 'Maternité / Paternité',
    code: 'MAT',
    color: '#db2777',
    bg: '#fce7f3',
    quotaAnnuel: null,
    requiresProof: true,
    description: 'Congé lié à la naissance ou à l\'accueil d\'un enfant.',
  },
  {
    id: 'sans_solde',
    label: 'Congé sans solde',
    code: 'CSS',
    color: '#4b5563',
    bg: '#f3f4f6',
    quotaAnnuel: null,
    requiresProof: false,
    description: 'Absence autorisée sans maintien de la rémunération.',
  },
]

export const STATUTS_CONGES = {
  en_attente: {
    label: 'En attente',
    color: '#a16207',
    bg: '#fef9c3',
    dot: '#eab308',
  },
  valide: {
    label: 'Validé',
    color: '#15803d',
    bg: '#dcfce7',
    dot: '#22c55e',
  },
  refuse: {
    label: 'Refusé',
    color: '#b91c1c',
    bg: '#FEF2F1',
    dot: '#ef4444',
  },
  annule: {
    label: 'Annulé',
    color: '#57534e',
    bg: '#f5f5f4',
    dot: '#a8a29e',
  },
}

/**
 * Calcul du nombre de jours ouvrés entre deux dates (exclut samedis et dimanches)
 */
export function calculerJoursOuvres(dateDebutStr, dateFinStr, demiJourneeDebut = 'journee', demiJourneeFin = 'journee') {
  if (!dateDebutStr || !dateFinStr) return 0
  const debut = new Date(dateDebutStr)
  const fin = new Date(dateFinStr)

  if (fin < debut) return 0

  let jours = 0
  const current = new Date(debut)

  while (current <= fin) {
    const dayOfWeek = current.getDay()
    // 0 = Dimanche, 6 = Samedi
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      jours += 1
    }
    current.setDate(current.getDate() + 1)
  }

  // Ajustement pour les demi-journées
  if (jours > 0) {
    if (demiJourneeDebut === 'apres_midi') jours -= 0.5
    if (demiJourneeFin === 'matin') jours -= 0.5
  }

  return Math.max(0, jours)
}

const STORAGE_KEY_DEMANDES = 'dayoch_demandes_conges_v2'

const INITIAL_DEMANDES = []

export const congesService = {
  // Récupérer toutes les demandes (depuis localStorage ou vide)
  getAllDemandes: () => {
    try {
      localStorage.removeItem('dayoch_demandes_conges_v1')
      const data = localStorage.getItem(STORAGE_KEY_DEMANDES)
      if (data) return JSON.parse(data)
    } catch {
      // Ignorer
    }
    return INITIAL_DEMANDES
  },

  saveDemandes: (demandes) => {
    try {
      localStorage.setItem(STORAGE_KEY_DEMANDES, JSON.stringify(demandes))
    } catch {
      // Ignorer
    }
  },

  // Récupérer les demandes de l'utilisateur connecté
  getMesDemandes: (user) => {
    const all = congesService.getAllDemandes()
    if (!user) return []
    // Match par id ou email ou matricule
    return all.filter(d =>
      d.employeId === user.id ||
      d.employeMatricule === user.matricule ||
      (d.employeNom && d.employeNom.toLowerCase().includes(user.nom?.toLowerCase() || ''))
    )
  },

  // Récupérer les demandes d'équipe à valider (pour manager ou super admin)
  getDemandesAValider: (user) => {
    const all = congesService.getAllDemandes()
    if (!user) return []
    if (user.role === 'super_admin') {
      // Super admin voit toutes les demandes
      return all
    }
    if (user.role === 'manager') {
      // Manager voit sa filiale ou toutes sauf la sienne
      return all.filter(d => d.employeId !== user.id && (d.filiale === user.filiale || !user.filiale))
    }
    return []
  },

  // Créer une nouvelle demande
  creerDemande: (user, data) => {
    const all = congesService.getAllDemandes()
    const nbJours = calculerJoursOuvres(
      data.dateDebut,
      data.dateFin,
      data.demiJourneeDebut,
      data.demiJourneeFin
    )

    const nouvelleDemande = {
      id: Date.now(),
      employeId: user?.id || 99,
      employeNom: `${user?.prenom || ''} ${user?.nom || 'Collaborateur'}`.trim(),
      employePoste: user?.poste || 'Collaborateur',
      employeMatricule: user?.matricule || 'DAY-999',
      filiale: user?.filiale || 'Dayo Bénin',
      typeId: data.typeId,
      dateDebut: data.dateDebut,
      demiJourneeDebut: data.demiJourneeDebut || 'journee',
      dateFin: data.dateFin,
      demiJourneeFin: data.demiJourneeFin || 'journee',
      nbJours,
      motif: data.motif || '',
      pieceJointe: data.pieceJointe || null,
      statut: 'en_attente',
      dateCreation: new Date().toISOString(),
      validateur: null,
      dateValidation: null,
      commentaireRefus: null,
    }

    const updated = [nouvelleDemande, ...all]
    congesService.saveDemandes(updated)
    return nouvelleDemande
  },

  // Valider une demande
  validerDemande: (demandeId, validateurUser) => {
    const all = congesService.getAllDemandes()
    const updated = all.map(d => {
      if (d.id === demandeId) {
        return {
          ...d,
          statut: 'valide',
          validateur: `${validateurUser?.prenom || ''} ${validateurUser?.nom || 'Manager'}`.trim(),
          dateValidation: new Date().toISOString(),
          commentaireRefus: null,
        }
      }
      return d
    })
    congesService.saveDemandes(updated)
    return updated
  },

  // Refuser une demande
  refuserDemande: (demandeId, validateurUser, motifRefus) => {
    const all = congesService.getAllDemandes()
    const updated = all.map(d => {
      if (d.id === demandeId) {
        return {
          ...d,
          statut: 'refuse',
          validateur: `${validateurUser?.prenom || ''} ${validateurUser?.nom || 'Manager'}`.trim(),
          dateValidation: new Date().toISOString(),
          commentaireRefus: motifRefus || 'Non conforme aux nécessités de service',
        }
      }
      return d
    })
    congesService.saveDemandes(updated)
    return updated
  },

  // Annuler une demande
  annulerDemande: (demandeId) => {
    const all = congesService.getAllDemandes()
    const updated = all.map(d => {
      if (d.id === demandeId) {
        return {
          ...d,
          statut: 'annule',
          dateAnnulation: new Date().toISOString(),
        }
      }
      return d
    })
    congesService.saveDemandes(updated)
    return updated
  },

  // Calcul des soldes pour l'utilisateur
  getSoldes: (user) => {
    const mesDemandes = congesService.getMesDemandes(user)
    
    // Total pris par type pour les demandes validées
    const prisCP = mesDemandes
      .filter(d => d.typeId === 'conge_paye' && d.statut === 'valide')
      .reduce((sum, d) => sum + (d.nbJours || 0), 0)

    const prisRTT = mesDemandes
      .filter(d => d.typeId === 'rtt' && d.statut === 'valide')
      .reduce((sum, d) => sum + (d.nbJours || 0), 0)

    const prisMaladie = mesDemandes
      .filter(d => d.typeId === 'maladie' && d.statut === 'valide')
      .reduce((sum, d) => sum + (d.nbJours || 0), 0)

    const enAttenteTotal = mesDemandes
      .filter(d => d.statut === 'en_attente')
      .reduce((sum, d) => sum + (d.nbJours || 0), 0)

    const enAttenteCount = mesDemandes.filter(d => d.statut === 'en_attente').length

    const totalAlloueCP = 26
    const totalAlloueRTT = 6

    return {
      congesPayes: {
        alloue: totalAlloueCP,
        pris: prisCP,
        restant: Math.max(0, totalAlloueCP - prisCP),
      },
      rtt: {
        alloue: totalAlloueRTT,
        pris: prisRTT,
        restant: Math.max(0, totalAlloueRTT - prisRTT),
      },
      maladie: {
        pris: prisMaladie,
      },
      enAttente: {
        totalJours: enAttenteTotal,
        count: enAttenteCount,
      },
    }
  },
}
