import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Bouton } from './Bouton';

interface Props {
  page: number;
  pages: number;
  total: number;
  onChangement: (page: number) => void;
}

export function Pagination({ page, pages, total, onChangement }: Props) {
  if (total === 0) return null;

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
      <span className="text-sm text-encre-douce">
        {total} resultat{total > 1 ? 's' : ''} &middot; page {page} sur {pages}
      </span>

      <div className="flex gap-2">
        <Bouton
          variante="secondaire"
          taille="sm"
          disabled={page <= 1}
          onClick={() => onChangement(page - 1)}
          icone={<ChevronLeft className="size-4" aria-hidden="true" />}
        >
          Precedent
        </Bouton>
        <Bouton
          variante="secondaire"
          taille="sm"
          disabled={page >= pages}
          onClick={() => onChangement(page + 1)}
        >
          Suivant
          <ChevronRight className="size-4" aria-hidden="true" />
        </Bouton>
      </div>
    </nav>
  );
}
