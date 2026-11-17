import { AlertTriangle, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

import { messageLisible } from '@/shared/api/erreurs';

export function MessageErreur({ erreur, children }: { erreur?: unknown; children?: ReactNode }) {
  return (
    <div
      role="alert"
      className="carte flex items-start gap-3 border-dayo-rouge bg-red-50 p-4 text-sm text-red-900"
    >
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-dayo-rouge" aria-hidden="true" />
      <div>{children ?? messageLisible(erreur)}</div>
    </div>
  );
}

export function EtatVide({ titre, children }: { titre: string; children?: ReactNode }) {
  return (
    <div className="carte flex flex-col items-center gap-2 p-10 text-center">
      <Inbox className="size-8 text-filet" aria-hidden="true" />
      <p className="font-semibold">{titre}</p>
      {children && <p className="text-sm text-encre-douce">{children}</p>}
    </div>
  );
}
