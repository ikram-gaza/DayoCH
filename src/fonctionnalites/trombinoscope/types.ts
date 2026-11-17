/**
 * Types du trombinoscope.
 *
 * Ils recopient le contrat du backend (TrombinoscopeService). Ils ne sont pas
 * devines depuis un ecran : ils viennent de la reponse de l API, et toute
 * divergence doit se corriger dans ce fichier uniquement.
 */
export interface FicheTrombinoscope {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  fonction: string | null;
  email: string | null;
  telephone: string | null;
  departement: string | null;
  service: string | null;
  estGerant: boolean;
  aPhoto: boolean;
  aSignature: boolean;
}

/** Les agents d une filiale, avec ses compteurs. */
export interface GroupeTrombinoscope {
  filialeId: string;
  code: string;
  nom: string;
  pays: string;
  effectif: number;
  avecPhoto: number;
  agents: FicheTrombinoscope[];
}

export interface FiltresTrombinoscope {
  recherche?: string;
  filialeIds?: string;
  departementIds?: string;
  serviceIds?: string;
  avecPhoto?: string;
  actif?: string;
  [cle: string]: string | undefined;
}
