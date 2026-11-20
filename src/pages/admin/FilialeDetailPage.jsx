import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Building2, MapPin, Mail, Phone, Globe, Landmark, Wallet,
  Clock, Calendar, Users, Layers, Hash, Pencil, Archive,
  CheckCircle2, AlertCircle, Plus, GitBranch,
} from 'lucide-react'
import { filialesService, messageErreurFiliale } from '../../services/filialesService'
import { departementsService, messageErreurDepartement } from '../../services/departementsService'
import { servicesService, messageErreurService } from '../../services/servicesService'
import { apiAgents } from '../../services/agentsService'
import { normaliserErreur } from '../../services/apiClient'
import { formaterDate } from '../../utils/format'
import { Badge, Spinner } from '../../components/ui/ui'
import FilialeModal from '../../components/filiales/FilialeModal'

function LigneInfo({ icon: Icon, label, value, accent }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ width: 28, height: 28, borderRadius: 8, background: `${accent || '#007FE1'}12`, color: accent || '#007FE1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
        <Icon size={14} />
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ fontSize: 13, color: '#1c1917', marginTop: 2, wordBreak: 'break-word' }}>{value}</div>
      </div>
    </div>
  )
}

function CarteSection({ titre, icon: Icon, accent, children, action }) {
  return (
    <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, background: `${accent || '#007FE1'}12`, color: accent || '#007FE1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} />
          </span>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c1917' }}>{titre}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function LienAction({ to, children }) {
  return (
    <Link to={to} style={{ fontSize: 12, color: '#007FE1', fontWeight: 700, textDecoration: 'none' }}>
      {children}
    </Link>
  )
}

export default function FilialeDetailPage() {
  const { id } = useParams()
  const [filiale, setFiliale] = useState(null)
  const [toutesFiliales, setToutesFiliales] = useState([])
  const [agents, setAgents] = useState([])
  const [totalAgents, setTotalAgents] = useState(0)
  const [departements, setDepartements] = useState([])
  const [totalDepartements, setTotalDepartements] = useState(0)
  const [services, setServices] = useState([])
  const [totalServices, setTotalServices] = useState(0)
  const [chargement, setChargement] = useState(true)
  const [chargementAgents, setChargementAgents] = useState(true)
  const [chargementOrganisation, setChargementOrganisation] = useState(true)
  const [erreur, setErreur] = useState('')
  const [erreurAgents, setErreurAgents] = useState('')
  const [erreurOrganisation, setErreurOrganisation] = useState('')
  const [toast, setToast] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showModalAgence, setShowModalAgence] = useState(false)

  const afficherToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const charger = async () => {
    setChargement(true)
    setErreur('')
    try {
      const [detail, liste] = await Promise.all([
        filialesService.detail(id),
        filialesService.lister({ sortOrder: 'ASC' }).catch(() => []),
      ])
      setFiliale(detail)
      setToutesFiliales(Array.isArray(liste) ? liste : [])
    } catch (e) {
      setErreur(messageErreurFiliale(e))
    } finally {
      setChargement(false)
    }
  }

  const chargerAgents = async () => {
    setChargementAgents(true)
    setErreurAgents('')
    try {
      const page = await apiAgents.lister({ filialeId: id, page: '1', limit: '50', sortOrder: 'ASC', triPar: 'nom' })
      setAgents(page.items || [])
      setTotalAgents(page.total || 0)
    } catch (e) {
      setErreurAgents(normaliserErreur(e).message)
      setAgents([])
      setTotalAgents(0)
    } finally {
      setChargementAgents(false)
    }
  }

  const chargerOrganisation = async () => {
    setChargementOrganisation(true)
    setErreurOrganisation('')
    try {
      const [deps, servs] = await Promise.all([
        departementsService.lister({ filialeId: id, page: '1', limit: '100', sortOrder: 'ASC', avecEffectifs: 'true' }).catch((e) => { throw { source: 'departements', erreur: e } }),
        servicesService.lister({ filialeId: id, page: '1', limit: '100', sortOrder: 'ASC' }).catch((e) => { throw { source: 'services', erreur: e } }),
      ])
      let depItems = Array.isArray(deps?.items) ? deps.items : []
      let servItems = Array.isArray(servs?.items) ? servs.items : []
      depItems = depItems.filter((d) => !d.filialeId || String(d.filialeId) === String(id))
      servItems = servItems.filter((s) => !s.filialeId || String(s.filialeId) === String(id))
      setDepartements(depItems)
      setTotalDepartements(depItems.length || deps?.total || 0)
      setServices(servItems)
      setTotalServices(servItems.length || servs?.total || 0)
    } catch (e) {
      if (e?.source === 'departements') {
        setErreurOrganisation(messageErreurDepartement(e.erreur))
        setDepartements([]); setTotalDepartements(0)
        try {
          const servs = await servicesService.lister({ filialeId: id, page: '1', limit: '100', sortOrder: 'ASC' })
          let servItems = Array.isArray(servs?.items) ? servs.items : []
          servItems = servItems.filter((s) => !s.filialeId || String(s.filialeId) === String(id))
          setServices(servItems); setTotalServices(servItems.length || servs?.total || 0)
        } catch (e2) {
          setErreurOrganisation(`${messageErreurDepartement(e.erreur)} ${messageErreurService(e2)}`)
          setServices([]); setTotalServices(0)
        }
      } else if (e?.source === 'services') {
        setErreurOrganisation(messageErreurService(e.erreur))
        setServices([]); setTotalServices(0)
        try {
          const deps = await departementsService.lister({ filialeId: id, page: '1', limit: '100', sortOrder: 'ASC', avecEffectifs: 'true' })
          let depItems = Array.isArray(deps?.items) ? deps.items : []
          depItems = depItems.filter((d) => !d.filialeId || String(d.filialeId) === String(id))
          setDepartements(depItems); setTotalDepartements(depItems.length || deps?.total || 0)
        } catch (e2) {
          setErreurOrganisation(`${messageErreurService(e.erreur)} ${messageErreurDepartement(e2)}`)
          setDepartements([]); setTotalDepartements(0)
        }
      } else {
        setErreurOrganisation(messageErreurDepartement(e) || messageErreurService(e))
      }
    } finally {
      setChargementOrganisation(false)
    }
  }

  useEffect(() => { charger() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { chargerAgents() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { chargerOrganisation() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const parent = useMemo(() => {
    if (!filiale?.parentId) return null
    return toutesFiliales.find((f) => String(f.id) === String(filiale.parentId)) || null
  }, [filiale, toutesFiliales])

  const agences = useMemo(
    () => toutesFiliales.filter((f) => String(f.parentId) === String(filiale?.id)),
    [toutesFiliales, filiale?.id],
  )

  const handleSubmit = async (data) => {
    try {
      await filialesService.modifier(id, data)
      await charger()
      afficherToast('Filiale mise à jour.')
      return true
    } catch (e) {
      afficherToast(`Erreur : ${messageErreurFiliale(e)}`)
      return false
    }
  }

  const handleCreerAgence = async (data) => {
    try {
      await filialesService.creer({ ...data, parentId: id })
      await charger()
      afficherToast('Agence / sous-filiale créée.')
      return true
    } catch (e) {
      afficherToast(`Erreur : ${messageErreurFiliale(e)}`)
      return false
    }
  }

  const handleArchiver = async () => {
    if (!filiale || !window.confirm(`Archiver la filiale ${filiale.nom} ?`)) return
    try {
      await filialesService.archiver(filiale.id)
      await charger()
      afficherToast('Filiale archivée.')
    } catch (e) {
      afficherToast(`Erreur : ${messageErreurFiliale(e)}`)
    }
  }

  if (chargement) {
    return <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}><Spinner /></div>
  }

  if (erreur || !filiale) {
    return (
      <div style={{ background: '#FEF2F1', border: '1px solid #fecaca', borderRadius: 14, padding: 16, color: '#b91c1c', fontSize: 13 }}>
        <p style={{ margin: 0, fontWeight: 700 }}>Filiale introuvable</p>
        <p style={{ margin: '4px 0 10px' }}>{erreur || 'Aucune donnée.'}</p>
        <Link to="/filiales" style={{ color: '#007FE1', fontWeight: 700 }}>Retour à la liste</Link>
      </div>
    )
  }

  const accent = filiale.couleur || '#007FE1'
  const nbCollabAffiche = filiale.nombreCollaborateurs ?? filiale.effectif ?? filiale.collaborateurs ?? (chargementAgents ? null : totalAgents)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, background: '#1c1917', color: 'white', padding: '12px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
          <span>{toast}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${accent}15`, color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {filiale.nom}
              <Badge tone={filiale.actif ? 'green' : 'stone'}>{filiale.actif ? 'Active' : 'Archivée'}</Badge>
            </h1>
            <p style={{ fontSize: 13, color: '#78716c', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {filiale.code && <span style={{ fontWeight: 700, color: accent, background: `${accent}12`, padding: '2px 8px', borderRadius: 6, letterSpacing: '0.06em' }}>{filiale.code}</span>}
              {[filiale.ville, filiale.pays].filter(Boolean).join(', ') || 'Localisation non renseignée'}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/filiales" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            <ArrowLeft size={15} /> Retour
          </Link>
          <button type="button" onClick={() => setShowModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Pencil size={15} /> Modifier
          </button>
          {filiale.actif !== false && (
            <button type="button" onClick={handleArchiver} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: '1px solid #fecaca', background: '#FEF2F1', color: '#b91c1c', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <Archive size={15} /> Archiver
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Collaborateurs', value: nbCollabAffiche ?? '—', icon: Users },
          { label: 'Départements', value: chargementOrganisation ? '…' : (totalDepartements || departements.length || 0), icon: Building2 },
          { label: 'Services', value: chargementOrganisation ? '…' : (totalServices || services.length || 0), icon: Layers },
          { label: 'Agences', value: agences.length, icon: GitBranch },
          { label: 'Devise', value: filiale.devise || '—', icon: Wallet },
          { label: 'Fuseau horaire', value: filiale.timezone || '—', icon: Clock },
        ].map((item) => (
          <div key={item.label} style={{ background: 'white', borderRadius: 14, padding: '14px 16px', border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
              <item.icon size={15} style={{ color: accent }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800, color: '#1c1917', wordBreak: 'break-word' }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
        <CarteSection titre="Informations générales" icon={Building2} accent={accent}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <LigneInfo icon={Hash} label="Code" value={filiale.code} accent={accent} />
            <LigneInfo icon={Landmark} label="Raison sociale" value={filiale.raisonSociale} accent={accent} />
            <LigneInfo icon={Globe} label="Pays" value={filiale.pays} accent={accent} />
            <LigneInfo icon={MapPin} label="Ville" value={filiale.ville} accent={accent} />
            <LigneInfo icon={MapPin} label="Adresse" value={filiale.adresse} accent={accent} />
            <LigneInfo icon={Layers} label="Filiale parente" value={parent ? `${parent.nom}${parent.code ? ` (${parent.code})` : ''}` : 'Aucune (racine)'} accent={accent} />
            <LigneInfo icon={Calendar} label="Date d'ouverture" value={formaterDate(filiale.dateOuverture || filiale.createdAt)} accent={accent} />
          </div>
        </CarteSection>

        <CarteSection titre="Contact & paramètres" icon={Mail} accent={accent}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <LigneInfo icon={Mail} label="E-mail" value={filiale.email} accent={accent} />
            <LigneInfo icon={Phone} label="Téléphone" value={filiale.telephone} accent={accent} />
            <LigneInfo icon={Wallet} label="Devise" value={filiale.devise} accent={accent} />
            <LigneInfo icon={Clock} label="Fuseau horaire" value={filiale.timezone} accent={accent} />
          </div>
        </CarteSection>
      </div>

      <CarteSection
        titre="Départements de la filiale"
        icon={Building2}
        accent={accent}
        action={(
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#78716c', fontWeight: 600 }}>{chargementOrganisation ? 'Chargement…' : `${totalDepartements || departements.length} département(s)`}</span>
            <LienAction to={`/departements?filialeId=${id}`}>Gérer</LienAction>
          </span>
        )}
      >
        {erreurOrganisation && !departements.length && (
          <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: '#FEF2F1', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={15} /> {erreurOrganisation}
          </div>
        )}
        {chargementOrganisation ? (
          <div style={{ display: 'grid', placeItems: 'center', padding: 24 }}><Spinner /></div>
        ) : departements.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>Aucun département rattaché à cette filiale. <LienAction to={`/departements?filialeId=${id}`}>Voir / créer</LienAction></p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4' }}>
                  {['Code', 'Nom', 'Responsable', 'Effectif', 'Statut', 'Liens'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departements.slice(0, 20).map((dep, index) => (
                  <tr key={dep.id || dep.code || index} style={{ borderBottom: index < Math.min(departements.length, 20) - 1 ? '1px solid #f5f5f4' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: accent }}>{dep.code || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#1c1917', fontWeight: 600 }}>{dep.nom || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#57534e' }}>{dep.responsableNom || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#57534e' }}>{dep.effectif ?? '—'}</td>
                    <td style={{ padding: '10px 14px' }}><Badge tone={dep.actif !== false ? 'green' : 'stone'}>{dep.actif !== false ? 'Actif' : 'Inactif'}</Badge></td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ display: 'inline-flex', gap: 10, flexWrap: 'wrap' }}>
                        {dep.id && <LienAction to={`/agents?filialeId=${id}&departementIds=${dep.id}`}>Agents</LienAction>}
                        {dep.id && <LienAction to={`/services?filialeId=${id}&departementId=${dep.id}`}>Services</LienAction>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {departements.length > 20 && (
              <p style={{ margin: '10px 14px 0', fontSize: 12, color: '#78716c' }}>
                Affichage des 20 premiers départements sur {departements.length}. <LienAction to={`/departements?filialeId=${id}`}>Voir tous</LienAction>
              </p>
            )}
          </div>
        )}
      </CarteSection>

      <CarteSection
        titre="Services de la filiale"
        icon={Layers}
        accent={accent}
        action={(
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#78716c', fontWeight: 600 }}>{chargementOrganisation ? 'Chargement…' : `${totalServices || services.length} service(s)`}</span>
            <LienAction to={`/services?filialeId=${id}`}>Gérer</LienAction>
          </span>
        )}
      >
        {erreurOrganisation && !services.length && !departements.length && null}
        {chargementOrganisation ? (
          <div style={{ display: 'grid', placeItems: 'center', padding: 24 }}><Spinner /></div>
        ) : services.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>Aucun service rattaché à cette filiale. <LienAction to={`/services?filialeId=${id}`}>Voir / créer</LienAction></p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4' }}>
                  {['Code', 'Nom', 'Département', 'Responsable', 'Effectif', 'Statut', 'Liens'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.slice(0, 20).map((s, index) => (
                  <tr key={s.id || s.code || index} style={{ borderBottom: index < Math.min(services.length, 20) - 1 ? '1px solid #f5f5f4' : 'none' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: accent }}>{s.code || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#1c1917', fontWeight: 600 }}>{s.nom || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#57534e' }}>{s.departementNom || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#57534e' }}>{s.responsableNom || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#57534e' }}>{s.effectif ?? '—'}</td>
                    <td style={{ padding: '10px 14px' }}><Badge tone={s.actif !== false ? 'green' : 'stone'}>{s.actif !== false ? 'Actif' : 'Inactif'}</Badge></td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ display: 'inline-flex', gap: 10, flexWrap: 'wrap' }}>
                        {s.id && <LienAction to={`/agents?filialeId=${id}&serviceIds=${s.id}${s.departementId ? `&departementIds=${s.departementId}` : ''}`}>Agents</LienAction>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {services.length > 20 && (
              <p style={{ margin: '10px 14px 0', fontSize: 12, color: '#78716c' }}>
                Affichage des 20 premiers services sur {services.length}. <LienAction to={`/services?filialeId=${id}`}>Voir tous</LienAction>
              </p>
            )}
          </div>
        )}
      </CarteSection>

      <CarteSection
        titre="Agences / sous-filiales"
        icon={GitBranch}
        accent={accent}
        action={(
          <button
            type="button"
            onClick={() => setShowModalAgence(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${accent}, ${accent}CC)`, color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            <Plus size={14} /> Nouvelle agence
          </button>
        )}
      >
        <p style={{ margin: '0 0 12px', fontSize: 12, color: '#78716c' }}>
          Les agences sont modélisées comme des filiales rattachées à celle-ci (hiérarchie via la filiale parente).
        </p>
        {agences.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>Aucune agence / sous-filiale rattachée.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {agences.map((a) => (
              <Link
                key={a.id}
                to={`/filiales/${a.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, border: '1px solid #e7e5e4', textDecoration: 'none', color: 'inherit', background: '#fafaf9' }}
              >
                <span style={{ width: 34, height: 34, borderRadius: 10, background: `${a.couleur || accent}15`, color: a.couleur || accent, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={16} />
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1c1917' }}>{a.nom}</span>
                  <span style={{ display: 'block', fontSize: 12, color: '#78716c' }}>
                    {a.code ? `${a.code} · ` : ''}{[a.ville, a.pays].filter(Boolean).join(', ') || '—'}
                  </span>
                </span>
                <Badge tone={a.actif ? 'green' : 'stone'}>{a.actif ? 'Active' : 'Archivée'}</Badge>
              </Link>
            ))}
          </div>
        )}
      </CarteSection>

      <CarteSection
        titre="Agents de la filiale"
        icon={Users}
        accent={accent}
        action={(
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#78716c', fontWeight: 600 }}>{chargementAgents ? 'Chargement…' : `${totalAgents} agent(s)`}</span>
            <LienAction to={`/agents?filialeId=${id}`}>Voir tous</LienAction>
          </span>
        )}
      >
        {erreurAgents && (
          <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: '#FEF2F1', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={15} /> {erreurAgents}
          </div>
        )}
        {chargementAgents ? (
          <div style={{ display: 'grid', placeItems: 'center', padding: 24 }}><Spinner /></div>
        ) : agents.length === 0 ? (
          <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>Aucun agent rattaché à cette filiale.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4' }}>
                  {['Matricule', 'Nom', 'Fonction', 'Département', 'Service', 'Statut'].map((h) => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.map((agent, index) => (
                  <tr key={agent.id} style={{ borderBottom: index < agents.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <Link to={`/agents/${agent.id}`} style={{ color: '#007FE1', fontWeight: 700, textDecoration: 'none' }}>{agent.matricule || '—'}</Link>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#1c1917', fontWeight: 600 }}>
                      {`${agent.prenom || ''} ${agent.nom || ''}`.trim() || '—'}
                      {agent.estGerant && <span style={{ marginLeft: 6 }}><Badge tone="red">Gérant</Badge></span>}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#57534e' }}>{agent.fonction || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#57534e' }}>
                      {agent.departement?.id ? <LienAction to={`/services?filialeId=${id}&departementId=${agent.departement.id}`}>{agent.departement?.nom || '—'}</LienAction> : (agent.departement?.nom || '—')}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#57534e' }}>
                      {agent.service?.id ? <LienAction to={`/agents?filialeId=${id}&serviceIds=${agent.service.id}`}>{agent.service?.nom || '—'}</LienAction> : (agent.service?.nom || '—')}
                    </td>
                    <td style={{ padding: '10px 14px' }}><Badge tone={agent.actif ? 'green' : 'stone'}>{agent.actif ? 'Actif' : 'Sorti'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalAgents > agents.length && (
              <p style={{ margin: '10px 14px 0', fontSize: 12, color: '#78716c' }}>
                Affichage des {agents.length} premiers agents sur {totalAgents}. <LienAction to={`/agents?filialeId=${id}`}>Voir tous les agents</LienAction>
              </p>
            )}
          </div>
        )}
      </CarteSection>

      {showModal && (
        <FilialeModal
          key={filiale.id}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          filiale={filiale}
          filiales={toutesFiliales}
          onSubmit={handleSubmit}
        />
      )}

      {showModalAgence && (
        <FilialeModal
          key={`agence-${filiale.id}`}
          isOpen={showModalAgence}
          onClose={() => setShowModalAgence(false)}
          filiale={null}
          filiales={toutesFiliales}
          parentParDefaut={filiale.id}
          onSubmit={handleCreerAgence}
        />
      )}
    </div>
  )
}
