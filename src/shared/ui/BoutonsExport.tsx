import { Download } from 'lucide-react';
import { useState } from 'react';

import { messageLisible } from '@/shared/api/erreurs';
import type { FormatExport } from '@/shared/api/types-api';
import { Bouton } from '@/shared/ui/Bouton';
import { MessageErreur } from '@/shared/ui/Etats';

const LIBELLES: Record<FormatExport, string> = { xlsx: 'Excel', pdf: 'PDF', csv: 'CSV' };

/**
 * Le composant ne sait pas CE QU il exporte : il recoit une fonction. Il sert
 * donc pour les agents, la carriere, le trombinoscope et l organigramme sans
 * une ligne de plus. C est l inversion de dependance, version React.
 */
export function BoutonsExport({
  onExport,
  formats = ['xlsx', 'pdf', 'csv'],
}: {
  onExport: (format: FormatExport) => Promise<void>;
  formats?: FormatExport[];
}) {
  const [enCours, setEnCours] = useState<FormatExport | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  async function exporter(format: FormatExport) {
    setEnCours(format);
    setErreur(null);
    try {
      await onExport(format);
    } catch (echec) {
      setErreur(messageLisible(echec));
    } finally {
      setEnCours(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {formats.map((format) => (
          <Bouton
            key={format}
            variante="secondaire"
            taille="sm"
            chargement={enCours === format}
            disabled={enCours !== null}
            onClick={() => void exporter(format)}
            icone={<Download className="size-4" aria-hidden="true" />}
          >
            {LIBELLES[format]}
          </Bouton>
        ))}
      </div>
      {erreur && <MessageErreur>{erreur}</MessageErreur>}
    </div>
  );
}
