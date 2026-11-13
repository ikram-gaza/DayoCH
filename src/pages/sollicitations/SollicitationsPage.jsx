import { useState, useMemo } from 'react'
import {
  MessageSquare, Plus, Search, CheckCircle2, Clock, Inbox,
  CheckCheck, XCircle, User, Users, Building2, ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  sollicitationsService,
  mesSollicitationsDe,
  sollicitationsATraiterDe,
  statsSollicitationsDe,
  TYPES_SOLLICITATIONS,
  STATUTS_SOLLICITATIONS,
  PRIORITES_SOLLICITATIONS,
} from '../../services/sollicitationsService'
import NouvelleSollicitationModal from '../../components/sollicitations/NouvelleSollicitationModal'
import SollicitationDetailModal from '../../components/sollicitations/SollicitationDetailModal'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function StatCard({ label, value, hint, icon: Icon, color, bg }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '18px 20px',
      border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span style={{
          width: 32, height: 32, borderRadius: 10, background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          <Icon size={16} />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#1c1917' }}>{value}</span>
        {hint && <span style={{ fontSize: 12, color: '#78716c' }}>{hint}</span>}
      </div>
    </div>
  )
}

function SollicitationCard({ sollicitation, afficherDemandeur, onOpen }) {
  const type = TYPES_SOLLICITATIONS.find((t) => t.id === sollicitation.typeId) || TYPES_SOLLICITATIONS[0]
  const statut = STATUTS_SOLLICITATIONS[sollicitation.statut] || STATUTS_SOLLICITATIONS.en_attente
  const priorite = PRIORITES_SOLLICITATIONS[sollicitation.priorite] || PRIORITES_SOLLICITATIONS.normale

  return (
    <div
      onClick={() => onOpen(sollicitation)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(sollicitation) } }}
      style={{
        background: 'white', borderRadius: 16, padding: '16px 18px',
        border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Icône type */}
        <span style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          background: type.bg, color: type.color,
          fontSize: 11, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {type.code}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#a8a29e', fontWeight: 700 }}>{sollicitation.reference}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              color: statut.color, background: statut.bg,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: statut.dot }} />
              {statut.label}
            </span>
            {sollicitation.priorite === 'haute' && (
              <span style={{
                padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
                color: priorite.color, background: priorite.bg,
              }}>
                Priorité haute
              </span>
            )}
          </div>

          <p style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {sollicitation.objet}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginTop: 6 }}>
            {afficherDemandeur && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#78716c' }}>
                <User size={12} /> {sollicitation.employeNom}
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#78716c' }}>
              <Building2 size={12} /> {sollicitation.filiale}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#78716c' }}>
              <Clock size={12} /> {formatDate(sollicitation.dateCreation)}
            </span>
          </div>
        </div>

        <ArrowRight size={16} style={{ color: '#d6d3d1', flexShrink: 0, marginTop: 12 }} />
      </div>
    </div>
  )
}

export default function SollicitationsPage() {
  const { user } = useAuth()
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'super_admin'

  const [activeTab, setActiveTab] = useState('mes')
  const [toutes, setToutes] = useState(() => sollicitationsService.getAll())
  const [filtreStatut, setFiltreStatut] = useState('all')
  const [filtreType, setFiltreType] = useState('all')
  const [recherche, setRecherche] = useState('')

  const [showNouvelle, setShowNouvelle] = useState(false)
  const [selection, setSelection] = useState(null)

  const [toastMessage, setToastMessage] = useState(null)

  const recharger = () => setToutes([...sollicitationsService.getAll()])

  const afficherToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const mesSollicitations = useMemo(
    () => mesSollicitationsDe(toutes, user),
    [toutes, user]
  )

  const aTraiter = useMemo(
    () => sollicitationsATraiterDe(toutes, user),
    [toutes, user]
  )

  const stats = useMemo(
    () => statsSollicitationsDe(toutes, user),
    [toutes, user]
  )

  const source = activeTab === 'mes' ? mesSollicitations : aTraiter

  const listeFiltree = useMemo(() => {
    return source.filter((s) => {
      const matchStatut = filtreStatut === 'all' || s.statut === filtreStatut
      const matchType = filtreType === 'all' || s.typeId === filtreType
      const terme = recherche.trim().toLowerCase()
      const matchRecherche = terme === '' ||
        s.objet?.toLowerCase().includes(terme) ||
        s.reference?.toLowerCase().includes(terme) ||
        s.employeNom?.toLowerCase().includes(terme)
      return matchStatut && matchType && matchRecherche
    })
  }, [source, filtreStatut, filtreType, recherche])

  const handleCreer = (data) => {
    sollicitationsService.creerSollicitation(user, data)
    recharger()
    setActiveTab('mes')
    afficherToast('Votre sollicitation a été soumise avec succès.')
  }

  const handleChangerStatut = (id, statut, commentaire) => {
    sollicitationsService.changerStatut(id, statut, user, commentaire)
    recharger()
    const messages = {
      en_cours: 'Sollicitation prise en charge.',
      approuvee: 'Sollicitation approuvée.',
      traitee: 'Sollicitation marquée comme traitée.',
      refusee: 'Sollicitation refusée.',
    }
    afficherToast(messages[statut] || 'Statut mis à jour.')
  }

  const handleAnnuler = (id) => {
    sollicitationsService.annuler(id, user)
    recharger()
    afficherToast('Sollicitation annulée.')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: '#1c1917', color: 'white', padding: '12px 20px',
          borderRadius: 14, fontSize: 13, fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <MessageSquare size={24} style={{ color: '#007FE1' }} />
            Sollicitations
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            Attestations, avances, missions, formations… soumettez et suivez vos demandes RH.
          </p>
        </div>
        <button
          onClick={() => setShowNouvelle(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #007FE1, #0066C0)',
            color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)',
          }}
        >
          <Plus size={16} />
          Nouvelle sollicitation
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard label="En attente" value={stats.enAttente} hint="demandes" icon={Clock} color="#a16207" bg="#fef9c3" />
        <StatCard label="En cours" value={stats.enCours} hint="en traitement" icon={Inbox} color="#007FE1" bg="#E5F2FD" />
        <StatCard label="Traitées" value={stats.traitees} hint="approuvées" icon={CheckCheck} color="#15803d" bg="#dcfce7" />
        <StatCard label="Refusées" value={stats.refusees} hint="ce cycle" icon={XCircle} color="#b91c1c" bg="#FEF2F1" />
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e7e5e4', paddingBottom: 2 }}>
        <button
          onClick={() => setActiveTab('mes')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10, border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'mes' ? '#007FE1' : 'transparent',
            color: activeTab === 'mes' ? 'white' : '#57534e',
            transition: 'all 0.15s',
          }}
        >
          <User size={15} />
          Mes sollicitations ({mesSollicitations.length})
        </button>

        {isManagerOrAdmin && (
          <button
            onClick={() => setActiveTab('a_traiter')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 10, border: 'none',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: activeTab === 'a_traiter' ? '#007FE1' : 'transparent',
              color: activeTab === 'a_traiter' ? 'white' : '#57534e',
              transition: 'all 0.15s',
            }}
          >
            <Users size={15} />
            À traiter ({aTraiter.length})
          </button>
        )}
      </div>

      {/* Filtres */}
      <div style={{
        background: 'white', borderRadius: 14, padding: '14px 18px',
        border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 240, maxWidth: 360 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher par objet, référence ou collaborateur…"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px 9px 34px', fontSize: 13, borderRadius: 10,
                border: '1px solid #e7e5e4', outline: 'none', color: '#1c1917',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            style={{
              padding: '9px 12px', fontSize: 13, borderRadius: 10,
              border: '1px solid #e7e5e4', background: 'white', color: '#57534e',
              fontWeight: 600, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUTS_SOLLICITATIONS).map(([id, s]) => (
              <option key={id} value={id}>{s.label}</option>
            ))}
          </select>

          <select
            value={filtreType}
            onChange={(e) => setFiltreType(e.target.value)}
            style={{
              padding: '9px 12px', fontSize: 13, borderRadius: 10,
              border: '1px solid #e7e5e4', background: 'white', color: '#57534e',
              fontWeight: 600, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="all">Tous les types</option>
            {TYPES_SOLLICITATIONS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste */}
      {listeFiltree.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px dashed #d6d3d1',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <span style={{
            width: 56, height: 56, borderRadius: 16, background: '#f5f5f4',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#a8a29e', marginBottom: 14,
          }}>
            <Inbox size={24} />
          </span>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>
            Aucune sollicitation
          </p>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            {activeTab === 'mes'
              ? 'Vous n\'avez aucune demande pour ces critères.'
              : 'Aucune demande de votre équipe à traiter pour le moment.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {listeFiltree.map((s) => (
            <SollicitationCard
              key={s.id}
              sollicitation={s}
              afficherDemandeur={activeTab === 'a_traiter'}
              onOpen={setSelection}
            />
          ))}
        </div>
      )}

      {/* Modales */}
      <NouvelleSollicitationModal
        isOpen={showNouvelle}
        onClose={() => setShowNouvelle(false)}
        onSubmit={handleCreer}
      />

      <SollicitationDetailModal
        isOpen={Boolean(selection)}
        sollicitation={selection}
        user={user}
        onClose={() => setSelection(null)}
        onChangerStatut={handleChangerStatut}
        onAnnuler={handleAnnuler}
      />
    </div>
  )
}
