import { useEffect, useMemo, useState } from 'react'
import { Building2, MapPin, Calendar, Users, BarChart3, Globe, Plus, Pencil, Archive, CheckCircle2, AlertCircle, Search, FilterX, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { filialesService, messageErreurFiliale } from '../../services/filialesService'
import FilialeModal from '../../components/filiales/FilialeModal'
import ExportButtons from '../../components/common/ExportButtons'
import { useDebounce } from '../../hooks/useDebounce'

function formatDate(dateString) {
  if (!dateString) return '—'
  try {
    return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(dateString))
  } catch {
    return dateString
  }
}

function FilialeCard({ filiale, onVoirProfil, onVoirEquipe, onStatistiques, onEditer, onArchiver }) {
  const nbCollab = filiale.nombreCollaborateurs ?? filiale.effectif ?? filiale.collaborateurs ?? null

  return (
    <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', opacity: filiale.actif === false ? 0.7 : 1, transition: 'box-shadow 0.2s, transform 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}>
      <div style={{ height: 4, background: filiale.couleur }} />
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3
              onClick={onVoirProfil}
              style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0, cursor: 'pointer' }}
              title="Voir le profil de la filiale"
            >
              {filiale.nom}
            </h3>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: `${filiale.couleur}15`, color: filiale.couleur }}>{filiale.code || '—'}</span>
              {filiale.actif === false && <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: '#f5f5f4', color: '#57534e' }}>Archivée</span>}
            </div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: `${filiale.couleur}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} style={{ color: filiale.couleur }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={13} style={{ color: filiale.couleur, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#78716c' }}>{[filiale.ville, filiale.pays].filter(Boolean).join(', ') || '—'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calendar size={13} style={{ color: filiale.couleur, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#78716c' }}>Ouverture : {formatDate(filiale.dateOuverture)}</span>
          </div>
          {(filiale.devise || filiale.timezone) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {filiale.devise && <span style={{ fontSize: 12, color: '#57534e', background: '#f5f5f4', borderRadius: 999, padding: '2px 8px', fontWeight: 600 }}>{filiale.devise}</span>}
              {filiale.timezone && <span style={{ fontSize: 12, color: '#78716c' }}>{filiale.timezone}</span>}
            </div>
          )}
          {nbCollab != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={13} style={{ color: filiale.couleur, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>{nbCollab} collaborateur{nbCollab > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, paddingTop: 14, borderTop: '1px solid #f5f5f4', flexWrap: 'wrap' }}>
          <button onClick={onVoirProfil} style={{ flex: 1, minWidth: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', fontSize: 12, fontWeight: 600, border: `1px solid ${filiale.couleur}40`, borderRadius: 8, background: `${filiale.couleur}08`, color: filiale.couleur, cursor: 'pointer' }}>
            <Eye size={13} /> Profil
          </button>
          <button onClick={onStatistiques} style={{ flex: 1, minWidth: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', fontSize: 12, fontWeight: 600, border: 'none', borderRadius: 8, background: filiale.couleur, color: 'white', cursor: 'pointer' }}>
            <BarChart3 size={13} /> Stats
          </button>
          <button onClick={onEditer} title="Modifier" style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Pencil size={14} /></button>
          {filiale.actif !== false && (
            <button onClick={onArchiver} title="Archiver" style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #fecaca', background: '#FEF2F1', color: '#b91c1c', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Archive size={14} /></button>
          )}
        </div>
      </div>
    </div>
  )
}

const styleInput = {
  width: '100%', boxSizing: 'border-box',
  height: 36, padding: '0 10px', borderRadius: 10,
  border: '1px solid #e7e5e4', background: 'white',
  fontSize: 13, color: '#1c1917', outline: 'none',
}

function Champ({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: '#57534e' }}>
      {label}
      {children}
    </label>
  )
}

function FilialesPage() {
  const navigate = useNavigate()
  const [filiales, setFiliales] = useState([])
  const [optionsFiliales, setOptionsFiliales] = useState([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [toast, setToast] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [edition, setEdition] = useState(null)

  const [recherche, setRecherche] = useState('')
  const rechercheDifferee = useDebounce(recherche, 350)
  const [pays, setPays] = useState('')
  const [devise, setDevise] = useState('')
  const [actif, setActif] = useState('')
  const [parentId, setParentId] = useState('')
  const [racinesSeulement, setRacinesSeulement] = useState('')
  const [sortOrder, setSortOrder] = useState('ASC')

  const paysOptions = useMemo(
    () => [...new Set(optionsFiliales.map((f) => f.pays).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')),
    [optionsFiliales],
  )
  const deviseOptions = useMemo(
    () => [...new Set(optionsFiliales.map((f) => f.devise).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')),
    [optionsFiliales],
  )

  const filtres = useMemo(() => ({
    recherche: rechercheDifferee || undefined,
    pays: pays || undefined,
    devise: devise || undefined,
    actif: actif || undefined,
    parentId: parentId || undefined,
    racinesSeulement: racinesSeulement || undefined,
    sortOrder: sortOrder || 'ASC',
  }), [rechercheDifferee, pays, devise, actif, parentId, racinesSeulement, sortOrder])

  const charger = async () => {
    setChargement(true)
    setErreur('')
    try {
      const liste = await filialesService.lister(filtres)
      setFiliales(liste)
      if (!optionsFiliales.length) setOptionsFiliales(liste)
    } catch (e) {
      setErreur(messageErreurFiliale(e))
    } finally {
      setChargement(false)
    }
  }

  const chargerOptions = async () => {
    try {
      const toutes = await filialesService.lister({ sortOrder: 'ASC' })
      setOptionsFiliales(toutes)
    } catch {
      /* options non bloquantes */
    }
  }

  useEffect(() => { charger() }, [filtres]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { chargerOptions() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const afficherToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const ouvrirEdition = async (filiale) => {
    try {
      const detail = await filialesService.detail(filiale.id)
      setEdition(detail)
      setShowModal(true)
    } catch (e) {
      afficherToast(`Erreur : ${messageErreurFiliale(e)}`)
    }
  }

  const actives = useMemo(() => filiales.filter((f) => f.actif !== false), [filiales])
  const totalCollabs = filiales.reduce((acc, f) => acc + (Number(f.nombreCollaborateurs ?? f.effectif ?? f.collaborateurs) || 0), 0)
  const nbFiltres = [rechercheDifferee, pays, devise, actif, parentId, racinesSeulement].filter(Boolean).length + (sortOrder !== 'ASC' ? 1 : 0)

  const reinitialiser = () => {
    setRecherche('')
    setPays('')
    setDevise('')
    setActif('')
    setParentId('')
    setRacinesSeulement('')
    setSortOrder('ASC')
  }

  const handleSubmit = async (data) => {
    try {
      if (edition) {
        await filialesService.modifier(edition.id, data)
        afficherToast('Filiale mise à jour.')
      } else {
        await filialesService.creer(data)
        afficherToast('Filiale créée.')
      }
      await charger()
      await chargerOptions()
      return true
    } catch (e) {
      afficherToast(`Erreur : ${messageErreurFiliale(e)}`)
      return false
    }
  }

  const handleArchiver = async (f) => {
    if (!window.confirm(`Archiver la filiale ${f.nom} ?`)) return
    try {
      await filialesService.archiver(f.id)
      await charger()
      await chargerOptions()
      afficherToast('Filiale archivée.')
    } catch (e) {
      afficherToast(`Erreur : ${messageErreurFiliale(e)}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, background: '#1c1917', color: 'white', padding: '12px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
          <span>{toast}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Building2 size={24} style={{ color: '#007FE1', flexShrink: 0 }} />
            Filiales du Groupe Dayo
          </h1>
          <p style={{ fontSize: 13, color: '#a8a29e', marginTop: 4 }}>{actives.length} filiale{actives.length > 1 ? 's' : ''} active{actives.length > 1 ? 's' : ''} · {filiales.length} affichée{filiales.length > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <ExportButtons onExport={(format) => filialesService.exporter(filtres, format)} formats={['xlsx', 'pdf', 'csv']} />
          <button onClick={() => { setEdition(null); setShowModal(true) }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #007FE1, #0066C0)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)' }}>
            <Plus size={16} /> Nouvelle filiale
          </button>
        </div>
      </div>

      {erreur && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEF2F1', border: '1px solid #fecaca', borderRadius: 12, padding: '10px 14px', color: '#b91c1c', fontSize: 13 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{erreur}</span>
          <button type="button" onClick={charger} style={{ border: '1px solid #fecaca', background: 'white', color: '#b91c1c', padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
        </div>
      )}

      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, background: 'linear-gradient(135deg, #00509A 0%, #007FE1 55%, #0066C0 100%)', padding: 24, color: 'white', boxShadow: '0 8px 32px rgba(0,127,225,0.2)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Globe size={18} style={{ color: 'rgba(147,197,253,0.9)' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(147,197,253,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Présence géographique</span>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(219,234,254,0.85)', lineHeight: 1.6, maxWidth: 440, margin: 0 }}>Gestion, filtrage et export des filiales du Groupe Dayo.</p>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'center', background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 20px', border: '1px solid rgba(255,255,255,0.2)' }}>
            <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1, margin: 0 }}>{totalCollabs || filiales.length}</p>
            <p style={{ fontSize: 11, color: 'rgba(219,234,254,0.75)', marginTop: 4, fontWeight: 600 }}>{totalCollabs ? 'collaborateurs' : 'filiales'}</p>
          </div>
        </div>
      </div>

      <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: '#57534e' }}>
            Recherche
            <span style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
              <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Nom, code, ville…" style={{ ...styleInput, paddingLeft: 32 }} />
            </span>
          </label>
          <Champ label="Pays">
            <select value={pays} onChange={(e) => setPays(e.target.value)} style={styleInput}>
              <option value="">Tous les pays</option>
              {paysOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Champ>
          <Champ label="Devise">
            <select value={devise} onChange={(e) => setDevise(e.target.value)} style={styleInput}>
              <option value="">Toutes les devises</option>
              {deviseOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Champ>
          <Champ label="Statut">
            <select value={actif} onChange={(e) => setActif(e.target.value)} style={styleInput}>
              <option value="">Toutes</option>
              <option value="true">Actives</option>
              <option value="false">Archivées</option>
            </select>
          </Champ>
          <Champ label="Filiale parente">
            <select value={parentId} onChange={(e) => setParentId(e.target.value)} style={styleInput}>
              <option value="">Toutes</option>
              {optionsFiliales.map((f) => <option key={f.id} value={f.id}>{f.nom}</option>)}
            </select>
          </Champ>
          <Champ label="Périmètre">
            <select value={racinesSeulement} onChange={(e) => setRacinesSeulement(e.target.value)} style={styleInput}>
              <option value="">Toutes</option>
              <option value="true">Racines seulement</option>
              <option value="false">Avec parent</option>
            </select>
          </Champ>
          <Champ label="Tri">
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={styleInput}>
              <option value="ASC">Croissant (A→Z)</option>
              <option value="DESC">Décroissant (Z→A)</option>
            </select>
          </Champ>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#78716c' }}>{nbFiltres > 0 ? `${nbFiltres} filtre(s) actif(s)` : 'Aucun filtre actif'}</span>
          <button type="button" disabled={nbFiltres === 0} onClick={reinitialiser} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 12, fontWeight: 600, cursor: nbFiltres === 0 ? 'not-allowed' : 'pointer', opacity: nbFiltres === 0 ? 0.55 : 1 }}>
            <FilterX size={14} /> Tout effacer
          </button>
        </div>
      </section>

      {chargement ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', padding: 28, textAlign: 'center', color: '#78716c', fontSize: 13 }}>Chargement des filiales…</div>
      ) : filiales.length === 0 ? (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', padding: 28, textAlign: 'center', color: '#78716c', fontSize: 13 }}>Aucune filiale{nbFiltres ? ' pour ces filtres' : ''}.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {filiales.map(f => (
            <FilialeCard
              key={f.id}
              filiale={f}
              onVoirProfil={() => navigate(`/filiales/${f.id}`)}
              onVoirEquipe={() => navigate('/organigramme')}
              onStatistiques={() => navigate('/pilotage')}
              onEditer={() => ouvrirEdition(f)}
              onArchiver={() => handleArchiver(f)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <FilialeModal
          key={edition?.id || 'nouvelle'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          filiale={edition}
          filiales={optionsFiliales}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

export default FilialesPage
