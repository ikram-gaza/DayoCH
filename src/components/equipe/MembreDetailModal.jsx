import {
  X, Mail, Phone, Building2, Hash, Briefcase,
  Calendar, MessageSquare, Inbox,
} from 'lucide-react'
import {
  ROLES_UTILISATEUR,
  STATUTS_UTILISATEUR,
} from '../../services/utilisateursService'
import {
  TYPES_CONGES,
  STATUTS_CONGES,
} from '../../services/congesService'
import {
  TYPES_SOLLICITATIONS,
  STATUTS_SOLLICITATIONS,
} from '../../services/sollicitationsService'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function Ligne({ icon: Icon, label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', borderBottom: '1px solid #f5f5f4' }}>
      <Icon size={15} style={{ color: '#a8a29e', marginTop: 2, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: '#a8a29e', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{label}</p>
        <div style={{ fontSize: 13, color: '#1c1917', fontWeight: 500, marginTop: 1 }}>{children}</div>
      </div>
    </div>
  )
}

function EmptyLine({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 14px', borderRadius: 10, background: '#fafaf9',
      fontSize: 12, color: '#a8a29e',
    }}>
      <Inbox size={14} /> {children}
    </div>
  )
}

export default function MembreDetailModal({ isOpen, membre, conges = [], sollicitations = [], onClose }) {
  if (!isOpen || !membre) return null

  const role = ROLES_UTILISATEUR[membre.role] || ROLES_UTILISATEUR.employe
  const statut = STATUTS_UTILISATEUR[membre.statut] || STATUTS_UTILISATEUR.actif
  const avatar = `${membre.prenom?.[0] || ''}${membre.nom?.[0] || ''}`.toUpperCase()

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
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <span style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: '#E5F2FD', color: '#007FE1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700,
            }}>
              {avatar}
            </span>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: 0 }}>
                {membre.prenom} {membre.nom}
              </h2>
              <p style={{ fontSize: 13, color: '#78716c', margin: '2px 0 0' }}>{membre.poste}</p>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={{ padding: '2px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700, color: role.color, background: role.bg }}>
                  {role.label}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700, color: statut.color, background: statut.bg }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: statut.dot }} />
                  {statut.label}
                </span>
              </div>
            </div>
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

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {/* Coordonnées */}
          <div>
            <Ligne icon={Mail} label="E-mail">{membre.email}</Ligne>
            <Ligne icon={Phone} label="Téléphone">{membre.telephone || '—'}</Ligne>
            <Ligne icon={Building2} label="Filiale">{membre.filiale}</Ligne>
            <Ligne icon={Hash} label="Matricule">{membre.matricule}</Ligne>
            <Ligne icon={Briefcase} label="Date d'embauche">{formatDate(membre.dateEmbauche)}</Ligne>
          </div>

          {/* Congés */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={13} /> Congés récents
            </p>
            {conges.length === 0 ? (
              <EmptyLine>Aucune demande de congé.</EmptyLine>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {conges.slice(0, 4).map((c) => {
                  const type = TYPES_CONGES.find((t) => t.id === c.typeId) || TYPES_CONGES[0]
                  const st = STATUTS_CONGES[c.statut] || STATUTS_CONGES.en_attente
                  return (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#fafaf9' }}>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1c1917' }}>{type.label}</span>
                        <span style={{ display: 'block', fontSize: 11, color: '#78716c' }}>
                          {formatDate(c.dateDebut)} → {formatDate(c.dateFin)} · {c.nbJours} j
                        </span>
                      </span>
                      <span style={{ flexShrink: 0, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, color: st.color, background: st.bg }}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sollicitations */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={13} /> Sollicitations récentes
            </p>
            {sollicitations.length === 0 ? (
              <EmptyLine>Aucune sollicitation.</EmptyLine>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sollicitations.slice(0, 4).map((s) => {
                  const type = TYPES_SOLLICITATIONS.find((t) => t.id === s.typeId) || TYPES_SOLLICITATIONS[0]
                  const st = STATUTS_SOLLICITATIONS[s.statut] || STATUTS_SOLLICITATIONS.en_attente
                  return (
                    <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '9px 12px', borderRadius: 10, background: '#fafaf9' }}>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#1c1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.objet}</span>
                        <span style={{ display: 'block', fontSize: 11, color: '#78716c' }}>{type.label} · {formatDate(s.dateCreation)}</span>
                      </span>
                      <span style={{ flexShrink: 0, padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, color: st.color, background: st.bg }}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
