import { client, lire } from '@/shared/api/client';

import type { ReponseConnexion, ResultatConnexion, UtilisateurConnecte } from './types';

/**
 * Forme brute de /auth/profil.
 *
 * Elle differe de celle de /auth/login : le profil detaille les roles en
 * objets, la connexion les donne en codes. Cette difference est corrigee ici,
 * au contact du serveur, pour que le reste de l application ne connaisse
 * qu une seule forme d utilisateur. C est une couche anti-corruption, et
 * c est exactement le genre de detail qui, laisse tel quel, finit en
 * "[object Object]" affiche a l ecran.
 */
interface ProfilBrut extends Omit<UtilisateurConnecte, 'roles' | 'nomComplet'> {
  nom: string;
  prenom: string;
  nomComplet?: string;
  roles: Array<{ code: string; libelle: string }> | string[];
  filiale?: { id: string; code: string; nom: string } | null;
}

const normaliserProfil = (brut: ProfilBrut): UtilisateurConnecte => ({
  ...brut,
  nomComplet: brut.nomComplet ?? `${brut.prenom} ${brut.nom}`.trim(),
  roles: brut.roles.map((role) => (typeof role === 'string' ? role : role.code)),
  filialeId: brut.filialeId ?? brut.filiale?.id ?? null,
});

export const apiAuth = {
  connexion: async (identifiant: string, password: string, codeTotp?: string) => {
    const { data } = await client.post<ResultatConnexion>('/auth/login', {
      identifiant,
      password,
      ...(codeTotp ? { codeTotp } : {}),
    });
    return data;
  },

  verifier2fa: async (challengeToken: string, codeTotp: string) => {
    const { data } = await client.post<ReponseConnexion>('/auth/2fa/verifier', {
      challengeToken,
      codeTotp,
    });
    return data;
  },

  profil: async (): Promise<UtilisateurConnecte> =>
    normaliserProfil(await lire<ProfilBrut>('/auth/profil')),

  deconnexion: (refreshToken: string) => client.post('/auth/logout', { refreshToken }),
};
