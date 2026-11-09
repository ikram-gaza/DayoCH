import { NavLink } from 'react-router-dom'

// ============================================================
//  DAYO CH — Design System
//  Inspiré de Bailo · Couleurs officielles Groupe Dayo
// ============================================================

// ── Boutons ──────────────────────────────────────────────────
const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dayo-blue'

export const buttonVariants = {
  primary:   `${BUTTON_BASE} bg-dayo-blue px-4 py-2.5 text-sm text-white shadow-sm shadow-dayo-blue/20 hover:-translate-y-px hover:bg-dayo-blue-dark hover:shadow-md hover:shadow-dayo-blue/30`,
  secondary: `${BUTTON_BASE} border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 shadow-sm hover:-translate-y-px hover:border-stone-300 hover:shadow-md`,
  ghost:     `${BUTTON_BASE} px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900`,
  danger:    `${BUTTON_BASE} border border-red-200 bg-white px-4 py-2.5 text-sm text-red-700 hover:bg-red-50`,
  link:      'text-sm font-semibold text-dayo-blue hover:text-dayo-blue-dark hover:underline underline-offset-4',
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button className={`${buttonVariants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// ── Tones (palette de couleurs sémantiques) ──────────────────
const TILE_TONES = {
  blue:  'bg-[#E5F2FD] text-[#007FE1]',
  red:   'bg-red-50 text-red-600',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  stone: 'bg-stone-100 text-stone-600',
}

// ── IconTile ─────────────────────────────────────────────────
/** Icône dans un carré arrondi coloré */
export function IconTile({ icon: Icon, tone = 'blue', size = 'md' }) {
  const box = { sm: 'h-9 w-9 rounded-xl', md: 'h-11 w-11 rounded-xl', lg: 'h-14 w-14 rounded-2xl' }[size]
  const glyph = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }[size]
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center ${box} ${TILE_TONES[tone]}`}>
      <Icon className={glyph} />
    </span>
  )
}

// ── Avatar ────────────────────────────────────────────────────
const AVATAR_TONES = [
  'bg-[#E5F2FD] text-[#007FE1]',
  'bg-green-50 text-green-700',
  'bg-amber-50 text-amber-700',
  'bg-purple-50 text-purple-700',
  'bg-stone-100 text-stone-700',
]

/** Initiales dans un cercle coloré — couleur stable basée sur le nom */
export function Avatar({ name, size = 'md' }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  const tone = AVATAR_TONES[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % AVATAR_TONES.length]
  const box = { sm: 'h-9 w-9 text-xs', md: 'h-11 w-11 text-sm', lg: 'h-14 w-14 text-lg' }[size]
  return (
    <span className={`grid shrink-0 place-items-center rounded-full font-semibold ${box} ${tone}`}>
      {initials}
    </span>
  )
}

// ── PageHeader ────────────────────────────────────────────────
/** En-tête de page : titre, sous-titre, badge, actions */
export function PageHeader({ title, subtitle, badge, actions, icon: Icon, lead }) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {lead ?? (Icon && (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#E5F2FD]">
              <Icon className="h-6 w-6 text-[#007FE1]" />
            </span>
          ))}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="font-display text-3xl font-bold tracking-tight text-stone-900">{title}</h1>
              {badge}
            </div>
            {subtitle && <div className="mt-1 text-stone-500">{subtitle}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}

// ── Section ───────────────────────────────────────────────────
/** Bloc de page avec titre, description et action optionnelle */
export function Section({ title, description, action, children, className = 'mt-10' }) {
  return (
    <section className={className}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold tracking-tight text-stone-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

// ── Panel ─────────────────────────────────────────────────────
/** Carte blanche avec en-tête optionnel */
export function Panel({ title, icon: Icon, action, children, className = '', padded = true }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-5 py-3.5">
          <h2 className="flex items-center gap-2.5 font-semibold text-stone-900">
            {Icon && <Icon className="h-[18px] w-[18px] text-[#007FE1]" />}
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

// ── ListCard / ListRow ────────────────────────────────────────
/** Conteneur liste */
export function ListCard({ children, className = '' }) {
  return (
    <ul className={`divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}>
      {children}
    </ul>
  )
}

/** Ligne de liste cliquable avec chevron */
export function ListRow({ to, lead, title, subtitle, meta, trailing, muted = false }) {
  return (
    <li className={muted ? 'opacity-60' : ''}>
      <NavLink to={to} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-[#F0F8FF]">
        {lead}
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-stone-900">{title}</p>
          {subtitle && <p className="truncate text-sm text-stone-500">{subtitle}</p>}
          {meta && <p className="mt-0.5 truncate text-xs text-stone-400">{meta}</p>}
        </div>
        {trailing && <div className="flex shrink-0 flex-col items-end gap-1 text-right">{trailing}</div>}
        <span aria-hidden className="shrink-0 text-stone-300 transition group-hover:translate-x-0.5 group-hover:text-[#007FE1]">›</span>
      </NavLink>
    </li>
  )
}

// ── Stat ──────────────────────────────────────────────────────
/** Chiffre clé : libellé, valeur, précision et icône */
export function Stat({ label, value, hint, icon: Icon, tone = 'blue', valueClassName = '', children }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-default">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        {Icon && <IconTile icon={Icon} tone={tone} size="sm" />}
      </div>
      <p className={`mt-2 text-2xl font-bold tracking-tight tabular-nums text-stone-900 ${valueClassName}`}>{value}</p>
      {hint && <div className="mt-1 text-xs text-stone-500">{hint}</div>}
      {children}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────
const BADGE_TONES = {
  blue:    'bg-[#E5F2FD] text-[#007FE1]',
  green:   'bg-green-50 text-green-700',
  amber:   'bg-amber-50 text-amber-700',
  red:     'bg-red-50 text-red-700',
  stone:   'bg-stone-100 text-stone-600',
}

export function Badge({ tone = 'stone', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  )
}

// ── Notice ────────────────────────────────────────────────────
const NOTICE_TONES = {
  info:    ['border-[#007FE1]/20 bg-[#F0F8FF] text-[#00509A]', 'text-[#007FE1]'],
  warning: ['border-amber-200 bg-amber-50 text-amber-900',      'text-amber-600'],
  success: ['border-green-200 bg-green-50 text-green-900',      'text-green-700'],
  danger:  ['border-red-200 bg-red-50 text-red-900',            'text-red-600'],
}

/** Encadré d'information ou d'alerte */
export function Notice({ tone = 'info', title, children, action, className = 'mb-6' }) {
  const [colors] = NOTICE_TONES[tone]
  const icons = { info: '💡', warning: '⚠️', success: '✅', danger: '🚫' }
  return (
    <div className={`flex flex-wrap items-start gap-3 rounded-2xl border px-4 py-3.5 ${colors} ${className}`}>
      <span className="mt-0.5 text-base shrink-0">{icons[tone]}</span>
      <div className="min-w-[min(100%,14rem)] flex-1 text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

// ── Details / Detail ──────────────────────────────────────────
/** Liste « libellé : valeur » */
export function Details({ children }) {
  return <dl className="divide-y divide-stone-100">{children}</dl>
}

export function Detail({ label, children }) {
  if (children === null || children === undefined || children === '' || children === false) return null
  return (
    <div className="flex flex-wrap justify-between gap-x-6 gap-y-0.5 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-sm text-stone-500">{label}</dt>
      <dd className="text-right text-sm font-medium text-stone-900">{children}</dd>
    </div>
  )
}

// ── FormCard / FormSection / FormActions ──────────────────────
export function FormCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function FormSection({ title, description, children }) {
  return (
    <section className="grid gap-x-10 gap-y-4 border-b border-stone-100 px-5 py-6 last:border-b-0 sm:px-7 lg:grid-cols-[13rem_1fr]">
      <div>
        <h2 className="font-semibold text-stone-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  )
}

export function FormActions({ children }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 rounded-b-2xl border-t border-stone-100 bg-stone-50/70 px-5 py-4 sm:px-7">
      {children}
    </div>
  )
}

// ── Input / Label ─────────────────────────────────────────────
export function Label({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-700">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  )
}

export function Input({ className = '', error, ...props }) {
  return (
    <input
      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition
        ${error
          ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20'
          : 'border-stone-300 bg-white hover:border-stone-400 focus:border-[#007FE1] focus:ring-[#007FE1]/20'
        }
        focus:outline-none focus:ring-2 ${className}`}
      {...props}
    />
  )
}

// ── Empty state ───────────────────────────────────────────────
export function Empty({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-stone-100">
          <Icon className="h-6 w-6 text-stone-400" />
        </span>
      )}
      <p className="font-semibold text-stone-900">{title}</p>
      {description && <p className="mt-1 text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin text-current ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ── Divider ───────────────────────────────────────────────────
export function Divider({ label }) {
  if (!label) return <hr className="border-stone-200" />
  return (
    <div className="relative flex items-center gap-3">
      <div className="flex-1 border-t border-stone-200" />
      <span className="text-xs font-medium text-stone-400">{label}</span>
      <div className="flex-1 border-t border-stone-200" />
    </div>
  )
}
