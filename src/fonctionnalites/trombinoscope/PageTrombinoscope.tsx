import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { BoutonsExport } from '@/shared/ui/BoutonsExport';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useFiltresUrl } from '@/shared/hooks/useFiltresUrl';
import { Badge } from '@/shared/ui/Badge';
import { EnTetePage } from '@/shared/ui/EnTetePage';
import { EtatVide, MessageErreur } from '@/shared/ui/Etats';
import { Squelette } from '@/shared/ui/Squelette';

import { apiTrombinoscope } from './api';
import { CarteAgent } from './CarteAgent';
import { useTrombinoscope } from './hooks';

/**
 * Trombinoscope du groupe : tous les agents, regroupes par filiale.
 *
 * C est le seul ecran qui traverse volontairement le cloisonnement par
 * filiale. La decision ne se prend pas ici : le backend decide ce que le
 * compte a le droit de voir, et un compte rattache a une filiale ne recoit
 * qu un groupe. Le front se contente d afficher ce qui arrive — sans quoi il
 * y aurait deux regles d acces a maintenir, l une derriere l autre.
 */
export function PageTrombinoscope() {
  const { filtres, definir } = useFiltresUrl({ actif: 'true' });

  // La frappe doit rester fluide : le champ est un etat local, l URL n est
  // mise a jour qu une fois la saisie stabilisee.
  const [saisie, setSaisie] = useState(filtres.recherche ?? '');
  const rechercheRetardee = useDebounce(saisie, 350);

  useEffect(() => {
    if (rechercheRetardee !== (filtres.recherche ?? '')) {
      definir('recherche', rechercheRetardee || null);
    }
  }, [rechercheRetardee, filtres.recherche, definir]);

  const { data, isLoading, isError, error } = useTrombinoscope(filtres);

  const effectifTotal = data?.reduce((total, groupe) => total + groupe.effectif, 0) ?? 0;

  return (
    <>
      <EnTetePage
        titre="Trombinoscope du groupe"
        sousTitre={
          data
            ? `${effectifTotal} agent${effectifTotal > 1 ? 's' : ''} dans ${data.length} filiale${
                data.length > 1 ? 's' : ''
              }`
            : 'Annuaire illustre de toutes les filiales'
        }
        actions={
          <BoutonsExport
            formats={['pdf', 'xlsx', 'csv']}
            onExport={(format) => apiTrombinoscope.exporter(filtres, format)}
          />
        }
      />

      <div className="carte mb-4 flex flex-wrap items-end gap-4 p-4">
        <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="trombi-recherche">
          Rechercher
          <span className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-encre-douce"
              aria-hidden="true"
            />
            <input
              id="trombi-recherche"
              type="search"
              value={saisie}
              onChange={(evenement) => setSaisie(evenement.target.value)}
              placeholder="Nom, matricule, fonction"
              className="h-9 w-72 rounded-md border border-filet pl-8 pr-3 text-sm font-normal"
            />
          </span>
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={filtres.avecPhoto === 'true'}
            onChange={(evenement) => definir('avecPhoto', evenement.target.checked ? 'true' : null)}
            className="size-4"
          />
          Uniquement les agents ayant une photo
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={filtres.actif !== 'false'}
            onChange={(evenement) => definir('actif', evenement.target.checked ? 'true' : 'false')}
            className="size-4"
          />
          Agents en poste seulement
        </label>
      </div>

      {/* Les trois etats obligatoires de toute donnee distante : en cours,
          en echec, vide. Les oublier donne un ecran blanc que personne ne
          sait interpreter. */}
      {isLoading && (
        <div className="carte p-6" aria-busy="true">
          <Squelette lignes={6} />
        </div>
      )}

      {isError && <MessageErreur erreur={error} />}

      {data && data.length === 0 && (
        <EtatVide titre="Aucun agent ne correspond">
          Elargissez la recherche ou retirez un filtre.
        </EtatVide>
      )}

      {data?.map((groupe) => (
        <section key={groupe.filialeId} className="mb-8">
          <h2 className="mb-3 flex flex-wrap items-center gap-2 text-lg font-bold">
            {groupe.nom}
            <Badge ton="bleu">{groupe.code}</Badge>
            <span className="text-sm font-normal text-encre-douce">
              {groupe.pays} &middot; {groupe.effectif} agent{groupe.effectif > 1 ? 's' : ''}
              {' '}&middot; {groupe.avecPhoto} avec photo
            </span>
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {groupe.agents.map((agent) => (
              <CarteAgent key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
