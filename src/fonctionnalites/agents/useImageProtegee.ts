import { useEffect, useState } from 'react';

import { chargerImage } from '@/shared/api/client';

interface Etat {
  /** Le chemin auquel ce resultat correspond. */
  pour: string | null;
  url: string | null;
  echec: boolean;
}

const VIDE: Etat = { pour: null, url: null, echec: false };

/**
 * Affiche une image servie par une route protegee.
 *
 * <img src="/api/v1/.../photo"> ne fonctionne pas : le navigateur n ajoute
 * pas l en-tete Authorization sur le chargement d une image. On recupere donc
 * le binaire, et on en fait une URL temporaire (blob:...).
 *
 * Le nettoyage n est pas facultatif : chaque URL creee occupe la memoire du
 * navigateur jusqu a revokeObjectURL. Sur une grille de deux cents portraits
 * parcourue plusieurs fois, l oubli se voit.
 *
 * Detail de conception : le resultat porte LE CHEMIN auquel il correspond.
 * Cela evite de remettre l etat a zero depuis un effet — ce qui declencherait
 * un rendu de plus et afficherait brievement l ancienne image sous le nouveau
 * nom. Ici, un resultat qui ne correspond pas au chemin demande est
 * simplement considere comme perime, pendant le rendu, sans toucher a l etat.
 */
export function useImageProtegee(chemin: string | null): { url: string | null; echec: boolean } {
  const [etat, setEtat] = useState<Etat>(VIDE);

  useEffect(() => {
    if (!chemin) return;

    let annule = false;
    let creee: string | null = null;

    chargerImage(chemin)
      .then((resultat) => {
        if (annule) {
          // Le composant a disparu pendant le telechargement : on libere tout
          // de suite, sinon cette URL ne le sera jamais.
          URL.revokeObjectURL(resultat);
          return;
        }
        creee = resultat;
        setEtat({ pour: chemin, url: resultat, echec: false });
      })
      .catch(() => {
        if (!annule) setEtat({ pour: chemin, url: null, echec: true });
      });

    return () => {
      annule = true;
      if (creee) URL.revokeObjectURL(creee);
    };
  }, [chemin]);

  const correspond = chemin !== null && etat.pour === chemin;

  return {
    url: correspond ? etat.url : null,
    echec: correspond ? etat.echec : false,
  };
}

/**
 * Ajoute la date de mise a jour a l adresse d une image (le backend ignore ce
 * parametre). Une nouvelle photo ou signature = une nouvelle adresse = un
 * nouveau telechargement ; sans cela, l ancienne image reste affichee.
 */
export function avecVersion(chemin: string, version?: string | null): string {
  return version ? `${chemin}?v=${encodeURIComponent(version)}` : chemin;
}
