import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useFiliales } from '@/fonctionnalites/organisation/filiales/hooks';
import { useAuth } from '@/shared/auth/useAuth';
import { Champ } from '@/shared/ui/Champ';

/**
 * Filiale de travail des comptes de niveau groupe.
 *
 * Un SuperAdmin n est rattache a aucune filiale : sans ce choix, le serveur
 * ne sait pas sur quel perimetre repondre. Pour un utilisateur de filiale, le
 * composant ne s affiche pas : son perimetre est impose par le backend, et
 * aucun reglage du navigateur ne peut le changer.
 *
 * Changer de filiale ne vide pas le cache : le perimetre fait partie des cles
 * (voir usePerimetre). Les deux filiales gardent chacune leurs donnees.
 */
export function SelecteurFiliale() {
  const { estCompteGroupe, filialeCourante, changerFiliale } = useAuth();
  const queryClient = useQueryClient();

  const filiales = useFiliales(estCompteGroupe);

  const premiere = filiales.data?.items[0];

  useEffect(() => {
    if (estCompteGroupe && !filialeCourante && premiere) changerFiliale(premiere.id);
  }, [estCompteGroupe, filialeCourante, premiere, changerFiliale]);

  if (!estCompteGroupe) return null;

  return (
    <Champ libelle="Filiale de travail">
      <select
        value={filialeCourante ?? ''}
        onChange={(evenement) => {
          changerFiliale(evenement.target.value || null);
          // Les requetes deja en cache portent l ancien perimetre dans leur
          // cle ; celles en vol, non. On les relance.
          void queryClient.invalidateQueries();
        }}
      >
        {filiales.data?.items.map((filiale) => (
          <option key={filiale.id} value={filiale.id}>
            {filiale.code} - {filiale.nom}
          </option>
        ))}
      </select>
    </Champ>
  );
}
