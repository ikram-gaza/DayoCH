import { ArrowDown, ArrowUp } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Badge, BadgeOuiNon } from '@/shared/ui/Badge';
import { EnTetePage } from '@/shared/ui/EnTetePage';
import { EtatVide, MessageErreur } from '@/shared/ui/Etats';
import { Pagination } from '@/shared/ui/Pagination';
import { Squelette } from '@/shared/ui/Squelette';
import { useFiltresUrl } from '@/shared/hooks/useFiltresUrl';
import { formaterDate } from '@/shared/utils/format';

import { apiAgents } from './api';
import { BoutonsExport } from '@/shared/ui/BoutonsExport';
import { FiltresAgents } from './FiltresAgents';
import { useAgents } from './hooks';
import { PhotoAgent } from './PhotoAgent';

const COLONNES = [
  { cle: 'photo', libelle: '', triable: false },
  { cle: 'matricule', libelle: 'Matricule', triable: true },
  { cle: 'nom', libelle: 'Nom', triable: true },
  { cle: 'fonction', libelle: 'Fonction', triable: true },
  { cle: 'departement', libelle: 'Departement', triable: true },
  { cle: 'service', libelle: 'Service', triable: true },
  { cle: 'dateEmbauche', libelle: 'Embauche', triable: true },
  { cle: 'compte', libelle: 'Compte', triable: false },
  { cle: 'actif', libelle: 'Statut', triable: false },
] as const;

/**
 * Liste des agents.
 *
 * Cette page n effectue aucun appel reseau et ne fait aucun calcul metier :
 * elle assemble. Les donnees viennent d un hook, les filtres de l URL,
 * l affichage de composants dedies.
 */
export function PageAgents() {
  const { filtres, definir, reinitialiser } = useFiltresUrl({
    page: '1',
    limit: '20',
    triPar: 'nom',
    sortOrder: 'ASC',
  });

  const { data, isLoading, isError, error, isFetching } = useAgents(filtres);

  /** Meme colonne : on inverse. Autre colonne : on repart en ASC. */
  function basculerTri(colonne: string) {
    if (filtres.triPar === colonne) {
      definir('sortOrder', filtres.sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      definir('triPar', colonne);
      definir('sortOrder', 'ASC');
    }
  }

  return (
    <>
      <EnTetePage
        titre="Agents"
        sousTitre={`Effectif de la filiale, filtrable et exportable.${
          isFetching && !isLoading ? ' Actualisation...' : ''
        }`}
        actions={<BoutonsExport onExport={(format) => apiAgents.exporter(filtres, format)} />}
      />

      <div className="flex flex-col gap-4">
        <FiltresAgents filtres={filtres} definir={definir} reinitialiser={reinitialiser} />

        {/* Trois etats a traiter, toujours : chargement, erreur, resultat
            vide. Les oublier donne une page blanche sans explication. */}
        {isLoading && (
          <div className="carte p-4" aria-busy="true">
            <Squelette lignes={8} />
          </div>
        )}
        {isError && <MessageErreur erreur={error} />}
        {data && data.items.length === 0 && (
          <EtatVide titre="Aucun agent ne correspond a ces criteres.">
            Elargissez la recherche ou effacez les filtres.
          </EtatVide>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="overflow-x-auto rounded-[--radius-carte] border border-filet">
              <table className="w-full border-collapse bg-white text-sm">
                <thead>
                  <tr>
                    {COLONNES.map((colonne) => {
                      const actif = filtres.triPar === colonne.cle;
                      return (
                        <th
                          key={colonne.cle}
                          scope="col"
                          // aria-sort annonce le tri aux lecteurs d ecran.
                          aria-sort={
                            actif
                              ? filtres.sortOrder === 'ASC'
                                ? 'ascending'
                                : 'descending'
                              : undefined
                          }
                          className="whitespace-nowrap bg-dayo-bleu-fonce px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-white"
                        >
                          {colonne.triable ? (
                            <button
                              type="button"
                              onClick={() => basculerTri(colonne.cle)}
                              className="inline-flex items-center gap-1"
                            >
                              {colonne.libelle}
                              {actif &&
                                (filtres.sortOrder === 'ASC' ? (
                                  <ArrowUp className="size-3" aria-hidden="true" />
                                ) : (
                                  <ArrowDown className="size-3" aria-hidden="true" />
                                ))}
                            </button>
                          ) : (
                            colonne.libelle
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {data.items.map((agent) => (
                    // La cle est l identifiant, jamais l index : avec l index,
                    // un tri melange les lignes et React reutilise le mauvais
                    // composant (la photo d un autre agent).
                    <tr key={agent.id} className="border-b border-filet last:border-0 even:bg-fond">
                      <td className="px-3 py-2">
                        <PhotoAgent
                          agentId={agent.id}
                          prenom={agent.prenom}
                          nom={agent.nom}
                          aPhoto={Boolean(agent.photoFichier)}
                          taille={36}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Link
                          to={`/agents/${agent.id}`}
                          className="font-medium text-dayo-bleu-fonce hover:underline"
                        >
                          {agent.matricule}
                        </Link>
                      </td>
                      <td className="px-3 py-2">
                        {agent.prenom} {agent.nom}{' '}
                        {agent.estGerant && <Badge ton="rouge">Gerant</Badge>}
                      </td>
                      <td className="px-3 py-2">{agent.fonction ?? '-'}</td>
                      <td className="px-3 py-2">{agent.departement?.nom ?? '-'}</td>
                      <td className="px-3 py-2">{agent.service?.nom ?? '-'}</td>
                      <td className="px-3 py-2">{formaterDate(agent.dateEmbauche)}</td>
                      <td className="px-3 py-2">
                        <BadgeOuiNon valeur={Boolean(agent.userId)} />
                      </td>
                      <td className="px-3 py-2">
                        <Badge ton={agent.actif ? 'vert' : 'gris'}>
                          {agent.actif ? 'Actif' : 'Sorti'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={data.page}
              pages={data.pages}
              total={data.total}
              onChangement={(page) => definir('page', String(page))}
            />
          </>
        )}
      </div>
    </>
  );
}
