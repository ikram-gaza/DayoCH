const LOCALE = 'fr-FR';

/** Toute date affichee passe par ici : un seul format dans l application. */
export function formaterDate(valeur: string | null | undefined): string {
  if (!valeur) return '-';
  const date = new Date(valeur);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString(LOCALE);
}

export function formaterDateHeure(valeur: string | null | undefined): string {
  if (!valeur) return '-';
  const date = new Date(valeur);
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleString(LOCALE, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

/** 70 -> "5 ans et 10 mois" : plus parlant qu un nombre de mois brut. */
export function formaterDuree(mois: number): string {
  if (mois < 1) return 'moins d un mois';
  const annees = Math.floor(mois / 12);
  const reste = mois % 12;

  const morceaux: string[] = [];
  if (annees) morceaux.push(`${annees} an${annees > 1 ? 's' : ''}`);
  if (reste) morceaux.push(`${reste} mois`);
  return morceaux.join(' et ');
}

export const initiales = (prenom: string, nom: string): string =>
  `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
