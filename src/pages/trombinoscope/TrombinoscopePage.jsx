import { useEffect, useState } from 'react'
import { Contact, Search, Users } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDebounce } from '../../hooks/useDebounce'
import { useFiltresUrl } from '../../hooks/useFiltresUrl'
import { useTrombinoscope } from '../../hooks/useAgents'
import { apiAgents } from '../../services/agentsService'
import { normaliserErreur } from '../../services/apiClient'
import { Spinner } from '../../components/ui/ui'
import ExportButtons from '../../components/common/ExportButtons'
import CarteAgent from '../../components/trombinoscope/CarteAgent'

export default function TrombinoscopePage() {
  const { estCompteGroupe, filialeCourante, perimetre, peut } = useAuth()
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Contact size={24} style={{ color: '#007FE1' }} />
            Trombinoscope
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            {requete.data ? `${effectifTotal} agent(s) · ${filiales} filiale(s).` : 'Annuaire illustré des filiales et des équipes.'}
            {estCompteGroupe && !filialeCourante ? ' Recherche possible dans toutes les filiales (vue groupe).' : ''}
          </p>
        </div>
        <ExportButtons
          formats={['pdf', 'xlsx', 'csv']}
          onExport={(format) => apiAgents.exporterTrombinoscope(filtres, format, toutesFiliales, perimetre)}
        />
      </div>

      <div style={{ background: 'white', borderRadius: 14, padding: '14px 18px', border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <label style={{ flex: '1 1 260px', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: '#57534e' }}>
          Rechercher (nom, prénom, matricule, fonction)
          <span style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input
              type="search"
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Ex : Ben, Awa, SA-0001…"
              style={{ width: '100%', boxSizing: 'border-box', height: 36, padding: '0 10px 0 32px', borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', fontSize: 13, outline: 'none' }}
            />
          </span>
        </label>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#57534e', cursor: 'pointer', marginTop: 18 }}>
          <input type="checkbox" checked={filtres.avecPhoto === 'true'} onChange={(e) => definir('avecPhoto', e.target.checked ? 'true' : null)} />
          Uniquement avec photo
        </label>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#57534e', cursor: 'pointer', marginTop: 18 }}>
          <input type="checkbox" checked={filtres.actif !== 'all'} onChange={(e) => definir('actif', e.target.checked ? null : 'all')} />
          Agents en poste seulement
        </label>
      </div>

      {requete.isLoading && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', padding: 48, display: 'grid', placeItems: 'center' }}>
          <Spinner />
        </div>
      )}

      {requete.isError && (
        <div style={{ borderRadius: 14, border: '1px solid #fecaca', background: '#FEF2F1', padding: 16, color: '#b91c1c', fontSize: 13 }}>
          {normaliserErreur(requete.error).message}
        </div>
      )}

      {requete.data && requete.data.length === 0 && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px dashed #d6d3d1', padding: '40px 24px', textAlign: 'center' }}>
          <span style={{ width: 56, height: 56, borderRadius: 16, background: '#f5f5f4', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e', marginBottom: 14 }}>
            <Contact size={24} />
          </span>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>Aucun agent ne correspond</p>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            {estCompteGroupe && filialeCourante ? 'Vous êtes en vue d’une filiale ; passez en « Groupe (toutes filiales) » pour chercher dans tout le groupe.' : 'Élargissez la recherche ou retirez un filtre.'}
          </p>
        </div>
      )}

      {requete.data?.map((groupe) => (
        <section key={groupe.filialeId} style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f5f5f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <span style={{ width: 32, height: 32, borderRadius: 10, background: '#E5F2FD', color: '#007FE1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={16} />
              </span>
              <div style={{ minWidth: 0 }}>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c1917', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {groupe.nom}
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#007FE1', background: '#E5F2FD', padding: '2px 8px', borderRadius: 999 }}>{groupe.code}</span>
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#78716c' }}>
                  {groupe.pays} · {groupe.effectif} agent{groupe.effectif > 1 ? 's' : ''} · {groupe.avecPhoto} avec photo
                </p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#57534e' }}>{groupe.effectif} membre{groupe.effectif > 1 ? 's' : ''}</span>
          </div>
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {groupe.agents.map((agent) => (
              <CarteAgent key={agent.id} agent={agent} lien={peut('agent:read')} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
