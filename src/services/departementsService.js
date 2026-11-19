import { api, lire, telecharger } from './apiClient'
import { exporterTableau } from '../utils/export'

function extraireListe(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.data?.items)) return data.data.items
  for (const cle of ['departements', 'resultats', 'results', 'records']) {
    if (Array.isArray(data?.[cle])) return data[cle]
    if (Array.isArray(data?.data?.[cle])) return data.data[cle]
  }
  return []
}

function extraireObjet(data) {
  if (!data || typeof data !== 'object') return {}
  return data.departement || data.data || data
}

function normaliserPage(data, filtres = {}) {
  const items = extraireListe(data).map(normaliserDepartement)
  const total = data?.total ?? data?.meta?.total ?? items.length
  const page = (data?.page ?? data?.meta?.page ?? Number(filtres.page)) || 1
  const limit = (data?.limit ?? data?.meta?.limit ?? Number(filtres.limit)) || 20
  const pages = data?.pages ?? data?.meta?.pages ?? Math.max(1, Math.ceil(total / (limit || 1)))
  return { items, total, page, limit, pages }
}

function texte(valeur) {
  if (valeur === undefined || valeur === null) return undefined
  const t = String(valeur).trim()
  return t ? t : undefined
}

export function normaliserDepartement(brut = {}) {
  if (!brut || typeof brut !== 'object') return brut
  const responsable = brut.responsable && typeof brut.responsable === 'object' ? brut.responsable : null
  const filiale = brut.filiale && typeof brut.filiale === 'object' ? brut.filiale : null
  const responsableNom = responsable
    ? ([responsable.prenom, responsable.nom].filter(Boolean).join(' ') || responsable.nomComplet || responsable.libelle)
    : (brut.responsableNom || (typeof brut.responsable === 'string' ? brut.responsable : ''))

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
    filialeId: brut.filialeId ?? filiale?.id ?? null,
    filialeNom: filiale?.nom || filiale?.libelle || (typeof brut.filiale === 'string' ? brut.filiale : '') || '',
    filiale,
    effectif: brut.effectif ?? brut.nombreAgents ?? brut.nbAgents ?? brut.agentsCount ?? brut.totalAgents ?? null,
  }
}

export function parametresDepartements(filtres = {}) {
  const p = {}
  const q = texte(filtres.q) || texte(filtres.recherche)
  if (q) p.recherche = q
  const sortOrder = texte(filtres.sortOrder)
  if (sortOrder) p.sortOrder = sortOrder

  if (filtres.actif === true || filtres.actif === 'true') p.actif = true
  else if (filtres.actif === false || filtres.actif === 'false') p.actif = false

  if (filtres.sansResponsable === true || filtres.sansResponsable === 'true') p.sansResponsable = true
  else if (filtres.sansResponsable === false || filtres.sansResponsable === 'false') p.sansResponsable = false

  if (filtres.avecEffectifs === true || filtres.avecEffectifs === 'true') p.avecEffectifs = true
  else if (filtres.avecEffectifs === false || filtres.avecEffectifs === 'false') p.avecEffectifs = false

  if (filtres.page) p.page = String(filtres.page)
  if (filtres.limit) p.limit = String(filtres.limit)

  const ids = Array.isArray(filtres.ids)
    ? filtres.ids.filter(Boolean)
    : texte(filtres.ids)
      ? String(filtres.ids).split(',').map((v) => v.trim()).filter(Boolean)
      : []
  if (ids.length) p.ids = ids.join(',')

  return p
}

function payloadCreation(data) {
  const p = {
    code: texte(data.code)?.toUpperCase(),
    nom: texte(data.nom),
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
    responsableId: texte(data.responsableId) ?? null,
    actif: data.actif !== false,
  }
  // permettre de vider responsable/description si explicitement demandé
  if (data.responsableId === '' || data.responsableId === null) p.responsableId = null
  if (data.description === '') p.description = ''
  Object.keys(p).forEach((k) => { if (p[k] === undefined) delete p[k] })
  return p
}

function colonnesExport() {
  return [
    { cle: 'code', libelle: 'Code' },
    { cle: 'nom', libelle: 'Nom' },
    { cle: 'description', libelle: 'Description' },
    { cle: 'responsable', libelle: 'Responsable' },
    { cle: 'filiale', libelle: 'Filiale' },
    { cle: 'effectif', libelle: 'Effectif' },
    { cle: 'statut', libelle: 'Statut' },
  ]
}

function lignesExport(items) {
  return (items || []).map((d) => ({
    code: d.code || '',
    nom: d.nom || '',
    description: d.description || '',
    responsable: d.responsableNom || '',
    filiale: d.filialeNom || '',
    effectif: d.effectif ?? '',
    statut: d.actif === false ? 'Inactif' : 'Actif',
  }))
}

export function messageErreurDepartement(error) {
  const status = error?.response?.status ?? error?.status
  const msg = error?.response?.data?.message || error?.message
  if (Array.isArray(msg)) return msg.join(' ')
  if (msg) return msg
  if (status === 400) return 'Requête invalide. Vérifiez les informations saisies.'
  if (status === 403) return "Vous n'avez pas les droits pour effectuer cette action."
  if (status === 404) return 'Département introuvable.'
  if (status === 409) return 'Conflit : code ou données déjà utilisés.'
  return 'Une erreur est survenue.'
}

export const departementsService = {
  lister: async (filtres = {}) => {
    const data = await lire('/organisation/departements', parametresDepartements(filtres))
    return normaliserPage(data, filtres)
  },

  detail: async (id) => {
    const data = await lire(`/organisation/departements/${id}`)
    return normaliserDepartement(extraireObjet(data))
  },

  creer: async (data) => {
    const reponse = await api.post('/organisation/departements', payloadCreation(data))
    return normaliserDepartement(extraireObjet(reponse.data))
  },

  modifier: async (id, data) => {
    const reponse = await api.patch(`/organisation/departements/${id}`, payloadModification(data))
    return normaliserDepartement(extraireObjet(reponse.data))
  },

  supprimer: async (id) => {
    await api.delete(`/organisation/departements/${id}`)
    return true
  },

  exporter: async (filtres = {}, format = 'xlsx') => {
    try {
      await telecharger('/organisation/departements/export', { ...parametresDepartements(filtres), format })
    } catch {
      const page = await departementsService.lister({ ...filtres, page: '1', limit: '200' })
      exporterTableau({
        nom: 'departements',
        titre: 'Liste des départements',
        colonnes: colonnesExport(),
        lignes: lignesExport(page.items || []),
        format,
      })
    }
  },
}
