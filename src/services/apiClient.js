import axios from 'axios'
import { jetons } from './jetons'

const BASE_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '')

export class ErreurApi extends Error {
  constructor(status, message, code) {
    super(message)
    this.name = 'ErreurApi'
    this.status = status
    this.code = code
  }
}

function messageDepuisCorps(data) {
  if (!data) return null
  if (Array.isArray(data.message)) return data.message.join(' ')
  return data.message || data.error || null
}

export function normaliserErreur(error) {
  if (error instanceof ErreurApi) return error

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data
    return new ErreurApi(
      status,
      messageDepuisCorps(data) || error.message || 'Erreur réseau.',
      data?.code,
    )
  }

  return error instanceof Error ? error : new ErreurApi(0, 'Erreur inconnue.')
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
})

const abonnes = new Set()

export function surSessionPerdue(abonne) {
  abonnes.add(abonne)
  return () => abonnes.delete(abonne)
}

api.interceptors.request.use((config) => {
  const acces = jetons.acces()
  if (acces) config.headers.Authorization = `Bearer ${acces}`

  const filiale = jetons.filiale()
  if (filiale) config.headers['X-Filiale-Id'] = filiale

  return config
})

let rafraichissementEnCours = null

async function rafraichir() {
  const refresh = jetons.refresh()
  if (!refresh) return false

  rafraichissementEnCours ??= (async () => {
    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken: refresh })
      const acces = data.accessToken || data.token
      if (!acces) return false
      jetons.save(acces, data.refreshToken || refresh)
      return true
    } catch {
      return false
    } finally {
      rafraichissementEnCours = null
    }
  })()

  return rafraichissementEnCours
}

export const reprendreSession = () => rafraichir()

api.interceptors.response.use(
  (reponse) => reponse,
  async (echec) => {
    if (!axios.isAxiosError(echec) || !echec.config) throw normaliserErreur(echec)

    const config = echec.config
    const statut = echec.response?.status
    const url = config.url || ''
    const sansRafraichissement = /\/auth\/(login|refresh|logout|2fa\/verifier)/.test(url)

    if (statut === 401 && !config._rejoue && !sansRafraichissement) {
      config._rejoue = true

      if (await rafraichir()) return api.request(config)

      jetons.clear()
      abonnes.forEach((abonne) => abonne())
      throw new ErreurApi(401, 'Session expirée, reconnectez-vous.', 'SESSION_EXPIREE')
    }

    throw normaliserErreur(echec)
  },
)

export function nettoyerParametres(parametres = {}) {
  const propres = {}

  for (const [cle, valeur] of Object.entries(parametres)) {
    if (valeur === undefined || valeur === null || valeur === '') continue
    if (Array.isArray(valeur)) {
      if (valeur.length) propres[cle] = valeur.join(',')
      continue
    }
    propres[cle] = valeur
  }

  return propres
}

export async function lire(chemin, parametres = {}, config = {}) {
  const { data } = await api.get(chemin, {
    ...config,
    params: nettoyerParametres(parametres),
  })
  return data
}

export async function telecharger(chemin, parametres = {}) {
  const reponse = await api.get(chemin, {
    params: nettoyerParametres(parametres),
    responseType: 'blob',
  })

  const url = URL.createObjectURL(reponse.data)
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichierDepuisEnTete(reponse.headers['content-disposition']) || 'export'
  document.body.appendChild(lien)
  lien.click()
  lien.remove()
  URL.revokeObjectURL(url)
}

export async function televerser(chemin, fichier) {
  const formulaire = new FormData()
  formulaire.append('fichier', fichier)
  await api.post(chemin, formulaire)
}

export async function chargerImage(chemin) {
  const reponse = await api.get(chemin, { responseType: 'blob' })
  return URL.createObjectURL(reponse.data)
}

export function nomFichierDepuisEnTete(enTete) {
  if (!enTete) return null
  const correspondance = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(enTete)
  return correspondance?.[1] ? decodeURIComponent(correspondance[1]) : null
}
