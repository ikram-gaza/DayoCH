import { api } from './apiClient'
import { FILIALES } from '../config/filiales'

const COULEURS = ['#007FE1', '#52784D', '#F24333', '#E1007F', '#7c3aed', '#0f766e']

function extraireListe(data) {
  if (Array.isArray(data)) return data
  const source = data?.data ?? data
  if (Array.isArray(source)) return source
  for (const cle of ['items', 'filiales', 'resultats', 'results', 'records']) {
    if (Array.isArray(source?.[cle])) return source[cle]
  }
  return []
}

function extraireObjet(data) {
  if (!data || typeof data !== 'object') return {}
  return data.filiale || data.data || data
}

function couleurPour(codeOuIndex) {
  if (typeof codeOuIndex === 'number') return COULEURS[codeOuIndex % COULEURS.length]
  const somme = [...String(codeOuIndex || '')].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return COULEURS[somme % COULEURS.length]
}

export function normaliserFiliale(brut = {}, index = 0) {
  const code = brut.code || ''
  const config = FILIALES.find((f) => f.code === code || f.id === brut.id || f.nom === brut.nom)
  return {
    ...brut,
    id: brut.id ?? brut._id ?? config?.id ?? code ?? `filiale-${index}`,
    code,
    nom: brut.nom || brut.libelle || config?.nom || '',
    pays: brut.pays || config?.pays || '',
    ville: brut.ville || config?.ville || '',
    adresse: brut.adresse || '',
    telephone: brut.telephone || '',
    email: brut.email || '',
    raisonSociale: brut.raisonSociale || '',
    devise: brut.devise || '',
    timezone: brut.timezone || '',
    parentId: brut.parentId ?? null,
    actif: brut.actif !== false,
    dateOuverture: brut.dateOuverture || brut.dateCreation || config?.dateOuverture || '',
    couleur: brut.couleur || config?.couleur || couleurPour(code || index),
  }
}

function payload(data) {
  const p = {
    code: data.code?.trim().toUpperCase(),
    nom: data.nom?.trim(),
    pays: data.pays?.trim(),
    ville: data.ville?.trim() || undefined,
    adresse: data.adresse?.trim() || undefined,
    telephone: data.telephone?.trim() || undefined,
    email: data.email?.trim() || undefined,
    raisonSociale: data.raisonSociale?.trim() || undefined,
    devise: data.devise?.trim() || undefined,
    timezone: data.timezone?.trim() || undefined,
    parentId: data.parentId || undefined,
    actif: data.actif !== false,
  }
  Object.keys(p).forEach((k) => { if (p[k] === undefined || p[k] === '') delete p[k] })
  return p
}

export const filialesService = {
  isMock: false,

  lister: async () => {
    const { data } = await api.get('/filiales', { params: { sortBy: 'code', sortOrder: 'ASC', limit: 100 } })
    return extraireListe(data).map((f, i) => normaliserFiliale(f, i))
  },

  creer: async (data) => {
    const { data: reponse } = await api.post('/filiales', payload(data))
    return normaliserFiliale(extraireObjet(reponse))
  },

  modifier: async (id, data) => {
    const p = payload(data)
    delete p.code
    const { data: reponse } = await api.patch(`/filiales/${id}`, p)
    return normaliserFiliale(extraireObjet(reponse))
  },

  archiver: async (id) => {
    await api.delete(`/filiales/${id}`)
    return true
  },
}

export function messageErreurFiliale(error) {
  const data = error?.response?.data
  const message = data?.message || data?.error || error?.message
  return Array.isArray(message) ? message.join(' ') : message || 'Une erreur est survenue.'
}
