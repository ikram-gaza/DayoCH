import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, ShieldCheck, Copy, Check, Loader2 } from 'lucide-react'
import { authService } from '../../services/authService'

export default function TwoFactorSetupModal({ user, onClose, onEnabled }) {
  const [loading, setLoading] = useState(true)
  const [secret, setSecret] = useState('')
  const [otpauthUri, setOtpauthUri] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    authService
      .prepare2FA(user)
      .then((data) => {
        if (cancelled) return
        setSecret(data.secret)
        setOtpauthUri(data.otpauthUri)
      })
      .catch(() => {
        if (!cancelled) setError('Impossible de préparer la double authentification.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copie impossible. Sélectionnez la clé manuellement.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (code.length !== 6) {
      setError('Saisissez le code à 6 chiffres.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const ok = await authService.enable2FA(user, secret, code)
      if (ok) onEnabled()
      else setError('Code invalide. Vérifiez le code affiché dans votre application.')
    } catch {
      setError('Une erreur est survenue. Réessayez.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tfa-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 440, background: 'white', borderRadius: 20,
        boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f5f5f4',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#E5F2FD',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShieldCheck size={18} style={{ color: '#007FE1' }} />
            </div>
            <div>
              <p id="tfa-title" style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>
                Activer la double authentification
              </p>
              <p style={{ fontSize: 11, color: '#a8a29e', margin: '1px 0 0' }}>
                Compatible 2FAS et autres applications TOTP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              border: 'none', background: 'transparent', cursor: 'pointer',
              width: 32, height: 32, borderRadius: 8, color: '#78716c',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '32px 0', color: '#78716c', fontSize: 13 }}>
              <Loader2 size={16} className="animate-spin" />
              Préparation de la clé de sécurité…
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: '#57534e', margin: 0, lineHeight: 1.5 }}>
                1. Scannez ce QR code avec 2FAS.
              </p>

              <div style={{
                alignSelf: 'center', padding: 12, background: 'white',
                border: '1px solid #e7e5e4', borderRadius: 14,
              }}>
                {otpauthUri && <QRCodeSVG value={otpauthUri} size={180} />}
              </div>

              <p style={{ fontSize: 12, color: '#78716c', margin: 0, textAlign: 'center' }}>
                Ou saisissez cette clé manuellement :
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: '#fafaf9', border: '1px solid #e7e5e4', borderRadius: 10,
                padding: '9px 12px',
              }}>
                <code style={{
                  flex: 1, fontSize: 12, color: '#1c1917', wordBreak: 'break-all',
                  fontFamily: 'monospace', letterSpacing: '0.05em',
                }}>
                  {secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copier la clé"
                  style={{
                    border: 'none', background: 'transparent', cursor: 'pointer',
                    color: copied ? '#16a34a' : '#007FE1', display: 'flex', padding: 4,
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  2. Code à 6 chiffres
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setError('')
                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }}
                  placeholder="000000"
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
                    fontSize: 20, fontWeight: 700, letterSpacing: '0.3em',
                    textAlign: 'center', borderRadius: 10, border: '1px solid #e7e5e4',
                    outline: 'none', color: '#1c1917',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = '#007FE1'; e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#e7e5e4'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <p style={{ fontSize: 11, color: '#a8a29e', margin: 0 }}>
                Le code change toutes les 30 s. Vérifiez que l'heure de votre téléphone est synchronisée automatiquement.
              </p>

              {error && (
                <p style={{ fontSize: 12, color: '#dc2626', margin: 0, fontWeight: 600 }}>{error}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 16px', fontSize: 13, fontWeight: 600, color: '#57534e',
                    background: 'white', border: '1px solid #e7e5e4', borderRadius: 10, cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || code.length !== 6}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', fontSize: 13, fontWeight: 700, color: 'white',
                    background: submitting || code.length !== 6 ? '#93c5fd' : '#007FE1',
                    border: 'none', borderRadius: 10,
                    cursor: submitting || code.length !== 6 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                  Activer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
