import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useFiltresUrl(valeursParDefaut = {}) {
  const [parametres, setParametres] = useSearchParams()
  const filtres = useMemo(() => {
    const resultat = { ...valeursParDefaut }
    parametres.forEach((valeur, cle) => {
      resultat[cle] = valeur
    })
    return resultat
  }, [parametres, valeursParDefaut])

  const definir = useCallback(
    (cle, valeur) => {
      const suivants = new URLSearchParams(parametres)

      if (valeur === null || valeur === '') suivants.delete(cle)
      else suivants.set(cle, valeur)

      if (cle !== 'page') suivants.delete('page')
      setParametres(suivants, { replace: true })
    },
    [parametres, setParametres],
  )

  const reinitialiser = useCallback(() => setParametres(new URLSearchParams()), [setParametres])

  return { filtres, definir, reinitialiser }
}
