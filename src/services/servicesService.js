import { api, lire, telecharger } from './apiClient'
import { exporterTableau } from '../utils/export'

function extraireListe(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.items)) return data.data.items
  for (const cle of ['services', 'resultats', 'results', 'records']) {
    if (Array.isArray(data?.[cle])) return data[cle]
    if (Array.isArray(data?.data?.[cle])) return data.data[cle]
  }
  return []
}

function extraireObjet(data) {
  if (!data || typeof data !== 'object') return {}
  return data.service || data.data || data
}

function texte(valeur) {
  if (valeur === undefined || valeur === null) return undefined
  const t = String(valeur).trim()
  return t ? t : undefined
}

export function normaliserService(brut = {}) {
  if (!brut || typeof brut !== 'object') return brut
  const responsable = brut.responsable && typeof brut.responsable === 'object' ? brut.responsable : null
  const departement = brut.departement && typeof brut.departement === 'object' ? brut.departement : null
  const filiale = brut.filiale && typeof brut.filiale === 'object' ? brut.filiale : null
  const responsableNom = responsable
    ? ([responsable.prenom, responsable.nom].filter(Boolean).join(' ') || responsable.nomComplet || responsable.libelle)
    : (brut.responsableNom || (typeof brut.responsable === 'string' ? brut.responsable : ''))
  const departementNom = departement
    ? (departement.nom || departement.libelle || departement.code)
    : (brut.departementNom || (typeof brut.departement === 'string' ? brut.departement : ''))

  return {
    ...brut,
    id: brut.id ?? brut._id,
    code: brut.code || '',
    nom: brut.nom || brut.libelle || '',
    description: brut.description || '',
    actif: brut.actif !== false,
    responsableId: brut.responsableId ?? responsable?.id ?? null,
    responsableNom: responsableNom || '',
    responsable,
    departementId: brut.departementId ?? departement?.id ?? null,
    departementNom: departementNom || '',
    departement,
    filialeId: brut.filialeId ?? filiale?.id ?? null,
    filialeNom: filiale?.nom || filiale?.libelle || (typeof brut.filiale === 'string' ? brut.filiale : '') || '',
    filiale,
    effectif: brut.effectif ?? brut.nombreAgents ?? brut.nbAgents ?? brut.agentsCount ?? brut.totalAgents ?? null,
  }
}

function normaliserPage(data, filtres = {}) {
  const items = extraireListe(data).map(normaliserService)
  const total = data?.total ?? data?.meta?.total ?? items.length
  const page = (data?.page ?? data?.meta?.page ?? Number(filtres.page)) || 1
  const limit = (data?.limit ?? data?.meta?.limit ?? Number(filtres.limit)) || 20
  const pages = data?.pages ?? data?.meta?.pages ?? Math.max(1, Math.ceil(total / (limit || 1)))
  return { items, total, page, limit, pages }
}

export function parametresServices(filtres = {}) {
  const p = {}
  const q = texte(filtres.q) || texte(filtres.recherche)
  if (q) p.recherche = q
  const sortOrder = texte(filtres.sortOrder)
  if (sortOrder) p.sortOrder = sortOrder

  if (filtres.actif === true || filtres.actif === 'true') p.actif = true
  else if (filtres.actif === false || filtres.actif === 'false') p.actif = false

  if (filtres.sansResponsable === true || filtres.sansResponsable === 'true') p.sansResponsable = true
  else if (filtres.sansResponsable === false || filtres.sansResponsable === 'false') p.sansResponsable = false

  if (filtres.sansAgent === true || filtres.sansAgent === 'true') p.sansAgent = true
  else if (filtres.sansAgent === false || filtres.sansAgent === 'false') p.sansAgent = false

  if (filtres.page) p.page = String(filtres.page)
  if (filtres.limit) p.limit = String(filtres.limit)

  // `filialeId` n'est pas un paramètre de requête accepté par GET /organisation/services ;
  // le filtrage par filiale est géré côté client (ou via le contexte X-Filiale-Id).
  const ids = Array.isArray(filtres.departementIds)
    ? filtres.departementIds.filter(Boolean)
    : texte(filtres.departementIds)
      ? String(filtres.departementIds).split(',').map((v) => v.trim()).filter(Boolean)
      : []
  if (ids.length) p.departementIds = ids.join(',')

  return p
}

function payloadCreation(data) {
  const p = {
    code: texte(data.code)?.toUpperCase(),
    nom: texte(data.nom),
    departementId: texte(data.departementId),
    description: texte(data.description),
    responsableId: texte(data.responsableId),
    filialeId: texte(data.filialeId),
    actif: data.actif !== false,
  }
  Object.keys(p).forEach((k) => { if (p[k] === undefined) delete p[k] })
  return p
}

function payloadModification(data) {
  const p = {
    nom: texte(data.nom),
    description: texte(data.description),
    departementId: texte(data.departementId),
    responsableId: texte(data.responsableId) ?? null,
    actif: data.actif !== false,
  }
  if (data.responsableId === '' || data.responsableId === null) p.responsableId = null
  if (data.description === '') p.description = ''
  Object.keys(p).forEach((k) => { if (p[k] === undefined) delete p[k] })
  return p
}

function colonnesExport() {
  return [
    { cle: 'code', libelle: 'Code' },
    { cle: 'nom', libelle: 'Nom' },
    { cle: 'departement', libelle: 'Département' },
    { cle: 'description', libelle: 'Description' },
    { cle: 'responsable', libelle: 'Responsable' },
    { cle: 'filiale', libelle: 'Filiale' },
    { cle: 'effectif', libelle: 'Effectif' },
    { cle: 'statut', libelle: 'Statut' },
  ]
}

function lignesExport(items) {
  return (items || []).map((s) => ({
    code: s.code || '',
    nom: s.nom || '',
    departement: s.departementNom || '',
    description: s.description || '',
    responsable: s.responsableNom || '',
    filiale: s.filialeNom || '',
    effectif: s.effectif ?? '',
    statut: s.actif === false ? 'Inactif' : 'Actif',
  }))
}

export function messageErreurService(error) {
  const status = error?.response?.status ?? error?.status
  const msg = error?.response?.data?.message || error?.message
  if (Array.isArray(msg)) return msg.join(' ')
  if (msg) return msg
  if (status === 400) return 'Requête invalide. Vérifiez les informations saisies.'
  if (status === 403) return "Vous n'avez pas les droits pour effectuer cette action."
  if (status === 404) return 'Service introuvable.'
  if (status === 409) return 'Conflit : code ou données déjà utilisés.'
  return 'Une erreur est survenue.'
}

export const servicesService = {
  lister: async (filtres = {}) => {
    const data = await lire('/organisation/services', parametresServices(filtres))
    return normaliserPage(data, filtres)
  },

  detail: async (id) => {
    const data = await lire(`/organisation/services/${id}`)
    return normaliserService(extraireObjet(data))
  },

  creer: async (data) => {
    const reponse = await api.post('/organisation/services', payloadCreation(data))
    return normaliserService(extraireObjet(reponse.data))
  },

  modifier: async (id, data) => {
    const reponse = await api.patch(`/organisation/services/${id}`, payloadModification(data))
    return normaliserService(extraireObjet(reponse.data))
  },

  supprimer: async (id) => {
    await api.delete(`/organisation/services/${id}`)
    return true
  },

  exporter: async (filtres = {}, format = 'xlsx') => {
    try {
      await telecharger('/organisation/services/export', { ...parametresServices(filtres), format })
    } catch {
      const page = await servicesService.lister({ ...filtres, page: '1', limit: '200' })
      exporterTableau({
        nom: 'services',
        titre: 'Liste des services',
        colonnes: colonnesExport(),
        lignes: lignesExport(page.items || []),
        format,
      })
    }
  },
}
