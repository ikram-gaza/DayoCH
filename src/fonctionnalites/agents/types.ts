import type { Reference } from '@/shared/api/types-api';

export interface Agent {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  fonction: string | null;
  dateEmbauche: string | null;
  dateSortie: string | null;
  estGerant: boolean;
  actif: boolean;
  userId: string | null;
  photoFichier: string | null;
  photoMajAt: string | null;
  signatureFichier: string | null;
  signatureMajAt: string | null;
  departement: Reference | null;
  service: Reference | null;
}

/** Une periode de l historique des postes. */
export interface Affectation {
  id: string;
  fonction: string | null;
  departement: string | null;
  service: string | null;
  estGerant: boolean;
  dateDebut: string;
  dateFin: string | null;
  enCours: boolean;
  dureeMois: number;
  motif: string;
  commentaire: string | null;
}

/** Tous les filtres acceptes par la liste. Tous facultatifs, tous dans l URL. */
export interface FiltresAgents {
  recherche?: string;
  matricule?: string;
  departementIds?: string;
  serviceIds?: string;
  fonction?: string;
  actif?: string;
  estGerant?: string;
  avecEmail?: string;
  avecCompte?: string;
  sansService?: string;
  sansDepartement?: string;
  embaucheDu?: string;
  embaucheAu?: string;
  triPar?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
  [cle: string]: string | undefined;
}
