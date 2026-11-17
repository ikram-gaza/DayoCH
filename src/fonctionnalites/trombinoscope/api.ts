import { lire, telecharger } from '@/shared/api/client';
import type { FormatExport } from '@/shared/api/types-api';

import type { FiltresTrombinoscope, GroupeTrombinoscope } from './types';

export const apiTrombinoscope = {
  /**
   * Le trombinoscope n est pas pagine : il renvoie directement les groupes,
   * un par filiale. C est volontaire — un annuaire se parcourt a l oeil, pas
   * page par page — et le backend borne deja le volume par filiale.
   */
  lister: (filtres: FiltresTrombinoscope) =>
    lire<GroupeTrombinoscope[]>('/organisation/trombinoscope', filtres),

  exporter: (filtres: FiltresTrombinoscope, format: FormatExport) =>
    telecharger('/organisation/trombinoscope/export', { ...filtres, format }),
};
