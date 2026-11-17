import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * Transition d entree d une page.
 *
 * useReducedMotion lit le reglage systeme "reduire les animations". Quand il
 * est actif, on ne desactive pas seulement l animation : on rend le contenu
 * immediatement a sa position finale. Une animation ignoree qui laisse le
 * contenu invisible serait pire que pas d animation du tout.
 *
 * Les durees restent courtes (0,18 s). Au-dela, l animation ne decore plus :
 * elle fait attendre.
 */
export function TransitionPage({ children }: { children: ReactNode }) {
  const mouvementReduit = useReducedMotion();

  if (mouvementReduit) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Apparition en cascade d une liste de cartes.
 *
 * `delay` croit avec l index, mais il est PLAFONNE : sans ce plafond, la
 * centieme carte d une grille attendrait deux secondes avant d apparaitre.
 */
export function AnimationCarte({ index, children }: { index: number; children: ReactNode }) {
  const mouvementReduit = useReducedMotion();

  if (mouvementReduit) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3), ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
