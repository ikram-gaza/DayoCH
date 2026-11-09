/**
 * Composant Input — style Bailo × Dayo
 */
function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  icon,
  rightElement,
  className = '',
  ...props
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-stone-700">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-stone-400">
            {icon}
          </span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={[
            'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition',
            'disabled:bg-stone-50 disabled:text-stone-400 disabled:cursor-not-allowed',
            icon ? 'pl-9' : '',
            rightElement ? 'pr-10' : '',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
              : 'border-stone-300 hover:border-stone-400 focus:border-[#007FE1] focus:ring-[#007FE1]/20',
            'focus:outline-none focus:ring-2',
          ].filter(Boolean).join(' ')}
          {...props}
        />

        {rightElement && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </span>
        )}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-600">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-stone-400">{hint}</p>
      )}
    </div>
  )
}

export default Input
