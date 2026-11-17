import { useEffect, useState } from 'react';

/**
 * Retarde la propagation d une valeur.
 *
 * Sans cela, taper "kponou" lance six requetes, une par lettre, et les
 * reponses peuvent revenir dans le desordre : le resultat de "kpon"
 * s afficherait apres celui de "kponou".
 *
 * Le `return` de useEffect annule le minuteur precedent : c est lui qui fait
 * tout le travail. Sans ce nettoyage, les minuteurs s accumulent.
 */
export function useDebounce<T>(valeur: T, delaiMs = 350): T {
  const [valeurRetardee, setValeurRetardee] = useState(valeur);

  useEffect(() => {
    const minuteur = setTimeout(() => setValeurRetardee(valeur), delaiMs);
    return () => clearTimeout(minuteur);
  }, [valeur, delaiMs]);

  return valeurRetardee;
}
