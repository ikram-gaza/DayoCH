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
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser = {
        id: 1,
        nom: 'Diallo',
        prenom: 'Amadou',
        email: 'amadou.diallo@dayo.com',
        matricule: 'DAY-001',
        role: 'employe',
        filiale: 'Dayo Assurance Siège',
        twoFactorEnabled: identifier === '2fa',
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
    <div className="min-h-screen flex">

      {/* Panneau gauche — branding Dayo */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #13366C 0%, #24426F 60%, #2390FF 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <span className="text-[#24426F] text-lg font-bold">D</span>
          </div>
          <span className="text-white text-xl font-semibold tracking-wide">Dayo Group</span>
        </div>

        {/* Citation centrale */}
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Gérez vos ressources humaines en toute sérénité
          </h2>
          <p className="text-[#B5D9FF] text-lg leading-relaxed">
            Une plateforme centralisée pour toutes vos filiales — congés, formations, évaluations et bien plus.
          </p>

          {/* Indicateurs */}
          <div className="flex gap-8 mt-10">
            <div>
              <p className="text-white text-2xl font-bold">7</p>
              <p className="text-[#90C6FF] text-sm">Modules RH</p>
            </div>
            <div>
              <p className="text-white text-2xl font-bold">4</p>
              <p className="text-[#90C6FF] text-sm">Rôles utilisateurs</p>
            </div>
            <div>
              <p className="text-white text-2xl font-bold">∞</p>
              <p className="text-[#90C6FF] text-sm">Filiales</p>
            </div>
          </div>
        </div>

        {/* Footer */}
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

          {/* Carte formulaire */}
          <div className="bg-white rounded-2xl shadow-md border border-[#D7D7D7] p-8">
            <h2 className="text-xl font-bold text-[#1D1D1B] mb-1">
              Connexion à votre espace
            </h2>
            <p className="text-sm text-[#696969] mb-6">
              Utilisez votre adresse e-mail ou votre numéro de matricule.
            </p>

            {/* Message d'erreur */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <svg className="w-4 h-4 text-[#E00613] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-[#E00613]">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Identifiant */}
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

              {/* Mot de passe */}
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
                    className="text-[#9B9B9A] hover:text-[#565655] transition-colors"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />
                    }
                  </button>
                }
              />

              {/* Mot de passe oublié */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-[#24426F] hover:text-[#007EFF] hover:underline transition-colors"
                >
                  Mot de passe oublié ?
                </button>
              </div>

              {/* Bouton connexion */}
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
          <p className="text-center text-xs text-[#9B9B9A] mt-6">
            Problème de connexion ?{' '}
            <span className="text-[#24426F] hover:underline cursor-pointer">
              Contacter le service RH
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
