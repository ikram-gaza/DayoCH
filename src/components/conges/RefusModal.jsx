import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

export default function RefusModal({ isOpen, demande, onClose, onConfirm }) {
  const [motifRefus, setMotifRefus] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !demande) return null

  const handleConfirm = (e) => {
    e.preventDefault()
    if (!motifRefus.trim()) {
      setError('Veuillez spécifier le motif du refus.')
      return
    }
    onConfirm(demande.id, motifRefus)
    setMotifRefus('')
    setError('')
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 18, width: '100%', maxWidth: 460,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        border: '1px solid #e7e5e4',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f5f5f4',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} />
            Refuser la demande de congé
          </h3>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8, border: 'none',
              background: '#f5f5f4', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#78716c',
            }}
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleConfirm} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: '#57534e', margin: 0, lineHeight: 1.5 }}>
            Vous êtes sur le point de refuser la demande de <strong>{demande.employeNom}</strong> pour la période du <strong>{demande.dateDebut}</strong> au <strong>{demande.dateFin}</strong> ({demande.nbJours} j.).
          </p>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Motif du refus <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              rows={3}
              value={motifRefus}
              onChange={(e) => { setMotifRefus(e.target.value); setError('') }}
              placeholder="Ex : Charge de travail élevée sur cette période, effectif minimum non atteint..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px', borderRadius: 10,
                border: `1px solid ${error ? '#fca5a5' : '#e7e5e4'}`, fontSize: 13,
                outline: 'none', resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            {error && <p style={{ fontSize: 11, color: '#dc2626', margin: '4px 0 0' }}>{error}</p>}
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px', borderRadius: 10, border: '1px solid #e7e5e4',
                background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(220,38,38,0.25)',
              }}
            >
              Confirmer le refus
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
