import { QueryClient } from '@tanstack/react-query';

import { ErreurApi } from '@/shared/api/erreurs';

/**
 * Cache des donnees du serveur.
 *
 * Pourquoi cette dependance alors que la pile annoncee ne mentionnait
 * qu Axios ? Parce que les deux ne font pas le meme travail et ne se
 * remplacent pas :
 *
 *   Axios          TRANSPORTE la requete (en-tetes, jetons, erreurs)
 *   React Query    MEMORISE la reponse (cache, invalidation, etats)
 *
 * Sans cache, chaque ecran reecrit a la main le meme useEffect, avec les
 * memes quatre defauts : pas de gestion d erreur, rechargement a chaque
 * visite, conditions de course quand les filtres changent vite, et requetes
 * non annulees au demontage. C est le levier de proprete le plus rentable du
 * projet ; le retirer ferait grossir chaque page de trente lignes.
 */
export const creerQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (nombreEchecs, erreur) => {
          // Inutile de rejouer une erreur de droits ou de saisie : la reponse
          // sera la meme. On ne reessaie que les pannes passageres.
          if (erreur instanceof ErreurApi && erreur.statut > 0 && erreur.statut < 500) return false;
          return nombreEchecs < 2;
        },
      },
      mutations: { retry: false }, // une ecriture rejouee peut creer un doublon
    },
  });
