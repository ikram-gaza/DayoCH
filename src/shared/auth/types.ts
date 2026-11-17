export interface UtilisateurConnecte {
  id: string;
  matricule: string;
  email: string | null;
  nomComplet: string;
  filialeId: string | null;
  roles: string[];
  permissions: string[];
  estGerant: boolean;
  doitChangerMotDePasse: boolean;
  twoFactorEnabled: boolean;
}

export interface ReponseConnexion {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  utilisateur: UtilisateurConnecte;
}

/** Reponse du backend quand la double authentification est active. */
export interface DefiDeuxFacteurs {
  twoFactorRequired: true;
  challengeToken: string;
}

export type ResultatConnexion = ReponseConnexion | DefiDeuxFacteurs;

/**
 * Garde de type : apres cet appel, TypeScript sait de quel cas il s agit.
 * Plus sur que de tester la presence d une propriete a la main dans chaque
 * composant qui manipule le resultat.
 */
export function estDefiDeuxFacteurs(resultat: ResultatConnexion): resultat is DefiDeuxFacteurs {
  return (resultat as DefiDeuxFacteurs).twoFactorRequired === true;
}

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN_FILIALE: 'ADMIN_FILIALE',
  GERANT: 'GERANT',
  RESPONSABLE_STOCK: 'RESPONSABLE_STOCK',
  RESPONSABLE_SERVICE: 'RESPONSABLE_SERVICE',
  AGENT: 'AGENT',
} as const;
