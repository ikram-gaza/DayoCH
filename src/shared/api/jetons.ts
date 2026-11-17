const CLE_REFRESH = 'dayopi.refreshToken';
const CLE_FILIALE = 'dayopi.filialeCourante';

/**
 * Conservation des jetons.
 *
 * Le jeton d acces reste en MEMOIRE : il disparait a la fermeture de
 * l onglet, et un script injecte dans la page ne peut pas le lire dans
 * localStorage. Le jeton de rafraichissement, lui, doit survivre au
 * rechargement : il va donc dans localStorage.
 *
 * Ce n est pas l ideal theorique. La meilleure solution reste un cookie
 * httpOnly, que JavaScript ne peut pas lire du tout ; elle demande une
 * adaptation du backend (cookies + protection CSRF). Le compromis est ecrit
 * ici, a l endroit ou il est pris : un compromis documente est une decision,
 * un compromis tacite est une dette.
 */
let jetonAcces: string | null = null;

const lire = (cle: string): string | null => {
  try {
    return localStorage.getItem(cle);
  } catch {
    // Navigation privee ou stockage desactive : on fonctionne sans persistance.
    return null;
  }
};

const ecrire = (cle: string, valeur: string | null): void => {
  try {
    if (valeur === null) localStorage.removeItem(cle);
    else localStorage.setItem(cle, valeur);
  } catch {
    /* sans persistance, la session durera le temps de l onglet */
  }
};

export const jetons = {
  acces: (): string | null => jetonAcces,
  rafraichissement: (): string | null => lire(CLE_REFRESH),

  enregistrer(acces: string, rafraichissement: string): void {
    jetonAcces = acces;
    ecrire(CLE_REFRESH, rafraichissement);
  },

  majAcces(acces: string): void {
    jetonAcces = acces;
  },

  effacer(): void {
    jetonAcces = null;
    ecrire(CLE_REFRESH, null);
  },

  /** Filiale de travail d un compte de niveau groupe. */
  filiale: (): string | null => lire(CLE_FILIALE),
  definirFiliale: (id: string | null): void => ecrire(CLE_FILIALE, id),
};
