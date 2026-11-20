import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Plus, Users, BarChart3, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAgents, clesAgents } from '../../hooks/useAgents'
import { useFiltresUrl } from '../../hooks/useFiltresUrl'
import { apiAgents } from '../../services/agentsService'
import { filialesService } from '../../services/filialesService'
import { utilisateursService } from '../../services/utilisateursService'
import { normaliserErreur } from '../../services/apiClient'
import { formaterDate } from '../../utils/format'
import { Badge, Spinner } from '../../components/ui/ui'
import ExportButtons from '../../components/common/ExportButtons'
import AgentsFilters from '../../components/agents/AgentsFilters'
import AgentModal from '../../components/agents/AgentModal'
import PhotoAgent from '../../components/agents/PhotoAgent'

const COLONNES_BASE = [
  { cle: 'photo', libelle: '', triable: false },
  { cle: 'matricule', libelle: 'Matricule', triable: true },
  { cle: 'nom', libelle: 'Nom', triable: true },
  { cle: 'fonction', libelle: 'Fonction', triable: true },
  { cle: 'filiale', libelle: 'Filiale', triable: false },
  { cle: 'departement', libelle: 'Département', triable: true },
  { cle: 'service', libelle: 'Service', triable: true },
  { cle: 'dateEmbauche', libelle: 'Embauche', triable: true },
  { cle: 'compte', libelle: 'Compte', triable: false },
  { cle: 'actif', libelle: 'Statut', triable: false },
]

function nomFiliale(agent) {
  return agent?.filiale?.nom || agent?.filialeNom || agent?.filiale?.libelle || '—'
}

function StatCarte({ label, value }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, padding: '14px 16px', border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800, color: '#1c1917' }}>{value ?? '—'}</div>
    </div>
  )
}

export default function AgentsPage() {
  const { perimetre, estCompteGroupe, filialeCourante, user } = useAuth()
  const queryClient = useQueryClient()
  const { filtres, definir, reinitialiser } = useFiltresUrl({
    page: '1',
    limit: '20',
    triPar: 'nom',
    sortOrder: 'ASC',
  })
  const requete = useAgents(filtres)
  const afficherFiliale = estCompteGroupe && !filialeCourante && !filtres.filialeId
  const colonnes = COLONNES_BASE.filter((c) => c.cle !== 'filiale' || afficherFiliale)

  const [showModal, setShowModal] = useState(false)
  const [toast, setToast] = useState(null)
  const [referentiels, setReferentiels] = useState({ departements: [], services: [] })
  const [filiales, setFiliales] = useState([])
  const [roles, setRoles] = useState([])
  const [stats, setStats] = useState(null)
  const [statsChargement, setStatsChargement] = useState(false)

  const filialeIdStats = filtres.filialeId || filialeCourante || user?.filialeId || ''

  useEffect(() => {
    let actif = true
    ;(async () => {
      try {
        const [refs, fils, rols] = await Promise.all([
          apiAgents.referentiels().catch(() => ({ departements: [], services: [] })),
          filialesService.lister({ sortOrder: 'ASC' }).catch(() => []),
          utilisateursService.listerRoles().catch(() => utilisateursService.getRolesDisponibles()),
        ])
        if (!actif) return
        setReferentiels({
          departements: Array.isArray(refs?.departements) ? refs.departements : [],
          services: Array.isArray(refs?.services) ? refs.services : [],
        })
        setFiliales(Array.isArray(fils) ? fils : [])
        setRoles(Array.isArray(rols) ? rols : [])
      } catch {
        /* options non bloquantes */
      }
    })()
    return () => { actif = false }
  }, [])

  useEffect(() => {
    if (!filialeIdStats) {
      setStats(null)
      return
    }
    let actif = true
    setStatsChargement(true)
    apiAgents.statistiques(filialeIdStats)
      .then((data) => { if (actif) setStats(data && typeof data === 'object' ? data : null) })
      .catch(() => { if (actif) setStats(null) })
      .finally(() => { if (actif) setStatsChargement(false) })
    return () => { actif = false }
  }, [filialeIdStats])

  const afficherToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const basculerTri = (colonne) => {
    if (filtres.triPar === colonne) {
      definir('sortOrder', filtres.sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      definir('triPar', colonne)
      definir('sortOrder', 'ASC')
    }
  }

  const handleCreer = async (corps) => {
    try {
      await apiAgents.creer(corps)
      afficherToast('Agent créé avec succès.')
      await queryClient.invalidateQueries({ queryKey: clesAgents.listes(perimetre) })
      await queryClient.invalidateQueries({ queryKey: ['trombinoscope'] })
      await queryClient.invalidateQueries({ queryKey: ['pilotage'] })
      if (filialeIdStats) {
        apiAgents.statistiques(filialeIdStats).then((d) => setStats(d && typeof d === 'object' ? d : null)).catch(() => {})
      }
      return true
    } catch (e) {
      afficherToast(`Erreur : ${normaliserErreur(e).message}`)
      return false
    }
  }

  const total = requete.data?.total

  const statsAffichables = useMemo(() => {
    if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return []
    const priorite = ['total', 'totalAgents', 'actifs', 'agentsActifs', 'inactifs', 'sortis', 'gerants', 'avecCompte', 'sansCompte']
    const libelles = {
      total: 'Total', totalAgents: 'Total agents', actifs: 'Actifs', agentsActifs: 'Agents actifs',
      inactifs: 'Inactifs', sortis: 'Sortis', gerants: 'Gérants', avecCompte: 'Avec compte',
      sansCompte: 'Sans compte', hommes: 'Hommes', femmes: 'Femmes', departements: 'Départements',
    }
    const entrees = Object.entries(stats).filter(([, v]) => v !== null && v !== undefined && typeof v !== 'object')
    entrees.sort((a, b) => {
      const ia = priorite.indexOf(a[0])
      const ib = priorite.indexOf(b[0])
      if (ia === -1 && ib === -1) return a[0].localeCompare(b[0])
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
    return entrees.slice(0, 6).map(([k, v]) => ({ label: libelles[k] || k, value: typeof v === 'boolean' ? (v ? 'Oui' : 'Non') : v }))
  }, [stats])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, background: '#1c1917', color: 'white', padding: '12px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420 }}>
          {toast.startsWith('Erreur') ? <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} /> : <CheckCircle2 size={16} style={{ color: '#22c55e', flexShrink: 0 }} />}
          <span>{toast}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={24} style={{ color: '#007FE1' }} />
            Agents
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            {total != null ? `${total} agent(s) · ` : ''}Filtrable par nom, matricule ou filiale et exportable.
            {requete.isFetching && !requete.isLoading ? ' Actualisation…' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <ExportButtons
            onExport={(format) => apiAgents.exporter(filtres, format, perimetre)}
            formats={['xlsx', 'pdf', 'csv']}
          />
          <button
            type="button"
            onClick={() => setShowModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #007FE1, #0066C0)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)' }}
          >
            <Plus size={16} /> Nouvel agent
          </button>
        </div>
      </div>

      {filialeIdStats && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <BarChart3 size={16} style={{ color: '#007FE1' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#57534e' }}>Indicateurs d’effectif</span>
            {statsChargement && <span style={{ fontSize: 12, color: '#a8a29e' }}>Chargement…</span>}
          </div>
          {statsAffichables.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {statsAffichables.map((s) => <StatCarte key={s.label} label={s.label} value={s.value} />)}
            </div>
          ) : !statsChargement ? (
            <div style={{ fontSize: 12, color: '#a8a29e' }}>Aucun indicateur disponible pour cette filiale.</div>
          ) : null}
        </section>
      )}

      <AgentsFilters filtres={filtres} definir={definir} reinitialiser={reinitialiser} />

      {requete.isError && (
        <div style={{ borderRadius: 14, border: '1px solid #fecaca', background: '#FEF2F1', padding: 16, color: '#b91c1c', fontSize: 13 }}>
          {normaliserErreur(requete.error).message}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {requete.isLoading ? (
          <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
            <Spinner />
          </div>
        ) : requete.data && requete.data.items.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#78716c', fontSize: 13 }}>
            Aucun agent ne correspond à ces critères.
          </div>
        ) : requete.data ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4' }}>
                  {colonnes.map((colonne) => (
                    <th
                      key={colonne.cle || colonne.libelle}
                      onClick={() => colonne.triable && basculerTri(colonne.cle)}
                      style={{
                        padding: '11px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#a8a29e',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        cursor: colonne.triable ? 'pointer' : 'default',
                        whiteSpace: 'nowrap',
                        userSelect: 'none',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {colonne.libelle}
                        {filtres.triPar === colonne.cle && (
                          filtres.sortOrder === 'ASC' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requete.data.items.map((agent, index) => (
                  <tr
                    key={agent.id}
                    style={{ borderBottom: index < requete.data.items.length - 1 ? '1px solid #f5f5f4' : 'none', background: 'white', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fafaf9' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <PhotoAgent
                        agentId={agent.id}
                        prenom={agent.prenom}
                        nom={agent.nom}
                        aPhoto={Boolean(agent.photoFichier || agent.photoUrl)}
                        photoUrl={agent.photoUrl}
                        taille={34}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link to={`/agents/${agent.id}`} style={{ color: '#007FE1', fontWeight: 700, textDecoration: 'none' }}>
                        {agent.matricule}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1c1917', fontSize: 13 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        {agent.prenom} {agent.nom}
                        {agent.estGerant && <Badge tone="red">Gérant</Badge>}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#57534e', fontSize: 13 }}>{agent.fonction || '—'}</td>
                    {afficherFiliale && (
                      <td style={{ padding: '12px 16px', color: '#57534e', fontSize: 13 }}>{nomFiliale(agent)}</td>
                    )}
                    <td style={{ padding: '12px 16px', color: '#57534e', fontSize: 13 }}>
                      {agent.departement?.id ? (
                        <Link to={`/services?departementId=${agent.departement.id}`} style={{ color: '#007FE1', fontWeight: 600, textDecoration: 'none' }}>
                          {agent.departement.nom || '—'}
                        </Link>
                      ) : (agent.departement?.nom || '—')}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#57534e', fontSize: 13 }}>
                      {agent.service?.id ? (
                        <Link to={`/agents?serviceIds=${agent.service.id}${agent.departement?.id ? `&departementIds=${agent.departement.id}` : ''}`} style={{ color: '#007FE1', fontWeight: 600, textDecoration: 'none' }}>
                          {agent.service.nom || '—'}
                        </Link>
                      ) : (agent.service?.nom || '—')}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#57534e', fontSize: 13, whiteSpace: 'nowrap' }}>{formaterDate(agent.dateEmbauche)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge tone={agent.userId ? 'green' : 'stone'}>{agent.userId ? 'Oui' : 'Non'}</Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge tone={agent.actif ? 'green' : 'stone'}>{agent.actif ? 'Actif' : 'Sorti'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      {requete.data && (
        <Pagination
          page={requete.data.page}
          pages={requete.data.pages}
          total={requete.data.total}
          onChangement={(page) => definir('page', String(page))}
        />
      )}

      {showModal && (
        <AgentModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreer}
          filiales={filiales}
          departements={referentiels.departements}
          services={referentiels.services}
          roles={roles}
          filialeParDefaut={filialeCourante || user?.filialeId || ''}
        />
      )}
    </div>
  )
}

function Pagination({ page, pages, total, onChangement }) {
  if (pages <= 1) {
    return <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>{total} agent(s)</p>
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>{total} agent(s) · page {page} sur {pages}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <BoutonPage disabled={page <= 1} onClick={() => onChangement(page - 1)}>Précédent</BoutonPage>
        <BoutonPage disabled={page >= pages} onClick={() => onChangement(page + 1)}>Suivant</BoutonPage>
      </div>
    </div>
  )
}

function BoutonPage({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        height: 34, padding: '0 12px', borderRadius: 10, border: '1px solid #e7e5e4',
        background: 'white', color: '#57534e', fontSize: 12, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
