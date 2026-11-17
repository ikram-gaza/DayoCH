import type { Edge, Node } from '@xyflow/react';

import type { NoeudOrganigramme } from './types';

export const LARGEUR_NOEUD = 220;
export const HAUTEUR_NOEUD = 76;
const ECART_HORIZONTAL = 32;
const ECART_VERTICAL = 96;

export interface DonneesNoeud extends Record<string, unknown> {
  libelle: string;
  sousTitre: string | null;
  code: string | null;
  niveau: NoeudOrganigramme['niveau'];
  effectif: number;
  estGerant: boolean;
  agentId: string | null;
  aPhoto: boolean;
  prenom: string;
  nom: string;
  /** Nombre d enfants dans l arbre COMPLET, replies compris. */
  nbEnfants: number;
  replie: boolean;
}

export interface Disposition {
  noeuds: Node<DonneesNoeud>[];
  liens: Edge[];
  largeur: number;
}

/**
 * Place l arbre dans le plan : un arbre -> des noeuds positionnes et des liens.
 *
 * Deux raisons de garder cette fonction a part, sans React ni ReactFlow dans
 * ses parametres :
 *  - elle se teste avec un simple objet en entree et des coordonnees en
 *    sortie, sans monter un composant ;
 *  - elle survit au changement de bibliotheque d affichage : seules les deux
 *    dernieres lignes, qui mettent en forme pour ReactFlow, seraient a
 *    reecrire.
 *
 * Algorithme (parcours en profondeur, dit "reingold-tilford simplifie") :
 *  1. une feuille occupe sa propre largeur ;
 *  2. un noeud ayant des enfants les place d abord cote a cote, puis se
 *     centre au-dessus d eux ;
 *  3. la profondeur donne l ordonnee.
 *
 * On obtient un arbre sans chevauchement, en un seul passage, parce que
 * chaque sous-arbre renvoie la largeur qu il a consommee.
 */
export function calculerDisposition(
  racine: NoeudOrganigramme,
  replies: ReadonlySet<string> = new Set(),
): Disposition {
  const noeuds: Node<DonneesNoeud>[] = [];
  const liens: Edge[] = [];

  /**
   * Place un sous-arbre a partir de l abscisse `depart` et renvoie la largeur
   * totale occupee. C est cette valeur de retour qui evite les chevauchements :
   * le frere suivant commence la ou le precedent s arrete.
   */
  function placer(noeud: NoeudOrganigramme, depart: number, profondeur: number): number {
    const y = profondeur * (HAUTEUR_NOEUD + ECART_VERTICAL);

    // Le pliage est un etat d AFFICHAGE : il n est pas applique a l arbre
    // recu, qui reste intact dans le cache. On se contente de ne pas
    // descendre — rouvrir une branche n exige donc aucun nouvel appel.
    const enfants = replies.has(noeud.id) ? [] : noeud.enfants;

    let largeurOccupee = 0;

    // Seuls le premier et le dernier centre servent au calcul : les garder
    // dans deux variables evite un tableau dont il faudrait ensuite prouver
    // a TypeScript que les deux bouts existent.
    let premierCentre: number | null = null;
    let dernierCentre = 0;

    for (const enfant of enfants) {
      const largeurEnfant = placer(enfant, depart + largeurOccupee, profondeur + 1);
      dernierCentre = depart + largeurOccupee + largeurEnfant / 2;
      premierCentre ??= dernierCentre;
      largeurOccupee += largeurEnfant + ECART_HORIZONTAL;
    }

    // Le dernier enfant n a pas de frere apres lui : son ecart est en trop.
    if (largeurOccupee > 0) largeurOccupee -= ECART_HORIZONTAL;

    const largeur = Math.max(LARGEUR_NOEUD, largeurOccupee);

    // Un parent se centre sur ses enfants ; une feuille se centre sur sa
    // propre largeur.
    const centre =
      premierCentre !== null ? (premierCentre + dernierCentre) / 2 : depart + largeur / 2;

    noeuds.push({
      id: noeud.id,
      type: 'organisation',
      position: { x: centre - LARGEUR_NOEUD / 2, y },
      // Dimensions annoncees a l avance. Sans elles, ReactFlow doit d abord
      // dessiner chaque noeud pour le mesurer : le recadrage initial porte
      // alors sur des bornes incompletes — la racine sort du cadre — et la
      // mini-carte n a rien a dessiner.
      width: LARGEUR_NOEUD,
      height: HAUTEUR_NOEUD,
      data: donnees(noeud, replies),
      // Les noeuds ne sont pas deplacables : l organigramme est une lecture
      // de la base, pas un dessin libre. Autoriser le glissement laisserait
      // croire que la position se sauvegarde.
      draggable: false,
    });

    for (const enfant of enfants) {
      liens.push({
        id: `${noeud.id}--${enfant.id}`,
        source: noeud.id,
        target: enfant.id,
        type: 'smoothstep',
        style: { stroke: '#d3d9df', strokeWidth: 1.5 },
      });
    }

    return largeur;
  }

  const largeur = placer(racine, 0, 0);
  return { noeuds, liens, largeur };
}

function donnees(noeud: NoeudOrganigramme, replies: ReadonlySet<string>): DonneesNoeud {
  // Un noeud agent porte un nom complet "Prenom Nom" ; les initiales de
  // substitution ont besoin des deux morceaux separement.
  const [prenom = '', ...reste] = noeud.libelle.split(' ');

  return {
    libelle: noeud.libelle,
    sousTitre: noeud.sousTitre ?? noeud.fonction ?? null,
    code: noeud.code ?? null,
    niveau: noeud.niveau,
    effectif: noeud.effectif,
    estGerant: Boolean(noeud.estGerant),
    agentId: noeud.niveau === 'AGENT' ? noeud.id : null,
    aPhoto: Boolean(noeud.photoFichier),
    prenom,
    nom: reste.join(' '),
    nbEnfants: noeud.enfants.length,
    replie: replies.has(noeud.id),
  };
}
