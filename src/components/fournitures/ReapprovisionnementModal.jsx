import { useState } from 'react'
import { X, PlusCircle, AlertCircle } from 'lucide-react'

export default function ReapprovisionnementModal({ isOpen, article, onClose, onConfirm }) {
  const [quantite, setQuantite] = useState('')
  const [motif, setMotif] = useState('')
  const [error, setError] = useState('')

  if (!isOpen || !article) return null

  const handleConfirm = (e) => {
    e.preventDefault()
    const qteNum = parseInt(quantite, 10)
    if (isNaN(qteNum) || qteNum <= 0) {
      setError('Veuillez saisir une quantité positive valide.')
      return
    }

    onConfirm(article.id, qteNum, motif || 'Livraison fournisseur')
    setQuantite('')
    setMotif('')
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
        border: '1px solid #e7e5e4', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f5f5f4',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#16a34a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PlusCircle size={18} />
            Réapprovisionnement de stock
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

        {/* Form */}
        <form onSubmit={handleConfirm} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: '#fafaf9', padding: '12px 14px', borderRadius: 12,
            border: '1px solid #e7e5e4',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1c1917', margin: 0 }}>{article.nom}</p>
            <p style={{ fontSize: 11, color: '#78716c', margin: '3px 0 0' }}>
              Réf. {article.reference} · Filiale : {article.filiale} · Stock actuel : <strong>{article.stockActuel} {article.unite}s</strong>
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#FEF2F1', border: '1px solid #fecaca',
              borderRadius: 10, padding: '8px 12px', color: '#dc2626', fontSize: 12,
            }}>
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Quantité à ajouter ({article.unite}s) <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="number"
              min="1"
              value={quantite}
              onChange={(e) => { setQuantite(e.target.value); setError('') }}
              placeholder="Ex : 10"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', borderRadius: 10,
                border: '1px solid #e7e5e4', fontSize: 14, fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Référence du bon / Motif
            </label>
            <input
              type="text"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : BL Fournisseur 2026-904, Réception stock central"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', borderRadius: 10,
                border: '1px solid #e7e5e4', fontSize: 13,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 6 }}>
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
                background: '#16a34a', color: 'white', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.25)',
              }}
            >
              Ajouter au stock
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
