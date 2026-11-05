import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, IdCard } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Détecter si l'identifiant est un email ou un matricule
  const isEmail = identifier.includes('@')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!identifier.trim()) {
      setError('Veuillez saisir votre email ou numéro de matricule.')
      return
    }
    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe.')
      return
    }

    setLoading(true)

    try {
      // TODO: remplacer par l'appel API réel
      // Simulation d'une connexion pour le développement
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser = {
        id: 1,
        nom: 'Diallo',
        prenom: 'Amadou',
        email: 'amadou.diallo@dayo.com',
        matricule: 'DAY-001',
        role: 'employe',
        filiale: 'Dayo Assurance Siège',
        twoFactorEnabled: identifier === '2fa', // simuler un user avec 2FA
      }

      const result = login(mockUser)

      if (result.requires2FA) {
        navigate('/2fa')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Identifiant ou mot de passe incorrect. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">D</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Dayo RH</h1>
          <p className="text-slate-500 text-sm mt-1">
            Plateforme de gestion des ressources humaines
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">
            Connexion à votre espace
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Utilisez votre adresse e-mail ou votre numéro de matricule.
          </p>

          {/* Message d'erreur global */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ identifiant (email ou matricule) */}
            <Input
              id="identifier"
              label="Adresse e-mail ou Numéro de matricule"
              placeholder="ex: amadou.diallo@dayo.com ou DAY-001"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              icon={
                isEmail
                  ? <Mail className="w-4 h-4" />
                  : <IdCard className="w-4 h-4" />
              }
              hint={
                identifier
                  ? isEmail
                    ? '✓ Connexion par adresse e-mail'
                    : '✓ Connexion par numéro de matricule'
                  : undefined
              }
            />

            {/* Champ mot de passe */}
            <Input
              id="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="Votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              }
            />

            {/* Lien mot de passe oublié */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-blue-700 hover:text-blue-800 hover:underline transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Bouton de connexion */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
            >
              Se connecter
            </Button>
          </form>
        </div>

        {/* Aide */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Problème de connexion ?{' '}
          <span className="text-blue-600 hover:underline cursor-pointer">
            Contacter le service RH
          </span>
        </p>

      </div>
    </div>
  )
}

export default LoginPage
