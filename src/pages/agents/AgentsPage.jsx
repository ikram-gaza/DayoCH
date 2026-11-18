import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAgents } from '../../hooks/useAgents'
import { useFiltresUrl } from '../../hooks/useFiltresUrl'
import { apiAgents } from '../../services/agentsService'
import { normaliserErreur } from '../../services/apiClient'
import { formaterDate } from '../../utils/format'
import { Badge, Spinner } from '../../components/ui/ui'
import ExportButtons from '../../components/common/ExportButtons'
import AgentsFilters from '../../components/agents/AgentsFilters'
import PhotoAgent from '../../components/agents/PhotoAgent'

const COLONNES = [
  { cle: 'photo', libelle: '', triable: false },
  { cle: 'matricule', libelle: 'Matricule', triable: true },
  { cle: 'nom', libelle: 'Nom', triable: true },
  { cle: 'fonction', libelle: 'Fonction', triable: true },
  { cle: 'departement', libelle: 'Département', triable: true },
  { cle: 'service', libelle: 'Service', triable: true },
  { cle: 'dateEmbauche', libelle: 'Embauche', triable: true },
  { cle: 'compte', libelle: 'Compte', triable: false },
  { cle: 'actif', libelle: 'Statut', triable: false },
]

export default function AgentsPage() {
  const { perimetre } = useAuth()
  const { filtres, definir, reinitialiser } = useFiltresUrl({
    page: '1',
    limit: '20',
    triPar: 'nom',
    sortOrder: 'ASC',
  })
  const requete = useAgents(filtres)

  const basculerTri = (colonne) => {
    if (filtres.triPar === colonne) {
      definir('sortOrder', filtres.sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      definir('triPar', colonne)
      definir('sortOrder', 'ASC')
    }
  }

  const total = requete.data?.total

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={24} style={{ color: '#007FE1' }} />
            Agents
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            {total != null ? `${total} agent(s) · ` : ''}Effectif de la filiale, filtrable et exportable.
            {requete.isFetching && !requete.isLoading ? ' Actualisation…' : ''}
          </p>
        </div>
        <ExportButtons
          onExport={(format) => apiAgents.exporter(filtres, format, perimetre)}
          formats={['xlsx', 'pdf', 'csv']}
        />
      </div>

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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 920 }}>
              <thead>
                <tr style={{ background: '#fafaf9', borderBottom: '1px solid #e7e5e4' }}>
                  {COLONNES.map((colonne) => {
                    const actif = filtres.triPar === colonne.cle
                    return (
                      <th
                        key={colonne.cle}
                        scope="col"
                        aria-sort={actif ? (filtres.sortOrder === 'ASC' ? 'ascending' : 'descending') : undefined}
                        style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}
                      >
                        {colonne.triable ? (
                          <button
                            type="button"
                            onClick={() => basculerTri(colonne.cle)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', color: actif ? '#007FE1' : 'inherit', padding: 0, cursor: 'pointer', font: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit' }}
                          >
                            {colonne.libelle}
                            {actif && (filtres.sortOrder === 'ASC' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                          </button>
                        ) : (
                          colonne.libelle
                        )}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {requete.data.items.map((agent) => (
                  <tr
                    key={agent.id}
                    style={{ borderBottom: '1px solid #f5f5f4', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F8FF' }}
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
                    <td style={{ padding: '12px 16px', color: '#57534e', fontSize: 13 }}>{agent.departement?.nom || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#57534e', fontSize: 13 }}>{agent.service?.nom || '—'}</td>
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
