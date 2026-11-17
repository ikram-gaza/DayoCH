/**
 * Contrat de GET /pilotage/tableau-de-bord et GET /pilotage/modules.
 * Recopie du backend (src/modules/pilotage/pilotage.service.ts).
 */
export interface Indicateur {
  cle: string;
  libelle: string;
  valeur: number;
  precision?: string;
}

export interface ModuleAccessible {
  cle: string;
  libelle: string;
  description: string;
  chemin: string;
  permission: string | null;
  roles: string[] | null;
  disponible: boolean;
}

export interface PointAttention {
  niveau: 'info' | 'alerte';
  message: string;
  chemin?: string;
}

export interface TableauDeBord {
  perimetre: { filialeId: string | null; libelle: string };
  indicateurs: Indicateur[];
  effectifParFiliale: Array<{ code: string; nom: string; effectif: number; avecPhoto: number }>;
  pointsAttention: PointAttention[];
  modules: ModuleAccessible[];
}
