import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

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
      // TODO: remplacer par l'appel API réel
      await new Promise((resolve) => setTimeout(resolve, 800))

      const success = verify2FA(codeToVerify)
      if (success) {
        navigate('/dashboard', { replace: true })
      } else {
        setError("Code incorrect. Vérifiez votre application d'authentification et réessayez.")
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
    <div className="min-h-screen flex">

      {/* Panneau gauche — branding Dayo */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #13366C 0%, #24426F 60%, #2390FF 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <span className="text-[#24426F] text-lg font-bold">D</span>
          </div>
          <span className="text-white text-xl font-semibold tracking-wide">Dayo Group</span>
        </div>

        <div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Votre sécurité est notre priorité
          </h2>
          <p className="text-[#B5D9FF] text-lg leading-relaxed">
            La double authentification protège votre compte même si votre mot de passe est compromis.
          </p>
        </div>

        <p className="text-[#6CB4FF] text-sm">
          © 2026 Dayo Group — Tous droits réservés
        </p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F8F8F8]">
        <div className="w-full max-w-md">

          {/* En-tête mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-lg"
                 style={{ background: 'linear-gradient(135deg, #24426F, #2390FF)' }}>
              <span className="text-white text-xl font-bold">D</span>
            </div>
            <h1 className="text-xl font-bold text-[#1D1D1B]">Dayo RH</h1>
          </div>

          {/* Carte 2FA */}
          <div className="bg-white rounded-2xl shadow-md border border-[#D7D7D7] p-8">

            {/* Icône et titre */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                   style={{ background: '#D9EBFF' }}>
                <ShieldCheck className="w-7 h-7 text-[#24426F]" />
              </div>
              <h2 className="text-xl font-bold text-[#1D1D1B] text-center">
                Vérification de sécurité
              </h2>
              <p className="text-sm text-[#696969] text-center mt-2 leading-relaxed">
                Saisissez le code à 6 chiffres généré par votre application
                d'authentification (Google/Microsoft Authenticator).
              </p>
            </div>

            {/* Nom de l'utilisateur */}
            {pendingUser && (
              <div className="bg-[#F8F8F8] rounded-lg px-4 py-3 mb-6 text-center border border-[#EBEBEB]">
                <p className="text-sm text-[#696969]">
                  Connexion en tant que{' '}
                  <span className="font-semibold text-[#1D1D1B]">
                    {pendingUser.prenom} {pendingUser.nom}
                  </span>
                </p>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <svg className="w-4 h-4 text-[#E00613] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-[#E00613]">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* 6 cases de saisie */}
              <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
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
                      w-11 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-[#24426F] focus:border-[#24426F]
                      ${digit
                        ? 'border-[#24426F] bg-[#D9EBFF] text-[#24426F]'
                        : 'border-[#D7D7D7] bg-white text-[#1D1D1B]'
                      }
                      ${error ? 'border-[#E00613] bg-red-50' : ''}
                    `}
                    aria-label={`Chiffre ${index + 1}`}
                  />
                ))}
              </div>

              {/* Bouton de validation */}
              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                disabled={!isComplete}
              >
                Confirmer et accéder à mon espace
              </Button>
            </form>

            {/* Lien retour */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-[#696969] hover:text-[#1D1D1B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Revenir à la page de connexion
            </button>
          </div>

          {/* Aide */}
          <p className="text-center text-xs text-[#9B9B9A] mt-6">
            Problème avec votre code ?{' '}
            <span className="text-[#24426F] hover:underline cursor-pointer">
              Contacter un gestionnaire RH de votre filiale
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorPage
