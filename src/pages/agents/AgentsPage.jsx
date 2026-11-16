import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAgents } from '../../hooks/useAgents'
import { useFiltresUrl } from '../../hooks/useFiltresUrl'
import { apiAgents } from '../../services/agentsService'
import { normaliserErreur } from '../../services/apiClient'
import { formaterDate } from '../../utils/format'
import { Badge, Empty, PageHeader, Spinner } from '../../components/ui/ui'
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

  return (
    <>
      <PageHeader
        icon={Users}
        title="Agents"
        subtitle={`Effectif de la filiale, filtrable et exportable.${requete.isFetching && !requete.isLoading ? ' Actualisation…' : ''}`}
        actions={
          <ExportButtons
            onExport={(format) => apiAgents.exporter(filtres, format, perimetre)}
            formats={['xlsx', 'pdf', 'csv']}
          />
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AgentsFilters filtres={filtres} definir={definir} reinitialiser={reinitialiser} />

        {requete.isLoading && (
          <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}>
            <Spinner />
          </div>
        )}

        {requete.isError && (
          <div style={{ borderRadius: 14, border: '1px solid #fecaca', background: '#FEF2F1', padding: 16, color: '#b91c1c', fontSize: 13 }}>
            {normaliserErreur(requete.error).message}
          </div>
        )}

        {requete.data && requete.data.items.length === 0 && (
          <Empty
            icon={Users}
            title="Aucun agent ne correspond à ces critères."
            description="Élargissez la recherche ou effacez les filtres."
          />
        )}

        {requete.data && requete.data.items.length > 0 && (
          <>
            <div style={{ overflowX: 'auto', borderRadius: 14, border: '1px solid #e7e5e4', background: 'white' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900, fontSize: 13 }}>
                <thead>
                  <tr>
                    {COLONNES.map((colonne) => {
                      const actif = filtres.triPar === colonne.cle
                      return (
                        <th
                          key={colonne.cle}
                          scope="col"
                          aria-sort={actif ? (filtres.sortOrder === 'ASC' ? 'ascending' : 'descending') : undefined}
                          style={{
                            whiteSpace: 'nowrap',
                            background: '#00509A',
                            color: 'white',
                            padding: '10px 12px',
                            textAlign: 'left',
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {colonne.triable ? (
                            <button
                              type="button"
                              onClick={() => basculerTri(colonne.cle)}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', color: 'inherit', padding: 0, cursor: 'pointer', font: 'inherit' }}
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
                    <tr key={agent.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <PhotoAgent
                          agentId={agent.id}
                          prenom={agent.prenom}
                          nom={agent.nom}
                          aPhoto={Boolean(agent.photoFichier || agent.photoUrl)}
                          photoUrl={agent.photoUrl}
                          taille={34}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <Link to={`/agents/${agent.id}`} style={{ color: '#00509A', fontWeight: 700, textDecoration: 'none' }}>
                          {agent.matricule}
                        </Link>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#1c1917' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          {agent.prenom} {agent.nom}
                          {agent.estGerant && <Badge tone="red">Gérant</Badge>}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', color: '#57534e' }}>{agent.fonction || '-'}</td>
                      <td style={{ padding: '8px 12px', color: '#57534e' }}>{agent.departement?.nom || '-'}</td>
                      <td style={{ padding: '8px 12px', color: '#57534e' }}>{agent.service?.nom || '-'}</td>
                      <td style={{ padding: '8px 12px', color: '#57534e' }}>{formaterDate(agent.dateEmbauche)}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <Badge tone={agent.userId ? 'green' : 'stone'}>{agent.userId ? 'Oui' : 'Non'}</Badge>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <Badge tone={agent.actif ? 'green' : 'stone'}>{agent.actif ? 'Actif' : 'Sorti'}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={requete.data.page}
              pages={requete.data.pages}
              total={requete.data.total}
              onChangement={(page) => definir('page', String(page))}
            />
          </>
        )}
      </div>
    </>
  )
}

function Pagination({ page, pages, total, onChangement }) {
  if (pages <= 1) {
    return <p style={{ margin: 0, fontSize: 12, color: '#78716c' }}>{total} agent(s)</p>
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <p style={{ margin: 0, fontSize: 12, color: '#78716c' }}>{total} agent(s) · page {page} sur {pages}</p>
      <div style={{ display: 'flex', gap: 6 }}>
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
        height: 32,
        padding: '0 12px',
        borderRadius: 8,
        border: '1px solid #e7e5e4',
        background: 'white',
        color: '#57534e',
        fontSize: 12,
        fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}
