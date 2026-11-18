import { useEffect, useMemo, useState } from 'react'
import {
  Users, Search, Mail, Phone, Building2, UserCheck, CalendarOff,
  Inbox, ArrowRight, Hash, AlertCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  utilisateursService,
  infoRole,
  STATUTS_UTILISATEUR,
  messageErreur,
} from '../../services/utilisateursService'
import MembreDetailModal from '../../components/equipe/MembreDetailModal'

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

function MembreCard({ membre, onOpen }) {
  const role = infoRole(membre.role)
  const statut = STATUTS_UTILISATEUR[membre.statut] || STATUTS_UTILISATEUR.actif
  const avatar = `${membre.prenom?.[0] || ''}${membre.nom?.[0] || ''}`.toUpperCase()

  return (
    <div style={{
      background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
      transition: 'box-shadow 0.15s, transform 0.15s',
    }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{
          width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
          background: '#E5F2FD', color: '#007FE1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700,
        }}>
          {avatar}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', margin: 0 }}>
              {membre.prenom} {membre.nom}
            </p>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700,
              color: statut.color, background: statut.bg,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: statut.dot }} />
              {statut.label}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#78716c', margin: '2px 0 0' }}>{membre.poste || '—'}</p>
          <span style={{
            display: 'inline-block', marginTop: 6, padding: '2px 8px',
            borderRadius: 999, fontSize: 10, fontWeight: 700, color: role.color, background: role.bg,
          }}>
            {role.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#57534e', minWidth: 0 }}>
          <Mail size={12} style={{ color: '#a8a29e', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{membre.email || '—'}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#57534e' }}>
          <Phone size={12} style={{ color: '#a8a29e' }} /> {membre.telephone || '—'}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#57534e' }}>
          <Building2 size={12} style={{ color: '#a8a29e' }} /> {membre.filiale || '—'}
          <span style={{ color: '#d6d3d1' }}>·</span>
          <Hash size={12} style={{ color: '#a8a29e' }} /> {membre.matricule || '—'}
        </span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 10, borderTop: '1px solid #f5f5f4', paddingTop: 12, marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#78716c' }}>
            <UserCheck size={12} /> Profil synchronisé
          </span>
        </div>
        <button
          onClick={() => onOpen(membre)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px', borderRadius: 10, border: '1px solid #e7e5e4',
            background: 'white', color: '#007FE1', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          Détails <ArrowRight size={13} />
        </button>
      </div>
    </div>
  )
}

export default function EquipePage() {
  const { user } = useAuth()

  const [equipe, setEquipe] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [filtreStatut, setFiltreStatut] = useState('all')
  const [selection, setSelection] = useState(null)

  useEffect(() => {
    let actif = true
    const charger = async () => {
      setChargement(true)
      setErreur('')
      try {
        const liste = await utilisateursService.getEquipe(user)
        if (actif) setEquipe(liste)
      } catch (e) {
        if (actif) setErreur(messageErreur(e))
      } finally {
        if (actif) setChargement(false)
      }
    }
    if (user) charger()
    else setChargement(false)
    return () => { actif = false }
  }, [user])

  const stats = useMemo(() => ({
    effectif: equipe.length,
    actifs: equipe.filter((m) => m.statut === 'actif').length,
    enConge: 0,
    demandesEnAttente: 0,
  }), [equipe])

  const terme = recherche.trim().toLowerCase()
  const listeFiltree = equipe.filter((m) => {
    const matchRecherche = terme === '' ||
      m.nom?.toLowerCase().includes(terme) ||
      m.prenom?.toLowerCase().includes(terme) ||
      m.email?.toLowerCase().includes(terme) ||
      m.poste?.toLowerCase().includes(terme) ||
      m.matricule?.toLowerCase().includes(terme)
    const matchStatut = filtreStatut === 'all' || m.statut === filtreStatut
    return matchRecherche && matchStatut
  })

  const estAdmin = user?.role === 'super_admin'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={24} style={{ color: '#007FE1' }} />
          Mon Équipe
        </h1>
        <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
          {estAdmin
            ? 'Vue d\'ensemble des collaborateurs du Groupe Dayo.'
            : 'Suivez les collaborateurs rattachés à votre périmètre.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard label="Effectif" value={stats.effectif} hint="collaborateurs" icon={Users} color="#007FE1" bg="#E5F2FD" />
        <StatCard label="Actifs" value={stats.actifs} hint="en poste" icon={UserCheck} color="#15803d" bg="#dcfce7" />
        <StatCard label="En congé" value={stats.enConge} hint="donnée indisponible" icon={CalendarOff} color="#a16207" bg="#fef9c3" />
        <StatCard label="Demandes en attente" value={stats.demandesEnAttente} hint="donnée indisponible" icon={Inbox} color="#7c3aed" bg="#f3e8ff" />
      </div>

      {erreur && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEF2F1', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', color: '#b91c1c', fontSize: 13 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{erreur}</span>
        </div>
      )}

      <div style={{
        background: 'white', borderRadius: 14, padding: '14px 18px',
        border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 240, maxWidth: 380 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un collaborateur…"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px 9px 34px', fontSize: 13, borderRadius: 10,
                border: '1px solid #e7e5e4', outline: 'none', color: '#1c1917',
              }}
            />
          </div>
        </div>

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
          {Object.entries(STATUTS_UTILISATEUR).map(([id, s]) => (
            <option key={id} value={id}>{s.label}</option>
          ))}
        </select>
      </div>

      {chargement ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', padding: '48px 24px', textAlign: 'center', color: '#78716c', fontSize: 13 }}>
          Chargement de l’équipe…
        </div>
      ) : listeFiltree.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px dashed #d6d3d1',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <span style={{
            width: 56, height: 56, borderRadius: 16, background: '#f5f5f4',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#a8a29e', marginBottom: 14,
          }}>
            <Users size={24} />
          </span>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>Aucun collaborateur</p>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>Aucun membre ne correspond à ces critères.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {listeFiltree.map((membre) => (
            <MembreCard
              key={membre.id}
              membre={membre}
              onOpen={setSelection}
            />
          ))}
        </div>
      )}

      <MembreDetailModal
        isOpen={Boolean(selection)}
        membre={selection}
        conges={[]}
        sollicitations={[]}
        onClose={() => setSelection(null)}
      />
    </div>
  )
}
