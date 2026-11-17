import { FilterX } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  useDepartementsReferentiel,
  useServicesReferentiel,
} from '@/fonctionnalites/organisation/referentiels/hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import type { Filtres } from '@/shared/hooks/useFiltresUrl';
import { Bouton } from '@/shared/ui/Bouton';
import { Champ } from '@/shared/ui/Champ';

interface Props {
  filtres: Filtres;
  definir: (cle: string, valeur: string | null) => void;
  reinitialiser: () => void;
}

export function FiltresAgents({ filtres, definir, reinitialiser }: Props) {
  // Le champ texte garde un etat local pour rester reactif a la frappe ;
  // seule la valeur retardee part dans l URL. Les menus deroulants, eux,
  // ecrivent directement : il n y a rien a retarder sur un choix unique.
  const [recherche, setRecherche] = useState(filtres.recherche ?? '');
  const rechercheRetardee = useDebounce(recherche, 350);

  useEffect(() => {
    if ((filtres.recherche ?? '') !== rechercheRetardee) {
      definir('recherche', rechercheRetardee || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rechercheRetardee]);

  const departements = useDepartementsReferentiel();
  const services = useServicesReferentiel(filtres.departementIds);

  const actifs = Object.entries(filtres).filter(
    ([cle, valeur]) => !['page', 'limit', 'triPar', 'sortOrder'].includes(cle) && valeur,
  ).length;

  return (
    <section className="carte p-4" aria-label="Filtres">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Champ
          libelle="Recherche"
          type="search"
          placeholder="Matricule, nom, fonction..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />

        <Champ libelle="Departement">
          <select
            value={filtres.departementIds ?? ''}
            onChange={(e) => {
              definir('departementIds', e.target.value || null);
              definir('serviceIds', null); // un service d un autre departement n a plus de sens
            }}
          >
            <option value="">Tous</option>
            {departements.data?.items.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nom}
              </option>
            ))}
          </select>
        </Champ>

        <Champ libelle="Service">
          <select
            value={filtres.serviceIds ?? ''}
            onChange={(e) => definir('serviceIds', e.target.value || null)}
          >
            <option value="">Tous</option>
            {services.data?.items.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom}
              </option>
            ))}
          </select>
        </Champ>

        <Champ libelle="Statut">
          <select value={filtres.actif ?? ''} onChange={(e) => definir('actif', e.target.value || null)}>
            <option value="">Tous</option>
            <option value="true">En poste</option>
            <option value="false">Sortis</option>
          </select>
        </Champ>

        <Champ libelle="Compte de connexion">
          <select
            value={filtres.avecCompte ?? ''}
            onChange={(e) => definir('avecCompte', e.target.value || null)}
          >
            <option value="">Indifferent</option>
            <option value="true">Avec compte</option>
            <option value="false">Sans compte</option>
          </select>
        </Champ>

        <Champ libelle="Adresse email">
          <select
            value={filtres.avecEmail ?? ''}
            onChange={(e) => definir('avecEmail', e.target.value || null)}
          >
            <option value="">Indifferent</option>
            <option value="true">Avec email</option>
            <option value="false">Sans email</option>
          </select>
        </Champ>

        <Champ
          libelle="Embauche du"
          type="date"
          value={filtres.embaucheDu ?? ''}
          onChange={(e) => definir('embaucheDu', e.target.value || null)}
        />

        <Champ
          libelle="Embauche au"
          type="date"
          value={filtres.embaucheAu ?? ''}
          onChange={(e) => definir('embaucheAu', e.target.value || null)}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm text-encre-douce">
          {actifs > 0 ? `${actifs} filtre(s) actif(s)` : 'Aucun filtre actif'}
        </span>
        <Bouton
          variante="secondaire"
          taille="sm"
          disabled={actifs === 0}
          onClick={() => {
            setRecherche('');
            reinitialiser();
          }}
          icone={<FilterX className="size-4" aria-hidden="true" />}
        >
          Tout effacer
        </Bouton>
      </div>
    </section>
  );
}
