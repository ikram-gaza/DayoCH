import { useEffect, useState } from 'react'

export function useDebounce(valeur, delaiMs = 350) {
  const [valeurRetardee, setValeurRetardee] = useState(valeur)

  useEffect(() => {
    const minuteur = setTimeout(() => setValeurRetardee(valeur), delaiMs)
    return () => clearTimeout(minuteur)
  }, [valeur, delaiMs])

  return valeurRetardee
}
