import { lire } from './apiClient'

function tableau(brut) {
  if (Array.isArray(brut)) return brut
  if (Array.isArray(brut?.data)) return brut.data
  if (Array.isArray(brut?.items)) return brut.items
  return []
}

function nombre(valeur, defaut = 0) {
  const n = Number(valeur)
  return Number.isFinite(n) ? n : defaut
}

function texte(valeur, defaut = '') {
  return valeur == null || valeur === '' ? defaut : String(valeur)
}

function normaliserIndicateur(item = {}, index = 0) {
  const cle = texte(item.cle || item.code || item.id || item.key || `indicateur_${index}`).toLowerCase()
  return {
    cle,
    libelle: texte(item.libelle || item.label || item.titre || item.nom || cle),
    valeur: item.valeur ?? item.value ?? item.total ?? item.count ?? 0,
    precision: item.precision ?? item.description ?? item.detail ?? item.sousTitre ?? null,
  }
}

function normaliserModule(item = {}, index = 0) {
  const cle = texte(item.cle || item.code || item.id || item.key || `module_${index}`).toLowerCase()
  const chemin = item.chemin || item.path || item.route || item.url || null
  const disponible = item.disponible ?? item.enabled ?? item.actif ?? Boolean(chemin)
  return {
    cle,
    libelle: texte(item.libelle || item.label || item.titre || item.nom || cle),
    description: texte(item.description || item.sousTitre || item.detail || ''),
    disponible: Boolean(disponible),
    chemin: chemin || '#',
  }
}

function normaliserPoint(item = {}, index = 0) {
  if (typeof item === 'string') {
    return { message: item, niveau: 'info', chemin: null, cle: `point_${index}` }
  }
  return {
    cle: texte(item.cle || item.code || item.id || `point_${index}`),
    message: texte(item.message || item.libelle || item.label || item.description || ''),
    niveau: texte(item.niveau || item.type || item.severite || 'info').toLowerCase(),
    chemin: item.chemin || item.path || item.route || item.lien || null,
  }
}

function normaliserFiliale(item = {}, index = 0) {
  return {
    code: texte(item.code || item.sigle || item.id || `F${index + 1}`),
    nom: texte(item.nom || item.libelle || item.filiale || ''),
    effectif: nombre(item.effectif ?? item.total ?? item.agents ?? item.nbAgents ?? 0),
    avecPhoto: nombre(item.avecPhoto ?? item.photos ?? item.nbPhotos ?? 0),
  }
}

function normaliserTableauDeBord(brut = {}) {
  const data = brut?.data && !Array.isArray(brut.data) ? brut.data : brut

  const indicateursBruts = tableau(data.indicateurs || data.kpis || data.stats || data.metriques)
  const modulesBruts = tableau(data.modules || data.accesRapides || data.raccourcis)
  const pointsBruts = tableau(data.pointsAttention || data.alertes || data.attentions || data.aTraiter)
  const filialesBrutes = tableau(data.effectifParFiliale || data.filiales || data.repartitionFiliales)

  const perimetreBrut = data.perimetre || {}
  const perimetre = typeof perimetreBrut === 'string'
    ? { libelle: perimetreBrut }
    : { libelle: texte(perimetreBrut.libelle || perimetreBrut.label || perimetreBrut.nom || data.perimetreLibelle || '') }

  return {
    perimetre,
    indicateurs: indicateursBruts.map(normaliserIndicateur),
    modules: modulesBruts.map(normaliserModule),
    pointsAttention: pointsBruts.map(normaliserPoint),
    effectifParFiliale: filialesBrutes.map(normaliserFiliale),
  }
}

export const apiPilotage = {
  tableauDeBord: async () => normaliserTableauDeBord(await lire('/pilotage/tableau-de-bord')),

  modules: async () => tableau(await lire('/pilotage/modules')).map(normaliserModule),
}
