import { useState, useCallback } from 'react'
import { Users, UserPlus, Search, Download, Filter, ZoomIn, ZoomOut, RefreshCw, History } from 'lucide-react'
import OrgChart from '../../components/organigramme/OrgChart'
import EmployeeModal from '../../components/organigramme/EmployeeModal'
import HistoriqueModal from '../../components/organigramme/HistoriqueModal'
import { useAuth } from '../../context/AuthContext'
import { getFiliales } from '../../config/filiales'

const mockEmployees = [
  { id: 1, nom: 'KOTCHOFA', prenom: 'Boris', poste: 'Directeur Général', filiale: 'Dayo Bénin', photo: null, responsableId: null, email: 'boris.kotchofa@dayo.africa', telephone: '+229 97 00 00 00', matricule: 'DG-001' },
  { id: 2, nom: 'DIALLO', prenom: 'Amadou', poste: 'Directeur CH', filiale: 'Dayo Bénin', photo: null, responsableId: 1, email: 'amadou.diallo@dayo.africa', telephone: '+229 97 00 00 01', matricule: 'BEN-001' },
  { id: 3, nom: 'KANE', prenom: 'Fatou', poste: 'Directrice Commerciale', filiale: 'Dayo Guinée', photo: null, responsableId: 1, email: 'fatou.kane@dayo.africa', telephone: '+224 62 00 00 02', matricule: 'GIN-001' },
  { id: 4, nom: 'MENSAH', prenom: 'Koffi', poste: 'Manager Équipe Commerciale', filiale: 'Dayo Guinée', photo: null, responsableId: 3, email: 'koffi.mensah@dayo.africa', telephone: '+224 62 00 00 03', matricule: 'GIN-002' },
  { id: 5, nom: 'TRAORE', prenom: 'Aïcha', poste: 'Chargée de Clientèle', filiale: 'Dayo Burkina Faso', photo: null, responsableId: 1, email: 'aicha.traore@dayo.africa', telephone: '+226 70 00 00 04', matricule: 'BFA-001' },
  { id: 6, nom: 'OUEDRAOGO', prenom: 'Jean', poste: 'Chargé de Clientèle', filiale: 'Dayo Burkina Faso', photo: null, responsableId: 5, email: 'jean.ouedraogo@dayo.africa', telephone: '+226 70 00 00 05', matricule: 'BFA-002' },
  { id: 7, nom: 'SORO', prenom: 'Marie', poste: 'Responsable Formation', filiale: "Dayo Côte d'Ivoire", photo: null, responsableId: 1, email: 'marie.soro@dayo.africa', telephone: '+225 07 00 00 06', matricule: 'CIV-001' },
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
    { id: 1, date: '2026-11-05T14:30:00', action: 'changement_hierarchie', employeNom: 'Aïcha TRAORE', employePoste: 'Chargée de Clientèle', ancienResponsable: 'Fatou KANE', nouveauResponsable: 'Koffi MENSAH', details: "Réorganisation de l'équipe commerciale", auteur: 'Boris KOTCHOFA' },
    { id: 2, date: '2026-11-04T09:15:00', action: 'creation', employeNom: 'Jean OUEDRAOGO', employePoste: 'Chargé de Clientèle', details: 'Nouveau recrutement équipe commerciale', auteur: 'Amadou DIALLO' },
    { id: 3, date: '2026-11-03T16:45:00', action: 'modification', employeNom: 'Marie SORO', employePoste: 'Responsable Formation', details: 'Mise à jour des coordonnées', auteur: 'Amadou DIALLO' },
  ])

  const filialesConfig = getFiliales()
  const filiales = filialesConfig.map(f => f.nom)

  const filteredEmployees = employees.filter(emp => {
    const matchSearch = searchTerm === '' ||
      emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.poste.toLowerCase().includes(searchTerm.toLowerCase())
    const matchFiliale = filterFiliale === 'all' || emp.filiale === filterFiliale
    return matchSearch && matchFiliale
  })

  const handleChangeResponsable = useCallback((employeeId, newResponsableId) => {
    const employee = employees.find(e => e.id === employeeId)
    const newResponsable = employees.find(e => e.id === newResponsableId)
    const oldResponsable = employees.find(e => e.id === employee?.responsableId)
    if (!employee || !newResponsable) return
    const confirmed = window.confirm(`Déplacer ${employee.prenom} ${employee.nom} sous ${newResponsable.prenom} ${newResponsable.nom} ?`)
    if (confirmed) {
      setEmployees(prev => prev.map(emp => emp.id === employeeId ? { ...emp, responsableId: newResponsableId } : emp))
      setHistorique(prev => [{
        id: prev.length + 1, date: new Date().toISOString(), action: 'changement_hierarchie',
        employeNom: `${employee.prenom} ${employee.nom}`, employePoste: employee.poste,
        ancienResponsable: oldResponsable ? `${oldResponsable.prenom} ${oldResponsable.nom}` : 'Aucun',
        nouveauResponsable: `${newResponsable.prenom} ${newResponsable.nom}`,
        details: "Modification via drag & drop", auteur: `${user.prenom} ${user.nom}`,
      }, ...prev])
    }
  }, [employees, user])

  const handleSelectEmployee = (employee) => { setSelectedEmployee(employee); setShowModal(true) }
  const handleAddEmployee = () => { setSelectedEmployee(null); setShowModal(true) }

  const handleSaveEmployee = (updatedEmployee) => {
    if (updatedEmployee.id) {
      const oldEmployee = employees.find(e => e.id === updatedEmployee.id)
      if (oldEmployee.responsableId !== updatedEmployee.responsableId) {
        const oldResp = employees.find(e => e.id === oldEmployee.responsableId)
        const newResp = employees.find(e => e.id === updatedEmployee.responsableId)
        setHistorique(prev => [{
          id: prev.length + 1, date: new Date().toISOString(), action: 'changement_hierarchie',
          employeNom: `${updatedEmployee.prenom} ${updatedEmployee.nom}`, employePoste: updatedEmployee.poste,
          ancienResponsable: oldResp ? `${oldResp.prenom} ${oldResp.nom}` : 'Aucun',
          nouveauResponsable: newResp ? `${newResp.prenom} ${newResp.nom}` : 'Aucun',
          details: 'Modification du responsable hiérarchique', auteur: `${user.prenom} ${user.nom}`,
        }, ...prev])
      }
      setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp))
    } else {
      const newEmployee = { ...updatedEmployee, id: Math.max(...employees.map(e => e.id)) + 1, matricule: `DAY-${String(employees.length + 1).padStart(3, '0')}` }
      setEmployees(prev => [...prev, newEmployee])
      setHistorique(prev => [{
        id: prev.length + 1, date: new Date().toISOString(), action: 'creation',
        employeNom: `${newEmployee.prenom} ${newEmployee.nom}`, employePoste: newEmployee.poste,
        details: 'Nouveau collaborateur ajouté', auteur: `${user.prenom} ${user.nom}`,
      }, ...prev])
    }
    setShowModal(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Users size={24} style={{ color: '#007FE1', flexShrink: 0 }} />
            Organigramme
          </h1>
          <p style={{ fontSize: 13, color: '#a8a29e', marginTop: 4 }}>
            {filteredEmployees.length} collaborateurs · Glissez-déposez pour réorganiser
          </p>
        </div>
        <button
          onClick={handleAddEmployee}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            padding: '9px 16px', background: '#007FE1', color: 'white',
            border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,127,225,0.25)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#006AC0'}
          onMouseLeave={e => e.currentTarget.style.background = '#007FE1'}
        >
          <UserPlus size={15} />
          Ajouter un collaborateur
        </button>
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background: 'white', borderRadius: 14, border: '1px solid #e7e5e4',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '12px 16px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
      }}>
        {/* Recherche */}
        <div style={{ flex: 1, minWidth: 180, maxWidth: 320, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input
            type="search"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 7, paddingBottom: 7,
              fontSize: 13, border: '1px solid #e7e5e4', borderRadius: 8,
              outline: 'none', background: '#fafaf9', boxSizing: 'border-box',
              color: '#1c1917',
            }}
          />
        </div>

        {/* Filtre filiale */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={14} style={{ color: '#a8a29e', flexShrink: 0 }} />
          <select
            value={filterFiliale}
            onChange={e => setFilterFiliale(e.target.value)}
            style={{
              padding: '7px 10px', fontSize: 13, border: '1px solid #e7e5e4',
              borderRadius: 8, outline: 'none', background: '#fafaf9', color: '#1c1917', cursor: 'pointer',
            }}
          >
            <option value="all">Toutes les filiales</option>
            {filiales.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div style={{ width: 1, height: 24, background: '#e7e5e4', flexShrink: 0 }} />

        {/* Contrôles zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => setZoom(prev => Math.max(0.3, +(prev - 0.1).toFixed(1)))}
            style={{ padding: 6, borderRadius: 7, border: '1px solid #e7e5e4', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Zoom arrière"
          >
            <ZoomOut size={14} style={{ color: '#78716c' }} />
          </button>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#78716c', minWidth: 40, textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(prev => Math.min(2, +(prev + 0.1).toFixed(1)))}
            style={{ padding: 6, borderRadius: 7, border: '1px solid #e7e5e4', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Zoom avant"
          >
            <ZoomIn size={14} style={{ color: '#78716c' }} />
          </button>
          <button
            onClick={() => setZoom(1)}
            style={{ padding: 6, borderRadius: 7, border: '1px solid #e7e5e4', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Réinitialiser"
          >
            <RefreshCw size={14} style={{ color: '#78716c' }} />
          </button>
        </div>

        <div style={{ width: 1, height: 24, background: '#e7e5e4', flexShrink: 0 }} />

        {/* Historique + Export */}
        <button
          onClick={() => setShowHistorique(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', fontSize: 13, fontWeight: 600,
            border: '1px solid #e7e5e4', borderRadius: 8, background: 'white',
            color: '#78716c', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#fafaf9'; e.currentTarget.style.borderColor = '#d6d3d1' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e7e5e4' }}
        >
          <History size={14} />
          Historique
        </button>
        <button
          onClick={() => alert('Export en cours de développement')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', fontSize: 13, fontWeight: 600,
            border: '1px solid #007FE1', borderRadius: 8, background: 'white',
            color: '#007FE1', cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E5F2FD'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}
        >
          <Download size={14} />
          Exporter
        </button>
      </div>

      {/* ── Canvas organigramme ── */}
      <div style={{
        height: 560, background: 'white', borderRadius: 16,
        border: '1px solid #e7e5e4', overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        <OrgChart
          employees={filteredEmployees}
          onSelectEmployee={handleSelectEmployee}
          onChangeResponsable={handleChangeResponsable}
          zoom={zoom}
        />
      </div>

      {/* Modals */}
      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          employees={employees}
          onClose={() => setShowModal(false)}
          onSave={handleSaveEmployee}
        />
      )}
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
