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

  // Gérer la saisie dans chaque case
  const handleChange = (index, value) => {
    // Accepter uniquement les chiffres
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1) // prendre seulement le dernier chiffre
    setCode(newCode)
    setError('')

    // Passer automatiquement à la case suivante
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Si tous les chiffres sont saisis, soumettre automatiquement
    if (value && index === 5) {
      const fullCode = [...newCode.slice(0, 5), value.slice(-1)].join('')
      if (fullCode.length === 6) {
        handleVerify(fullCode)
      }
    }
  }

  // Gérer la touche Retour arrière
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Gérer le collage d'un code complet
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

  // Vérifier le code
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
        setError('Code incorrect. Vérifiez votre application d\'authentification et réessayez.')
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">D</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Dayo RH</h1>
        </div>

        {/* Carte 2FA */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

          {/* Icône et titre */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-7 h-7 text-blue-700" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 text-center">
              Vérification de sécurité (2FA)
            </h2>
            <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">
              Pour protéger vos informations personnelles, saisissez le code
              à 6 chiffres généré par votre application d'authentification.
            </p>
          </div>

          {/* Nom de l'utilisateur */}
          {pendingUser && (
            <div className="bg-slate-50 rounded-lg px-4 py-3 mb-6 text-center">
              <p className="text-sm text-slate-600">
                Connexion en tant que{' '}
                <span className="font-semibold text-slate-900">
                  {pendingUser.prenom} {pendingUser.nom}
                </span>
              </p>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* 6 cases de saisie */}
            <div
              className="flex gap-2 justify-center mb-6"
              onPaste={handlePaste}
            >
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
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    ${digit ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-900'}
                    ${error ? 'border-red-400 bg-red-50' : ''}
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
            className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Revenir à la page de connexion
          </button>
        </div>

        {/* Aide */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Problème avec votre code ?{' '}
          <span className="text-blue-600 hover:underline cursor-pointer">
            Contacter un gestionnaire RH de votre filiale
          </span>
        </p>

      </div>
    </div>
  )
}

export default TwoFactorPage
