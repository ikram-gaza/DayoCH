import { lire } from '@/shared/api/client';

import type { ModuleAccessible, TableauDeBord } from './types';

export const apiPilotage = {
  tableauDeBord: () => lire<TableauDeBord>('/pilotage/tableau-de-bord'),
  /** Source UNIQUE du menu : le serveur filtre deja selon les roles et permissions. */
  modules: () => lire<ModuleAccessible[]>('/pilotage/modules'),
};
