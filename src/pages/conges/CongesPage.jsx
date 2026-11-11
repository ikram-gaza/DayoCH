import { useState, useMemo } from 'react'
import {
  Calendar, Clock, CheckCircle2, AlertCircle, Plus,
  Search, Download, User, Users, FileText,
  Shield, Check, X, Info
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  congesService,
  TYPES_CONGES,
  STATUTS_CONGES,
} from '../../services/congesService'
import DemandeModal from '../../components/conges/DemandeModal'
import RefusModal from '../../components/conges/RefusModal'
import PlanningCalendar from '../../components/conges/PlanningCalendar'

export default function CongesPage() {
  const { user } = useAuth()
  const isManagerOrAdmin = user?.role === 'manager' || user?.role === 'super_admin'

  // Onglet actif
  const [activeTab, setActiveTab] = useState('mes_demandes') // 'mes_demandes' | 'a_valider' | 'planning' | 'droits'

  // Modales
  const [showDemandeModal, setShowDemandeModal] = useState(false)
  const [refusCandidat, setRefusCandidat] = useState(null) // demande en cours de refus

  // Toasts
  const [toastMessage, setToastMessage] = useState(null)

  // Données
  const [demandes, setDemandes] = useState(() => congesService.getAllDemandes())
  const [filtreStatut, setFiltreStatut] = useState('all')
  const [filtreType, setFiltreType] = useState('all')
  const [recherche, setRecherche] = useState('')

  // Charger les demandes
  const rechargerDonnees = () => {
    const all = congesService.getAllDemandes()
    setDemandes([...all])
  }

  const afficherToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Soldes pour l'utilisateur
  const soldes = useMemo(() => {
    return congesService.getSoldes(user)
  }, [user, demandes])

  // Mes demandes
  const mesDemandes = useMemo(() => {
    if (!user) return []
    return demandes.filter(d =>
      d.employeId === user.id ||
      d.employeMatricule === user.matricule ||
      (d.employeNom && d.employeNom.toLowerCase().includes(user.nom?.toLowerCase() || ''))
    )
  }, [demandes, user])

  // Demandes de l'équipe à valider
  const demandesAValider = useMemo(() => {
    if (!isManagerOrAdmin) return []
    if (user.role === 'super_admin') {
      return demandes.filter(d => d.statut === 'en_attente')
    }
    return demandes.filter(d =>
      d.statut === 'en_attente' &&
      d.employeId !== user.id &&
      (d.filiale === user.filiale || !user.filiale)
    )
  }, [demandes, user, isManagerOrAdmin])

  // Toutes les demandes d'équipe (historique complet manager)
  const historiqueEquipe = useMemo(() => {
    if (!isManagerOrAdmin) return []
    if (user.role === 'super_admin') return demandes
    return demandes.filter(d => d.employeId !== user.id && (d.filiale === user.filiale || !user.filiale))
  }, [demandes, user, isManagerOrAdmin])

  // Mes demandes filtrées
  const mesDemandesFiltrees = useMemo(() => {
    return mesDemandes.filter(d => {
      const matchStatut = filtreStatut === 'all' || d.statut === filtreStatut
      const matchType = filtreType === 'all' || d.typeId === filtreType
      const matchRech = recherche === '' ||
        d.motif?.toLowerCase().includes(recherche.toLowerCase()) ||
        d.dateDebut.includes(recherche)
      return matchStatut && matchType && matchRech
    })
  }, [mesDemandes, filtreStatut, filtreType, recherche])

  // Actions
  const handleCreerDemande = (data) => {
    congesService.creerDemande(user, data)
    rechargerDonnees()
    afficherToast('Votre demande d\'absence a été soumise avec succès.')
  }

  const handleValiderDemande = (demandeId) => {
    congesService.validerDemande(demandeId, user)
    rechargerDonnees()
    afficherToast('Demande validée avec succès.')
  }

  const handleConfirmerRefus = (demandeId, motifRefus) => {
    congesService.refuserDemande(demandeId, user, motifRefus)
    rechargerDonnees()
    afficherToast('La demande a été refusée.')
  }

  const handleAnnulerDemande = (demandeId) => {
    if (window.confirm('Voulez-vous vraiment annuler cette demande ?')) {
      congesService.annulerDemande(demandeId)
      rechargerDonnees()
      afficherToast('Demande annulée.')
    }
  }

  // Export CSV
  const handleExportCSV = () => {
    const listToExport = activeTab === 'a_valider' ? historiqueEquipe : mesDemandes
    if (listToExport.length === 0) return

    const headers = ['ID', 'Collaborateur', 'Filiale', 'Type', 'Date Début', 'Date Fin', 'Jours', 'Statut', 'Motif']
    const rows = listToExport.map(d => [
      d.id,
      `"${d.employeNom}"`,
      `"${d.filiale}"`,
      d.typeId,
      d.dateDebut,
      d.dateFin,
      d.nbJours,
      d.statut,
      `"${(d.motif || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `conges_dayo_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    afficherToast('Export CSV téléchargé.')
  }

  const getType = (typeId) => TYPES_CONGES.find(t => t.id === typeId) || TYPES_CONGES[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: '#1c1917', color: 'white', padding: '12px 20px',
          borderRadius: 14, fontSize: 13, fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Calendar size={24} style={{ color: '#007FE1' }} />
            Congés & Absences
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            Consultez vos soldes, posez vos demandes et suivez les validations de votre équipe.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 14px', borderRadius: 12, border: '1px solid #e7e5e4',
              background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <Download size={15} />
            Exporter CSV
          </button>
          <button
            onClick={() => setShowDemandeModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #007FE1, #0066C0)',
              color: 'white', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)',
            }}
          >
            <Plus size={16} />
            Nouvelle demande
          </button>
        </div>
      </div>

      {/* ── Compteurs & Soldes (KPIs) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        {/* CP */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#007FE1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Congés Payés (CP)
            </span>
            <span style={{
              width: 32, height: 32, borderRadius: 10, background: '#E5F2FD',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007FE1',
            }}>
              <Calendar size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#1c1917' }}>{soldes.congesPayes.restant}</span>
            <span style={{ fontSize: 13, color: '#78716c' }}>/ {soldes.congesPayes.alloue} jours restants</span>
          </div>
          <div style={{ marginTop: 12, height: 6, background: '#f5f5f4', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(soldes.congesPayes.restant / soldes.congesPayes.alloue) * 100}%`,
              background: '#007FE1', borderRadius: 999,
            }} />
          </div>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '8px 0 0' }}>
            {soldes.congesPayes.pris} jours déjà pris cette année
          </p>
        </div>

        {/* RTT */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              RTT / Récupération
            </span>
            <span style={{
              width: 32, height: 32, borderRadius: 10, background: '#dcfce7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a',
            }}>
              <Clock size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#1c1917' }}>{soldes.rtt.restant}</span>
            <span style={{ fontSize: 13, color: '#78716c' }}>/ {soldes.rtt.alloue} jours</span>
          </div>
          <div style={{ marginTop: 12, height: 6, background: '#f5f5f4', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(soldes.rtt.restant / soldes.rtt.alloue) * 100}%`,
              background: '#16a34a', borderRadius: 999,
            }} />
          </div>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '8px 0 0' }}>
            {soldes.rtt.pris} jours de récupération consommés
          </p>
        </div>

        {/* Demandes en attente */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a16207', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              En cours de validation
            </span>
            <span style={{
              width: 32, height: 32, borderRadius: 10, background: '#fef9c3',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a16207',
            }}>
              <AlertCircle size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#1c1917' }}>{soldes.enAttente.count}</span>
            <span style={{ fontSize: 13, color: '#78716c' }}>demande{soldes.enAttente.count > 1 ? 's' : ''} ({soldes.enAttente.totalJours} j.)</span>
          </div>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '14px 0 0' }}>
            En attente d'approbation par votre manager
          </p>
        </div>

        {/* Maladie / Autres */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Arrêts & Maladie
            </span>
            <span style={{
              width: 32, height: 32, borderRadius: 10, background: '#FEF2F1',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626',
            }}>
              <Shield size={16} />
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#1c1917' }}>{soldes.maladie.pris}</span>
            <span style={{ fontSize: 13, color: '#78716c' }}>jours cumulés</span>
          </div>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '14px 0 0' }}>
            Certificats médicaux transmis aux RH
          </p>
        </div>
      </div>

      {/* ── Onglets de Navigation ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid #e7e5e4', paddingBottom: 2,
      }}>
        <button
          onClick={() => setActiveTab('mes_demandes')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10, border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'mes_demandes' ? '#007FE1' : 'transparent',
            color: activeTab === 'mes_demandes' ? 'white' : '#57534e',
            transition: 'all 0.15s',
          }}
        >
          <User size={15} />
          Mes demandes ({mesDemandes.length})
        </button>

        {isManagerOrAdmin && (
          <button
            onClick={() => setActiveTab('a_valider')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 10, border: 'none',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              background: activeTab === 'a_valider' ? '#007FE1' : 'transparent',
              color: activeTab === 'a_valider' ? 'white' : '#57534e',
              transition: 'all 0.15s',
            }}
          >
            <Users size={15} />
            À valider (Équipe)
            {demandesAValider.length > 0 && (
              <span style={{
                background: activeTab === 'a_valider' ? 'white' : '#f59e0b',
                color: activeTab === 'a_valider' ? '#007FE1' : 'white',
                borderRadius: 999, padding: '1px 7px', fontSize: 11, fontWeight: 800,
              }}>
                {demandesAValider.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('planning')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10, border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'planning' ? '#007FE1' : 'transparent',
            color: activeTab === 'planning' ? 'white' : '#57534e',
            transition: 'all 0.15s',
          }}
        >
          <Calendar size={15} />
          Calendrier d'équipe
        </button>

        <button
          onClick={() => setActiveTab('droits')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10, border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'droits' ? '#007FE1' : 'transparent',
            color: activeTab === 'droits' ? 'white' : '#57534e',
            transition: 'all 0.15s',
          }}
        >
          <Info size={15} />
          Règles & Droits Dayo
        </button>
      </div>

      {/* ── Contenu selon onglet actif ── */}

      {/* 1. MES DEMANDES */}
      {activeTab === 'mes_demandes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filtres & Recherche */}
          <div style={{
            background: 'white', borderRadius: 14, padding: '14px 18px',
            border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 240, maxWidth: 360 }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
                <input
                  type="search"
                  placeholder="Rechercher par motif ou date..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 12px 8px 34px', borderRadius: 10,
                    border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {/* Filtre statut */}
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                style={{
                  padding: '7px 12px', borderRadius: 10, border: '1px solid #e7e5e4',
                  background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="valide">Validé</option>
                <option value="refuse">Refusé</option>
                <option value="annule">Annulé</option>
              </select>

              {/* Filtre type */}
              <select
                value={filtreType}
                onChange={(e) => setFiltreType(e.target.value)}
                style={{
                  padding: '7px 12px', borderRadius: 10, border: '1px solid #e7e5e4',
                  background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">Tous les types</option>
                {TYPES_CONGES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tableau / Liste des demandes */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
            overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            {mesDemandesFiltrees.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <Calendar size={36} style={{ color: '#d6d3d1', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>
                  Aucune demande trouvée
                </p>
                <p style={{ fontSize: 13, color: '#a8a29e', margin: '4px 0 16px' }}>
                  Vous n'avez soumis aucune demande correspondant aux critères sélectionnés.
                </p>
                <button
                  onClick={() => setShowDemandeModal(true)}
                  style={{
                    padding: '8px 16px', borderRadius: 10, border: 'none',
                    background: '#007FE1', color: 'white', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Poser une demande
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4', color: '#78716c', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 20px' }}>Type d'absence</th>
                    <th style={{ padding: '14px 20px' }}>Période</th>
                    <th style={{ padding: '14px 20px' }}>Durée</th>
                    <th style={{ padding: '14px 20px' }}>Motif & Justificatif</th>
                    <th style={{ padding: '14px 20px' }}>Statut</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mesDemandesFiltrees.map((dem) => {
                    const type = getType(dem.typeId)
                    const statut = STATUTS_CONGES[dem.statut] || STATUTS_CONGES.en_attente
                    return (
                      <tr key={dem.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{
                              width: 30, height: 30, borderRadius: 8, background: type.bg,
                              color: type.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 11, fontWeight: 800, flexShrink: 0,
                            }}>
                              {type.code}
                            </span>
                            <div>
                              <p style={{ fontWeight: 700, color: '#1c1917', margin: 0 }}>{type.label}</p>
                              <p style={{ fontSize: 11, color: '#a8a29e', margin: '2px 0 0' }}>
                                Déposée le {new Date(dem.dateCreation).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontWeight: 600, color: '#1c1917', margin: 0 }}>
                            Du {new Date(dem.dateDebut).toLocaleDateString('fr-FR')} au {new Date(dem.dateFin).toLocaleDateString('fr-FR')}
                          </p>
                          {(dem.demiJourneeDebut !== 'journee' || dem.demiJourneeFin !== 'journee') && (
                            <p style={{ fontSize: 11, color: '#007FE1', margin: '2px 0 0' }}>
                              {dem.demiJourneeDebut === 'apres_midi' ? 'Début après-midi' : ''}
                              {dem.demiJourneeDebut === 'apres_midi' && dem.demiJourneeFin === 'matin' ? ' · ' : ''}
                              {dem.demiJourneeFin === 'matin' ? 'Fin matinée' : ''}
                            </p>
                          )}
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontWeight: 800, fontSize: 14, color: '#1c1917' }}>
                            {dem.nbJours}
                          </span>
                          <span style={{ fontSize: 12, color: '#78716c' }}> jour{dem.nbJours > 1 ? 's' : ''} ouvré{dem.nbJours > 1 ? 's' : ''}</span>
                        </td>

                        <td style={{ padding: '14px 20px', maxWidth: 220 }}>
                          <p style={{ fontSize: 12, color: '#57534e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dem.motif || 'Aucun motif spécifié'}
                          </p>
                          {dem.pieceJointe && (
                            <p style={{ fontSize: 11, color: '#007FE1', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FileText size={12} />
                              {dem.pieceJointe}
                            </p>
                          )}
                          {dem.commentaireRefus && (
                            <p style={{ fontSize: 11, color: '#dc2626', margin: '2px 0 0', fontWeight: 600 }}>
                              Motif refus : {dem.commentaireRefus}
                            </p>
                          )}
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 10px', borderRadius: 999,
                            background: statut.bg, color: statut.color,
                            fontSize: 12, fontWeight: 700,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statut.dot }} />
                            {statut.label}
                          </span>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          {dem.statut === 'en_attente' && (
                            <button
                              onClick={() => handleAnnulerDemande(dem.id)}
                              style={{
                                padding: '5px 10px', borderRadius: 8, border: '1px solid #fee2e2',
                                background: '#FEF2F1', color: '#dc2626', fontSize: 12, fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Annuler
                            </button>
                          )}
                          {dem.statut === 'valide' && (
                            <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                              Approuvé {dem.validateur ? `par ${dem.validateur}` : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 2. À VALIDER (ÉQUIPE) */}
      {activeTab === 'a_valider' && isManagerOrAdmin && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: '#F0F8FF', border: '1px solid rgba(0,127,225,0.15)',
            borderRadius: 14, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Users size={20} style={{ color: '#007FE1' }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#007FE1', margin: 0 }}>
                  Demandes d'absence de vos collaborateurs
                </p>
                <p style={{ fontSize: 12, color: '#0066C0', margin: '2px 0 0' }}>
                  {demandesAValider.length} demande{demandesAValider.length > 1 ? 's' : ''} en attente de décision.
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
            overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            {demandesAValider.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <CheckCircle2 size={36} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>
                  Toutes les demandes sont traitées
                </p>
                <p style={{ fontSize: 13, color: '#a8a29e', margin: '4px 0 0' }}>
                  Aucune demande d'absence en attente de validation pour le moment.
                </p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4', color: '#78716c', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 20px' }}>Collaborateur</th>
                    <th style={{ padding: '14px 20px' }}>Type</th>
                    <th style={{ padding: '14px 20px' }}>Période</th>
                    <th style={{ padding: '14px 20px' }}>Jours</th>
                    <th style={{ padding: '14px 20px' }}>Motif & Justificatif</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Décision</th>
                  </tr>
                </thead>
                <tbody>
                  {demandesAValider.map((dem) => {
                    const type = getType(dem.typeId)
                    return (
                      <tr key={dem.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontWeight: 700, color: '#1c1917', margin: 0 }}>{dem.employeNom}</p>
                          <p style={{ fontSize: 11, color: '#78716c', margin: '2px 0 0' }}>
                            {dem.employePoste} · <span style={{ color: '#007FE1', fontWeight: 600 }}>{dem.filiale}</span>
                          </p>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '3px 8px', borderRadius: 6,
                            background: type.bg, color: type.color,
                            fontSize: 11, fontWeight: 700,
                          }}>
                            {type.code} - {type.label}
                          </span>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontWeight: 600, color: '#1c1917', margin: 0 }}>
                            Du {new Date(dem.dateDebut).toLocaleDateString('fr-FR')} au {new Date(dem.dateFin).toLocaleDateString('fr-FR')}
                          </p>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontWeight: 800, fontSize: 15, color: '#1c1917' }}>{dem.nbJours}</span>
                          <span style={{ fontSize: 12, color: '#78716c' }}> j.</span>
                        </td>

                        <td style={{ padding: '14px 20px', maxWidth: 220 }}>
                          <p style={{ fontSize: 12, color: '#57534e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dem.motif || 'Aucun motif précisé'}
                          </p>
                          {dem.pieceJointe && (
                            <p style={{ fontSize: 11, color: '#007FE1', margin: '2px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FileText size={12} />
                              {dem.pieceJointe}
                            </p>
                          )}
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            <button
                              onClick={() => setRefusCandidat(dem)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '6px 12px', borderRadius: 8, border: '1px solid #fee2e2',
                                background: '#FEF2F1', color: '#dc2626', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <X size={14} />
                              Refuser
                            </button>
                            <button
                              onClick={() => handleValiderDemande(dem.id)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                padding: '6px 14px', borderRadius: 8, border: 'none',
                                background: '#16a34a', color: 'white', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', boxShadow: '0 2px 6px rgba(22,163,74,0.25)',
                              }}
                            >
                              <Check size={14} />
                              Approuver
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* 3. CALENDRIER DE L'ÉQUIPE */}
      {activeTab === 'planning' && (
        <PlanningCalendar demandes={demandes} />
      )}

      {/* 4. RÈGLES & DROITS */}
      {activeTab === 'droits' && (
        <div style={{
          background: 'white', borderRadius: 18, border: '1px solid #e7e5e4',
          padding: 24, display: 'flex', flexDirection: 'column', gap: 20,
        }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1c1917', margin: 0 }}>
              Politique des Congés & Absences — Groupe Dayo
            </h3>
            <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
              Modalités d'acquisition, de prise et de validation des congés selon la convention d'entreprise.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {TYPES_CONGES.map((t) => (
              <div
                key={t.id}
                style={{
                  background: '#fafaf9', borderRadius: 14, padding: 18,
                  border: '1px solid #e7e5e4', display: 'flex', flexDirection: 'column', gap: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: t.color }}>{t.label}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6,
                    background: t.bg, color: t.color,
                  }}>
                    {t.quotaAnnuel ? `${t.quotaAnnuel} jours / an` : 'Selon barème légal'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#57534e', margin: 0, lineHeight: 1.5 }}>
                  {t.description}
                </p>
                {t.requiresProof && (
                  <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={12} />
                    Certificat ou justificatif officiel requis
                  </span>
                )}
              </div>
            ))}
          </div>

          <div style={{
            background: '#F0F8FF', borderRadius: 14, padding: '16px 20px',
            border: '1px solid rgba(0,127,225,0.15)',
          }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#007FE1', margin: 0 }}>
              Procédure de validation
            </h4>
            <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12, color: '#0066C0', lineHeight: 1.6 }}>
              <li>Toute demande de congé payé supérieur à 5 jours consécutifs doit être déposée au moins <strong>15 jours à l'avance</strong>.</li>
              <li>Le manager dispose d'un délai de <strong>5 jours ouvrés</strong> pour apporter une réponse. Sans réponse, une alerte est transmise à la Direction CH.</li>
              <li>Les congés maladie nécessitent l'envoi d'un arrêt de travail dans les <strong>48 heures</strong> suivant le premier jour d'absence.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Modale Nouvelle Demande */}
      <DemandeModal
        isOpen={showDemandeModal}
        onClose={() => setShowDemandeModal(false)}
        onSubmit={handleCreerDemande}
        soldes={soldes}
      />

      {/* Modale Refus de Demande */}
      <RefusModal
        isOpen={!!refusCandidat}
        demande={refusCandidat}
        onClose={() => setRefusCandidat(null)}
        onConfirm={handleConfirmerRefus}
      />
    </div>
  )
}
