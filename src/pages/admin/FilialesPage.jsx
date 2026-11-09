import { Building2, MapPin, Calendar, Users, BarChart3, Globe, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { FILIALES } from '../../config/filiales'

// Nombre de collaborateurs fixe par filiale (à remplacer par API)
const COLLABORATEURS = {
  'dayo-benin': 32,
  'dayo-guinee': 18,
  'dayo-burkina': 12,
  'dayo-ci': 7,
}

const EASE = [0.22, 1, 0.36, 1]

function FilialeCard({ filiale, onVoirEquipe, onStatistiques }) {
  const nbCollab = COLLABORATEURS[filiale.id] ?? 0

  const formatDate = (dateString) =>
    new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(dateString))

  return (
    <div style={{
      background: 'white', borderRadius: 16,
      border: '1px solid #e7e5e4',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Barre colorée top */}
      <div style={{ height: 4, background: filiale.couleur }} />

      <div style={{ padding: 20 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>{filiale.nom}</h3>
            <span style={{
              display: 'inline-block', marginTop: 6,
              padding: '2px 8px', borderRadius: 6,
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              background: `${filiale.couleur}15`, color: filiale.couleur,
            }}>
              {filiale.code}
            </span>
          </div>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: `${filiale.couleur}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={20} style={{ color: filiale.couleur }} />
          </div>
        </div>

        {/* Infos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={13} style={{ color: filiale.couleur, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#78716c' }}>{filiale.ville}, {filiale.pays}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={13} style={{ color: filiale.couleur, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#78716c' }}>Ouverture : {formatDate(filiale.dateOuverture)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={13} style={{ color: filiale.couleur, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>
              {nbCollab} collaborateur{nbCollab > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #f5f5f4' }}>
          <button
            onClick={onVoirEquipe}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 12px', fontSize: 12, fontWeight: 600,
              border: `1px solid ${filiale.couleur}40`, borderRadius: 8,
              background: `${filiale.couleur}08`, color: filiale.couleur,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${filiale.couleur}18`}
            onMouseLeave={e => e.currentTarget.style.background = `${filiale.couleur}08`}
          >
            <Users size={13} />
            Voir l'équipe
          </button>
          <button
            onClick={onStatistiques}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '8px 12px', fontSize: 12, fontWeight: 600,
              border: 'none', borderRadius: 8,
              background: filiale.couleur, color: 'white',
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <BarChart3 size={13} />
            Statistiques
          </button>
        </div>
      </div>
    </div>
  )
}

function FilialesPage() {
  const navigate = useNavigate()
  const totalCollabs = Object.values(COLLABORATEURS).reduce((a, b) => a + b, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <Building2 size={24} style={{ color: '#007FE1', flexShrink: 0 }} />
          Filiales du Groupe Dayo
        </h1>
        <p style={{ fontSize: 13, color: '#a8a29e', marginTop: 4 }}>
          {FILIALES.length} filiales actives en Afrique de l'Ouest
        </p>
      </div>

      {/* ── Bannière géographique ── */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 20,
        background: 'linear-gradient(135deg, #00509A 0%, #007FE1 55%, #0066C0 100%)',
        padding: 24, color: 'white',
        boxShadow: '0 8px 32px rgba(0,127,225,0.2)',
      }}>
        {/* Grille décorative */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', right: 100, bottom: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Globe size={18} style={{ color: 'rgba(147,197,253,0.9)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(147,197,253,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Présence géographique
              </span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(219,234,254,0.85)', lineHeight: 1.6, maxWidth: 440, margin: 0 }}>
              Le Groupe Dayo est spécialisé dans le courtage en assurances et accompagne ses clients dans 4 pays d'Afrique de l'Ouest.
            </p>
          </div>

          {/* KPI */}
          <div style={{
            flexShrink: 0, textAlign: 'center',
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
            borderRadius: 14, padding: '12px 20px', border: '1px solid rgba(255,255,255,0.2)',
          }}>
            <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, margin: 0 }}>{totalCollabs}</p>
            <p style={{ fontSize: 11, color: 'rgba(219,234,254,0.75)', marginTop: 4, fontWeight: 600 }}>collaborateurs</p>
          </div>
        </div>

        {/* Pills pays */}
        <div style={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
          {FILIALES.map(f => (
            <div key={f.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
              fontSize: 12, fontWeight: 600,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: f.couleur === '#007FE1' ? 'rgba(255,255,255,0.8)' : f.couleur,
              }} />
              {f.pays}
            </div>
          ))}
        </div>
      </div>

      {/* ── KPIs ligne ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {FILIALES.map(f => (
          <div key={f.id} style={{
            background: 'white', borderRadius: 14, border: '1px solid #e7e5e4',
            padding: '14px 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            borderLeft: `3px solid ${f.couleur}`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              {f.code}
            </p>
            <p style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', margin: '4px 0 2px', lineHeight: 1 }}>
              {COLLABORATEURS[f.id]}
            </p>
            <p style={{ fontSize: 12, color: '#78716c', margin: 0 }}>{f.pays}</p>
          </div>
        ))}
      </div>

      {/* ── Grille filiales ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {FILIALES.map(f => (
          <FilialeCard
            key={f.id}
            filiale={f}
            onVoirEquipe={() => navigate('/organigramme')}
            onStatistiques={() => navigate('/statistiques')}
          />
        ))}
      </div>
    </div>
  )
}

export default FilialesPage
