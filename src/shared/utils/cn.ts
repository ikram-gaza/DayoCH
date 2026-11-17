import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Assemble des classes Tailwind en resolvant les conflits.
 *
 * clsx gere les conditions, tailwind-merge tranche quand deux utilitaires
 * touchent la meme propriete : cn('p-2', 'p-4') rend 'p-4', et non les deux.
 * Sans lui, une classe passee en prop ne surcharge jamais vraiment la classe
 * par defaut du composant, et on finit par ecrire des "!important".
 */
export function cn(...valeurs: ClassValue[]): string {
  return twMerge(clsx(valeurs));
}
