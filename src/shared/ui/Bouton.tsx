import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type Variante = 'principal' | 'secondaire' | 'discret' | 'danger';
type Taille = 'sm' | 'md';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  taille?: Taille;
  chargement?: boolean;
  icone?: ReactNode;
  children: ReactNode;
}

/**
 * Les classes sont regroupees dans des tables plutot que dans des ternaires
 * imbriquees. Ajouter une variante devient une ligne, et aucune condition ne
 * se cache dans le JSX.
 */
const VARIANTES: Record<Variante, string> = {
  principal: 'bg-dayo-bleu text-white hover:bg-dayo-bleu-fonce',
  secondaire: 'border border-filet bg-white text-dayo-bleu-fonce hover:bg-dayo-bleu-clair',
  discret: 'text-encre-douce hover:bg-fond',
  danger: 'bg-dayo-rouge text-white hover:brightness-95',
};

const TAILLES: Record<Taille, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
};

export function Bouton({
  variante = 'principal',
  taille = 'md',
  chargement = false,
  icone,
  disabled,
  className,
  children,
  // Le defaut HTML est "submit" : un bouton pose dans un formulaire le
  // soumettrait sans qu on l ait demande.
  type = 'button',
  ...reste
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || chargement}
      aria-busy={chargement}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-55',
        VARIANTES[variante],
        TAILLES[taille],
        className,
      )}
      {...reste}
    >
      {chargement ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        icone
      )}
      {children}
    </button>
  );
}
