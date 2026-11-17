import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PhotoAgent } from '@/fonctionnalites/agents/PhotoAgent';
import { cn } from '@/shared/utils/cn';

import type { DonneesNoeud } from './disposition';
import { HAUTEUR_NOEUD, LARGEUR_NOEUD } from './disposition';

/** Une allure par niveau. La table remplace quatre conditions dans le JSX. */
const ALLURES: Record<DonneesNoeud['niveau'], string> = {
  FILIALE: 'bg-dayo-bleu text-white border-dayo-bleu-fonce',
  DEPARTEMENT: 'bg-dayo-bleu-clair text-dayo-bleu-fonce border-dayo-bleu',
  SERVICE: 'bg-white text-encre border-filet',
  AGENT: 'bg-white text-encre border-dashed border-filet',
};

/**
 * Noeud personnalise de ReactFlow.
 *
 * ReactFlow fournit le canevas, le zoom et le deplacement ; le contenu reste
 * un composant React ordinaire. Les deux `Handle` sont obligatoires : sans
 * eux, la bibliotheque ne sait pas ou accrocher les liens et le trait part du
 * coin du cadre.
 */
export function NoeudOrganisation({ data }: NodeProps<Node<DonneesNoeud>>) {
  const estAgent = data.niveau === 'AGENT';

  const contenu = (
    <div
      style={{ width: LARGEUR_NOEUD, minHeight: HAUTEUR_NOEUD }}
      className={cn(
        'flex items-center gap-2 rounded-[--radius-carte] border px-3 py-2 text-left shadow-sm',
        ALLURES[data.niveau],
        data.estGerant && 'ring-2 ring-dayo-rouge ring-offset-1',
      )}
    >
      {!estAgent && data.nbEnfants > 0 && (
        // Simple indicateur : le clic est capte par le canevas (onNodeClick),
        // pas par une icone de 16 pixels qu il faudrait viser.
        <span className="shrink-0 opacity-70" aria-hidden="true">
          {data.replie ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
        </span>
      )}

      {estAgent && data.agentId && (
        <PhotoAgent
          agentId={data.agentId}
          prenom={data.prenom}
          nom={data.nom}
          aPhoto={data.aPhoto}
          taille={36}
        />
      )}

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-tight" title={data.libelle}>
          {data.libelle}
        </p>
        {data.sousTitre && (
          <p className="truncate text-xs opacity-80" title={data.sousTitre}>
            {data.sousTitre}
          </p>
        )}
        {!estAgent && (
          <p className="text-xs opacity-80">
            {data.effectif} agent{data.effectif > 1 ? 's' : ''}
            {data.replie && data.nbEnfants > 0 && ` - ${data.nbEnfants} branche(s) repliee(s)`}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Les poignees restent invisibles : elles servent au trace, pas a
          l utilisateur, qui ne peut pas relier les noeuds a la main. */}
      <Handle type="target" position={Position.Top} className="!opacity-0" isConnectable={false} />

      {estAgent && data.agentId ? (
        <Link to={`/agents/${data.agentId}`} className="block no-underline">
          {contenu}
        </Link>
      ) : (
        contenu
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!opacity-0"
        isConnectable={false}
      />
    </>
  );
}
