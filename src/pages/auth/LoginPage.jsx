import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1]

const FILIALES = [
  { code: 'BEN', flag: '🇧🇯', name: 'Dayo Bénin' },
  { code: 'GIN', flag: '🇬🇳', name: 'Dayo Guinée' },
  { code: 'BFA', flag: '🇧🇫', name: 'Dayo Burkina' },
  { code: 'CIV', flag: '🇨🇮', name: 'Dayo CI' },
]

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

export default function LoginPage() {
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
    if (!identifier.trim()) { setError('Veuillez saisir votre e-mail ou matricule.'); return }
    if (!password.trim())   { setError('Veuillez saisir votre mot de passe.'); return }

    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 900))
      const mockUser = {
        id: 1, nom: 'KOTCHOFA', prenom: 'Boris',
        email: 'boris.kotchofa@dayo.africa', matricule: 'DG-001',
        role: 'super_admin', filiale: 'Dayo Group',
        twoFactorEnabled: identifier === '2fa',
      }
      const result = login(mockUser)
      if (result.requires2FA) navigate('/2fa')
      else navigate('/dashboard')
    } catch {
      setError('Identifiant ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafaf9' }}>

      {/* ── PANNEAU GAUCHE décoratif ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #00509A 0%, #007FE1 60%, #0066C0 100%)' }}
      >
        {/* Cercles décoratifs */}
        <div style={{ position: 'absolute', right: -80, top: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: -60, bottom: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: 120, bottom: 120, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Grille décorative */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white', fontStyle: 'italic', fontFamily: 'Lora, Georgia, serif' }}>D</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, color: 'white', fontSize: 15, fontFamily: 'Lora, Georgia, serif', letterSpacing: '-0.3px' }}>Dayo CH</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Capital Humain</p>
          </div>
        </motion.div>

        {/* Contenu principal gauche */}
        <div style={{ position: 'relative' }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            style={{ fontSize: 12, fontWeight: 700, color: 'rgba(147,197,253,0.9)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}
          >
            Groupe Dayo · Assurance &amp; Finance
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 40, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 20 }}
          >
            Gérez votre capital humain avec{' '}
            <span style={{ color: '#93C5FD', fontStyle: 'italic' }}>excellence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            style={{ fontSize: 16, color: 'rgba(219,234,254,0.85)', lineHeight: 1.7, maxWidth: 380, marginBottom: 28 }}
          >
            Congés, formations, évaluations et organigramme — tout en un seul espace sécurisé pour vos équipes en Afrique.
          </motion.p>

          {/* Filiales */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}
          >
            {FILIALES.map(({ code, flag, name }) => (
              <span
                key={code}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12, fontWeight: 600, color: 'white',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <span>{flag}</span> {name}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Footer gauche */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
          style={{ position: 'relative', fontSize: 12, color: 'rgba(147,197,253,0.7)' }}
        >
          © {new Date().getFullYear()} Groupe Dayo — Connexion sécurisée SSL
        </motion.p>
      </div>

      {/* ── PANNEAU DROIT : formulaire ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header mobile */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #e7e5e4',
          background: 'white',
        }} className="lg:hidden">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #007FE1, #00509A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>D</span>
            </div>
            <span style={{ fontWeight: 700, color: '#1c1917' }}>Dayo CH</span>
          </div>
          <span style={{ fontSize: 12, color: '#a8a29e' }}>Espace sécurisé</span>
        </header>

        {/* Formulaire centré */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            {/* Titre */}
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
              {/* Logo visible desktop */}
              <div className="hidden lg:flex" style={{ justifyContent: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'linear-gradient(135deg, #007FE1, #00509A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,127,225,0.3)',
                }}>
                  <span style={{ color: 'white', fontWeight: 800, fontSize: 22, fontStyle: 'italic', fontFamily: 'Lora, Georgia, serif' }}>D</span>
                </div>
              </div>
              <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 28, fontWeight: 700, color: '#1c1917', letterSpacing: '-0.5px' }}>
                Connexion
              </h1>
              <p style={{ marginTop: 8, fontSize: 15, color: '#78716c' }}>
                Accédez à votre espace Dayo Assurance
              </p>
            </div>

            {/* Carte formulaire */}
            <div style={{
              background: 'white',
              borderRadius: 20,
              border: '1px solid #e7e5e4',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              overflow: 'hidden',
            }}>
              {/* Liseré gradient */}
              <div style={{ height: 4, background: 'linear-gradient(90deg, #007FE1, #00509A)' }} />

              <div style={{ padding: 28 }}>
                {/* Erreur */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                        background: '#FEF2F1', border: '1px solid #fecaca',
                        borderRadius: 12, padding: '12px 14px',
                        marginBottom: 20, fontSize: 13, color: '#b91c1c',
                      }}
                    >
                      <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                  {/* Identifiant */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label htmlFor="identifier" style={{ fontSize: 13, fontWeight: 600, color: '#44403c' }}>
                      E-mail ou matricule
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="a.diallo@dayo.africa ou DAY-001"
                      style={{
                        width: '100%', padding: '10px 14px', fontSize: 14,
                        border: `1px solid ${error ? '#fca5a5' : '#d6d3d1'}`,
                        borderRadius: 12, outline: 'none', color: '#1c1917',
                        background: error ? '#FEF2F1' : 'white',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#007FE1'
                        e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.15)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = error ? '#fca5a5' : '#d6d3d1'
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Mot de passe */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label htmlFor="password" style={{ fontSize: 13, fontWeight: 600, color: '#44403c' }}>
                        Mot de passe
                      </label>
                      <button type="button" style={{ fontSize: 12, fontWeight: 600, color: '#007FE1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        Oublié ?
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Votre mot de passe"
                        style={{
                          width: '100%', padding: '10px 42px 10px 14px', fontSize: 14,
                          border: `1px solid ${error ? '#fca5a5' : '#d6d3d1'}`,
                          borderRadius: 12, outline: 'none', color: '#1c1917',
                          background: error ? '#FEF2F1' : 'white',
                          transition: 'border-color 0.15s, box-shadow 0.15s',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#007FE1'
                          e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.15)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = error ? '#fca5a5' : '#d6d3d1'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: '#a8a29e', display: 'flex', alignItems: 'center',
                        }}
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Bouton connexion */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: 4,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      width: '100%', padding: '11px 20px',
                      background: loading ? '#a8a29e' : 'linear-gradient(135deg, #007FE1, #0066C0)',
                      color: 'white', fontWeight: 700, fontSize: 14,
                      border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 16px rgba(0,127,225,0.3)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,127,225,0.4)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,127,225,0.3)'
                      e.currentTarget.style.transform = 'none'
                    }}
                  >
                    {loading ? (
                      <><Spinner /> Connexion…</>
                    ) : (
                      <>Se connecter <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Aide */}
            <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#a8a29e' }}>
              Problème de connexion ?{' '}
              <span style={{ color: '#007FE1', fontWeight: 600, cursor: 'pointer' }}>
                Contacter le service RH
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
