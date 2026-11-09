import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser = {
        id: 1,
        nom: 'KOTCHOFA',
        prenom: 'Boris',
        email: 'boris.kotchofa@dayo.africa',
        matricule: 'DG-001',
        role: 'super_admin', // Changé pour tester l'organigramme
        filiale: 'Dayo Group',
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
            <span>Espace employé sécurisé</span>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Carte */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

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
                <span className="text-xs font-semibold text-[#007FE1] tracking-widest uppercase">Espace employé</span>
              </div>

              {/* Titre */}
              <h1 className="text-2xl font-bold text-[#1D1D1B] mb-2">
                Connectez-vous à votre espace
              </h1>
              <p className="text-sm text-[#696969] mb-6">
                Bienvenue sur votre espace Dayo Assurance. Saisissez vos identifiants pour accéder à votre compte employé.
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Identifiant */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="identifier" className="text-sm font-medium text-[#1D1D1B]">
                    Identifiant (E-mail ou Matricule)
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Votre e-mail ou votre matricule"
                    className="w-full px-4 py-3 text-sm rounded-xl border border-[#D7D7D7] bg-white text-[#1D1D1B] placeholder-[#9B9B9A] focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
                  />
                </div>

                {/* Mot de passe */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-[#1D1D1B]">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full px-4 py-3 pr-11 text-sm rounded-xl border border-[#D7D7D7] bg-white text-[#1D1D1B] placeholder-[#9B9B9A] focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9B9B9A] hover:text-[#565655] transition-colors"
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mot de passe oublié */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-[#007FE1] hover:underline transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Bouton */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#007FE1] hover:bg-[#006AC0] text-white font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      Se connecter
                      <span className="text-lg leading-none">→</span>
                    </>
                  )}
                </button>
              </form>

              {/* Aide */}
              <p className="text-center text-xs text-[#9B9B9A] mt-5">
                Un problème de connexion ?{' '}
                <span className="text-[#007FE1] hover:underline cursor-pointer">
                  Contactez l'assistance.
                </span>
              </p>
            </div>
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

export default LoginPage
