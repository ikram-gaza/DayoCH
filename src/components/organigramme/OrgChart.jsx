import { useCallback, useMemo, useState, useEffect } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import EmployeeNode from './EmployeeNode'

const nodeTypes = {
  employee: EmployeeNode,
}

// Composant interne qui peut utiliser useReactFlow (doit être dans ReactFlowProvider)
function OrgChartInner({ employees, onSelectEmployee, onChangeResponsable, zoom = 1 }) {
  const { zoomTo } = useReactFlow()
  const [isDragging, setIsDragging] = useState(false)

  // Synchroniser le zoom externe avec le viewport ReactFlow
  useEffect(() => {
    zoomTo(zoom, { duration: 300 })
  }, [zoom, zoomTo])
  
  // Construire l'arbre hiérarchique
  const buildHierarchy = useCallback(() => {
    const nodes = []
    const edges = []
    const levels = {}

    // Trouver la racine (sans responsable)
    const root = employees.find(emp => !emp.responsableId)
    if (!root) return { nodes, edges }

    // BFS pour construire les niveaux
    const queue = [{ employee: root, level: 0, parentX: 400 }]
    levels[0] = []

    while (queue.length > 0) {
      const { employee, level, parentX } = queue.shift()

      if (!levels[level]) levels[level] = []
      levels[level].push(employee)

      // Trouver les subordonnés directs
      const subordinates = employees.filter(emp => emp.responsableId === employee.id)
      
      subordinates.forEach((sub, idx) => {
        queue.push({
          employee: sub,
          level: level + 1,
          parentX,
        })
      })
    }

    // Calculer les positions
    Object.keys(levels).forEach((lvl) => {
      const levelEmployees = levels[lvl]
      const levelWidth = levelEmployees.length * 280
      const startX = 400 - levelWidth / 2

      levelEmployees.forEach((emp, idx) => {
        const x = startX + idx * 280
        const y = parseInt(lvl) * 180 + 50

        nodes.push({
          id: String(emp.id),
          type: 'employee',
          position: { x, y },
          data: {
            employee: emp,
            onClick: () => onSelectEmployee(emp),
          },
        })

        // Créer l'arête vers le parent
        if (emp.responsableId) {
          edges.push({
            id: `e${emp.responsableId}-${emp.id}`,
            source: String(emp.responsableId),
            target: String(emp.id),
            type: 'smoothstep',
            animated: false,
            style: { stroke: '#007FE1', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#007FE1',
            },
          })
        }
      })
    })

    return { nodes, edges }
  }, [employees, onSelectEmployee])

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildHierarchy(),
    [buildHierarchy]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  // Gérer le drag & drop pour changer de responsable
  const onNodeDragStop = useCallback(
    (event, node) => {
      setIsDragging(false)
      
      const draggedEmployeeId = parseInt(node.id)
      
      // Trouver le nœud le plus proche (potentiel nouveau responsable)
      const draggedNode = nodes.find(n => n.id === node.id)
      if (!draggedNode) return

      let closestNode = null
      let minDistance = Infinity

      nodes.forEach(n => {
        if (n.id === node.id) return // Ignorer le nœud lui-même

        const distance = Math.sqrt(
          Math.pow(n.position.x - draggedNode.position.x, 2) +
          Math.pow(n.position.y - draggedNode.position.y, 2)
        )

        if (distance < minDistance && distance < 150) { // Seuil de 150px
          minDistance = distance
          closestNode = n
        }
      })

      if (closestNode) {
        const newResponsableId = parseInt(closestNode.id)
        const draggedEmployee = employees.find(e => e.id === draggedEmployeeId)
        
        // Vérifier qu'on ne crée pas de boucle hiérarchique
        if (!wouldCreateCycle(draggedEmployeeId, newResponsableId, employees)) {
          onChangeResponsable(draggedEmployeeId, newResponsableId)
        } else {
          alert('⚠️ Impossible : cette action créerait une boucle hiérarchique.')
        }
      }
    },
    [nodes, employees, onChangeResponsable]
  )

  // Vérifier si le changement créerait une boucle
  const wouldCreateCycle = (employeeId, newResponsableId, employees) => {
    let currentId = newResponsableId
    const visited = new Set()

    while (currentId) {
      if (currentId === employeeId) return true // Boucle détectée
      if (visited.has(currentId)) return true // Boucle existante
      
      visited.add(currentId)
      const current = employees.find(e => e.id === currentId)
      currentId = current?.responsableId
    }

    return false
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Indicateur drag */}
      {isDragging && (
        <div
          style={{
            position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, background: '#007FE1', color: 'white',
            padding: '8px 16px', borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,127,225,0.3)',
            fontSize: 13, fontWeight: 600, pointerEvents: 'none',
          }}
        >
          💡 Déposez sur un autre employé pour changer de responsable
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls
          style={{
            bottom: 16, left: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            borderRadius: 10, border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
          showInteractive={false}
        />
        <MiniMap
          nodeColor={() => '#007FE1'}
          maskColor="rgba(0,127,225,0.06)"
          style={{
            bottom: 16, right: 16,
            borderRadius: 10, border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  )
}

// Wrapper avec ReactFlowProvider pour accéder à useReactFlow
function OrgChart(props) {
  return (
    <ReactFlowProvider>
      <OrgChartInner {...props} />
    </ReactFlowProvider>
  )
}

export default OrgChart
