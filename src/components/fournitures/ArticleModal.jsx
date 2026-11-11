import { useState, useEffect } from 'react'
import { X, Package, AlertCircle } from 'lucide-react'
import { CATEGORIES_ARTICLES } from '../../services/fournituresService'
import { FILIALES } from '../../config/filiales'

export default function ArticleModal({ isOpen, article, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: '',
    reference: '',
    categorie: 'informatique',
    description: '',
    unite: 'pièce',
    stockActuel: 0,
    stockMin: 2,
    filiale: 'Dayo Bénin',
    typeDotation: 'consommable',
    prixUnitaire: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (article) {
      setFormData(article)
    } else {
      setFormData({
        nom: '',
        reference: '',
        categorie: 'informatique',
        description: '',
        unite: 'pièce',
        stockActuel: 0,
        stockMin: 2,
        filiale: 'Dayo Bénin',
        typeDotation: 'consommable',
        prixUnitaire: 0,
      })
    }
    setError('')
  }, [article, isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.nom.trim()) {
      setError('Veuillez renseigner le nom de l\'article.')
      return
    }

    onSave(formData)
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
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 540,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #e7e5e4', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px', borderBottom: '1px solid #f5f5f4',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={20} style={{ color: '#007FE1' }} />
            {article ? 'Modifier l\'article' : 'Ajouter une référence au stock'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none',
              background: '#f5f5f4', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#78716c',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              Désignation de l'article <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              placeholder="Ex : Écran 24 pouces Full HD, Souris optique..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', borderRadius: 10,
                border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Catégorie
              </label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              >
                {CATEGORIES_ARTICLES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Type de dotation
              </label>
              <select
                value={formData.typeDotation}
                onChange={(e) => setFormData({ ...formData, typeDotation: e.target.value })}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              >
                <option value="consommable">Consommable (Définitif)</option>
                <option value="emprunt">Matériel restitué (Emprunt)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Filiale de stockage
              </label>
              <select
                value={formData.filiale}
                onChange={(e) => setFormData({ ...formData, filiale: e.target.value })}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              >
                {FILIALES.map(f => (
                  <option key={f.id} value={f.nom}>{f.nom}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Unité de compte
              </label>
              <select
                value={formData.unite}
                onChange={(e) => setFormData({ ...formData, unite: e.target.value })}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              >
                <option value="pièce">Pièce / Unité</option>
                <option value="boîte">Boîte / Carton</option>
                <option value="rame">Rame</option>
                <option value="lot">Lot / Pack</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Stock initial
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockActuel}
                onChange={(e) => setFormData({ ...formData, stockActuel: parseInt(e.target.value, 10) || 0 })}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Seuil d'alerte
              </label>
              <input
                type="number"
                min="1"
                value={formData.stockMin}
                onChange={(e) => setFormData({ ...formData, stockMin: parseInt(e.target.value, 10) || 1 })}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Prix unit. (FCFA)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={formData.prixUnitaire}
                onChange={(e) => setFormData({ ...formData, prixUnitaire: parseInt(e.target.value, 10) || 0 })}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Description / Fiche technique
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Spécifications, compatibilité, recommandations d'usage..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px', borderRadius: 10,
                border: '1px solid #e7e5e4', fontSize: 13,
                outline: 'none', resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid #f5f5f4' }}>
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
                background: '#007FE1', color: 'white', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,127,225,0.25)',
              }}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
