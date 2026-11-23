import { useState } from 'react'
import {
  X, MessageSquare, Clock, User, Building2, CalendarClock,
  Check, Play, CheckCheck, XCircle, Ban, Paperclip, History,
} from 'lucide-react'
import {
  TYPES_SOLLICITATIONS,
  STATUTS_SOLLICITATIONS,
  PRIORITES_SOLLICITATIONS,
} from '../../services/sollicitationsService'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(date)
}

const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
      color, background: bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {label}
    </span>
  )
}

function Ligne({ icon: Icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 0', borderBottom: '1px solid #f5f5f4' }}>
      <Icon size={15} style={{ color: '#a8a29e', marginTop: 2, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: '#a8a29e', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
        <div style={{ fontSize: 13, color: '#1c1917', fontWeight: 500, marginTop: 1 }}>{children}</div>
      </div>
    </div>
  )
}

const actionLabels = {
  creation: 'Demande créée',
  prise_en_charge: 'Prise en charge',
  approbation: 'Approuvée',
  refus: 'Refusée',
  cloture: 'Clôturée',
  annulation: 'Annulée',
  modification: 'Modifiée',
}

export default function SollicitationDetailModal({
  isOpen, sollicitation, user, onClose, onChangerStatut, onAnnuler,
}) {
  const [modeRefus, setModeRefus] = useState(false)
  const [commentaire, setCommentaire] = useState('')

  if (!isOpen || !sollicitation) return null

  const type = TYPES_SOLLICITATIONS.find((t) => t.id === sollicitation.typeId) || TYPES_SOLLICITATIONS[0]
  const statut = STATUTS_SOLLICITATIONS[sollicitation.statut] || STATUTS_SOLLICITATIONS.en_attente
  const priorite = PRIORITES_SOLLICITATIONS[sollicitation.priorite] || PRIORITES_SOLLICITATIONS.normale

  const estManager = user?.role === 'manager' || user?.role === 'super_admin'
  const estProprietaire =
    sollicitation.employeId === user?.id ||
    sollicitation.employeMatricule === user?.matricule

  const peutTraiter = estManager && !estProprietaire && ['en_attente', 'en_cours', 'approuvee'].includes(sollicitation.statut)
  const peutAnnuler = estProprietaire && ['en_attente', 'en_cours'].includes(sollicitation.statut)

  const traiter = (nouveauStatut, avecCommentaire = false) => {
    onChangerStatut(sollicitation.id, nouveauStatut, avecCommentaire ? commentaire : null)
    setModeRefus(false)
    setCommentaire('')
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
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 620,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #e7e5e4',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f5f5f4', gap: 12,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
                color: type.color, background: type.bg, padding: '3px 8px', borderRadius: 6,
              }}>
                {type.code}
              </span>
              <span style={{ fontSize: 12, color: '#a8a29e', fontWeight: 600 }}>{sollicitation.reference}</span>
              <Badge label={statut.label} color={statut.color} bg={statut.bg} />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} style={{ color: '#007FE1', flexShrink: 0 }} />
              {sollicitation.objet}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none', flexShrink: 0,
              background: '#f5f5f4', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#78716c',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Description */}
          {sollicitation.description && (
            <div style={{
              background: '#fafaf9', borderRadius: 12, padding: '14px 16px',
              fontSize: 13, color: '#44403c', lineHeight: 1.6,
            }}>
              {sollicitation.description}
            </div>
          )}

          {/* Détails */}
          <div>
            <Ligne icon={User} label="Demandeur">
              {sollicitation.employeNom} · {sollicitation.employePoste}
            </Ligne>
            <Ligne icon={Building2} label="Filiale">{sollicitation.filiale}</Ligne>
            <Ligne icon={Clock} label="Priorité">
              <span style={{ color: priorite.color, fontWeight: 700 }}>{priorite.label}</span>
            </Ligne>
            <Ligne icon={CalendarClock} label="Date souhaitée">{formatDate(sollicitation.dateSouhaitee)}</Ligne>
            <Ligne icon={CalendarClock} label="Créée le">{formatDateTime(sollicitation.dateCreation)}</Ligne>
            {sollicitation.pieceJointe && (
              <Ligne icon={Paperclip} label="Justificatif">{sollicitation.pieceJointe}</Ligne>
            )}
            {sollicitation.traitePar && (
              <Ligne icon={CheckCheck} label="Traité par">{sollicitation.traitePar}</Ligne>
            )}
            {sollicitation.commentaireTraitement && (
              <Ligne icon={MessageSquare} label="Commentaire">
                <span style={{ color: sollicitation.statut === 'refusee' ? '#b91c1c' : '#44403c' }}>
                  {sollicitation.commentaireTraitement}
                </span>
              </Ligne>
            )}
          </div>

          {/* Historique */}
          {sollicitation.historique?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <History size={13} /> Historique
              </p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sollicitation.historique.map((h, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: '#57534e' }}>
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                      background: i === sollicitation.historique.length - 1 ? '#007FE1' : '#d6d3d1',
                    }} />
                    <span style={{ minWidth: 0 }}>
                      <strong style={{ color: '#1c1917' }}>{actionLabels[h.action] || h.action}</strong>
                      {' · '}{h.auteur}{' · '}
                      <span style={{ color: '#a8a29e' }}>{formatDateTime(h.date)}</span>
                      {h.commentaire && <span style={{ display: 'block', color: '#78716c', marginTop: 1 }}>{h.commentaire}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Zone de refus */}
          {modeRefus && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>
                Motif du refus
              </label>
              <textarea
                rows={3}
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Expliquez la raison du refus ou la solution alternative proposée."
                style={{
                  width: '100%', boxSizing: 'border-box', resize: 'vertical',
                  padding: '10px 14px', fontSize: 13, borderRadius: 12,
                  border: '1px solid #d6d3d1', outline: 'none', color: '#1c1917', fontFamily: 'inherit',
                }}
              />
            </div>
          )}

          {/* Actions */}
          {(peutTraiter || peutAnnuler) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid #f5f5f4', paddingTop: 16 }}>
              {peutAnnuler && (
                <button
                  type="button"
                  onClick={() => { onAnnuler(sollicitation.id); onClose() }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 16px', borderRadius: 12, border: '1px solid #e7e5e4',
                    background: 'white', color: '#78716c', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Ban size={15} /> Annuler ma demande
                </button>
              )}

              {peutTraiter && sollicitation.statut === 'en_attente' && (
                <button
                  type="button"
                  onClick={() => traiter('en_cours')}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 16px', borderRadius: 12, border: '1px solid #BFE0FB',
                    background: '#E5F2FD', color: '#007FE1', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <Play size={15} /> Prendre en charge
                </button>
              )}

              {peutTraiter && !modeRefus && (
                <button
                  type="button"
                  onClick={() => setModeRefus(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 16px', borderRadius: 12, border: '1px solid #fecaca',
                    background: '#FEF2F1', color: '#b91c1c', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <XCircle size={15} /> Refuser
                </button>
              )}

              {modeRefus ? (
                <button
                  type="button"
                  onClick={() => traiter('refusee', true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    padding: '9px 18px', borderRadius: 12, border: 'none',
                    background: '#dc2626', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <XCircle size={15} /> Confirmer le refus
                </button>
              ) : (
                peutTraiter && (
                  <button
                    type="button"
                    onClick={() => traiter(sollicitation.statut === 'en_cours' ? 'traitee' : 'approuvee')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 7,
                      padding: '9px 18px', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #16a34a, #15803d)',
                      color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
                    }}
                  >
                    {sollicitation.statut === 'en_cours' ? <><CheckCheck size={15} /> Marquer résolue</> : <><Check size={15} /> Approuver</>}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
