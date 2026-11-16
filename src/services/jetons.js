const REFRESH_KEY = 'dayopi.refreshToken'
const FILIALE_KEY = 'dayopi.filialeCourante'

let accessToken = null

function lire(cle) {
  try {
    return localStorage.getItem(cle)
  } catch {
    return null
  }
}

function ecrire(cle, valeur) {
  try {
    if (valeur === null) localStorage.removeItem(cle)
    else localStorage.setItem(cle, valeur)
  } catch {
    /* stockage indisponible */
  }
}

export const jetons = {
  acces: () => accessToken,
  refresh: () => lire(REFRESH_KEY),

  save(acces, refresh) {
    accessToken = acces || null
    ecrire(REFRESH_KEY, refresh || null)
  },

  setAcces(acces) {
    accessToken = acces || null
  },

  clear() {
    accessToken = null
    ecrire(REFRESH_KEY, null)
  },

  filiale: () => lire(FILIALE_KEY),

  setFiliale(id) {
    ecrire(FILIALE_KEY, id || null)
  },
}
