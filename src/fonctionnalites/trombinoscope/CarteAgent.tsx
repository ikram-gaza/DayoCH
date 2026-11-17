import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PhotoAgent } from '@/fonctionnalites/agents/PhotoAgent';
import { Badge } from '@/shared/ui/Badge';

import type { FicheTrombinoscope } from './types';

/**
 * Une carte du trombinoscope.
 *
 * Le composant ne connait ni l API ni les filtres : il recoit une fiche et
 * l affiche. C est ce qui permet de le reutiliser dans un autre ecran — une
 * recherche globale, un selecteur de participants — sans le modifier.
 */
export function CarteAgent({ agent }: { agent: FicheTrombinoscope }) {
  return (
    <Link
      to={`/agents/${agent.id}`}
      className="carte flex flex-col items-center gap-2 p-4 text-center transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dayo-bleu"
    >
      <PhotoAgent
        agentId={agent.id}
        prenom={agent.prenom}
        nom={agent.nom}
        aPhoto={agent.aPhoto}
        taille={80}
      />

      <div>
        <p className="font-semibold leading-tight">{agent.nomComplet}</p>
        <p className="text-xs text-encre-douce">{agent.fonction ?? 'Fonction non precisee'}</p>
      </div>

      <p className="text-xs text-encre-douce">
        {[agent.departement, agent.service].filter(Boolean).join(' - ') || 'Rattachement direct'}
      </p>

      {agent.estGerant && <Badge ton="rouge">Gerant</Badge>}

      {/* Les coordonnees sont du texte, pas des liens : un lien dans un lien
          est invalide en HTML et le navigateur reorganise le document comme il
          peut, ce qui casse la mise en page. */}
      <div className="flex flex-col gap-0.5 text-xs text-encre-douce">
        {agent.email && (
          <span className="flex items-center justify-center gap-1">
            <Mail className="size-3" aria-hidden="true" />
            <span className="max-w-44 truncate">{agent.email}</span>
          </span>
        )}
        {agent.telephone && (
          <span className="flex items-center justify-center gap-1">
            <Phone className="size-3" aria-hidden="true" />
            {agent.telephone}
          </span>
        )}
      </div>
    </Link>
  );
}
