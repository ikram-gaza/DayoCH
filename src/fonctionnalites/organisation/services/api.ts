import { lire } from '@/shared/api/client';
import type { PageApi, Reference } from '@/shared/api/types-api';

import { LIMITE_REFERENTIEL } from '../departements/api';

export const apiServices = {
  /**
   * Referentiel, eventuellement restreint a des departements
   * (identifiants separes par des virgules, comme dans l URL).
   * (CRUD complet : etape 3.2 du plan.)
   */
  referentiel: (departementIds?: string) =>
    lire<PageApi<Reference>>('/organisation/services', {
      limit: LIMITE_REFERENTIEL,
      sortBy: 'nom',
      sortOrder: 'ASC',
      departementIds,
    }),
};
