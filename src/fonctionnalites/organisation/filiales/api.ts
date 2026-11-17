import { lire } from '@/shared/api/client';
import type { PageApi } from '@/shared/api/types-api';

import type { Filiale } from './types';

export const apiFiliales = {
  /**
   * Tri EXPLICITE par code : sans lui, le backend trie par date de creation
   * et la "premiere filiale" changerait au gre des enregistrements.
   * (Creation, modification, archivage : etape 3.3 du plan.)
   */
  lister: () => lire<PageApi<Filiale>>('/filiales', { limit: 100, sortBy: 'code', sortOrder: 'ASC' }),
};
