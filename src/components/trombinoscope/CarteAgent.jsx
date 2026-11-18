import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import PhotoAgent from '../agents/PhotoAgent'
import { Badge } from '../ui/ui'

export default function CarteAgent({ agent, lien = true }) {
  const contenu = (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <PhotoAgent
          agentId={agent.id}
          prenom={agent.prenom}
          nom={agent.nom}
          aPhoto={agent.aPhoto}
          photoUrl={agent.photoUrl}
          taille={44}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', margin: 0 }}>
            {agent.nomComplet || `${agent.prenom} ${agent.nom}`}
          </p>
          <p style={{ fontSize: 12, color: '#78716c', margin: '2px 0 0' }}>{agent.fonction || 'Fonction non précisée'}</p>
          {agent.estGerant && (
            <span style={{ display: 'inline-block', marginTop: 6 }}>
              <Badge tone="red">Gérant</Badge>
            </span>
          )}
        </div>
      </div>

      <p style={{ fontSize: 12, color: '#57534e', margin: 0 }}>
        {[agent.departement, agent.service].filter(Boolean).join(' · ') || 'Rattachement direct'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, borderTop: '1px solid #f5f5f4', paddingTop: 10, marginTop: 'auto' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#57534e', minWidth: 0 }}>
          <Mail size={12} style={{ color: '#a8a29e', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.email || '—'}</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#57534e' }}>
          <Phone size={12} style={{ color: '#a8a29e', flexShrink: 0 }} /> {agent.telephone || '—'}
        </span>
      </div>
    </>
  )

  const style = {
    background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)', padding: '16px 18px',
    display: 'flex', flexDirection: 'column', gap: 10,
    textDecoration: 'none', color: 'inherit', transition: 'box-shadow 0.15s, transform 0.15s',
  }

  if (!lien) return <div style={style}>{contenu}</div>

  return (
    <Link
      to={`/agents/${agent.id}`}
      style={style}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none' }}
    >
      {contenu}
    </Link>
  )
}
