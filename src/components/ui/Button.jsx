/**
 * Composant Button — style Bailo × Dayo
 * Variantes : primary, secondary, ghost, danger
 */

const BASE = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0'

const variants = {
  primary:   `${BASE} bg-[#007FE1] px-4 py-2.5 text-sm text-white shadow-sm shadow-[#007FE1]/20 hover:-translate-y-px hover:bg-[#0066C0] hover:shadow-md hover:shadow-[#007FE1]/25`,
  secondary: `${BASE} border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 shadow-sm hover:-translate-y-px hover:border-stone-300 hover:shadow-md`,
  ghost:     `${BASE} px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900`,
  danger:    `${BASE} border border-red-200 bg-white px-4 py-2.5 text-sm text-red-700 hover:bg-red-50`,
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: '',          // géré par la variante
  lg: 'px-5 py-3 text-base',
}

function Button({
  children,
  variant = 'primary',
  size,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        variants[variant],
        size ? sizes[size] : '',
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Chargement…
        </>
      ) : children}
    </button>
  )
}

export default Button
