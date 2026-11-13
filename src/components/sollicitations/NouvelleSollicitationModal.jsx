import { useState, useMemo } from 'react'
import { X, MessageSquare, AlertCircle, Upload, Paperclip } from 'lucide-react'
import {
  TYPES_SOLLICITATIONS,
  PRIORITES_SOLLICITATIONS,
} from '../../services/sollicitationsService'

export default function NouvelleSollicitationModal({ isOpen, onClose, onSubmit }) {
  const [typeId, setTypeId] = useState('attestation_travail')
  const [objet, setObjet] = useState('')
  const [description, setDescription] = useState('')
  const [priorite, setPriorite] = useState('normale')
  const [dateSouhaitee, setDateSouhaitee] = useState('')
  const [pieceJointe, setPieceJointe] = useState(null)
  const [error, setError] = useState('')

  const selectedType = useMemo(
    () => TYPES_SOLLICITATIONS.find((t) => t.id === typeId) || TYPES_SOLLICITATIONS[0],
    [typeId]
  )

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!objet.trim()) {
      setError('Veuillez préciser l\'objet de votre sollicitation.')
      return
    }

    if (selectedType.requiresJustificatif && !pieceJointe && !description.trim()) {
      setError(`Pour « ${selectedType.label} », un justificatif ou une description détaillée est requis.`)
      return
    }

    onSubmit({
      typeId,
      objet,
      description,
      priorite,
      dateSouhaitee: dateSouhaitee || null,
      pieceJointe: pieceJointe ? pieceJointe.name : null,
    })

    setObjet('')
    setDescription('')
    setPriorite('normale')
    setDateSouhaitee('')
    setPieceJointe(null)
    setError('')
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 600,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #e7e5e4',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f5f5f4',
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={20} style={{ color: '#007FE1' }} />
              Nouvelle sollicitation
            </h2>
            <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
              Décrivez votre demande, elle sera transmise aux RH pour traitement.
            </p>
          </div>
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

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#FEF2F1', border: '1px solid #fecaca',
              borderRadius: 12, padding: '10px 14px', color: '#b91c1c', fontSize: 13,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Type de sollicitation */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Type de demande
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {TYPES_SOLLICITATIONS.map((t) => {
                const isSelected = t.id === typeId
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTypeId(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 12, textAlign: 'left',
                      background: isSelected ? t.bg : '#fafaf9',
                      border: `1.5px solid ${isSelected ? t.color : '#e7e5e4'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: isSelected ? t.color : '#e7e5e4',
                      color: isSelected ? 'white' : '#57534e',
                      fontSize: 10, fontWeight: 800, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {t.code}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1c1917' }}>
                        {t.label}
                      </span>
                      <span style={{ display: 'block', fontSize: 10, color: '#a8a29e' }}>
                        Délai indicatif : {t.delaiJours} j
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 11, color: '#a8a29e', margin: '8px 0 0' }}>
              {selectedType.description}
            </p>
          </div>

          {/* Objet */}
          <div>
            <label htmlFor="objet" style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Objet <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="objet"
              type="text"
              value={objet}
              onChange={(e) => setObjet(e.target.value)}
              placeholder="Ex. Attestation de travail pour dossier bancaire"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 14px', fontSize: 14, borderRadius: 12,
                border: '1px solid #d6d3d1', outline: 'none', color: '#1c1917',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#007FE1'; e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.12)' }}
              onBlur={(e) => { e.target.style.borderColor = '#d6d3d1'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Description {selectedType.requiresJustificatif && <span style={{ color: '#dc2626' }}>*</span>}
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez le contexte et les informations utiles au traitement de votre demande."
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'vertical',
                padding: '10px 14px', fontSize: 14, borderRadius: 12,
                border: '1px solid #d6d3d1', outline: 'none', color: '#1c1917',
                fontFamily: 'inherit',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#007FE1'; e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.12)' }}
              onBlur={(e) => { e.target.style.borderColor = '#d6d3d1'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          {/* Priorité + date souhaitée */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                Priorité
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                {Object.entries(PRIORITES_SOLLICITATIONS).map(([id, p]) => {
                  const isSelected = priorite === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPriorite(id)}
                      style={{
                        flex: 1, padding: '8px 6px', borderRadius: 10, cursor: 'pointer',
                        fontSize: 12, fontWeight: 700,
                        background: isSelected ? p.bg : 'white',
                        border: `1.5px solid ${isSelected ? p.color : '#e7e5e4'}`,
                        color: isSelected ? p.color : '#78716c',
                      }}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label htmlFor="dateSouhaitee" style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                Date souhaitée
              </label>
              <input
                id="dateSouhaitee"
                type="date"
                value={dateSouhaitee}
                onChange={(e) => setDateSouhaitee(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', fontSize: 13, borderRadius: 10,
                  border: '1px solid #d6d3d1', outline: 'none', color: '#1c1917',
                }}
              />
            </div>
          </div>

          {/* Pièce jointe */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Justificatif (optionnel)
            </label>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
              border: '1.5px dashed #d6d3d1', background: '#fafaf9',
              color: '#78716c', fontSize: 13,
            }}>
              {pieceJointe ? <Paperclip size={16} style={{ color: '#007FE1' }} /> : <Upload size={16} />}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {pieceJointe ? pieceJointe.name : 'Cliquez pour joindre un fichier (PDF, image)'}
              </span>
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => setPieceJointe(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px', borderRadius: 12, border: '1px solid #e7e5e4',
                background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #007FE1, #0066C0)',
                color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,127,225,0.25)',
              }}
            >
              Envoyer la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
