import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { ErreurApi, normaliserErreur } from './erreurs';
import { jetons } from './jetons';

/** Requetes marquees pour ne pas boucler sur le rafraichissement. */
interface ConfigInterne extends InternalAxiosRequestConfig {
  _rejoue?: boolean;
}

export const client: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
  timeout: 20_000,
  headers: { Accept: 'application/json' },
});

/** Prevenu quand la session est definitivement perdue. */
type Abonne = () => void;
const abonnes = new Set<Abonne>();
export function surSessionPerdue(abonne: Abonne): () => void {
  abonnes.add(abonne);
  return () => abonnes.delete(abonne);
}

// ---------------------------------------------------------------- requetes

/**
 * Intercepteur de requete : pose le jeton et le perimetre sur CHAQUE appel.
 *
 * C est tout l interet de l instance Axios : ni les composants ni les
 * fonctions d API ne s occupent de l authentification. Une seule ligne a
 * changer le jour ou le backend passera aux cookies.
 */
client.interceptors.request.use((config) => {
  const acces = jetons.acces();
  if (acces) config.headers.Authorization = `Bearer ${acces}`;

  const filiale = jetons.filiale();
  if (filiale) config.headers['X-Filiale-Id'] = filiale;

  return config;
});

// ---------------------------------------------------------------- reponses

/**
 * Rafraichissement du jeton, une seule fois a la fois.
 *
 * Le probleme a connaitre : cinq requetes partent en parallele, les cinq
 * recoivent 401, et cinq rafraichissements partent. Comme le backend fait
 * TOURNER les jetons de rafraichissement, le deuxieme presente un jeton deja
 * consomme ; le serveur en deduit un vol et revoque toutes les sessions.
 * L utilisateur est deconnecte sans comprendre pourquoi.
 *
 * La parade tient en une variable : la promesse en cours est partagee, les
 * autres requetes l attendent au lieu d en lancer une nouvelle.
 */
let rafraichissementEnCours: Promise<boolean> | null = null;

async function rafraichir(): Promise<boolean> {
  const refresh = jetons.rafraichissement();
  if (!refresh) return false;

  rafraichissementEnCours ??= (async () => {
    try {
      // Appel direct avec axios, et non avec `client` : l intercepteur de
      // reponse ne doit pas intercepter son propre rafraichissement.
      const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/refresh`,
        { refreshToken: refresh },
      );
      jetons.enregistrer(data.accessToken, data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      rafraichissementEnCours = null;
    }
  })();

  return rafraichissementEnCours;
}

/** Echange volontaire au demarrage : evite un 401 garanti au premier appel. */
export const reprendreSession = (): Promise<boolean> => rafraichir();

client.interceptors.response.use(
  (reponse) => reponse,
  async (echec: unknown) => {
    if (!axios.isAxiosError(echec) || !echec.config) {
      throw normaliserErreur(echec);
    }

    const config = echec.config as ConfigInterne;
    const statut = echec.response?.status;

    if (statut === 401 && !config._rejoue) {
      config._rejoue = true; // une seule tentative, jamais de boucle

      if (await rafraichir()) {
        return client.request(config);
      }

      jetons.effacer();
      abonnes.forEach((abonne) => abonne());
      throw new ErreurApi(401, 'Session expiree, reconnectez-vous.', 'SESSION_EXPIREE');
    }

    throw normaliserErreur(echec);
  },
);

// ------------------------------------------------------------------ outils

/**
 * Retire les valeurs vides avant d envoyer les parametres.
 *
 * Un formulaire de filtres envoie volontiers "?dateDebut=&serviceId=". Le
 * backend refuse ces chaines vides avec un 400, et il a raison de le faire :
 * c est au client de ne pas envoyer un filtre qu il ne filtre pas.
 */
export function nettoyerParametres(parametres: Record<string, unknown> = {}): Record<string, unknown> {
  const propres: Record<string, unknown> = {};

  for (const [cle, valeur] of Object.entries(parametres)) {
    if (valeur === undefined || valeur === null || valeur === '') continue;
    if (Array.isArray(valeur)) {
      if (valeur.length) propres[cle] = valeur.join(',');
      continue;
    }
    propres[cle] = valeur;
  }
  return propres;
}

/** Lecture typee, avec nettoyage des parametres. */
export async function lire<T>(
  chemin: string,
  parametres?: Record<string, unknown>,
  config?: AxiosRequestConfig,
): Promise<T> {
  const { data } = await client.get<T>(chemin, {
    ...config,
    params: nettoyerParametres(parametres),
  });
  return data;
}

/**
 * Telechargement d un fichier protege par le jeton.
 *
 * Une balise <a href> ne conviendrait pas : le navigateur n y mettrait pas
 * l en-tete Authorization. On recupere donc le binaire, on cree une URL
 * temporaire, on declenche le clic, puis on LIBERE l URL — sans cette
 * derniere etape, le fichier reste en memoire jusqu au rechargement.
 */
export async function telecharger(
  chemin: string,
  parametres: Record<string, unknown> = {},
): Promise<void> {
  const reponse = await client.get<Blob>(chemin, {
    params: nettoyerParametres(parametres),
    responseType: 'blob',
  });

  const url = URL.createObjectURL(reponse.data);
  const lien = document.createElement('a');

  lien.href = url;
  lien.download =
    nomFichierDepuisEnTete(reponse.headers['content-disposition'] as string | undefined) ?? 'export';
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
}

/** Content-Disposition: attachment; filename="agents_BEN.xlsx" -> agents_BEN.xlsx */
export function nomFichierDepuisEnTete(enTete: string | undefined): string | null {
  if (!enTete) return null;
  const correspondance = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(enTete);
  return correspondance?.[1] ? decodeURIComponent(correspondance[1]) : null;
}

/** Image servie par une route protegee : rendue sous forme d URL temporaire. */
export async function chargerImage(chemin: string): Promise<string> {
  const reponse = await client.get<Blob>(chemin, { responseType: 'blob' });
  return URL.createObjectURL(reponse.data);
}

/**
 * Televersement.
 *
 * Ne JAMAIS poser Content-Type soi-meme sur un FormData : le navigateur doit
 * composer l en-tete lui-meme pour y inclure la frontiere ("boundary") qui
 * separe les parties. L ecrire a la main casse l envoi de facon difficile a
 * diagnostiquer.
 */
export async function televerser(chemin: string, fichier: File): Promise<void> {
  const formulaire = new FormData();
  formulaire.append('fichier', fichier);
  await client.post(chemin, formulaire);
}
