import type { ReactNode } from 'react';

import { cn } from '@/shared/utils/cn';

type Ton = 'bleu' | 'vert' | 'rouge' | 'gris';

const TONS: Record<Ton, string> = {
  bleu: 'bg-dayo-bleu-clair text-dayo-bleu-fonce',
  vert: 'bg-green-50 text-dayo-vert',
  rouge: 'bg-red-50 text-dayo-rouge',
  gris: 'bg-fond text-encre-douce',
};

export function Badge({ ton = 'bleu', children }: { ton?: Ton; children: ReactNode }) {
  return (
    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-semibold', TONS[ton])}>
      {children}
    </span>
  );
}

/** Oui / Non colore : evite de repeter la meme ternaire dans chaque tableau. */
export const BadgeOuiNon = ({ valeur }: { valeur: boolean }) => (
  <Badge ton={valeur ? 'vert' : 'gris'}>{valeur ? 'Oui' : 'Non'}</Badge>
);
