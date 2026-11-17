import axios from 'axios';

import type { CorpsErreurApi } from './types-api';

/**
 * Erreur applicative normalisee.
 *
 * Une erreur n est pas une chaine : c est un statut, un code, un message deja
 * traduit et, pour une erreur de validation, le detail champ par champ. En
 * faire une classe permet de l attraper precisement et de decider quoi
 * afficher plutot que de tout montrer de la meme facon.
 */
export class ErreurApi extends Error {
  readonly statut: number;
  readonly code: string;
  readonly details: string[];

  constructor(statut: number, message: string, code = 'ERREUR', details: string[] = []) {
    super(message);
    this.name = 'ErreurApi';
    this.statut = statut;
    this.code = code;
    this.details = details;
  }

  get estSessionExpiree(): boolean {
    return this.statut === 401;
  }

  get estDroitsInsuffisants(): boolean {
    return this.statut === 403;
  }

  get estSaisieInvalide(): boolean {
    return this.statut === 400 || this.statut === 422;
  }
}

const MESSAGES: Record<number, string> = {
  400: 'Donnees invalides.',
  401: 'Session expiree, reconnectez-vous.',
  403: "Vous n avez pas les droits pour cette action.",
  404: 'Element introuvable.',
  409: "Conflit : cette operation est impossible en l etat.",
  413: 'Fichier trop volumineux.',
  429: 'Trop de requetes, patientez un instant.',
  500: 'Erreur du serveur. Reessayez dans un moment.',
  503: 'Service momentanement indisponible.',
};

/**
 * Traduit n importe quoi en ErreurApi.
 *
 * Axios rejette sur les statuts d erreur, contrairement a fetch : le code
 * d appel n a donc plus a tester reponse.ok. En revanche il faut distinguer
 * trois cas qu Axios melange : reponse d erreur du serveur, requete partie
 * sans reponse (reseau coupe), et erreur de programmation.
 */
export function normaliserErreur(echec: unknown): ErreurApi {
  if (echec instanceof ErreurApi) return echec;

  if (axios.isCancel(echec)) {
    return new ErreurApi(0, 'Requete annulee.', 'ANNULEE');
  }

  if (axios.isAxiosError<CorpsErreurApi>(echec)) {
    const reponse = echec.response;

    if (!reponse) {
      return new ErreurApi(0, 'Serveur injoignable. Verifiez votre connexion.', 'RESEAU');
    }

    const corps = reponse.data;
    const details = Array.isArray(corps?.message) ? corps.message : [];
    const message =
      details[0] ??
      (typeof corps?.message === 'string' ? corps.message : undefined) ??
      MESSAGES[reponse.status] ??
      `Erreur inattendue (${reponse.status}).`;

    return new ErreurApi(reponse.status, message, corps?.code ?? 'ERREUR', details);
  }

  return new ErreurApi(0, echec instanceof Error ? echec.message : 'Erreur inconnue.');
}

/** Message affichable, quelle que soit la nature de ce qui a ete attrape. */
export const messageLisible = (echec: unknown): string => normaliserErreur(echec).message;
