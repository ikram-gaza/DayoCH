import type { ReactNode } from 'react';

/** En-tete uniforme : titre, sous-titre, actions a droite. */
export function EnTetePage({
  titre,
  sousTitre,
  actions,
}: {
  titre: string;
  sousTitre?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{titre}</h1>
        {sousTitre && <p className="text-sm text-encre-douce">{sousTitre}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
