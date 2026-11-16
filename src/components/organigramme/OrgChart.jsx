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
function OrgChartInner({ employees, onSelectEmployee, onChangeResponsable, zoom = 1, lectureSeule = false }) {
  const { zoomTo } = useReactFlow()
  const [isDragging, setIsDragging] = useState(false)

  // Synchroniser le zoom externe avec le viewport ReactFlow
  useEffect(() => {
    zoomTo(zoom, { duration: 300 })
  }, [zoom, zoomTo])
  
  // Construire l'arbre hiérarchique, avec une ou plusieurs racines (forêt)
  const buildHierarchy = useCallback(() => {
    const nodes = []
    const edges = []
    const levels = {}
    const ids = new Set(employees.map(emp => emp.id))
    const seen = new Set()
    const queue = []

    const roots = employees.filter(
      emp => !emp.responsableId || !ids.has(emp.responsableId)
    )

    roots.forEach((root) => {
      if (seen.has(root.id)) return
      seen.add(root.id)
      queue.push({ employee: root, level: 0 })
    })

    while (queue.length > 0) {
      const { employee, level } = queue.shift()

      if (!levels[level]) levels[level] = []
      levels[level].push(employee)

      employees.forEach((subordonne) => {
        if (subordonne.responsableId !== employee.id || seen.has(subordonne.id)) return

        seen.add(subordonne.id)
        queue.push({ employee: subordonne, level: level + 1 })
        edges.push({
          id: `e${employee.id}-${subordonne.id}`,
          source: String(employee.id),
          target: String(subordonne.id),
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#007FE1', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#007FE1',
          },
        })
      })
    }

    // Les employés restants (cycle ou parent absent) restent visibles à la racine
    employees.forEach((emp) => {
      if (seen.has(emp.id)) return
      seen.add(emp.id)
      if (!levels[0]) levels[0] = []
      levels[0].push(emp)
    })

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

  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])

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
      if (lectureSeule) return

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
    [nodes, employees, onChangeResponsable, lectureSeule]
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
      {isDragging && !lectureSeule && (
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
        onNodeDragStart={lectureSeule ? undefined : onNodeDragStart}
        onNodeDragStop={lectureSeule ? undefined : onNodeDragStop}
        nodesDraggable={!lectureSeule}
        nodesConnectable={false}
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
