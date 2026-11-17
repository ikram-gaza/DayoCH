import { client, lire, telecharger, televerser } from '@/shared/api/client';
import type { FormatExport, PageApi } from '@/shared/api/types-api';

import type { Affectation, Agent, FiltresAgents } from './types';

/**
 * Toutes les routes du domaine "agents", et rien d autre.
 *
 * Aucun composant n appelle Axios directement. Le jour ou une route change de
 * nom, un seul fichier bouge et le compilateur signale tous les appels
 * devenus faux.
 */
export const apiAgents = {
  lister: (filtres: FiltresAgents) => lire<PageApi<Agent>>('/organisation/agents', filtres),

  detail: (id: string) => lire<Agent>(`/organisation/agents/${id}`),

  historique: (id: string) => lire<Affectation[]>(`/organisation/agents/${id}/historique`),

  muter: async (
    id: string,
    corps: {
      departementId?: string;
      serviceId?: string;
      fonction?: string;
      motif: string;
      nature?: string;
      dateEffet?: string;
    },
  ) => {
    const { data } = await client.patch<Agent>(`/organisation/agents/${id}/mutation`, corps);
    return data;
  },

  // --- Pieces ---
  envoyerPhoto: (id: string, fichier: File) =>
    televerser(`/organisation/agents/${id}/photo`, fichier),

  envoyerSignatureFichier: (id: string, fichier: File) =>
    televerser(`/organisation/agents/${id}/signature/fichier`, fichier),

  /** Signature tracee dans le navigateur : canvas -> data URL -> PUT JSON. */
  enregistrerSignatureTracee: async (id: string, dataUrl: string) => {
    const { data } = await client.put<{ id: string; signatureMajAt: string }>(
      `/organisation/agents/${id}/signature`,
      { dataUrl },
    );
    return data;
  },

  // --- Exports ---
  exporter: (filtres: FiltresAgents, format: FormatExport) =>
    telecharger('/organisation/agents/export', { ...filtres, format }),

  exporterCarriere: (id: string, format: FormatExport) =>
    telecharger(`/organisation/agents/${id}/historique/export`, { format }),
};
