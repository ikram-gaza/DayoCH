import { createContext } from 'react';

import type { ResultatConnexion, UtilisateurConnecte } from './types';

export interface ValeurAuth {
  utilisateur: UtilisateurConnecte | null;
  chargement: boolean;
  filialeCourante: string | null;
  estCompteGroupe: boolean;
  connecter: (
    identifiant: string,
    password: string,
    codeTotp?: string,
  ) => Promise<ResultatConnexion>;
  terminerConnexion2fa: (challengeToken: string, codeTotp: string) => Promise<void>;
  deconnecter: () => Promise<void>;
  changerFiliale: (filialeId: string | null) => void;
  peut: (permission: string) => boolean;
  aRole: (...roles: string[]) => boolean;
}

/**
 * Le contexte est dans SON PROPRE fichier, separe du composant qui le
 * fournit.
 *
 * Raison pratique : le rechargement a chaud de Vite ne sait remplacer un
 * module a la volee que s il n exporte que des composants. Un fichier qui
 * exporte a la fois un contexte et un composant force un rechargement complet
 * de la page a chaque modification — et l on perd l etat en cours, donc la
 * session, donc le formulaire a moitie rempli.
 */
export const ContexteAuth = createContext<ValeurAuth | null>(null);
