import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  Calendar,
  Camera,
  CheckCircle2,
  Contact,
  KeyRound,
  LayoutGrid,
  Mail,
  Package,
  RefreshCw,
  Star,
  TriangleAlert,
  UserCog,
  Users,
  Warehouse,
} from 'lucide-react'
import { Badge, Empty, Notice, PageHeader, Spinner } from '../../components/ui/ui'
import { USE_MOCK_DATA } from '../../config/donnees'
import { usePilotage } from '../../hooks/usePilotage'
import { normaliserErreur } from '../../services/apiClient'

const INDICATEURS = {
  effectif: { icon: Users, couleur: '#007FE1', fond: '#E5F2FD' },
  photos: { icon: Camera, couleur: '#15803d', fond: '#dcfce7' },
  sans_compte: { icon: KeyRound, couleur: '#b45309', fond: '#fef3c7' },
  sans_email: { icon: Mail, couleur: '#b91c1c', fond: '#FEF2F1' },
  gerants: { icon: Star, couleur: '#7e22ce', fond: '#f3e8ff' },
  filiales: { icon: Building2, couleur: '#0369a1', fond: '#e0f2fe' },
}

const MODULES = {
  agents: { icon: Users, couleur: '#007FE1', fond: '#E5F2FD' },
  trombinoscope: { icon: Contact, couleur: '#15803d', fond: '#dcfce7' },
  conges: { icon: Calendar, couleur: '#b45309', fond: '#fef3c7' },
  fournitures: { icon: Package, couleur: '#7e22ce', fond: '#f3e8ff' },
  stock: { icon: Warehouse, couleur: '#b91c1c', fond: '#FEF2F1' },
  organigramme: { icon: Briefcase, couleur: '#0369a1', fond: '#e0f2fe' },
  utilisateurs: { icon: UserCog, couleur: '#57534e', fond: '#f5f5f4' },
}

export default function PilotagePage() {
  const requete = usePilotage()

  return (
    <>
      <PageHeader
        icon={BarChart3}
        title="Pilotage"
        subtitle={requete.data?.perimetre?.libelle || 'Indicateurs consolidés du périmètre.'}
        actions={
          <button
            type="button"
            onClick={() => requete.refetch()}
            disabled={requete.isFetching}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              height: 36,
              padding: '0 13px',
              borderRadius: 10,
              border: '1px solid #e7e5e4',
              background: 'white',
              color: '#57534e',
              fontSize: 12,
              fontWeight: 700,
              cursor: requete.isFetching ? 'not-allowed' : 'pointer',
              opacity: requete.isFetching ? 0.65 : 1,
            }}
          >
            <RefreshCw size={14} className={requete.isFetching ? 'animate-spin' : ''} />
            Actualiser
          </button>
        }
      />

      {USE_MOCK_DATA && (
        <Notice tone="info" title="Indicateurs de démonstration" className="mb-4">
          Les données affichées proviennent du jeu de démonstration. Activez le backend pour obtenir les indicateurs réels.
        </Notice>
      )}

      {requete.isLoading && (
        <div style={{ display: 'grid', placeItems: 'center', padding: 64 }}>
          <Spinner />
        </div>
      )}

      {requete.isError && (
        <Empty
          icon={BarChart3}
          title="Indicateurs indisponibles"
          description={normaliserErreur(requete.error).message}
          action={
            <button
              type="button"
              onClick={() => requete.refetch()}
              style={{ border: 'none', background: 'none', color: '#007FE1', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              Réessayer
            </button>
          }
        />
      )}

      {requete.data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <section aria-label="Indicateurs clés" className="grid grid-cols-2 gap-3.5 lg:grid-cols-3">
            {requete.data.indicateurs.map((indicateur) => (
              <CarteIndicateur key={indicateur.cle} indicateur={indicateur} />
            ))}
          </section>

          <div className="grid items-start gap-[18px] xl:grid-cols-[1.25fr_0.75fr]">
            <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <EnteteSection
                icon={LayoutGrid}
                titre="Modules"
                description="Accès rapides selon vos permissions."
              />
              <div className="grid gap-2.5 p-4 sm:grid-cols-2">
                {requete.data.modules.map((module) => (
                  <CarteModule key={module.cle} module={module} />
                ))}
              </div>
            </section>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <EnteteSection
                  icon={TriangleAlert}
                  titre="À traiter"
                  description={requete.data.pointsAttention.length > 0 ? `${requete.data.pointsAttention.length} point(s) d'attention` : 'Aucune action urgente'}
                  compte={requete.data.pointsAttention.length}
                />
                <div style={{ padding: 14 }}>
                  {requete.data.pointsAttention.length === 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px', color: '#15803d' }}>
                      <CheckCircle2 size={17} />
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Tout est à jour sur ce périmètre.</span>
                    </div>
                  ) : (
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0, listStyle: 'none' }}>
                      {requete.data.pointsAttention.map((point) => (
                        <LigneAttention key={point.message} point={point} />
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              {requete.data.effectifParFiliale.length > 1 && (
                <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                  <EnteteSection icon={Building2} titre="Effectif par filiale" description="Répartition des agents actifs." />
                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {requete.data.effectifParFiliale.map((filiale) => (
                      <BarreFiliale
                        key={filiale.code}
                        filiale={filiale}
                        maximum={Math.max(...requete.data.effectifParFiliale.map((item) => item.effectif), 1)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CarteIndicateur({ indicateur }) {
  const style = INDICATEURS[indicateur.cle] || { icon: BarChart3, couleur: '#57534e', fond: '#f5f5f4' }
  const Icone = style.icon
  const suffixe = indicateur.cle === 'photos' ? '%' : null

  return (
    <article
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 13,
        padding: 16,
        background: 'white',
        border: '1px solid #e7e5e4',
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <span
        style={{
          width: 38,
          height: 38,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 11,
          background: style.fond,
          color: style.couleur,
        }}
      >
        <Icone size={18} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.045em' }}>
          {indicateur.libelle}
        </p>
        <p style={{ margin: '3px 0 0', fontSize: 27, lineHeight: 1.05, fontWeight: 800, color: '#1c1917' }}>
          {indicateur.valeur}
          {suffixe && <span style={{ marginLeft: 3, fontSize: 15, fontWeight: 700, color: '#a8a29e' }}>{suffixe}</span>}
        </p>
        {indicateur.precision && (
          <p style={{ margin: '5px 0 0', fontSize: 11, color: '#a8a29e', lineHeight: 1.35 }}>{indicateur.precision}</p>
        )}
      </div>
    </article>
  )
}

function EnteteSection({ icon: Icone, titre, description, compte }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '16px 18px', borderBottom: '1px solid #f5f5f4' }}>
      <span style={{ width: 32, height: 32, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 9, background: '#E5F2FD', color: '#007FE1' }}>
        <Icone size={16} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#1c1917' }}>{titre}</h2>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#a8a29e' }}>{description}</p>
      </div>
      {typeof compte === 'number' && compte > 0 && <Badge tone="amber">{compte}</Badge>}
    </div>
  )
}

function CarteModule({ module }) {
  const style = MODULES[module.cle] || { icon: LayoutGrid, couleur: '#57534e', fond: '#f5f5f4' }
  const Icone = style.icon
  const contenu = (
    <>
      <span style={{ width: 34, height: 34, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: 10, background: style.fond, color: style.couleur }}>
        <Icone size={16} />
      </span>
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <strong style={{ fontSize: 13, color: module.disponible ? '#1c1917' : '#78716c' }}>{module.libelle}</strong>
          {!module.disponible && <Badge tone="stone">À venir</Badge>}
        </span>
        <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: '#a8a29e', lineHeight: 1.35 }}>{module.description}</span>
      </span>
      {module.disponible && <ArrowRight size={14} style={{ marginTop: 9, flexShrink: 0, color: '#d6d3d1' }} />}
    </>
  )

  const base = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '11px 12px',
    borderRadius: 12,
    border: '1px solid #f5f5f4',
    background: '#fafaf9',
    textDecoration: 'none',
  }

  if (!module.disponible) {
    return <div aria-disabled="true" style={{ ...base, opacity: 0.6 }}>{contenu}</div>
  }

  return (
    <Link
      to={module.chemin}
      style={base}
      onMouseEnter={(evenement) => {
        evenement.currentTarget.style.background = 'white'
        evenement.currentTarget.style.borderColor = '#bae6fd'
      }}
      onMouseLeave={(evenement) => {
        evenement.currentTarget.style.background = '#fafaf9'
        evenement.currentTarget.style.borderColor = '#f5f5f4'
      }}
    >
      {contenu}
    </Link>
  )
}

function LigneAttention({ point }) {
  const Icone = point.niveau === 'alerte' ? TriangleAlert : BarChart3
  const couleur = point.niveau === 'alerte' ? '#dc2626' : '#007FE1'
  const fond = point.niveau === 'alerte' ? '#FEF2F1' : '#F0F8FF'
  const contenu = (
    <>
      <span style={{ width: 28, height: 28, display: 'grid', placeItems: 'center', borderRadius: 8, background: fond, color: couleur, flexShrink: 0 }}>
        <Icone size={14} />
      </span>
      <span style={{ flex: 1, fontSize: 12, color: '#44403c', lineHeight: 1.4 }}>{point.message}</span>
      {point.chemin && <ArrowRight size={13} style={{ color: '#a8a29e', flexShrink: 0 }} />}
    </>
  )

  if (!point.chemin) {
    return <li style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 6px' }}>{contenu}</li>
  }

  return (
    <li>
      <Link
        to={point.chemin}
        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 6px', borderRadius: 9, textDecoration: 'none' }}
        onMouseEnter={(evenement) => { evenement.currentTarget.style.background = '#fafaf9' }}
        onMouseLeave={(evenement) => { evenement.currentTarget.style.background = 'transparent' }}
      >
        {contenu}
      </Link>
    </li>
  )
}

function BarreFiliale({ filiale, maximum }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ minWidth: 105, fontSize: 11, color: '#44403c' }}>
        <strong>{filiale.code}</strong>
        <span style={{ display: 'block', marginTop: 1, color: '#a8a29e', fontSize: 10 }}>{filiale.nom}</span>
      </span>
      <div style={{ height: 8, flex: 1, minWidth: 50, borderRadius: 999, background: '#f5f5f4', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(filiale.effectif / maximum) * 100}%`, borderRadius: 999, background: 'linear-gradient(90deg, #007FE1, #00509A)' }} />
      </div>
      <span style={{ minWidth: 98, textAlign: 'right', fontSize: 10, color: '#a8a29e' }}>
        {filiale.effectif} agent(s) · {filiale.avecPhoto} photo(s)
      </span>
    </div>
  )
}
