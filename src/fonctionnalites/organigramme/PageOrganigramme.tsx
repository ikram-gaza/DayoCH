import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { CalendarClock, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BoutonsExport } from '@/shared/ui/BoutonsExport';
import { Bouton } from '@/shared/ui/Bouton';
import { EnTetePage } from '@/shared/ui/EnTetePage';
import { MessageErreur } from '@/shared/ui/Etats';
import { useFiltresUrl } from '@/shared/hooks/useFiltresUrl';
import { Squelette } from '@/shared/ui/Squelette';
import { formaterDate } from '@/shared/utils/format';

import { apiOrganigramme } from './api';
import { calculerDisposition, type DonneesNoeud } from './disposition';
import { useOrganigramme } from './hooks';
import { NoeudOrganisation } from './NoeudOrganisation';

/**
 * La table des types de noeuds est declaree UNE fois, hors du composant.
 *
 * Definie a l interieur, elle serait un nouvel objet a chaque rendu :
 * ReactFlow croirait a un changement, demonterait puis remonterait tous les
 * noeuds, et l avertissement correspondant remplirait la console.
 */
const TYPES_NOEUDS = { organisation: NoeudOrganisation };

export function PageOrganigramme() {
  return (
    // Le fournisseur donne acces a l instance du canevas (zoom, recadrage).
    // Il doit envelopper le composant qui appelle useReactFlow.
    <ReactFlowProvider>
      <VueOrganigramme />
    </ReactFlowProvider>
  );
}

function VueOrganigramme() {
  const { filtres, definir } = useFiltresUrl({ inclureAgents: 'true', seulementActifs: 'true' });

  /**
   * Branches repliees, par identifiant.
   *
   * Cet etat appartient a l ECRAN, pas au serveur : il ne passe donc pas par
   * TanStack Query. Melanger les deux obligerait a reecrire le cache a chaque
   * clic sur un chevron, pour une information qui n a aucun sens hors de
   * cette page.
   */
  const [replies, setReplies] = useState<ReadonlySet<string>>(new Set());

  const basculerBranche = useCallback((id: string) => {
    setReplies((actuelles) => {
      // On recree un ensemble au lieu de modifier celui en place : React
      // compare les references pour decider de redessiner. Un Set modifie
      // sur place reste le meme objet, et l ecran ne bouge pas.
      const suivantes = new Set(actuelles);
      if (!suivantes.delete(id)) suivantes.add(id);
      return suivantes;
    });
  }, []);

  const requete = useOrganigramme(filtres);

  /**
   * Le calcul de disposition est memoise sur l arbre.
   *
   * Il parcourt tout l arbre : le refaire a chaque rendu — au moindre
   * mouvement de souris sur le canevas — rendrait l ecran saccade sur une
   * filiale de deux cents agents.
   */
  const disposition = useMemo(
    () => (requete.data ? calculerDisposition(requete.data, replies) : null),
    [requete.data, replies],
  );

  const { fitView } = useReactFlow();

  /**
   * Recadrage apres CHAQUE changement d arbre (passage a une date du passe,
   * agents masques...).
   *
   * Le premier cadrage, lui, est confie a la propriete `fitView` du canevas
   * plus bas : a l instant ou cet effet s execute pour la premiere fois, le
   * canevas vient tout juste d etre monte et sa reserve interne de noeuds est
   * encore vide — l appel partirait dans le vide, sans la moindre erreur pour
   * le signaler. C est un piege classique : la fonction existe, elle ne
   * refuse rien, et pourtant rien ne bouge.
   */
  useEffect(() => {
    if (!disposition) return;

    // Laisser passer une image : le canevas a alors pris connaissance des
    // nouveaux noeuds.
    const minuteur = window.setTimeout(() => {
      void fitView({ padding: 0.15, maxZoom: 1, duration: 400 });
    }, 0);

    return () => window.clearTimeout(minuteur);
  }, [disposition, fitView]);

  return (
    <>
      <EnTetePage
        titre="Organigramme"
        sousTitre={
          filtres.dateReference
            ? `Organisation telle qu elle etait au ${formaterDate(filtres.dateReference)}`
            : "Organisation d aujourd hui"
        }
        actions={
          <BoutonsExport
            formats={['pdf', 'xlsx']}
            onExport={(format) =>
              apiOrganigramme.exporter(filtres, format === 'csv' ? 'xlsx' : format)
            }
          />
        }
      />

      <div className="carte mb-4 flex flex-wrap items-end gap-4 p-4">
        <label className="flex flex-col gap-1 text-sm font-semibold" htmlFor="orga-date">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-4 text-dayo-bleu" aria-hidden="true" />
            Organigramme a la date du
          </span>
          <input
            id="orga-date"
            type="date"
            value={filtres.dateReference ?? ''}
            // L historique des postes permet de remonter dans le temps :
            // l arbre est alors reconstitue a partir des affectations ouvertes
            // ce jour-la, et non des rattachements actuels.
            onChange={(evenement) => definir('dateReference', evenement.target.value || null)}
            className="h-9 rounded-md border border-filet px-3 text-sm font-normal"
          />
        </label>

        {replies.size > 0 ? (
          <Bouton
            variante="secondaire"
            taille="sm"
            className="mb-0.5"
            onClick={() => setReplies(new Set())}
            icone={<Maximize2 className="size-4" aria-hidden="true" />}
          >
            Tout deplier
          </Bouton>
        ) : (
          <Bouton
            variante="secondaire"
            taille="sm"
            className="mb-0.5"
            onClick={() =>
              setReplies(
                new Set(
                  (disposition?.noeuds ?? [])
                    .filter((n) => n.data.niveau === 'DEPARTEMENT')
                    .map((n) => n.id),
                ),
              )
            }
            icone={<Minimize2 className="size-4" aria-hidden="true" />}
          >
            Replier les departements
          </Bouton>
        )}

        {filtres.dateReference && (
          <Bouton
            variante="secondaire"
            taille="sm"
            className="mb-0.5"
            onClick={() => definir('dateReference', null)}
            icone={<RotateCcw className="size-4" aria-hidden="true" />}
          >
            Revenir a aujourd hui
          </Bouton>
        )}

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={filtres.inclureAgents !== 'false'}
            onChange={(evenement) =>
              definir('inclureAgents', evenement.target.checked ? 'true' : 'false')
            }
            className="size-4"
          />
          Descendre jusqu aux agents
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={filtres.seulementActifs !== 'false'}
            onChange={(evenement) =>
              definir('seulementActifs', evenement.target.checked ? 'true' : 'false')
            }
            className="size-4"
          />
          Masquer les entites desactivees
        </label>
      </div>

      {requete.isLoading && (
        <div className="carte p-6" aria-busy="true">
          <Squelette lignes={6} />
        </div>
      )}
      {requete.isError && <MessageErreur erreur={requete.error} />}

      {disposition && (
        <div className="carte h-[70vh] overflow-hidden p-0">
          <ReactFlow
            nodes={disposition.noeuds}
            edges={disposition.liens}
            nodeTypes={TYPES_NOEUDS}
            fitView
            // maxZoom : sur un arbre reduit — une seule branche depliee — le
            // cadrage grossirait les cartes jusqu a l absurde.
            fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
            onNodeClick={(_evenement, noeud) => {
              const donnees = noeud.data as DonneesNoeud;
              // Un agent n a pas d enfants : son noeud est un lien vers la
              // fiche, et le clic ne doit pas etre detourne.
              if (donnees.niveau !== 'AGENT' && donnees.nbEnfants > 0) {
                basculerBranche(noeud.id);
              }
            }}
            // Positions calculees par nous : la bibliotheque ne doit ni les
            // recalculer ni les laisser modifier.
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: false }}
            minZoom={0.2}
            maxZoom={1.6}
          >
            <Background gap={24} color="#e3e8ee" />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable className="!bg-fond" />
          </ReactFlow>
        </div>
      )}
    </>
  );
}
