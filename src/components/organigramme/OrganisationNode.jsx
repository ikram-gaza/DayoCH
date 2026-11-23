import { Building2, ChevronDown, ChevronRight, Network, UserRound, UsersRound } from 'lucide-react'
import { Handle, Position } from 'reactflow'

const ALLURES = {
  FILIALE: {
    background: '#007FE1',
    color: 'white',
    borderColor: '#006AC0',
    icon: Building2,
  },
  DEPARTEMENT: {
    background: '#E5F2FD',
    color: '#005EA8',
    borderColor: '#007FE1',
    icon: UsersRound,
  },
  SERVICE: {
    background: 'white',
    color: '#1c1917',
    borderColor: '#e7e5e4',
    icon: Network,
  },
  AGENT: {
    background: '#fafaf9',
    color: '#1c1917',
    borderColor: '#d6d3d1',
    icon: UserRound,
  },
}

function initialesAgent(data) {
  const prenom = data.prenom?.[0] || ''
  const nom = data.nom?.[0] || ''
  return `${prenom}${nom}`.toUpperCase() || '?'
}

export default function OrganisationNode({ data }) {
  const allure = ALLURES[data.niveau] || ALLURES.SERVICE
  const Icone = allure.icon
  const estAgent = data.niveau === 'AGENT'
  const cliquable = estAgent ? Boolean(data.agentId) : data.nbEnfants > 0

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} isConnectable={false} />

      <div
        title={estAgent && data.agentId ? 'Voir la fiche agent' : undefined}
        style={{
          width: 220,
          minHeight: 76,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 12px',
          background: allure.background,
          color: allure.color,
          border: `1px solid ${allure.borderColor}`,
          borderStyle: estAgent ? 'dashed' : 'solid',
          borderRadius: 12,
          boxShadow: data.estGerant
            ? '0 0 0 2px #F24333, 0 2px 8px rgba(0,0,0,0.08)'
            : '0 2px 8px rgba(0,0,0,0.06)',
          textAlign: 'left',
          cursor: cliquable ? 'pointer' : 'default',
        }}
      >
        {!estAgent && data.nbEnfants > 0 && (
          <span style={{ flexShrink: 0, opacity: 0.7 }} aria-hidden="true">
            {data.replie ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
          </span>
        )}

        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 800,
            background: estAgent ? '#E5F2FD' : 'rgba(255,255,255,0.18)',
            color: estAgent ? '#007FE1' : 'inherit',
          }}
        >
          {estAgent ? initialesAgent(data) : <Icone size={16} />}
        </span>

        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            title={data.libelle}
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {data.libelle}
          </p>

          {data.sousTitre && (
            <p
              title={data.sousTitre}
              style={{
                margin: '2px 0 0',
                fontSize: 11,
                lineHeight: 1.3,
                opacity: 0.8,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {data.sousTitre}
            </p>
          )}

          {estAgent ? (
            data.estGerant && (
              <span
                style={{
                  display: 'inline-block',
                  marginTop: 4,
                  padding: '1px 6px',
                  borderRadius: 999,
                  background: '#FEF2F1',
                  color: '#b91c1c',
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Gérant
              </span>
            )
          ) : (
            <p style={{ margin: '2px 0 0', fontSize: 10, lineHeight: 1.3, opacity: 0.75 }}>
              {data.effectif} agent{data.effectif > 1 ? 's' : ''}
              {data.replie && data.nbEnfants > 0 ? ` · ${data.nbEnfants} branche(s) repliée(s)` : ''}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} isConnectable={false} />
    </>
  )
}
