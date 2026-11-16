import { Link } from 'react-router-dom'
import { Mail, Phone } from 'lucide-react'
import PhotoAgent from '../agents/PhotoAgent'
import { Badge } from '../ui/ui'

export default function CarteAgent({ agent, lien = true }) {
  const contenu = (
    <>
      <PhotoAgent
        agentId={agent.id}
        prenom={agent.prenom}
        nom={agent.nom}
        aPhoto={agent.aPhoto}
        photoUrl={agent.photoUrl}
        taille={80}
      />
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1c1917' }}>{agent.nomComplet || `${agent.prenom} ${agent.nom}`}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#78716c' }}>{agent.fonction || 'Fonction non précisée'}</p>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: '#a8a29e', textAlign: 'center' }}>
        {[agent.departement, agent.service].filter(Boolean).join(' · ') || 'Rattachement direct'}
      </p>
      {agent.estGerant && <Badge tone="red">Gérant</Badge>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', fontSize: 11, color: '#78716c' }}>
        {agent.email && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, maxWidth: 190 }}>
            <Mail size={11} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.email}</span>
          </span>
        )}
        {agent.telephone && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Phone size={11} /> {agent.telephone}
          </span>
        )}
      </div>
    </>
  )

  const style = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    textAlign: 'center',
    background: 'white',
    border: '1px solid #e7e5e4',
    borderRadius: 16,
    textDecoration: 'none',
    color: 'inherit',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }

  if (!lien) return <div style={style}>{contenu}</div>

  return (
    <Link to={`/agents/${agent.id}`} style={style}>
      {contenu}
    </Link>
  )
}
