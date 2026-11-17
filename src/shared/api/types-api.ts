/** Enveloppe de pagination, identique sur toutes les listes du backend. */
export interface PageApi<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/** Corps d erreur renvoye par le HttpExceptionFilter du backend. */
export interface CorpsErreurApi {
  success: false;
  code: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

/** Reference minimale : tout objet nomme renvoye en relation. */
export interface Reference {
  id: string;
  nom: string;
  code?: string;
}

export type FormatExport = 'xlsx' | 'pdf' | 'csv';
