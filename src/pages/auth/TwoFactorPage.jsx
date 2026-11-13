import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Copy, Check, ArrowRight } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'motion/react'
import { useAuth } from '../../context/AuthContext'
import { buildOtpauthUri } from '../../utils/totp'

const EASE = [0.22, 1, 0.36, 1]
const CURRENT_YEAR = new Date().getFullYear()

function TwoFactorPage() {
  const navigate = useNavigate()
  const { pendingUser, user, verify2FA, refresh2FASetup } = useAuth()

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const inputRefs = useRef([])

  const requiresSetup = Boolean(pendingUser?.requiresSetup)
  const setupSecret = pendingUser?.setupSecret || ''
  const otpauthUri = setupSecret
    ? buildOtpauthUri({
        secret: setupSecret,
        accountName: pendingUser?.email || pendingUser?.matricule || 'utilisateur',
      })
    : ''

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(setupSecret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copie impossible. Sélectionnez la clé manuellement.')
    }
  }

  const handleRefresh = async () => {
    setError('')
    setCode(['', '', '', '', '', ''])
    setRefreshing(true)
    try {
      await refresh2FASetup()
      inputRefs.current[0]?.focus()
    } catch {
      setError('Impossible de régénérer le QR code. Veuillez réessayer.')
    } finally {
      setRefreshing(false)
    }
  }

  // Rediriger si aucun utilisateur en attente de 2FA (et pas déjà connecté)
  useEffect(() => {
    if (!pendingUser && !user) {
      navigate('/login', { replace: true })
    }
  }, [pendingUser, user, navigate])

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
      const success = await verify2FA(codeToVerify)
      if (success) {
        navigate('/dashboard', { replace: true })
      } else {
        const suffix = setupSecret ? setupSecret.slice(-4) : null
        setError(
          suffix
            ? `Code incorrect. Dans 2FAS, utilisez l'entrée …${suffix} et vérifiez l'heure de votre téléphone.`
            : "Code incorrect. Vérifiez le code affiché dans 2FAS et l'heure de votre téléphone.",
        )
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch {
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
  const disabled = !isComplete || loading

  const inputBorder = (digit) => (error ? '#fca5a5' : digit ? '#007FE1' : '#e7e5e4')
  const inputBackground = (digit) => (error ? '#fef2f2' : digit ? '#F0F8FF' : 'white')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafaf9' }}>

      {/* ── PANNEAU GAUCHE décoratif ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between items-center text-center p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #00509A 0%, #007FE1 60%, #0066C0 100%)' }}
      >
        <div style={{ position: 'absolute', right: -80, top: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', left: -60, bottom: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: 120, bottom: 120, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

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
            <p style={{ fontWeight: 700, color: 'white', fontSize: 15, fontFamily: 'Lora, Georgia, serif', letterSpacing: '-0.3px' }}>DayoPI</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Puls Infra</p>
          </div>
        </motion.div>

        {/* Contenu principal */}
        <div style={{ position: 'relative', maxWidth: 500, width: '100%' }}>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            style={{ fontSize: 12, fontWeight: 700, color: 'rgba(147,197,253,0.9)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16 }}
          >
            Sécurité du compte
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 40, fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: 20 }}
          >
            {requiresSetup ? (
              <>Activez votre <span style={{ color: '#93C5FD', fontStyle: 'italic' }}>double authentification.</span></>
            ) : (
              <>Vérifiez votre <span style={{ color: '#93C5FD', fontStyle: 'italic' }}>identité.</span></>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
            style={{ fontSize: 16, color: 'rgba(219,234,254,0.85)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 28px' }}
          >
            {requiresSetup
              ? 'Une étape obligatoire pour les rôles à privilèges. Scannez le QR code avec 2FAS et validez votre accès.'
              : 'Saisissez le code temporaire généré par 2FAS pour finaliser votre connexion sécurisée.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: EASE }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}
          >
            {['2FAS', 'TOTP · 30 s', '6 chiffres'].map((label) => (
              <span
                key={label}
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
                {label}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
          style={{ position: 'relative', fontSize: 12, color: 'rgba(147,197,253,0.7)' }}
        >
          © {CURRENT_YEAR} Groupe Dayo — Connexion sécurisée SSL
        </motion.p>
      </div>

      {/* ── PANNEAU DROIT : vérification ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header mobile */}
        <header
          className="lg:hidden"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid #e7e5e4',
            background: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #007FE1, #00509A)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>D</span>
            </div>
            <span style={{ fontWeight: 700, color: '#1c1917' }}>DayoPI</span>
          </div>
          <span style={{ fontSize: 12, color: '#a8a29e' }}>Espace sécurisé</span>
        </header>

        {/* Contenu centré */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            style={{ width: '100%', maxWidth: 400 }}
          >
            {/* Titre */}
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
              <div className="hidden lg:flex" style={{ justifyContent: 'center', marginBottom: 22 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'linear-gradient(135deg, #007FE1, #00509A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(0,127,225,0.3)',
                }}>
                  <ShieldCheck size={24} style={{ color: 'white' }} />
                </div>
              </div>
              <p style={{
                fontSize: 11, fontWeight: 700, color: '#007FE1',
                textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8,
              }}>
                {requiresSetup ? 'Activation obligatoire' : 'Double authentification'}
              </p>
              <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 28, fontWeight: 700, color: '#1c1917', letterSpacing: '-0.5px' }}>
                {requiresSetup ? 'Activez la 2FA' : 'Vérification 2FA'}
              </h1>
              <p style={{ marginTop: 8, fontSize: 15, color: '#78716c', lineHeight: 1.5 }}>
                {requiresSetup
                  ? 'Scannez le QR code avec 2FAS pour sécuriser votre compte.'
                  : 'Saisissez le code à 6 chiffres généré par 2FAS.'}
              </p>
            </div>

            {/* Carte formulaire */}
            <div style={{
              background: 'white',
              borderRadius: 20,
              border: '1px solid #e7e5e4',
              boxShadow: '0 10px 40px rgba(0,0,0,0.06)',
              padding: 28,
            }}>
              {error && (
                <div style={{
                  marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#dc2626', fontSize: 13, fontWeight: 600,
                }}>
                  {error}
                </div>
              )}

              {requiresSetup && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'center',
                    padding: 12, marginBottom: 12,
                    background: '#fafaf9', border: '1px solid #e7e5e4', borderRadius: 14,
                  }}>
                    {otpauthUri && <QRCodeSVG value={otpauthUri} size={190} level="M" />}
                  </div>
                  <p style={{ fontSize: 12, color: '#78716c', margin: '0 0 8px', textAlign: 'center' }}>
                    Scannez avec 2FAS, ou saisissez la clé manuellement :
                  </p>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '9px 12px', borderRadius: 10,
                    background: '#F0F8FF', border: '1px solid #D7E9FF',
                  }}>
                    <code style={{ flex: 1, fontSize: 11, color: '#1c1917', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                      {setupSecret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      aria-label="Copier la clé"
                      style={{
                        border: 'none', background: 'transparent', cursor: 'pointer',
                        color: copied ? '#16a34a' : '#007FE1', display: 'flex', padding: 2,
                      }}
                    >
                      {copied ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 10, marginTop: 10,
                  }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#78716c' }}>
                      Entrée 2FAS : <strong style={{ color: '#1c1917' }}>…{setupSecret ? setupSecret.slice(-4) : '----'}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={refreshing}
                      style={{
                        background: 'transparent', border: 'none', padding: 0,
                        fontSize: 11, fontWeight: 600, color: refreshing ? '#a8a29e' : '#007FE1',
                        cursor: refreshing ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {refreshing ? 'Régénération…' : 'Régénérer le QR'}
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <p style={{
                  fontSize: 12, fontWeight: 600, color: '#78716c',
                  textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
                }}>
                  Code à 6 chiffres
                </p>

                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }} onPaste={handlePaste}>
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
                      aria-label={`Chiffre ${index + 1}`}
                      style={{
                        width: '100%', height: 52, boxSizing: 'border-box',
                        textAlign: 'center', fontSize: 20, fontWeight: 700,
                        borderRadius: 12,
                        border: `1.5px solid ${inputBorder(digit)}`,
                        background: inputBackground(digit),
                        color: digit ? '#007FE1' : '#1c1917',
                        outline: 'none',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#007FE1'
                        e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.12)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = inputBorder(digit)
                        e.target.style.boxShadow = 'none'
                      }}
                    />
                  ))}
                </div>

                <p style={{ fontSize: 11, color: '#a8a29e', margin: '0 0 20px', lineHeight: 1.5 }}>
                  {requiresSetup
                    ? "Scannez le QR code, puis saisissez le code généré. Vérifiez que l'heure de votre téléphone est synchronisée automatiquement."
                    : "Utilisez le code actuellement affiché dans l'application. Vérifiez que l'heure de votre téléphone est synchronisée automatiquement."}
                </p>

                <button
                  type="submit"
                  disabled={disabled}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '13px 20px', fontSize: 14, fontWeight: 700, color: 'white',
                    background: disabled ? '#a8a29e' : 'linear-gradient(135deg, #007FE1, #0066C0)',
                    border: 'none', borderRadius: 12,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    boxShadow: disabled ? 'none' : '0 4px 16px rgba(0,127,225,0.3)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (!disabled) {
                      e.currentTarget.style.transform = 'translateY(-1px)'
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,127,225,0.38)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = disabled ? 'none' : '0 4px 16px rgba(0,127,225,0.3)'
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="animate-spin"
                        style={{
                          width: 16, height: 16, display: 'inline-block', borderRadius: '50%',
                          border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white',
                        }}
                      />
                      Vérification…
                    </>
                  ) : (
                    <>
                      {requiresSetup ? 'Activer et continuer' : 'Vérifier et continuer'}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Retour connexion */}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button
                type="button"
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent', border: 'none', padding: 0,
                  fontSize: 13, fontWeight: 600, color: '#007FE1', cursor: 'pointer',
                }}
              >
                ← Retour à la connexion
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default TwoFactorPage
