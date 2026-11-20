import { Construction, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ModuleAVenirPage({ titre, description, icon: Icon = Construction }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon size={24} style={{ color: '#007FE1' }} />
          {titre}
        </h1>
        <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
          Module en cours de préparation
        </p>
      </div>

      <div style={{
        background: 'white', border: '1px solid #e7e5e4', borderRadius: 16,
        padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14,
      }}>
        <span style={{
          width: 64, height: 64, borderRadius: 18, background: '#E5F2FD', color: '#007FE1',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Construction size={30} />
        </span>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1c1917' }}>{titre}</h2>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: '#57534e', maxWidth: 520 }}>
            {description || 'Ce module sera disponible prochainement. Les fonctionnalités et les connexions API associées sont en cours de mise en place.'}
          </p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: 999,
          background: '#f5f5f4', color: '#57534e', fontSize: 12, fontWeight: 700,
        }}>
          À venir
        </span>
        <Link
          to="/dashboard"
          style={{
            marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 12, border: '1px solid #e7e5e4',
            background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}
        >
          <ArrowLeft size={15} /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
