import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export type Filtres = Record<string, string>;

/**
 * Les filtres vivent dans l URL, pas dans un useState.
 *
 * Trois consequences concretes :
 *  - la page filtree se partage par copier-coller du lien ;
 *  - le bouton Precedent revient au filtre precedent ;
 *  - un rechargement conserve la recherche en cours.
 *
 * L URL devient la source de verite, React n en est que le reflet.
 */
export function useFiltresUrl(valeursParDefaut: Filtres = {}) {
  const [parametres, setParametres] = useSearchParams();

  // La dependance porte sur la CHAINE : l objet URLSearchParams change
  // d identite a chaque rendu, pas son contenu. On extrait la chaine ici,
  // car une liste de dependances n accepte que des expressions simples.
  const chaineParametres = parametres.toString();

  const filtres = useMemo<Filtres>(() => {
    const resultat: Filtres = { ...valeursParDefaut };
    parametres.forEach((valeur, cle) => {
      resultat[cle] = valeur;
    });
    return resultat;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaineParametres]);

  /** Modifie un filtre et revient page 1 : sinon on reste sur une page vide. */
  const definir = useCallback(
    (cle: string, valeur: string | null) => {
      const suivants = new URLSearchParams(parametres);

      if (valeur === null || valeur === '') suivants.delete(cle);
      else suivants.set(cle, valeur);

      if (cle !== 'page') suivants.delete('page');
      setParametres(suivants, { replace: true });
    },
    [parametres, setParametres],
  );

  const reinitialiser = useCallback(() => setParametres(new URLSearchParams()), [setParametres]);

  return { filtres, definir, reinitialiser };
}
