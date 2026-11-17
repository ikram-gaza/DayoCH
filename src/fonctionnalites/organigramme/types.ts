/** Les quatre niveaux de l arbre, tels que le backend les nomme. */
export type NiveauNoeud = 'FILIALE' | 'DEPARTEMENT' | 'SERVICE' | 'AGENT';

/**
 * Noeud de l organigramme.
 *
 * Structure recursive : un noeud contient ses enfants. Le type se definit en
 * se citant lui-meme, ce que TypeScript accepte sans difficulte.
 */
export interface NoeudOrganigramme {
  id: string;
  niveau: NiveauNoeud;
  code?: string | null;
  libelle: string;
  sousTitre?: string | null;
  effectif: number;
  estGerant?: boolean;
  photoFichier?: string | null;
  fonction?: string | null;
  enfants: NoeudOrganigramme[];
}

export interface LigneSynthese {
  departement: string;
  service: string;
  effectif: number;
  responsable: string;
}

export interface FiltresOrganigramme {
  filialeId?: string;
  departementId?: string;
  inclureAgents?: string;
  seulementActifs?: string;
  /** AAAA-MM-JJ : organigramme tel qu il etait a cette date. */
  dateReference?: string;
  [cle: string]: string | undefined;
}
