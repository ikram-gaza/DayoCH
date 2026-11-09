import { useState, useCallback } from 'react'
import { 
  Users, 
  UserPlus, 
  Search, 
  Download,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  History
} from 'lucide-react'
import OrgChart from '../../components/organigramme/OrgChart'
import EmployeeCard from '../../components/organigramme/EmployeeCard'
import EmployeeModal from '../../components/organigramme/EmployeeModal'
import HistoriqueModal from '../../components/organigramme/HistoriqueModal'
import { useAuth } from '../../context/AuthContext'
import { getFiliales } from '../../config/filiales'

// Mock data - à remplacer par API
const mockEmployees = [
  {
    id: 1,
    nom: 'KOTCHOFA',
    prenom: 'Boris',
    poste: 'Directeur Général',
    filiale: 'Dayo Bénin',
    photo: null,
    responsableId: null,
    email: 'boris.kotchofa@dayo.africa',
    telephone: '+229 97 00 00 00',
    matricule: 'DG-001',
  },
  {
    id: 2,
    nom: 'DIALLO',
    prenom: 'Amadou',
    poste: 'Directeur CH',
    filiale: 'Dayo Bénin',
    photo: null,
    responsableId: 1,
    email: 'amadou.diallo@dayo.africa',
    telephone: '+229 97 00 00 01',
    matricule: 'BEN-001',
  },
  {
    id: 3,
    nom: 'KANE',
    prenom: 'Fatou',
    poste: 'Directrice Commerciale',
    filiale: 'Dayo Guinée',
    photo: null,
    responsableId: 1,
    email: 'fatou.kane@dayo.africa',
    telephone: '+224 62 00 00 02',
    matricule: 'GIN-001',
  },
  {
    id: 4,
    nom: 'MENSAH',
    prenom: 'Koffi',
    poste: 'Manager Équipe Commerciale',
    filiale: 'Dayo Guinée',
    photo: null,
    responsableId: 3,
    email: 'koffi.mensah@dayo.africa',
    telephone: '+224 62 00 00 03',
    matricule: 'GIN-002',
  },
  {
    id: 5,
    nom: 'TRAORE',
    prenom: 'Aïcha',
    poste: 'Chargée de Clientèle',
    filiale: 'Dayo Burkina Faso',
    photo: null,
    responsableId: 1,
    email: 'aicha.traore@dayo.africa',
    telephone: '+226 70 00 00 04',
    matricule: 'BFA-001',
  },
  {
    id: 6,
    nom: 'OUEDRAOGO',
    prenom: 'Jean',
    poste: 'Chargé de Clientèle',
    filiale: 'Dayo Burkina Faso',
    photo: null,
    responsableId: 5,
    email: 'jean.ouedraogo@dayo.africa',
    telephone: '+226 70 00 00 05',
    matricule: 'BFA-002',
  },
  {
    id: 7,
    nom: 'SORO',
    prenom: 'Marie',
    poste: 'Responsable Formation',
    filiale: 'Dayo Côte d\'Ivoire',
    photo: null,
    responsableId: 1,
    email: 'marie.soro@dayo.africa',
    telephone: '+225 07 00 00 06',
    matricule: 'CIV-001',
  },
]

function OrganigrammePage() {
  const { user } = useAuth()
  const [employees, setEmployees] = useState(mockEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showHistorique, setShowHistorique] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFiliale, setFilterFiliale] = useState('all')
  const [zoom, setZoom] = useState(1)
  const [historique, setHistorique] = useState([
    // Mock historique (à remplacer par API)
    {
      id: 1,
      date: '2026-11-05T14:30:00',
      action: 'changement_hierarchie',
      employeNom: 'Aïcha TRAORE',
      employePoste: 'Chargée de Clientèle',
      ancienResponsable: 'Fatou KANE',
      nouveauResponsable: 'Koffi MENSAH',
      details: 'Réorganisation de l\'équipe commerciale',
      auteur: 'Boris KOTCHOFA',
    },
    {
      id: 2,
      date: '2026-11-04T09:15:00',
      action: 'creation',
      employeNom: 'Jean OUEDRAOGO',
      employePoste: 'Chargé de Clientèle',
      details: 'Nouveau recrutement équipe commerciale',
      auteur: 'Amadou DIALLO',
    },
    {
      id: 3,
      date: '2026-11-03T16:45:00',
      action: 'modification',
      employeNom: 'Marie SORO',
      employePoste: 'Responsable Formation',
      details: 'Mise à jour des coordonnées',
      auteur: 'Amadou DIALLO',
    },
  ])

  // Extraire les filiales uniques depuis la config
  const filialesConfig = getFiliales()
  const filiales = ['all', ...filialesConfig.map(f => f.nom)]

  // Filtrer les employés
  const filteredEmployees = employees.filter(emp => {
    const matchSearch = searchTerm === '' || 
      emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.poste.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchFiliale = filterFiliale === 'all' || emp.filiale === filterFiliale

    return matchSearch && matchFiliale
  })

  // Gérer le changement de responsable (drag & drop)
  const handleChangeResponsable = useCallback((employeeId, newResponsableId) => {
    const employee = employees.find(e => e.id === employeeId)
    const newResponsable = employees.find(e => e.id === newResponsableId)
    const oldResponsable = employees.find(e => e.id === employee?.responsableId)
    
    if (!employee || !newResponsable) return

    // Confirmation utilisateur
    const confirmed = window.confirm(
      `Voulez-vous déplacer ${employee.prenom} ${employee.nom} sous la responsabilité de ${newResponsable.prenom} ${newResponsable.nom} ?`
    )

    if (confirmed) {
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { ...emp, responsableId: newResponsableId }
          : emp
      ))

      // Ajouter à l'historique
      const newEntry = {
        id: historique.length + 1,
        date: new Date().toISOString(),
        action: 'changement_hierarchie',
        employeNom: `${employee.prenom} ${employee.nom}`,
        employePoste: employee.poste,
        ancienResponsable: oldResponsable ? `${oldResponsable.prenom} ${oldResponsable.nom}` : 'Aucun',
        nouveauResponsable: `${newResponsable.prenom} ${newResponsable.nom}`,
        details: 'Modification via drag & drop dans l\'organigramme',
        auteur: `${user.prenom} ${user.nom}`,
      }
      setHistorique(prev => [newEntry, ...prev])
    }
  }, [employees, historique, user])

  // Sélectionner un employé
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee)
    setShowModal(true)
  }

  // Ajouter un employé
  const handleAddEmployee = () => {
    setSelectedEmployee(null)
    setShowModal(true)
  }

  // Sauvegarder les modifications
  const handleSaveEmployee = (updatedEmployee) => {
    let action = 'modification'
    let details = 'Modification des informations'

    if (updatedEmployee.id) {
      // Modification
      const oldEmployee = employees.find(e => e.id === updatedEmployee.id)
      
      // Vérifier si le responsable a changé
      if (oldEmployee.responsableId !== updatedEmployee.responsableId) {
        const oldResponsable = employees.find(e => e.id === oldEmployee.responsableId)
        const newResponsable = employees.find(e => e.id === updatedEmployee.responsableId)
        
        action = 'changement_hierarchie'
        details = 'Modification du responsable hiérarchique'

        // Ajouter à l'historique
        const newEntry = {
          id: historique.length + 1,
          date: new Date().toISOString(),
          action,
          employeNom: `${updatedEmployee.prenom} ${updatedEmployee.nom}`,
          employePoste: updatedEmployee.poste,
          ancienResponsable: oldResponsable ? `${oldResponsable.prenom} ${oldResponsable.nom}` : 'Aucun',
          nouveauResponsable: newResponsable ? `${newResponsable.prenom} ${newResponsable.nom}` : 'Aucun',
          details,
          auteur: `${user.prenom} ${user.nom}`,
        }
        setHistorique(prev => [newEntry, ...prev])
      }

      setEmployees(prev => prev.map(emp => 
        emp.id === updatedEmployee.id ? updatedEmployee : emp
      ))
    } else {
      // Ajout
      const newEmployee = {
        ...updatedEmployee,
        id: Math.max(...employees.map(e => e.id)) + 1,
        matricule: `DAY-${String(employees.length + 1).padStart(3, '0')}`,
      }
      setEmployees(prev => [...prev, newEmployee])

      action = 'creation'
      details = 'Nouveau collaborateur ajouté'

      // Ajouter à l'historique
      const newEntry = {
        id: historique.length + 1,
        date: new Date().toISOString(),
        action,
        employeNom: `${newEmployee.prenom} ${newEmployee.nom}`,
        employePoste: newEmployee.poste,
        details,
        auteur: `${user.prenom} ${user.nom}`,
      }
      setHistorique(prev => [newEntry, ...prev])
    }
    
    setShowModal(false)
  }

  // Exporter l'organigramme
  const handleExport = () => {
    // TODO: Implémenter l'export en PDF ou PNG
    alert('Export en cours de développement')
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1D1D1B] flex items-center gap-2">
            <Users className="w-7 h-7 text-[#007FE1]" />
            Organigramme
          </h1>
          <p className="text-sm text-[#696969] mt-1">
            {filteredEmployees.length} collaborateurs · Glissez-déposez pour réorganiser
          </p>
        </div>

        <button
          onClick={handleAddEmployee}
          className="flex items-center gap-2 px-4 py-2 bg-[#007FE1] hover:bg-[#006AC0] text-white text-sm font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Ajouter un collaborateur
        </button>
      </div>

      {/* Barre d'outils */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Recherche */}
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9B9A]" />
            <input
              type="search"
              placeholder="Rechercher un collaborateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
            />
          </div>

          {/* Filtre par filiale */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#9B9B9A]" />
            <select
              value={filterFiliale}
              onChange={(e) => setFilterFiliale(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
            >
              <option value="all">Toutes les filiales</option>
              {filiales.filter(f => f !== 'all').map(filiale => (
                <option key={filiale} value={filiale}>{filiale}</option>
              ))}
            </select>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg">
            <button
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Zoom arrière"
            >
              <ZoomOut className="w-4 h-4 text-[#565655]" />
            </button>
            <span className="text-sm font-medium text-[#1D1D1B] min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Zoom avant"
            >
              <ZoomIn className="w-4 h-4 text-[#565655]" />
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1" />
            <button
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label="Réinitialiser le zoom"
            >
              <RefreshCw className="w-4 h-4 text-[#565655]" />
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={() => setShowHistorique(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#565655] border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <History className="w-4 h-4" />
            Historique
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#007FE1] border border-[#007FE1] hover:bg-[#D9EBFF] rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
        </div>
      </div>

      {/* Organigramme */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <OrgChart
          employees={filteredEmployees}
          onSelectEmployee={handleSelectEmployee}
          onChangeResponsable={handleChangeResponsable}
          zoom={zoom}
        />
      </div>

      {/* Modal employé */}
      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          employees={employees}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEmployee}
        />
      )}

      {/* Modal historique */}
      {showHistorique && (
        <HistoriqueModal
          historique={historique}
          onClose={() => setShowHistorique(false)}
        />
      )}
    </div>
  )
}

export default OrganigrammePage
