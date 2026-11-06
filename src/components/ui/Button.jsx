/**
 * Composant Button réutilisable — Charte Dayo Group
 * Variantes: primary, secondary, danger, ghost, accent
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed'

  const variants = {
    // Bleu marine Dayo — action principale
    primary:
      'bg-[#24426F] text-white hover:bg-[#13366C] focus:ring-[#24426F]',
    // Contour bleu — action secondaire
    secondary:
      'bg-white text-[#24426F] border border-[#24426F] hover:bg-[#D9EBFF] focus:ring-[#24426F]',
    // Orange Dayo — accent / CTA important
    accent:
      'bg-[#FF7600] text-white hover:bg-[#EC7C30] focus:ring-[#FF7600]',
    // Rouge — action destructive
    danger:
      'bg-[#E00613] text-white hover:bg-red-700 focus:ring-red-500',
    // Transparent — action tertiaire
    ghost:
      'bg-transparent text-[#24426F] hover:bg-[#D9EBFF] focus:ring-[#24426F]',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
          Chargement...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
