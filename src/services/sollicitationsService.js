/**
 * Service de gestion des Sollicitations IT - Groupe Dayo
 *
 * Les sollicitations couvrent les demandes d'assistance technique
 * adressées à l'équipe informatique / DSI.
 * Données persistées en localStorage en attendant le backend.
 */

export const TYPES_SOLLICITATIONS = [
  {
    id: 'materiel_panne',
    label: 'Panne matériel',
    code: 'MAT',
    color: '#dc2626',
    bg: '#FEF2F1',
    delaiJours: 1,
    requiresJustificatif: false,
    description: 'Ordinateur, écran, clavier, souris, imprimante ou autre équipement défaillant.',
  },
  {
    id: 'acces_compte',
    label: 'Accès / compte / mot de passe',
    code: 'ACC',
    color: '#7c3aed',
    bg: '#f3e8ff',
    delaiJours: 1,
    requiresJustificatif: false,
    description: 'Problème de connexion, compte bloqué, réinitialisation de mot de passe, droits d’accès.',
  },
  {
    id: 'reseau_connexion',
    label: 'Réseau / connexion',
    code: 'NET',
    color: '#007FE1',
    bg: '#E5F2FD',
    delaiJours: 1,
    requiresJustificatif: false,
    description: 'Wi-Fi, internet, VPN, lenteur réseau ou impossibilité d’accéder aux ressources.',
  },
  {
    id: 'logiciel_application',
    label: 'Logiciel / application',
    code: 'APP',
    color: '#16a34a',
    bg: '#dcfce7',
    delaiJours: 2,
    requiresJustificatif: false,
    description: 'Bug applicatif, erreur logiciel, installation, mise à jour ou configuration.',
  },
  {
    id: 'messagerie',
    label: 'Messagerie / collaboration',
    code: 'MSG',
    color: '#0891b2',
    bg: '#cffafe',
    delaiJours: 1,
    requiresJustificatif: false,
    description: 'Email, Teams/Outlook, calendrier, partage de fichiers ou outils collaboratifs.',
  },
  {
    id: 'securite_incident',
    label: 'Sécurité / incident',
    code: 'SEC',
    color: '#b91c1c',
    bg: '#fee2e2',
    delaiJours: 0,
    requiresJustificatif: false,
    description: 'Phishing, virus, activité suspecte, perte de données ou incident de sécurité.',
  },
  {
    id: 'demande_equipement',
    label: 'Demande d’équipement / installation',
    code: 'EQP',
    color: '#a16207',
    bg: '#fef9c3',
    delaiJours: 3,
    requiresJustificatif: true,
    description: 'Nouvel équipement, périphérique, installation de poste ou besoin matériel.',
  },
  {
    id: 'autre',
    label: 'Autre demande IT',
    code: 'AUT',
    color: '#57534e',
    bg: '#f5f5f4',
    delaiJours: 3,
    requiresJustificatif: false,
    description: 'Toute autre demande technique à traiter par la DSI.',
  },
]

export const STATUTS_SOLLICITATIONS = {
  en_attente: { label: 'En attente', color: '#a16207', bg: '#fef9c3', dot: '#eab308' },
  en_cours: { label: 'En cours', color: '#007FE1', bg: '#E5F2FD', dot: '#007FE1' },
  approuvee: { label: 'Approuvée', color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
  traitee: { label: 'Résolue', color: '#0f766e', bg: '#ccfbf1', dot: '#14b8a6' },
  refusee: { label: 'Refusée', color: '#b91c1c', bg: '#FEF2F1', dot: '#ef4444' },
  annulee: { label: 'Annulée', color: '#57534e', bg: '#f5f5f4', dot: '#a8a29e' },
}

export const PRIORITES_SOLLICITATIONS = {
  basse: { label: 'Basse', color: '#57534e', bg: '#f5f5f4', weight: 1 },
  normale: { label: 'Normale', color: '#007FE1', bg: '#E5F2FD', weight: 2 },
  haute: { label: 'Haute', color: '#b91c1c', bg: '#FEF2F1', weight: 3 },
}

const STORAGE_KEY = 'dayoch_sollicitations_it_v1'
const LEGACY_STORAGE_KEY = 'dayoch_sollicitations_v2'

const INITIAL_SOLLICITATIONS = []

function lireTout() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy) {
      // Ne pas réutiliser les anciennes données RH : démarrer un espace IT propre.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SOLLICITATIONS))
      return INITIAL_SOLLICITATIONS
    }
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

  creerSollicitation: (user, data) => {
    const toutes = lireTout()
    const annee = new Date().getFullYear()
    const numero = toutes.filter((s) => s.reference?.includes(`IT-${annee}`)).length + 1

    const nouvelle = {
      id: Date.now(),
      reference: `IT-${annee}-${String(numero).padStart(3, '0')}`,
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

  getStats: (user) => statsSollicitationsDe(lireTout(), user),
}
