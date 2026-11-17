/** Filiale telle que renvoyee par GET /filiales (champs utilises par le front). */
export interface Filiale {
  id: string;
  code: string;
  nom: string;
  pays: string;
  ville: string | null;
  actif: boolean;
}
