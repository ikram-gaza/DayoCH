/**
 * Service de gestion des utilisateurs - Groupe Dayo
 *
 * Annuaire des collaborateurs et de leurs accès à DayoPI.
 * Les données sont persistées en localStorage en attendant le backend.
 */

import { FILIALES } from '../config/filiales'

export const ROLES_UTILISATEUR = {
  employe: { label: 'Employé', color: '#a16207', bg: '#fef9c3' },
  manager: { label: 'Manager', color: '#16a34a', bg: '#dcfce7' },
  gestionnaire_stock: { label: 'Gestionnaire stock', color: '#7c3aed', bg: '#f3e8ff' },
  super_admin: { label: 'Super administrateur', color: '#007FE1', bg: '#E5F2FD' },
}

export const STATUTS_UTILISATEUR = {
  actif: { label: 'Actif', color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
  inactif: { label: 'Inactif', color: '#57534e', bg: '#f5f5f4', dot: '#a8a29e' },
  suspendu: { label: 'Suspendu', color: '#b91c1c', bg: '#FEF2F1', dot: '#ef4444' },
}

// Filiales proposées + siège (Groupe)
export const FILIALES_UTILISATEUR = [
  { nom: 'Dayo Group', code: 'DG' },
  ...FILIALES.map((f) => ({ nom: f.nom, code: f.code })),
]

const STORAGE_KEY = 'dayoch_utilisateurs_v2'

const INITIAL_UTILISATEURS = []

function lireTout() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) return JSON.parse(data)
  } catch {
    // Ignorer
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_UTILISATEURS))
  return INITIAL_UTILISATEURS
}

function ecrireTout(liste) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(liste))
  } catch {
    // Ignorer
  }
}

const nomComplet = (u) => `${u.prenom || ''} ${u.nom || ''}`.trim()

function genererMatricule(liste, filiale) {
  const config = FILIALES_UTILISATEUR.find((f) => f.nom === filiale)
  const prefix = config?.code || 'DAY'
  const numeros = liste
    .filter((u) => u.matricule?.startsWith(`${prefix}-`))
    .map((u) => parseInt(u.matricule.split('-')[1], 10))
    .filter((n) => !Number.isNaN(n))
  const suivant = (numeros.length ? Math.max(...numeros) : 0) + 1
  return `${prefix}-${String(suivant).padStart(3, '0')}`
}

export const utilisateursService = {
  getAll: () => lireTout(),

  getById: (id) => lireTout().find((u) => u.id === id) || null,

  // Équipe d'un manager : ses rattachements directs, sinon sa filiale
  getEquipe: (manager) => {
    const liste = lireTout()
    if (!manager) return []
    const autres = liste.filter((u) => u.id !== manager.id)
    if (manager.role === 'super_admin') return autres
    const directs = autres.filter((u) => u.managerId === manager.id)
    if (directs.length > 0) return directs
    return autres.filter((u) => u.filiale === manager.filiale)
  },

  emailExiste: (email, excludeId = null) => {
    const cible = email?.trim().toLowerCase()
    if (!cible) return false
    return lireTout().some((u) => u.email?.toLowerCase() === cible && u.id !== excludeId)
  },

  creerUtilisateur: (data) => {
    const liste = lireTout()
    const maintenant = new Date().toISOString()
    const nouvel = {
      id: Date.now(),
      nom: data.nom?.trim().toUpperCase(),
      prenom: data.prenom?.trim(),
      email: data.email?.trim().toLowerCase(),
      telephone: data.telephone?.trim() || '',
      matricule: data.matricule?.trim() || genererMatricule(liste, data.filiale),
      role: data.role || 'employe',
      filiale: data.filiale || FILIALES_UTILISATEUR[1].nom,
      managerId: data.managerId ?? null,
      poste: data.poste?.trim() || 'Collaborateur',
      statut: data.statut || 'actif',
      twoFactorEnabled: Boolean(data.twoFactorEnabled),
      dateEmbauche: data.dateEmbauche || maintenant.slice(0, 10),
      dateCreation: maintenant,
      dernierAcces: null,
    }
    ecrireTout([nouvel, ...liste])
    return nouvel
  },

  modifierUtilisateur: (id, updates) => {
    const liste = lireTout()
    const misAJour = liste.map((u) => {
      if (u.id !== id) return u
      return {
        ...u,
        ...updates,
        nom: updates.nom ? updates.nom.trim().toUpperCase() : u.nom,
        prenom: updates.prenom ? updates.prenom.trim() : u.prenom,
        email: updates.email ? updates.email.trim().toLowerCase() : u.email,
        matricule: updates.matricule?.trim() || u.matricule,
        poste: updates.poste?.trim() || u.poste,
        dateModification: new Date().toISOString(),
      }
    })
    ecrireTout(misAJour)
    return misAJour
  },

  changerStatut: (id, statut) => {
    const liste = lireTout()
    const misAJour = liste.map((u) => (u.id === id ? { ...u, statut } : u))
    ecrireTout(misAJour)
    return misAJour
  },

  basculer2FA: (id) => {
    const liste = lireTout()
    const misAJour = liste.map((u) =>
      u.id === id ? { ...u, twoFactorEnabled: !u.twoFactorEnabled } : u
    )
    ecrireTout(misAJour)
    return misAJour
  },

  supprimerUtilisateur: (id) => {
    const misAJour = lireTout().filter((u) => u.id !== id)
    ecrireTout(misAJour)
    return misAJour
  },

  // Simulation : aucun mot de passe n'est stocké côté front
  reinitialiserMotDePasse: () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let motDePasse = ''
    for (let i = 0; i < 10; i += 1) {
      motDePasse += alphabet[Math.floor(Math.random() * alphabet.length)]
    }
    return motDePasse
  },

  getStats: (liste = lireTout()) => {
    return {
      total: liste.length,
      actifs: liste.filter((u) => u.statut === 'actif').length,
      inactifs: liste.filter((u) => u.statut !== 'actif').length,
      deuxFA: liste.filter((u) => u.twoFactorEnabled).length,
      managers: liste.filter((u) => u.role === 'manager' || u.role === 'super_admin').length,
    }
  },

  getNomComplet: nomComplet,
}
