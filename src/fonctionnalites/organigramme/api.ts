import { lire, telecharger } from '@/shared/api/client';

import type { FiltresOrganigramme, LigneSynthese, NoeudOrganigramme } from './types';

export const apiOrganigramme = {
  arbre: (filtres: FiltresOrganigramme) =>
    lire<NoeudOrganigramme>('/organisation/organigramme', filtres),

  synthese: (filtres: FiltresOrganigramme) =>
    lire<LigneSynthese[]>('/organisation/organigramme/synthese', filtres),

  exporter: (filtres: FiltresOrganigramme, format: 'pdf' | 'xlsx') =>
    telecharger('/organisation/organigramme/export', { ...filtres, format }),
};
