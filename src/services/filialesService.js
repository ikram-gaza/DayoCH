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

function texte(valeur) {
  if (valeur === undefined || valeur === null) return undefined
  const t = String(valeur).trim()
  return t ? t : undefined
}

export function normaliserFiliale(brut = {}, index = 0) {
  const code = brut.code || ''
  const config = FILIALES.find((f) => f.code === code || f.id === brut.id || f.nom === brut.nom)
  const identifiants =
    brut.identifiants && typeof brut.identifiants === 'object' && !Array.isArray(brut.identifiants)
      ? brut.identifiants
      : null

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
    identifiants,
    parentId: brut.parentId ?? null,
    actif: brut.actif !== false,
    dateOuverture: brut.dateOuverture || brut.dateCreation || brut.createdAt || config?.dateOuverture || '',
    couleur: brut.couleur || config?.couleur || couleurPour(code || index),
  }
}

export function parametresFiliales(filtres = {}) {
  const p = {}

  const q = texte(filtres.q)
  const recherche = texte(filtres.recherche)
  const devise = texte(filtres.devise)
  const parentId = texte(filtres.parentId)
  const sortOrder = texte(filtres.sortOrder)

  if (q) p.q = q
  if (recherche) p.recherche = recherche
  if (devise) p.devise = devise
  if (parentId) p.parentId = parentId
  if (sortOrder) p.sortOrder = sortOrder

  const paysBrut = filtres.pays
  const pays = Array.isArray(paysBrut)
    ? paysBrut.map((v) => texte(v)).filter(Boolean)
    : texte(paysBrut)
      ? String(paysBrut).split(',').map((v) => v.trim()).filter(Boolean)
      : []
  if (pays.length) p.pays = pays

  if (filtres.actif === true || filtres.actif === 'true') p.actif = true
  else if (filtres.actif === false || filtres.actif === 'false') p.actif = false

  if (filtres.racinesSeulement === true || filtres.racinesSeulement === 'true') p.racinesSeulement = true
  else if (filtres.racinesSeulement === false || filtres.racinesSeulement === 'false') p.racinesSeulement = false

  return p
}

function payload(data) {
  const p = {
    code: texte(data.code)?.toUpperCase(),
    nom: texte(data.nom),
    pays: texte(data.pays),
    ville: texte(data.ville),
    adresse: texte(data.adresse),
    telephone: texte(data.telephone),
    email: texte(data.email),
    raisonSociale: texte(data.raisonSociale),
    devise: texte(data.devise),
    timezone: texte(data.timezone),
    parentId: texte(data.parentId),
    actif: data.actif !== false,
  }

  if (data.identifiants && typeof data.identifiants === 'object' && !Array.isArray(data.identifiants) && Object.keys(data.identifiants).length > 0) {
    p.identifiants = data.identifiants
  }

  Object.keys(p).forEach((k) => {
    if (p[k] === undefined) delete p[k]
  })
  return p
}

function nomFichierDepuisEnTete(enTete) {
  if (!enTete) return null
  const correspondance = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(enTete)
  return correspondance?.[1] ? decodeURIComponent(correspondance[1]) : null
}

export const filialesService = {
  isMock: false,

  lister: async (filtres = {}) => {
    const { data } = await api.get('/filiales', {
      params: { sortOrder: 'ASC', ...parametresFiliales(filtres) },
      paramsSerializer: { indexes: null },
    })
    return extraireListe(data).map((f, i) => normaliserFiliale(f, i))
  },

  detail: async (id) => {
    const { data } = await api.get(`/filiales/${id}`)
    return normaliserFiliale(extraireObjet(data))
  },

  exporter: async (filtres = {}, format = 'xlsx') => {
    const reponse = await api.get('/filiales/export', {
      params: { sortOrder: 'ASC', ...parametresFiliales(filtres), format },
      paramsSerializer: { indexes: null },
      responseType: 'blob',
    })

    const url = URL.createObjectURL(reponse.data)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = nomFichierDepuisEnTete(reponse.headers?.['content-disposition']) || `filiales.${format}`
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    URL.revokeObjectURL(url)
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
