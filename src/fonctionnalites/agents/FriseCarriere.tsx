import { Badge } from '@/shared/ui/Badge';
import { formaterDate, formaterDuree } from '@/shared/utils/format';

import type { Affectation } from './types';

const LIBELLES: Record<string, string> = {
  EMBAUCHE: 'Embauche',
  MUTATION: 'Mutation',
  PROMOTION: 'Promotion',
  REORGANISATION: 'Reorganisation',
  INTERIM: 'Interim',
  DESIGNATION_GERANT: 'Designation comme gerant',
  FIN_GERANCE: 'Fin de gerance',
  SORTIE: "Sortie d effectif",
};

/**
 * Historique des postes en frise.
 *
 * Les periodes arrivent deja triees du serveur : le composant ne retrie pas.
 * Trier aux deux endroits finit toujours par produire deux ordres differents
 * selon l ecran.
 */
export function FriseCarriere({ affectations }: { affectations: Affectation[] }) {
  if (affectations.length === 0) {
    return <p className="text-sm text-encre-douce">Aucune periode enregistree.</p>;
  }

  return (
    <ol className="ml-2 border-l-2 border-filet pl-6">
      {affectations.map((affectation) => (
        <li key={affectation.id} className="relative pb-6 last:pb-0">
          <span
            aria-hidden="true"
            className={`absolute -left-[31px] top-1 size-3 rounded-full border-[3px] bg-white ${
              affectation.enCours ? 'border-dayo-bleu' : 'border-filet'
            }`}
          />

          <div className="flex flex-wrap items-center gap-2">
            <strong>{affectation.fonction ?? 'Fonction non precisee'}</strong>
            {affectation.enCours && <Badge ton="vert">En cours</Badge>}
            {affectation.estGerant && <Badge ton="rouge">Gerant</Badge>}
          </div>

          <p className="text-sm text-encre-douce">
            {[affectation.departement, affectation.service].filter(Boolean).join(' - ') ||
              'Rattachement non precise'}
          </p>

          <p className="text-sm">
            Du {formaterDate(affectation.dateDebut)}{' '}
            {affectation.dateFin ? `au ${formaterDate(affectation.dateFin)}` : "a aujourd'hui"} (
            {formaterDuree(affectation.dureeMois)})
          </p>

          <p className="text-xs text-encre-douce">
            {LIBELLES[affectation.motif] ?? affectation.motif}
            {affectation.commentaire ? ` - ${affectation.commentaire}` : ''}
          </p>
        </li>
      ))}
    </ol>
  );
}
