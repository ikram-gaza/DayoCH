import { cn } from '@/shared/utils/cn';

/**
 * Barres grises affichees pendant le chargement.
 *
 * Preferable a un "Chargement..." centre : la page garde sa forme, donc elle
 * ne saute pas quand les donnees arrivent. aria-hidden parce qu il n y a rien
 * a annoncer : c est le conteneur qui porte aria-busy.
 */
export function Squelette({ lignes = 4, className }: { lignes?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-3', className)} aria-hidden="true">
      {Array.from({ length: lignes }, (_, index) => (
        <div
          key={index}
          className="h-4 animate-pulse rounded bg-filet/60"
          style={{ width: `${100 - (index % 3) * 12}%` }}
        />
      ))}
    </div>
  );
}
