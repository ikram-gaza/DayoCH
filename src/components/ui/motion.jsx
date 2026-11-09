import { animate, motion, MotionConfig, useInView, useMotionValue, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

// ============================================================
//  DAYO RH — Composants d'animation
//  Inspiré de Bailo · motion/react (Framer Motion)
// ============================================================

/** Courbe de toutes les animations du site : départ vif, arrivée très douce. */
export const EASE = [0.22, 1, 0.36, 1]

/** Respecte le réglage « réduire les animations » du système. */
export function MotionProvider({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

/** Apparition au défilement : monte légèrement et sort du flou. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = 'div',
  immediate = false,
}) {
  const Component = motion[as]
  const shown = { opacity: 1, y: 0, filter: 'blur(0px)' }
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      {...(immediate ? { animate: shown } : { whileInView: shown })}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Component>
  )
}

/** Variants pour stagger */
const staggerParent = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.09 } },
}
const staggerChild = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  shown: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.8, ease: EASE },
  },
}

/** Liste dont les éléments apparaissent l'un après l'autre. */
export function Stagger({ children, className, as = 'ul' }) {
  const Component = motion[as]
  return (
    <Component
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
    >
      {children}
    </Component>
  )
}

export function StaggerItem({ children, className, as = 'li' }) {
  const Component = motion[as]
  return (
    <Component className={className} variants={staggerChild}>
      {children}
    </Component>
  )
}

/** Titre révélé mot à mot. */
export function WordReveal({
  text,
  className,
  delay = 0,
  accent,
  accentClassName = 'italic text-[#007FE1]',
}) {
  const words = text.split(' ')
  const accentWords = new Set(accent?.split(' '))
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <motion.span
              className={`inline-block ${accentWords.has(word) ? accentClassName : ''}`}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              transition={{ duration: 1, delay: delay + i * 0.06, ease: EASE }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && ' '}
          </span>
        ))}
      </span>
    </span>
  )
}

/** Nombre qui défile jusqu'à sa valeur quand il devient visible. */
export function CountUp({
  to,
  suffix = '',
  format = (n) => Math.round(n).toLocaleString('fr-FR'),
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  const value = useMotionValue(0)
  const formatRef = useRef(format)
  formatRef.current = format
  const [display, setDisplay] = useState(() => format(0))

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setDisplay(formatRef.current(to))
      return
    }
    const controls = animate(value, to, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (n) => setDisplay(formatRef.current(n)),
    })
    return () => controls.stop()
  }, [inView, reduce, to, value])

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  )
}

/** Animation d'entrée pour les cartes */
export function FadeUp({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Conteneur avec animation scale pour les modals et dropdowns */
export function ScaleIn({ children, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.18, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
