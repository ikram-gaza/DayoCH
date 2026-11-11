import { useState, useMemo } from 'react'
import { X, Calendar, AlertCircle, Upload, CheckCircle2, Info } from 'lucide-react'
import { TYPES_CONGES, calculerJoursOuvres } from '../../services/congesService'

export default function DemandeModal({ isOpen, onClose, onSubmit, soldes }) {
  const [typeId, setTypeId] = useState('conge_paye')
  const [dateDebut, setDateDebut] = useState('')
  const [demiJourneeDebut, setDemiJourneeDebut] = useState('journee')
  const [dateFin, setDateFin] = useState('')
  const [demiJourneeFin, setDemiJourneeFin] = useState('journee')
  const [motif, setMotif] = useState('')
  const [pieceJointe, setPieceJointe] = useState(null)
  const [error, setError] = useState('')

  const selectedType = useMemo(() => {
    return TYPES_CONGES.find(t => t.id === typeId) || TYPES_CONGES[0]
  }, [typeId])

  // Calcul du nombre de jours ouvrés en temps réel
  const nbJours = useMemo(() => {
    return calculerJoursOuvres(dateDebut, dateFin, demiJourneeDebut, demiJourneeFin)
  }, [dateDebut, dateFin, demiJourneeDebut, demiJourneeFin])

  // Vérification de dépassement de solde
  const depasseSolde = useMemo(() => {
    if (typeId === 'conge_paye' && soldes?.congesPayes) {
      return nbJours > soldes.congesPayes.restant
    }
    if (typeId === 'rtt' && soldes?.rtt) {
      return nbJours > soldes.rtt.restant
    }
    return false
  }, [typeId, nbJours, soldes])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!dateDebut || !dateFin) {
      setError('Veuillez renseigner la date de début et la date de fin.')
      return
    }

    if (new Date(dateFin) < new Date(dateDebut)) {
      setError('La date de fin ne peut pas être antérieure à la date de début.')
      return
    }

    if (nbJours <= 0) {
      setError('La période sélectionnée ne comporte aucun jour ouvré.')
      return
    }

    if (selectedType.requiresProof && !pieceJointe && !motif.trim()) {
      setError(`Pour un ${selectedType.label}, un motif ou un justificatif est requis.`)
      return
    }

    onSubmit({
      typeId,
      dateDebut,
      demiJourneeDebut,
      dateFin,
      demiJourneeFin,
      motif,
      pieceJointe: pieceJointe ? pieceJointe.name : null,
    })

    // Réinitialiser le formulaire
    setDateDebut('')
    setDateFin('')
    setMotif('')
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
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 580,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #e7e5e4',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header modal */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f5f5f4',
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={20} style={{ color: '#007FE1' }} />
              Nouvelle demande d'absence
            </h2>
            <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
              Soumettez votre demande pour validation par votre responsable.
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

        {/* Corps formulaire */}
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

          {/* Type d'absence */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
              Type d'absence
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {TYPES_CONGES.map((t) => {
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
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: isSelected ? t.color : '#e7e5e4',
                      color: isSelected ? 'white' : '#57534e',
                      fontSize: 10, fontWeight: 800, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      {t.code}
                    </span>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: isSelected ? t.color : '#1c1917', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {t.label}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 12, color: '#78716c', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Info size={13} style={{ color: selectedType.color, flexShrink: 0 }} />
              {selectedType.description}
            </p>
          </div>

          {/* Période (Début et Fin) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Début */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Date de début
              </label>
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13,
                  outline: 'none', background: 'white',
                }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setDemiJourneeDebut('journee')}
                  style={{
                    flex: 1, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    border: '1px solid', cursor: 'pointer',
                    background: demiJourneeDebut === 'journee' ? '#007FE1' : '#f5f5f4',
                    borderColor: demiJourneeDebut === 'journee' ? '#007FE1' : '#e7e5e4',
                    color: demiJourneeDebut === 'journee' ? 'white' : '#57534e',
                  }}
                >
                  Toute la journée
                </button>
                <button
                  type="button"
                  onClick={() => setDemiJourneeDebut('apres_midi')}
                  style={{
                    flex: 1, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    border: '1px solid', cursor: 'pointer',
                    background: demiJourneeDebut === 'apres_midi' ? '#007FE1' : '#f5f5f4',
                    borderColor: demiJourneeDebut === 'apres_midi' ? '#007FE1' : '#e7e5e4',
                    color: demiJourneeDebut === 'apres_midi' ? 'white' : '#57534e',
                  }}
                >
                  Après-midi
                </button>
              </div>
            </div>

            {/* Fin */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                Date de fin
              </label>
              <input
                type="date"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                min={dateDebut || undefined}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13,
                  outline: 'none', background: 'white',
                }}
              />
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setDemiJourneeFin('journee')}
                  style={{
                    flex: 1, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    border: '1px solid', cursor: 'pointer',
                    background: demiJourneeFin === 'journee' ? '#007FE1' : '#f5f5f4',
                    borderColor: demiJourneeFin === 'journee' ? '#007FE1' : '#e7e5e4',
                    color: demiJourneeFin === 'journee' ? 'white' : '#57534e',
                  }}
                >
                  Toute la journée
                </button>
                <button
                  type="button"
                  onClick={() => setDemiJourneeFin('matin')}
                  style={{
                    flex: 1, padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    border: '1px solid', cursor: 'pointer',
                    background: demiJourneeFin === 'matin' ? '#007FE1' : '#f5f5f4',
                    borderColor: demiJourneeFin === 'matin' ? '#007FE1' : '#e7e5e4',
                    color: demiJourneeFin === 'matin' ? 'white' : '#57534e',
                  }}
                >
                  Matinée
                </button>
              </div>
            </div>
          </div>

          {/* Résumé de durée */}
          {dateDebut && dateFin && (
            <div style={{
              background: depasseSolde ? '#FEF2F1' : '#F0F8FF',
              border: `1px solid ${depasseSolde ? 'rgba(220,38,38,0.2)' : 'rgba(0,127,225,0.2)'}`,
              borderRadius: 12, padding: '12px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: depasseSolde ? '#dc2626' : '#007FE1', margin: 0 }}>
                  Durée décomptée : {nbJours} jour{nbJours > 1 ? 's' : ''} ouvré{nbJours > 1 ? 's' : ''}
                </p>
                <p style={{ fontSize: 11, color: '#78716c', margin: '3px 0 0' }}>
                  Hors samedis et dimanches.
                  {typeId === 'conge_paye' && soldes?.congesPayes && (
                    <span> Solde restant : {soldes.congesPayes.restant} j.</span>
                  )}
                  {typeId === 'rtt' && soldes?.rtt && (
                    <span> Solde RTT : {soldes.rtt.restant} j.</span>
                  )}
                </p>
              </div>
              {depasseSolde && (
                <span style={{ fontSize: 11, fontWeight: 700, background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: 6 }}>
                  Dépassement de solde
                </span>
              )}
            </div>
          )}

          {/* Motif */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Motif / Commentaire {selectedType.requiresProof ? '(Obligatoire si pas de pièce)' : '(Facultatif)'}
            </label>
            <textarea
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Précisez la raison de votre absence ou toute précision utile pour votre manager..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px', borderRadius: 10,
                border: '1px solid #e7e5e4', fontSize: 13,
                outline: 'none', resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Pièce jointe */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Justificatif / Document {selectedType.requiresProof && <span style={{ color: '#dc2626' }}>*</span>}
            </label>
            <div style={{
              border: '2px dashed #e7e5e4', borderRadius: 12, padding: '16px',
              textAlign: 'center', background: '#fafaf9', cursor: 'pointer',
              position: 'relative',
            }}>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setPieceJointe(e.target.files[0] || null)}
                style={{
                  position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%',
                }}
              />
              <Upload size={20} style={{ color: '#a8a29e', margin: '0 auto 6px' }} />
              {pieceJointe ? (
                <p style={{ fontSize: 13, fontWeight: 600, color: '#16a34a', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} />
                  {pieceJointe.name}
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1c1917', margin: 0 }}>
                    Glissez votre fichier ici ou cliquez pour parcourir
                  </p>
                  <p style={{ fontSize: 11, color: '#a8a29e', margin: '3px 0 0' }}>
                    Formats acceptés : PDF, PNG, JPG (max. 5 Mo)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid #f5f5f4' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px', borderRadius: 10, border: '1px solid #e7e5e4',
                background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 20px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #007FE1, #0066C0)',
                color: 'white', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,127,225,0.25)',
              }}
            >
              <Calendar size={15} />
              Soumettre la demande
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
