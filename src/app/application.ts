/**
 * Nom de l application, defini une seule fois.
 *
 * VITE_NOM_APPLICATION (fichier .env du front) peut le surcharger, par exemple
 * pour distinguer une instance de recette : "DAYO PulseInfra - RECETTE".
 * Seules les variables prefixees VITE_ sont exposees au navigateur : c est une
 * protection de Vite, qui evite d embarquer par erreur un secret du serveur
 * dans le code envoye a l utilisateur.
 */
export const NOM_APPLICATION: string =
  import.meta.env.VITE_NOM_APPLICATION ?? 'DAYO PulseInfra';
