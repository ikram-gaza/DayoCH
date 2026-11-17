import { initiales } from '@/shared/utils/format';
import { cn } from '@/shared/utils/cn';

import { avecVersion, useImageProtegee } from './useImageProtegee';

interface Props {
  agentId: string;
  prenom: string;
  nom: string;
  aPhoto: boolean;
  /**
   * Date de derniere mise a jour (photoMajAt). Elle entre dans l adresse de
   * l image : une nouvelle photo = une nouvelle adresse = un nouveau
   * telechargement. Sans elle, l ancienne image reste affichee.
   */
  version?: string | null;
  taille?: number;
  className?: string;
}

/**
 * Portrait d un agent, ou ses initiales a defaut.
 *
 * Toujours prevoir le cas sans photo : une image cassee dans une grille de
 * deux cents cartes se voit plus qu un trou en base.
 */
export function PhotoAgent({ agentId, prenom, nom, aPhoto, version, taille = 40, className }: Props) {
  const { url, echec } = useImageProtegee(
    aPhoto ? avecVersion(`/organisation/agents/${agentId}/photo`, version) : null,
  );
  const style = { width: taille, height: taille };

  if (!aPhoto || echec || !url) {
    return (
      <div
        aria-hidden="true"
        style={{ ...style, fontSize: taille * 0.36 }}
        className={cn(
          'grid shrink-0 place-items-center rounded-full border border-filet bg-dayo-bleu-clair font-bold text-dayo-bleu-fonce',
          className,
        )}
      >
        {initiales(prenom, nom)}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`Photo de ${prenom} ${nom}`}
      style={style}
      className={cn('shrink-0 rounded-full border border-filet object-cover', className)}
    />
  );
}
