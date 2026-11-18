import { Link } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Briefcase, Building2, Calendar, Camera,
  CheckCircle2, Contact, KeyRound, LayoutGrid, Mail, Package,
  RefreshCw, Star, TriangleAlert, UserCog, Users, Warehouse,
} from 'lucide-react'
import { Spinner } from '../../components/ui/ui'
import { usePilotage } from '../../hooks/usePilotage'
import { normaliserErreur } from '../../services/apiClient'

const INDICATEURS = {
  effectif: { icon: Users, color: '#007FE1', bg: '#E5F2FD' },
  photos: { icon: Camera, color: '#15803d', bg: '#dcfce7' },
  sans_compte: { icon: KeyRound, color: '#a16207', bg: '#fef9c3' },
  sans_email: { icon: Mail, color: '#dc2626', bg: '#FEF2F1' },
  gerants: { icon: Star, color: '#7e22ce', bg: '#f3e8ff' },
  filiales: { icon: Building2, color: '#0369a1', bg: '#e0f2fe' },
}

const MODULES = {
  agents: { icon: Users, color: '#007FE1', bg: '#E5F2FD' },
  trombinoscope: { icon: Contact, color: '#15803d', bg: '#dcfce7' },
  conges: { icon: Calendar, color: '#a16207', bg: '#fef9c3' },
  fournitures: { icon: Package, color: '#7e22ce', bg: '#f3e8ff' },
  stock: { icon: Warehouse, color: '#dc2626', bg: '#FEF2F1' },
  organigramme: { icon: Briefcase, color: '#0369a1', bg: '#e0f2fe' },
  utilisateurs: { icon: UserCog, color: '#57534e', bg: '#f5f5f4' },
}

function StatCard({ label, value, hint, icon: Icon, color, bg }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '18px 20px', border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          <Icon size={16} />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#1c1917' }}>{value}</span>
        {hint && <span style={{ fontSize: 12, color: '#78716c' }}>{hint}</span>}
      </div>
    </div>
  )
}

export default function PilotagePage() {
  const requete = usePilotage()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart3 size={24} style={{ color: '#007FE1' }} />
            Pilotage
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            {requete.data?.perimetre?.libelle || 'Indicateurs consolidés du périmètre.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => requete.refetch()}
          disabled={requete.isFetching}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 12, border: '1px solid #e7e5e4',
            background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600,
            cursor: requete.isFetching ? 'not-allowed' : 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            opacity: requete.isFetching ? 0.7 : 1,
          }}
        >
          <RefreshCw size={15} className={requete.isFetching ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>


      {requete.isLoading && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', padding: 48, display: 'grid', placeItems: 'center' }}>
          <Spinner />
        </div>
      )}

      {requete.isError && (
        <div style={{ background: '#FEF2F1', border: '1px solid #fecaca', borderRadius: 14, padding: 16, color: '#b91c1c', fontSize: 13 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Indicateurs indisponibles</p>
          <p style={{ margin: '4px 0 10px' }}>{normaliserErreur(requete.error).message}</p>
          <button type="button" onClick={() => requete.refetch()} style={{ border: 'none', background: 'none', color: '#007FE1', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
            Réessayer
          </button>
        </div>
      )}

      {requete.data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
            {requete.data.indicateurs.map((indicateur) => {
              const style = INDICATEURS[indicateur.cle] || { icon: BarChart3, color: '#57534e', bg: '#f5f5f4' }
              const suffixe = indicateur.cle === 'photos' ? '%' : ''
              return (
                <StatCard
                  key={indicateur.cle}
                  label={indicateur.libelle}
                  value={`${indicateur.valeur}${suffixe}`}
                  hint={indicateur.precision || null}
                  icon={style.icon}
                  color={style.color}
                  bg={style.bg}
                />
              )
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f4', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: '#E5F2FD', color: '#007FE1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutGrid size={16} />
                </span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c1917' }}>Modules</h2>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#78716c' }}>Accès rapides selon vos permissions.</p>
                </div>
              </div>
              <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {requete.data.modules.map((module) => {
                  const style = MODULES[module.cle] || { icon: LayoutGrid, color: '#57534e', bg: '#f5f5f4' }
                  const Icone = style.icon
                  const contenu = (
                    <>
                      <span style={{ width: 34, height: 34, borderRadius: 10, background: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icone size={16} />
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: 13, color: '#1c1917' }}>{module.libelle}</strong>
                          {!module.disponible && <span style={{ fontSize: 10, fontWeight: 700, color: '#57534e', background: '#f5f5f4', padding: '2px 8px', borderRadius: 999 }}>À venir</span>}
                        </span>
                        <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: '#78716c', lineHeight: 1.4 }}>{module.description}</span>
                      </span>
                      {module.disponible && <ArrowRight size={15} style={{ color: '#a8a29e', flexShrink: 0, marginTop: 8 }} />}
                    </>
                  )
                  const base = { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid #e7e5e4', background: 'white', textDecoration: 'none', color: 'inherit' }
                  if (!module.disponible) return <div key={module.cle} aria-disabled="true" style={{ ...base, opacity: 0.6 }}>{contenu}</div>
                  return <Link key={module.cle} to={module.chemin} style={base}>{contenu}</Link>
                })}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: requete.data.pointsAttention.length > 0 ? '#fef3c7' : '#dcfce7', color: requete.data.pointsAttention.length > 0 ? '#a16207' : '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TriangleAlert size={16} />
                    </span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c1917' }}>À traiter</h2>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#78716c' }}>
                        {requete.data.pointsAttention.length > 0 ? `${requete.data.pointsAttention.length} point(s) d'attention` : 'Aucune action urgente'}
                      </p>
                    </div>
                  </div>
                  {requete.data.pointsAttention.length > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#a16207', background: '#fef3c7', padding: '2px 8px', borderRadius: 999 }}>{requete.data.pointsAttention.length}</span>
                  )}
                </div>
                <div style={{ padding: 16 }}>
                  {requete.data.pointsAttention.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#15803d', fontSize: 13, fontWeight: 600 }}>
                      <CheckCircle2 size={16} />
                      <span>Tout est à jour sur ce périmètre.</span>
                    </div>
                  ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {requete.data.pointsAttention.map((point) => {
                        const alerte = point.niveau === 'alerte'
                        const Icone = alerte ? TriangleAlert : BarChart3
                        const couleur = alerte ? '#dc2626' : '#007FE1'
                        const fond = alerte ? '#FEF2F1' : '#F0F8FF'
                        const contenu = (
                          <>
                            <span style={{ width: 28, height: 28, borderRadius: 8, background: fond, color: couleur, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Icone size={14} />
                            </span>
                            <span style={{ flex: 1, fontSize: 13, color: '#44403c', lineHeight: 1.45 }}>{point.message}</span>
                            {point.chemin && <ArrowRight size={14} style={{ color: '#a8a29e', flexShrink: 0 }} />}
                          </>
                        )
                        const ligneStyle = { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', textDecoration: 'none', color: 'inherit' }
                        return (
                          <li key={point.message}>
                            {point.chemin ? <Link to={point.chemin} style={ligneStyle}>{contenu}</Link> : <div style={ligneStyle}>{contenu}</div>}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {requete.data.effectifParFiliale.length > 1 && (
                <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f4', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 10, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={16} />
                    </span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c1917' }}>Effectif par filiale</h2>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#78716c' }}>Répartition des agents actifs.</p>
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {requete.data.effectifParFiliale.map((filiale) => {
                      const max = Math.max(...requete.data.effectifParFiliale.map((item) => item.effectif), 1)
                      return (
                        <div key={filiale.code}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: '#1c1917', fontWeight: 600 }}>{filiale.code} <span style={{ fontWeight: 500, color: '#78716c' }}>· {filiale.nom}</span></span>
                            <span style={{ fontSize: 12, color: '#78716c' }}>{filiale.effectif} agent(s) · {filiale.avecPhoto} photo(s)</span>
                          </div>
                          <div style={{ height: 8, borderRadius: 999, background: '#f5f5f4', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${(filiale.effectif / max) * 100}%`, borderRadius: 999, background: '#007FE1' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
