import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function TwoFactorPage() {
  const navigate = useNavigate()
  const { pendingUser, verify2FA } = useAuth()

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef([])

  // Rediriger si aucun utilisateur en attente de 2FA
  useEffect(() => {
    if (!pendingUser) {
      navigate('/login', { replace: true })
    }
  }, [pendingUser, navigate])

  // Focus automatique sur le premier champ au chargement
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (value && index === 5) {
      const fullCode = [...newCode.slice(0, 5), value.slice(-1)].join('')
      if (fullCode.length === 6) handleVerify(fullCode)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
      handleVerify(pasted)
    }
  }

  const handleVerify = async (fullCode) => {
    const codeToVerify = fullCode || code.join('')
    if (codeToVerify.length !== 6) {
      setError('Veuillez saisir les 6 chiffres du code.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))

      const success = verify2FA(codeToVerify)
      if (success) {
        navigate('/dashboard', { replace: true })
      } else {
        setError("Code incorrect. Vérifiez votre application d'authentification.")
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleVerify()
  }

  const isComplete = code.every((digit) => digit !== '')

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#EEF2F7' }}>

      {/* Header */}
      <header className="bg-white border-b-2 border-[#007FE1]">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-[#007FE1] text-2xl font-bold tracking-tight">Dayo</span>
            <div className="w-px h-8 bg-gray-300 mx-1" />
            <div className="flex flex-col leading-tight">
              <span className="text-[#007FE1] text-[10px] font-semibold tracking-widest uppercase">Assurance</span>
              <span className="text-[#007FE1] text-[10px] font-semibold tracking-widest uppercase">Bénin</span>
            </div>
          </div>

          {/* Espace sécurisé */}
          <div className="flex items-center gap-1.5 text-sm text-[#007FE1]">
            <Lock className="w-4 h-4" />
            <span>Espace assuré sécurisé</span>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Carte */}
          <div className="bg-white rounded-2xl shadow-sm border border-dashed border-[#007FE1]/40 overflow-hidden">

            {/* Barre bleue top */}
            <div className="h-1 bg-[#007FE1]" />

            <div className="p-8">
              {/* Icône */}
              <div className="w-12 h-12 bg-[#007FE1] rounded-xl flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>

              {/* Badge */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#007FE1] inline-block" />
                <span className="text-xs font-semibold text-[#007FE1] tracking-widest uppercase">Double authentification</span>
              </div>

              {/* Titre */}
              <h1 className="text-2xl font-bold text-[#1D1D1B] mb-2">
                Vérifiez votre connexion
              </h1>
              <p className="text-sm text-[#696969] mb-6">
                Ouvrez votre application d'authentification et saisissez le code à 6 chiffres associé à votre compte Dayo Assurance.
              </p>

              {/* Erreur */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Label */}
                <p className="text-sm font-medium text-[#1D1D1B] mb-3">Code à 6 chiffres</p>

                {/* 6 cases */}
                <div className="flex gap-2 mb-2" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`
                        w-full h-12 text-center text-lg font-bold rounded-xl border-2 transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1]
                        ${digit
                          ? 'border-[#007FE1] bg-[#D9EBFF] text-[#007FE1]'
                          : 'border-[#D7D7D7] bg-white text-[#1D1D1B]'
                        }
                        ${error ? 'border-red-400 bg-red-50' : ''}
                      `}
                      aria-label={`Chiffre ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Hint */}
                <p className="text-xs text-[#9B9B9A] mb-5">
                  Utilisez le code actuellement affiché dans l'application.
                </p>

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={!isComplete || loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#007FE1] hover:bg-[#006AC0] text-white font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Vérification...
                    </>
                  ) : (
                    <>
                      Vérifier et continuer
                      <span className="text-lg leading-none">→</span>
                    </>
                  )}
                </button>
              </form>

              {/* Séparateur */}
              <div className="border-t border-[#EBEBEB] my-5" />

              {/* Code de récupération */}
              <div className="text-center">
                <p className="text-xs text-[#9B9B9A] mb-1">
                  Vous n'avez pas accès à votre application ?
                </p>
                <button
                  type="button"
                  className="text-sm text-[#007FE1] hover:underline font-medium transition-colors"
                >
                  Utiliser un code de récupération
                </button>
              </div>
            </div>
          </div>

          {/* Retour connexion */}
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-[#007FE1] hover:underline transition-colors border border-dashed border-[#007FE1]/40 px-4 py-1.5 rounded-lg"
            >
              ← Retour à la connexion
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-[#9B9B9A]">
          <span>© 2026 Dayo Assurance Bénin</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#007FE1] cursor-pointer transition-colors">Confidentialité</span>
            <span className="text-[#D7D7D7]">|</span>
            <span className="hover:text-[#007FE1] cursor-pointer transition-colors">Besoin d'aide ?</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TwoFactorPage
