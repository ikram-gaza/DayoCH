import { useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
} from 'reactflow'
import 'reactflow/dist/style.css'
import EmployeeNode from './EmployeeNode'

const nodeTypes = {
  employee: EmployeeNode,
}

function OrgChart({ employees, onSelectEmployee, onChangeResponsable, zoom = 1 }) {
  const [isDragging, setIsDragging] = useState(false)
  
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
    <div className="w-full h-full relative">
      {/* Indicateur drag */}
      {isDragging && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-[#007FE1] text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
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
        minZoom={0.5}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom }}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => '#007FE1'}
          maskColor="rgba(0, 127, 225, 0.1)"
        />
      </ReactFlow>
    </div>
  )
}

export default OrgChart
