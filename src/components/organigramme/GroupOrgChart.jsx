import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import OrganisationNode from './OrganisationNode'

const LARGEUR_NOEUD = 220
const HAUTEUR_NOEUD = 76
const ECART_HORIZONTAL = 32
const ECART_VERTICAL = 96

const nodeTypes = { organisation: OrganisationNode }

function donneesNoeud(noeud, replies) {
  const [prenom = '', ...reste] = (noeud.libelle || '').split(' ')

  return {
    libelle: noeud.libelle,
    sousTitre: noeud.sousTitre ?? noeud.fonction ?? null,
    code: noeud.code ?? null,
    niveau: noeud.niveau,
    effectif: noeud.effectif || 0,
    estGerant: Boolean(noeud.estGerant),
    nbEnfants: noeud.enfants?.length || 0,
    replie: replies.has(noeud.id),
    prenom,
    nom: reste.join(' '),
    agentId: noeud.agentId ?? noeud.agent?.id ?? noeud.idAgent ?? noeud.referenceId ?? (noeud.niveau === 'AGENT' ? noeud.id : null),
  }
}

function calculerDisposition(racine, replies) {
  const noeuds = []
  const liens = []

  function placer(noeud, depart, profondeur) {
    const y = profondeur * (HAUTEUR_NOEUD + ECART_VERTICAL)
    const enfants = replies.has(noeud.id) ? [] : noeud.enfants || []

    let largeurOccupee = 0
    let premierCentre = null
    let dernierCentre = 0

    for (const enfant of enfants) {
      const largeurEnfant = placer(enfant, depart + largeurOccupee, profondeur + 1)
      dernierCentre = depart + largeurOccupee + largeurEnfant / 2
      premierCentre ??= dernierCentre
      largeurOccupee += largeurEnfant + ECART_HORIZONTAL
    }

    if (largeurOccupee > 0) largeurOccupee -= ECART_HORIZONTAL

    const largeur = Math.max(LARGEUR_NOEUD, largeurOccupee)
    const centre = premierCentre !== null ? (premierCentre + dernierCentre) / 2 : depart + largeur / 2

    noeuds.push({
      id: noeud.id,
      type: 'organisation',
      position: { x: centre - LARGEUR_NOEUD / 2, y },
      data: donneesNoeud(noeud, replies),
      draggable: false,
    })

    for (const enfant of enfants) {
      liens.push({
        id: `${noeud.id}--${enfant.id}`,
        source: noeud.id,
        target: enfant.id,
        type: 'smoothstep',
        style: { stroke: '#d3d9df', strokeWidth: 1.5 },
      })
    }

    return largeur
  }

  placer(racine, 0, 0)
  return { noeuds, liens }
}

function GroupOrgChartInner({ arbre, replies, onToggleBranche }) {
  const navigate = useNavigate()
  const { fitView } = useReactFlow()
  const disposition = useMemo(
    () => (arbre ? calculerDisposition(arbre, replies) : null),
    [arbre, replies],
  )

  useEffect(() => {
    if (!disposition) return undefined

    const minuteur = window.setTimeout(() => {
      fitView({ padding: 0.15, maxZoom: 1, duration: 350 })
    }, 0)

    return () => window.clearTimeout(minuteur)
  }, [disposition, fitView])

  if (!disposition) return null

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={disposition.noeuds}
        edges={disposition.liens}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        onNodeClick={(_evenement, noeud) => {
          if (noeud.data.niveau === 'AGENT') {
            if (noeud.data.agentId) navigate(`/agents/${noeud.data.agentId}`)
            return
          }
          if (noeud.data.nbEnfants > 0) onToggleBranche(noeud.id)
        }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.2}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} color="#e5e7eb" size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={() => '#007FE1'}
          maskColor="rgba(0,127,225,0.06)"
        />
      </ReactFlow>
    </div>
  )
}

export default function GroupOrgChart(props) {
  return (
    <ReactFlowProvider>
      <GroupOrgChartInner {...props} />
    </ReactFlowProvider>
  )
}
