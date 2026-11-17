import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { FournisseurAuth } from '@/shared/auth/contexte-auth';

import { creerQueryClient } from './queryClient';

/**
 * Fournisseurs globaux, et rien d autre.
 *
 * useState(creerQueryClient) et non creerQueryClient() : la fonction n est
 * appelee qu au premier rendu. Ecrit sans useState, un nouveau cache serait
 * cree a chaque rendu, et le cache ne servirait donc a rien.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(creerQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <FournisseurAuth>{children}</FournisseurAuth>
    </QueryClientProvider>
  );
}
