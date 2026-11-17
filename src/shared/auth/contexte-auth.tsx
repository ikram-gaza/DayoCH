import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { reprendreSession, surSessionPerdue } from '@/shared/api/client';
import { jetons } from '@/shared/api/jetons';

import { apiAuth } from './api-auth';
import { ContexteAuth, type ValeurAuth } from './contexte';
import { estDefiDeuxFacteurs, ROLES, type UtilisateurConnecte } from './types';

/**
 * Session de l utilisateur.
 *
 * Le contexte est reserve a ce qui est vraiment global : la session et le
 * perimetre de travail. Tout y mettre ferait rerendre l application entiere
 * au moindre changement.
 */
export function FournisseurAuth({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<UtilisateurConnecte | null>(null);

  /**
   * Le cache des donnees appartient a UNE session.
   *
   * Sans ce nettoyage, sur un poste partage, le compte suivant se voyait
   * d abord servir le menu, les listes et les fiches gardes en memoire pour
   * le precedent, le temps qu ils soient rafraichis. Le cache est donc vide a
   * chaque ouverture et a chaque fermeture de session.
   */
  const queryClient = useQueryClient();

  // L etat initial est CALCULE, pas corrige ensuite : sans jeton de
  // rafraichissement il n y a rien a reprendre, donc rien a attendre.
  // Partir de `true` puis repasser a `false` dans un effet provoquerait un
  // rendu supplementaire — et surtout un bref ecran de chargement a chaque
  // ouverture de l application par un visiteur non connecte.
  const [chargement, setChargement] = useState(() => Boolean(jetons.rafraichissement()));
  const [filiale, setFiliale] = useState<string | null>(() => jetons.filiale());

  const changerFiliale = useCallback((filialeId: string | null) => {
    setFiliale(filialeId);
    jetons.definirFiliale(filialeId);
  }, []);

  /*
   * Reprise de session au demarrage.
   *
   * Ordre important : on echange d abord le jeton de rafraichissement contre
   * un jeton d acces, PUIS on demande le profil. L ordre inverse fonctionne
   * aussi, au prix d un 401 systematique a chaque chargement de page — une
   * erreur attendue reste une erreur, et elle finit par masquer les vraies.
   */
  useEffect(() => {
    if (!jetons.rafraichissement()) return;

    let actif = true;

    void (async () => {
      try {
        if (!(await reprendreSession())) throw new Error('Session non reprise.');
        const profil = await apiAuth.profil();
        if (actif) setUtilisateur(profil);
      } catch {
        jetons.effacer();
      } finally {
        if (actif) setChargement(false);
      }
    })();

    // Nettoyage : si le composant disparait avant la reponse, on ne touche
    // plus a son etat.
    return () => {
      actif = false;
    };
  }, []);

  // Le client Axios previent quand la session est definitivement perdue.
  useEffect(
    () =>
      surSessionPerdue(() => {
        queryClient.clear();
        setUtilisateur(null);
      }),
    [queryClient],
  );

  const connecter = useCallback(
    async (identifiant: string, password: string, codeTotp?: string) => {
      const resultat = await apiAuth.connexion(identifiant, password, codeTotp);

      if (!estDefiDeuxFacteurs(resultat)) {
        queryClient.clear();
        jetons.enregistrer(resultat.accessToken, resultat.refreshToken);
        setUtilisateur(resultat.utilisateur);
      }
      return resultat;
    },
    [queryClient],
  );

  const terminerConnexion2fa = useCallback(async (challengeToken: string, codeTotp: string) => {
    const resultat = await apiAuth.verifier2fa(challengeToken, codeTotp);
    queryClient.clear();
    jetons.enregistrer(resultat.accessToken, resultat.refreshToken);
    setUtilisateur(resultat.utilisateur);
  }, [queryClient]);

  const deconnecter = useCallback(async () => {
    const refresh = jetons.rafraichissement();
    try {
      if (refresh) await apiAuth.deconnexion(refresh);
    } finally {
      // Meme si l appel echoue, la session locale se ferme : l utilisateur a
      // demande a partir, le reseau ne doit pas l en empecher.
      jetons.effacer();
      // La filiale de travail aussi : c est un choix du compte qui part, pas
      // un reglage du poste.
      jetons.definirFiliale(null);
      setFiliale(null);
      queryClient.clear();
      setUtilisateur(null);
    }
  }, [queryClient]);

  const peut = useCallback(
    (permission: string) =>
      Boolean(
        utilisateur &&
          (utilisateur.roles.includes(ROLES.SUPER_ADMIN) ||
            utilisateur.permissions.includes(permission)),
      ),
    [utilisateur],
  );

  const aRole = useCallback(
    (...roles: string[]) => Boolean(utilisateur && roles.some((r) => utilisateur.roles.includes(r))),
    [utilisateur],
  );

  // useMemo : sans lui, l objet serait recree a chaque rendu et tous les
  // composants abonnes au contexte se rerendraient pour rien.
  const valeur = useMemo<ValeurAuth>(
    () => ({
      utilisateur,
      chargement,
      filialeCourante: filiale,
      estCompteGroupe: utilisateur?.filialeId === null,
      connecter,
      terminerConnexion2fa,
      deconnecter,
      changerFiliale,
      peut,
      aRole,
    }),
    [utilisateur, chargement, filiale, connecter, terminerConnexion2fa, deconnecter, changerFiliale, peut, aRole],
  );

  return <ContexteAuth.Provider value={valeur}>{children}</ContexteAuth.Provider>;
}
