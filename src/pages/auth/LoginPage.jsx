import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
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
      setError('Veuillez saisir votre e-mail ou numéro de matricule.')
      return
    }
    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe.')
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 900))

      const mockUser = {
        id: 1,
        nom: 'KOTCHOFA',
        prenom: 'Boris',
        email: 'boris.kotchofa@dayo.africa',
        matricule: 'DG-001',
        role: 'super_admin',
        filiale: 'Dayo Group',
        twoFactorEnabled: identifier === '2fa',
      }

      const result = login(mockUser)
      if (result.requires2FA) {
        navigate('/2fa')
      } else {
        navigate('/dashboard')
      }
    } catch {
      setError('Identifiant ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">

      {/* Bandeau supérieur */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo Dayo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#007FE1] flex items-center justify-center shadow-sm">
              <span className="text-white text-sm font-bold leading-none">D</span>
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">Dayo RH</span>
          </div>
          <span className="text-xs text-stone-400">Espace employé sécurisé</span>
        </div>
      </header>

      {/* Contenu centré */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Titre au-dessus de la carte */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
              Connexion
            </h1>
            <p className="mt-1.5 text-sm text-stone-500">
              Accédez à votre espace Dayo Assurance
            </p>
          </div>

          {/* Carte */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">

            {/* Liseré bleu en haut */}
            <div className="h-0.5 bg-[#007FE1]" />

            <div className="p-7">

              {/* Erreur */}
              {error && (
                <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Identifiant */}
                <div className="space-y-1.5">
                  <label htmlFor="identifier" className="block text-sm font-medium text-stone-700">
                    E-mail ou matricule
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ex : a.diallo@dayo.africa ou DAY-001"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder-stone-400 transition hover:border-stone-400 focus:border-[#007FE1] focus:outline-none focus:ring-2 focus:ring-[#007FE1]/20"
                  />
                </div>

                {/* Mot de passe */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      className="text-xs font-medium text-[#007FE1] hover:text-[#0066C0] hover:underline underline-offset-4"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 pr-10 text-sm text-stone-900 placeholder-stone-400 transition hover:border-stone-400 focus:border-[#007FE1] focus:outline-none focus:ring-2 focus:ring-[#007FE1]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-stone-600 transition"
                      aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Bouton Se connecter */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#007FE1] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#007FE1]/20 transition duration-200 hover:-translate-y-px hover:bg-[#0066C0] hover:shadow-md hover:shadow-[#007FE1]/25 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Connexion…
                    </>
                  ) : (
                    <>
                      Se connecter
                      <span aria-hidden>→</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Aide */}
          <p className="mt-5 text-center text-xs text-stone-400">
            Problème de connexion ?{' '}
            <span className="cursor-pointer font-medium text-[#007FE1] hover:underline underline-offset-4">
              Contacter le service RH
            </span>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-stone-400">
          <span>© 2026 Dayo Assurance</span>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-stone-600 transition">Confidentialité</span>
            <span className="cursor-pointer hover:text-stone-600 transition">Aide</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LoginPage
