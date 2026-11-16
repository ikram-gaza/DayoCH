import { useState, useCallback } from 'react'
import { Users, UserPlus, Search, Filter, ZoomIn, ZoomOut, RefreshCw, History } from 'lucide-react'
import OrgChart from '../../components/organigramme/OrgChart'
import EmployeeModal from '../../components/organigramme/EmployeeModal'
import HistoriqueModal from '../../components/organigramme/HistoriqueModal'
import OrganigrammeGroupe from '../../components/organigramme/OrganigrammeGroupe'
import { useAuth } from '../../context/AuthContext'
import { USE_MOCK_DATA } from '../../config/donnees'
import { apiOrganigramme } from '../../services/apiOrganigramme'
import { exporterTableau } from '../../utils/export'
import ExportButtons from '../../components/common/ExportButtons'
import { getFiliales } from '../../config/filiales'
import { MOCK_EMPLOYEES } from '../../config/organigrammeDemo'
import { appartientFiliale, normaliserFiliales } from '../../utils/organigramme'

function OrganigrammePage() {
  const { user, peut } = useAuth()
  const peutModifier = peut('agent:update')
  const filialesConfig = getFiliales()
  const filiales = filialesConfig.map(f => f.nom)
  const filialeInitiale = filiales.includes(user?.filiale) ? user.filiale : (filiales[0] || '')
  const [vue, setVue] = useState('equipe')
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showHistorique, setShowHistorique] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFiliale, setFilterFiliale] = useState(filialeInitiale)
  const [zoom, setZoom] = useState(1)
  const [historique, setHistorique] = useState([
    { id: 1, date: '2026-11-05T14:30:00', action: 'changement_hierarchie', employeNom: 'Aïcha TRAORE', employePoste: 'Chargée de Clientèle', ancienResponsable: 'Fatou KANE', nouveauResponsable: 'Koffi MENSAH', details: "Réorganisation de l'équipe commerciale", auteur: 'Boris KOTCHOFA' },
    { id: 2, date: '2026-11-04T09:15:00', action: 'creation', employeNom: 'Jean OUEDRAOGO', employePoste: 'Chargé de Clientèle', details: 'Nouveau recrutement équipe commerciale', auteur: 'Amadou DIALLO' },
    { id: 3, date: '2026-11-03T16:45:00', action: 'modification', employeNom: 'Marie SORO', employePoste: 'Responsable Formation', details: 'Mise à jour des coordonnées', auteur: 'Amadou DIALLO' },
  ])

  const employesFiliale = employees.filter(emp => appartientFiliale(emp, filterFiliale))

  const filteredEmployees = employesFiliale.filter(emp => (
    searchTerm === '' ||
    emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.poste.toLowerCase().includes(searchTerm.toLowerCase())
  ))

  const handleChangeResponsable = useCallback((employeeId, newResponsableId) => {
    if (!peutModifier) return
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
  }, [employees, user, peutModifier])

  const handleSelectEmployee = (employee) => {
    if (!peutModifier) return
    setSelectedEmployee(employee)
    setShowModal(true)
  }
  const handleAddEmployee = () => {
    if (!peutModifier) return
    setSelectedEmployee({ filiale: filterFiliale })
    setShowModal(true)
  }

  const exporter = async (format) => {
    if (!USE_MOCK_DATA) {
      const filialeId = filialesConfig.find((filiale) => filiale.nom === filterFiliale)?.id
      return apiOrganigramme.exporter({ filialeId, inclureAgents: true, seulementActifs: true }, format)
    }
    exporterTableau({
      nom: `organigramme-${filterFiliale.toLowerCase().replaceAll(' ', '-')}`,
      titre: `Organigramme de ${filterFiliale}`,
      colonnes: [
        { cle: 'matricule', libelle: 'Matricule' },
        { cle: 'nom', libelle: 'Collaborateur' },
        { cle: 'poste', libelle: 'Poste' },
        { cle: 'filiale', libelle: 'Filiale' },
        { cle: 'responsable', libelle: 'Responsable' },
      ],
      lignes: filteredEmployees.map((employe) => ({
        matricule: employe.matricule || '',
        nom: `${employe.prenom} ${employe.nom}`,
        poste: employe.poste || '',
        filiale: employe.filiale || '',
        responsable: employees.find((item) => item.id === employe.responsableId)?.nom || 'Aucun',
      })),
      format,
    })
  }

  const handleSaveEmployee = (updatedEmployee) => {
    if (!peutModifier) return
    const employe = normaliserFiliales(updatedEmployee)

    if (employe.id) {
      const oldEmployee = employees.find(e => e.id === employe.id)
      if (oldEmployee.responsableId !== employe.responsableId) {
        const oldResp = employees.find(e => e.id === oldEmployee.responsableId)
        const newResp = employees.find(e => e.id === employe.responsableId)
        setHistorique(prev => [{
          id: prev.length + 1, date: new Date().toISOString(), action: 'changement_hierarchie',
          employeNom: `${employe.prenom} ${employe.nom}`, employePoste: employe.poste,
          ancienResponsable: oldResp ? `${oldResp.prenom} ${oldResp.nom}` : 'Aucun',
          nouveauResponsable: newResp ? `${newResp.prenom} ${newResp.nom}` : 'Aucun',
          details: 'Modification du responsable hiérarchique', auteur: `${user.prenom} ${user.nom}`,
        }, ...prev])
      }
      setEmployees(prev => prev.map(emp => emp.id === employe.id ? employe : emp))
    } else {
      const nouvelId = employees.reduce((max, emp) => Math.max(max, Number(emp.id) || 0), 0) + 1
      const nouveauxMembres = employees.filter(e => e.filiale === employe.filiale).length + 1
      const newEmployee = {
        ...employe,
        id: nouvelId,
        matricule: `DAY-${String(nouveauxMembres).padStart(3, '0')}`,
      }
      setEmployees(prev => [...prev, newEmployee])
      setHistorique(prev => [{
        id: prev.length + 1, date: new Date().toISOString(), action: 'creation',
        employeNom: `${newEmployee.prenom} ${newEmployee.nom}`, employePoste: newEmployee.poste,
        details: 'Nouveau collaborateur ajouté', auteur: `${user.prenom} ${user.nom}`,
      }, ...prev])
    }
    setShowModal(false)
  }

  const entete = (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <Users size={24} style={{ color: '#007FE1', flexShrink: 0 }} />
          Organigramme
        </h1>
        <p style={{ fontSize: 13, color: '#a8a29e', marginTop: 4 }}>
          {vue === 'equipe'
            ? `${filteredEmployees.length} collaborateurs · ${filterFiliale}`
            : 'Organisation du groupe · Lecture seule'}
        </p>
      </div>
      {vue === 'equipe' && peutModifier && (
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
      )}
    </div>
  )

  const onglets = (
    <div style={{ display: 'flex', gap: 8 }}>
      {[
        { id: 'equipe', label: 'Par filiale' },
        { id: 'groupe', label: 'Organigramme du groupe' },
      ].map((onglet) => (
        <button
          key={onglet.id}
          type="button"
          onClick={() => setVue(onglet.id)}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: vue === onglet.id ? '1px solid #007FE1' : '1px solid #e7e5e4',
            background: vue === onglet.id ? '#E5F2FD' : 'white',
            color: vue === onglet.id ? '#007FE1' : '#78716c',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {onglet.label}
        </button>
      ))}
    </div>
  )

  if (vue === 'groupe') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {entete}
        {onglets}
        <OrganigrammeGroupe />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header ── */}
      {entete}
      {onglets}

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
            disabled={filiales.length === 0}
            style={{
              padding: '7px 10px', fontSize: 13, border: '1px solid #e7e5e4',
              borderRadius: 8, outline: 'none', background: '#fafaf9', color: '#1c1917', cursor: 'pointer',
            }}
          >
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
        <ExportButtons formats={['pdf', 'xlsx']} onExport={exporter} />
      </div>

      {/* ── Canvas organigramme ── */}
      {filteredEmployees.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px dashed #d6d3d1',
          padding: '48px 24px', textAlign: 'center',
        }}>
          <span style={{
            width: 56, height: 56, borderRadius: 16, background: '#f5f5f4',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#a8a29e', marginBottom: 14,
          }}>
            <Users size={24} />
          </span>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>
            Aucun collaborateur
          </p>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            {searchTerm
              ? 'Aucun collaborateur de cette filiale ne correspond à la recherche.'
              : 'Cette filiale ne contient encore aucun collaborateur.'}
          </p>
        </div>
      ) : (
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
            lectureSeule={!peutModifier}
          />
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          employees={employees}
          filialeCourante={filterFiliale}
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
