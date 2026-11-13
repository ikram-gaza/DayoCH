/**
 * Service de gestion des Sollicitations RH - Groupe Dayo
 *
 * Les sollicitations couvrent les demandes diverses des collaborateurs :
 * attestations, avances, ordres de mission, formations, etc.
 * Les données sont persistées en localStorage en attendant le backend.
 */

export const TYPES_SOLLICITATIONS = [
  {
    id: 'attestation_travail',
    label: 'Attestation de travail',
    code: 'ATT',
    color: '#007FE1',
    bg: '#E5F2FD',
    delaiJours: 2,
    requiresJustificatif: false,
    description: 'Justificatif d\'emploi pour démarches administratives ou bancaires.',
  },
  {
    id: 'attestation_salaire',
    label: 'Attestation de salaire',
    code: 'SAL',
    color: '#7c3aed',
    bg: '#f3e8ff',
    delaiJours: 3,
    requiresJustificatif: false,
    description: 'Document attestant de la rémunération pour un dossier de crédit.',
  },
  {
    id: 'avance_salaire',
    label: 'Avance sur salaire',
    code: 'AVS',
    color: '#16a34a',
    bg: '#dcfce7',
    delaiJours: 5,
    requiresJustificatif: true,
    description: 'Demande d\'avance exceptionnelle sur la paie du mois en cours.',
  },
  {
    id: 'ordre_mission',
    label: 'Ordre de mission',
    code: 'MIS',
    color: '#a16207',
    bg: '#fef9c3',
    delaiJours: 2,
    requiresJustificatif: false,
    description: 'Autorisation de déplacement professionnel avec prise en charge.',
  },
  {
    id: 'demande_formation',
    label: 'Demande de formation',
    code: 'FOR',
    color: '#db2777',
    bg: '#fce7f3',
    delaiJours: 7,
    requiresJustificatif: true,
    description: 'Inscription à une formation interne ou externe financée par Dayo.',
  },
  {
    id: 'autre',
    label: 'Autre demande',
    code: 'AUT',
    color: '#57534e',
    bg: '#f5f5f4',
    delaiJours: 5,
    requiresJustificatif: false,
    description: 'Toute autre demande à traiter par les services RH.',
  },
]

export const STATUTS_SOLLICITATIONS = {
  en_attente: { label: 'En attente', color: '#a16207', bg: '#fef9c3', dot: '#eab308' },
  en_cours: { label: 'En cours', color: '#007FE1', bg: '#E5F2FD', dot: '#007FE1' },
  approuvee: { label: 'Approuvée', color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
  traitee: { label: 'Traitée', color: '#0f766e', bg: '#ccfbf1', dot: '#14b8a6' },
  refusee: { label: 'Refusée', color: '#b91c1c', bg: '#FEF2F1', dot: '#ef4444' },
  annulee: { label: 'Annulée', color: '#57534e', bg: '#f5f5f4', dot: '#a8a29e' },
}

export const PRIORITES_SOLLICITATIONS = {
  basse: { label: 'Basse', color: '#57534e', bg: '#f5f5f4', weight: 1 },
  normale: { label: 'Normale', color: '#007FE1', bg: '#E5F2FD', weight: 2 },
  haute: { label: 'Haute', color: '#b91c1c', bg: '#FEF2F1', weight: 3 },
}

const STORAGE_KEY = 'dayoch_sollicitations_v2'

const INITIAL_SOLLICITATIONS = []

function lireTout() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch {
    // Ignorer
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SOLLICITATIONS))
  return INITIAL_SOLLICITATIONS
}

function ecrireTout(liste) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(liste))
  } catch {
    // Ignorer
  }
}

const nomComplet = (user) => `${user?.prenom || ''} ${user?.nom || 'Collaborateur'}`.trim()

const estProprietaire = (sollicitation, user) => {
  if (!user) return false
  return (
    sollicitation.employeId === user.id ||
    sollicitation.employeMatricule === user.matricule ||
    (sollicitation.employeNom && sollicitation.employeNom.toLowerCase().includes(user.nom?.toLowerCase() || ''))
  )
}

// ── Sélecteurs purs (utiles pour dériver depuis un état local) ──
export function mesSollicitationsDe(liste, user) {
  if (!user) return []
  return liste.filter((s) => estProprietaire(s, user))
}

export function sollicitationsATraiterDe(liste, user) {
  if (!user) return []
  const enCoursDeTraitement = ['en_attente', 'en_cours']
  const aTraiter = liste.filter(
    (s) => enCoursDeTraitement.includes(s.statut) && !estProprietaire(s, user)
  )

  if (user.role === 'super_admin') return aTraiter
  if (user.role === 'manager') {
    return aTraiter.filter((s) => s.filiale === user.filiale || !user.filiale)
  }
  return []
}

export function statsSollicitationsDe(liste, user) {
  const source = user?.role === 'super_admin' || user?.role === 'manager'
    ? liste.filter((s) => user.role === 'super_admin' || s.filiale === user.filiale || !user.filiale)
    : mesSollicitationsDe(liste, user)

  const compter = (statuts) => source.filter((s) => statuts.includes(s.statut)).length

  return {
    total: source.length,
    enAttente: compter(['en_attente']),
    enCours: compter(['en_cours']),
    traitees: compter(['approuvee', 'traitee']),
    refusees: compter(['refusee']),
  }
}

export const sollicitationsService = {
  // ── LECTURE ──
  getAll: () => lireTout(),

  getMesSollicitations: (user) => mesSollicitationsDe(lireTout(), user),

  getATraiter: (user) => sollicitationsATraiterDe(lireTout(), user),

  getHistoriqueEquipe: (user) => {
    if (!user || (user.role !== 'manager' && user.role !== 'super_admin')) return []
    const toutes = lireTout().filter((s) => !estProprietaire(s, user))
    if (user.role === 'super_admin') return toutes
    return toutes.filter((s) => s.filiale === user.filiale || !user.filiale)
  },

  getById: (id) => lireTout().find((s) => s.id === id) || null,

  // ── CRÉATION ──
  creerSollicitation: (user, data) => {
    const toutes = lireTout()
    const annee = new Date().getFullYear()
    const numero = toutes.filter((s) => s.reference?.includes(`SOL-${annee}`)).length + 1

    const nouvelle = {
      id: Date.now(),
      reference: `SOL-${annee}-${String(numero).padStart(3, '0')}`,
      typeId: data.typeId,
      objet: data.objet?.trim(),
      description: data.description?.trim() || '',
      priorite: data.priorite || 'normale',
      employeId: user?.id || 99,
      employeNom: nomComplet(user),
      employePoste: user?.poste || 'Collaborateur',
      employeMatricule: user?.matricule || 'DAY-999',
      filiale: user?.filiale || 'Dayo Bénin',
      dateCreation: new Date().toISOString(),
      dateSouhaitee: data.dateSouhaitee || null,
      statut: 'en_attente',
      traitePar: null,
      dateTraitement: null,
      commentaireTraitement: null,
      pieceJointe: data.pieceJointe || null,
      historique: [
        { date: new Date().toISOString(), action: 'creation', auteur: nomComplet(user) },
      ],
    }

    ecrireTout([nouvelle, ...toutes])
    return nouvelle
  },

  // ── TRAITEMENT ──
  changerStatut: (id, nouveauStatut, user, commentaire = null) => {
    const toutes = lireTout()
    const auteur = nomComplet(user)
    const maintenant = new Date().toISOString()

    const actionParStatut = {
      en_cours: 'prise_en_charge',
      approuvee: 'approbation',
      traitee: 'cloture',
      refusee: 'refus',
    }

    const misesAJour = toutes.map((s) => {
      if (s.id !== id) return s

      const statutActuel = STATUTS_SOLLICITATIONS[nouveauStatut]
      const entree = {
        date: maintenant,
        action: actionParStatut[nouveauStatut] || 'modification',
        auteur,
      }
      if (commentaire) entree.commentaire = commentaire

      return {
        ...s,
        statut: nouveauStatut,
        traitePar: auteur,
        dateTraitement: statutActuel ? maintenant : s.dateTraitement,
        commentaireTraitement: commentaire ?? s.commentaireTraitement,
        historique: [...(s.historique || []), entree],
      }
    })

    ecrireTout(misesAJour)
    return misesAJour
  },

  annuler: (id, user) => {
    const toutes = lireTout()
    const maintenant = new Date().toISOString()
    const misesAJour = toutes.map((s) => {
      if (s.id !== id) return s
      return {
        ...s,
        statut: 'annulee',
        historique: [
          ...(s.historique || []),
          { date: maintenant, action: 'annulation', auteur: nomComplet(user) },
        ],
      }
    })
    ecrireTout(misesAJour)
    return misesAJour
  },

  // ── STATISTIQUES ──
  getStats: (user) => statsSollicitationsDe(lireTout(), user),
}
