import { useContext } from 'react';

import { ContexteAuth } from './contexte';

/** Acces a la session. L erreur explicite vaut mieux qu un null qui se propage. */
export function useAuth() {
  const valeur = useContext(ContexteAuth);

  if (!valeur) {
    throw new Error('useAuth doit etre utilise a l interieur de <FournisseurAuth>.');
  }
  return valeur;
}

/**
 * Perimetre courant, tel qu il doit apparaitre dans les cles de cache.
 *
 * Sans cette valeur dans la cle, le cache de la filiale A serait reaffiche
 * apres un passage a la filiale B : memes filtres, meme cle, donc le cache
 * croit a juste titre connaitre deja la reponse. Les donnees affichees sont
 * vraies, mais ce ne sont pas celles du bon perimetre.
 */
export function usePerimetre(): string {
  return useAuth().filialeCourante ?? 'groupe';
}
