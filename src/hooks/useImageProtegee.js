import { useEffect, useState } from 'react'
import { chargerImage } from '../services/apiClient'

const VIDE = { pour: null, url: null, echec: false }

export function useImageProtegee(chemin) {
  const [etat, setEtat] = useState(VIDE)

  useEffect(() => {
    if (!chemin) return undefined

    let annule = false
    let creee = null

    chargerImage(chemin)
      .then((resultat) => {
        if (annule) {
          URL.revokeObjectURL(resultat)
          return
        }
        creee = resultat
        setEtat({ pour: chemin, url: resultat, echec: false })
      })
      .catch(() => {
        if (!annule) setEtat({ pour: chemin, url: null, echec: true })
      })

    return () => {
      annule = true
      if (creee) URL.revokeObjectURL(creee)
    }
  }, [chemin])

  const correspond = chemin !== null && etat.pour === chemin

  return {
    url: correspond ? etat.url : null,
    echec: correspond ? etat.echec : false,
  }
}
