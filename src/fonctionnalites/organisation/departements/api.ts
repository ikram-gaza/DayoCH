import { lire } from '@/shared/api/client';
import type { PageApi, Reference } from '@/shared/api/types-api';

/** Plafond de pagination du backend (PaginationDto) : au-dela, 400. */
export const LIMITE_REFERENTIEL = 200;

export const apiDepartements = {
  /** Referentiel pour les listes deroulantes. (CRUD complet : etape 3.1 du plan.) */
  referentiel: () =>
    lire<PageApi<Reference>>('/organisation/departements', {
      limit: LIMITE_REFERENTIEL,
      sortBy: 'nom',
      sortOrder: 'ASC',
    }),
};
