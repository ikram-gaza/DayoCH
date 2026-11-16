import { useEffect, useState } from 'react'
import { Contact, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDebounce } from '../../hooks/useDebounce'
import { useFiltresUrl } from '../../hooks/useFiltresUrl'
import { useTrombinoscope } from '../../hooks/useAgents'
import { apiAgents } from '../../services/agentsService'
import { normaliserErreur } from '../../services/apiClient'
import { Badge, Empty, PageHeader, Spinner } from '../../components/ui/ui'
import ExportButtons from '../../components/common/ExportButtons'
import CarteAgent from '../../components/trombinoscope/CarteAgent'

export default function TrombinoscopePage() {
  const { estCompteGroupe, perimetre, peut } = useAuth()
  const { filtres, definir } = useFiltresUrl({ actif: 'true' })
  const [saisie, setSaisie] = useState(filtres.recherche || '')
  const rechercheRetardee = useDebounce(saisie, 350)
  const toutesFiliales = estCompteGroupe

  useEffect(() => {
    if (rechercheRetardee !== (filtres.recherche || '')) {
      definir('recherche', rechercheRetardee || null)
    }
  }, [rechercheRetardee, filtres.recherche, definir])

  const requete = useTrombinoscope(filtres, toutesFiliales)
  const effectifTotal = requete.data?.reduce((total, groupe) => total + groupe.effectif, 0) || 0
  const filiales = requete.data?.length || 0

  return (
    <>
      <PageHeader
        icon={Contact}
        title="Trombinoscope du groupe"
        subtitle={
          requete.data
            ? `${effectifTotal} agent${effectifTotal > 1 ? 's' : ''} dans ${filiales} filiale${filiales > 1 ? 's' : ''}.`
            : 'Annuaire illustré de toutes les filiales.'
        }
        actions={
          <ExportButtons
            formats={['pdf', 'xlsx', 'csv']}
            onExport={(format) => apiAgents.exporterTrombinoscope(filtres, format, toutesFiliales, perimetre)}
          />
        }
      />

      <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 14, marginBottom: 18, display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 14 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, fontWeight: 700, color: '#57534e' }}>
          <span>Rechercher</span>
          <span style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input
              type="search"
              value={saisie}
              onChange={(evenement) => setSaisie(evenement.target.value)}
              placeholder="Nom, matricule, fonction"
              style={{ width: 300, maxWidth: '100%', height: 36, padding: '0 10px 0 32px', borderRadius: 9, border: '1px solid #e7e5e4', background: '#fafaf9', fontSize: 12, boxSizing: 'border-box' }}
            />
          </span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 7, paddingBottom: 8, fontSize: 12, color: '#57534e' }}>
          <input
            type="checkbox"
            checked={filtres.avecPhoto === 'true'}
            onChange={(evenement) => definir('avecPhoto', evenement.target.checked ? 'true' : null)}
          />
          Uniquement avec photo
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 7, paddingBottom: 8, fontSize: 12, color: '#57534e' }}>
          <input
            type="checkbox"
            checked={filtres.actif !== 'all'}
            onChange={(evenement) => definir('actif', evenement.target.checked ? null : 'all')}
          />
          Agents en poste seulement
        </label>
      </section>

      {requete.isLoading && <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}><Spinner /></div>}

      {requete.isError && (
        <div style={{ borderRadius: 14, border: '1px solid #fecaca', background: '#FEF2F1', padding: 16, color: '#b91c1c', fontSize: 13 }}>
          {normaliserErreur(requete.error).message}
        </div>
      )}

      {requete.data && requete.data.length === 0 && (
        <Empty icon={Contact} title="Aucun agent ne correspond" description="Élargissez la recherche ou retirez un filtre." />
      )}

      {requete.data?.map((groupe) => (
        <section key={groupe.filialeId} style={{ marginBottom: 28 }}>
          <h2 style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, margin: '0 0 12px', fontSize: 17, color: '#1c1917' }}>
            {groupe.nom}
            <Badge tone="blue">{groupe.code}</Badge>
            <span style={{ fontSize: 12, fontWeight: 400, color: '#78716c' }}>
              {groupe.pays} · {groupe.effectif} agent{groupe.effectif > 1 ? 's' : ''} · {groupe.avecPhoto} avec photo
            </span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
            {groupe.agents.map((agent) => (
              <CarteAgent key={agent.id} agent={agent} lien={peut('agent:read')} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
