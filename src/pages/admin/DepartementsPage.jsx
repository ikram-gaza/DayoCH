import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Building2, Plus, Search, FilterX, Pencil, Trash2, CheckCircle2, AlertCircle, Users, Layers } from 'lucide-react'
import { departementsService, messageErreurDepartement } from '../../services/departementsService'
import { filialesService } from '../../services/filialesService'
import { apiAgents } from '../../services/agentsService'
import DepartementModal from '../../components/departements/DepartementModal'
import ExportButtons from '../../components/common/ExportButtons'
import { useDebounce } from '../../hooks/useDebounce'

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

function BadgeStatut({ actif }) {
  const ok = actif !== false
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 700,
      background: ok ? '#dcfce7' : '#f5f5f4', color: ok ? '#15803d' : '#57534e',
    }}>
      {ok ? 'Actif' : 'Inactif'}
    </span>
  )
}

export default function DepartementsPage() {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const [pageData, setPageData] = useState({ items: [], total: 0, page: 1, pages: 1, limit: 20 })
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [toast, setToast] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [edition, setEdition] = useState(null)
  const [filiales, setFiliales] = useState([])
  const [agents, setAgents] = useState([])

  const invaliderReferentiels = () => queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'agents' && q.queryKey.includes('referentiels') })

  const [recherche, setRecherche] = useState('')
  const rechercheDifferee = useDebounce(recherche, 350)
  const [filialeId, setFilialeId] = useState(() => searchParams.get('filialeId') || '')
  const [actif, setActif] = useState('')
  const [sansResponsable, setSansResponsable] = useState('')
  const [avecEffectifs, setAvecEffectifs] = useState('true')
  const [sortOrder, setSortOrder] = useState('ASC')
  const [page, setPage] = useState(1)

  const filtres = useMemo(() => ({
    recherche: rechercheDifferee || undefined,
    filialeId: filialeId || undefined,
    actif: actif || undefined,
    sansResponsable: sansResponsable || undefined,
    avecEffectifs: avecEffectifs || undefined,
    sortOrder: sortOrder || 'ASC',
    page: String(page),
    limit: '20',
  }), [rechercheDifferee, filialeId, actif, sansResponsable, avecEffectifs, sortOrder, page])

  useEffect(() => { setPage(1) }, [rechercheDifferee, filialeId, actif, sansResponsable, avecEffectifs, sortOrder])

  const charger = async () => {
    setChargement(true)
    setErreur('')
    try {
      const data = await departementsService.lister(filtres)
      let items = data.items || []
      if (filialeId) items = items.filter((d) => String(d.filialeId || d.filiale?.id || '') === String(filialeId))
      setPageData({ ...data, items, total: filialeId ? items.length : data.total })
    } catch (e) {
      setErreur(messageErreurDepartement(e))
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { charger() }, [filtres]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let actifReq = true
    ;(async () => {
      try {
        const [fils, ag] = await Promise.all([
          filialesService.lister({ sortOrder: 'ASC' }).catch(() => []),
          apiAgents.lister({ page: '1', limit: '200', sortOrder: 'ASC', triPar: 'nom' }).catch(() => ({ items: [] })),
        ])
        if (!actifReq) return
        setFiliales(Array.isArray(fils) ? fils : [])
        setAgents(Array.isArray(ag?.items) ? ag.items : (Array.isArray(ag) ? ag : []))
      } catch {
        /* options non bloquantes */
      }
    })()
    return () => { actifReq = false }
  }, [])

  const afficherToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const nbFiltres = [rechercheDifferee, filialeId, actif, sansResponsable].filter(Boolean).length + (avecEffectifs !== 'true' ? 1 : 0) + (sortOrder !== 'ASC' ? 1 : 0)

  const reinitialiser = () => {
    setRecherche('')
    setFilialeId('')
    setActif('')
    setSansResponsable('')
    setAvecEffectifs('true')
    setSortOrder('ASC')
    setPage(1)
  }

  const ouvrirEdition = async (dep) => {
    try {
      const detail = await departementsService.detail(dep.id)
      setEdition(detail)
      setShowModal(true)
    } catch (e) {
      afficherToast(`Erreur : ${messageErreurDepartement(e)}`)
    }
  }

  const handleSubmit = async (data) => {
    try {
      if (edition) {
        await departementsService.modifier(edition.id, data)
        afficherToast('Département mis à jour.')
      } else {
        await departementsService.creer(data)
        afficherToast('Département créé.')
      }
      await charger()
      await invaliderReferentiels()
      return true
    } catch (e) {
      afficherToast(`Erreur : ${messageErreurDepartement(e)}`)
      return false
    }
  }

  const handleSupprimer = async (dep) => {
    if (!window.confirm(`Supprimer le département « ${dep.nom} » ?`)) return
    try {
      await departementsService.supprimer(dep.id)
      await charger()
      await invaliderReferentiels()
      afficherToast('Département supprimé.')
    } catch (e) {
      afficherToast(`Erreur : ${messageErreurDepartement(e)}`)
    }
  }

  const items = pageData.items || []

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
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <Building2 size={24} style={{ color: '#007FE1', flexShrink: 0 }} />
            Départements
          </h1>
          <p style={{ fontSize: 13, color: '#a8a29e', marginTop: 4 }}>{pageData.total ?? items.length} département(s)</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <ExportButtons onExport={(format) => departementsService.exporter(filtres, format)} formats={['xlsx', 'pdf', 'csv']} />
          <button onClick={() => { setEdition(null); setShowModal(true) }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #007FE1, #0066C0)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)' }}>
            <Plus size={16} /> Nouveau département
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

      <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, alignItems: 'end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: '#57534e' }}>
            Recherche
            <span style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
              <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Nom, code…" style={{ ...styleInput, paddingLeft: 32 }} />
            </span>
          </label>
          <Champ label="Filiale">
            <select value={filialeId} onChange={(e) => setFilialeId(e.target.value)} style={styleInput}>
              <option value="">Toutes les filiales</option>
              {filiales.map((f) => <option key={f.id} value={f.id}>{f.nom}{f.code ? ` (${f.code})` : ''}</option>)}
            </select>
          </Champ>
          <Champ label="Statut">
            <select value={actif} onChange={(e) => setActif(e.target.value)} style={styleInput}>
              <option value="">Tous</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </select>
          </Champ>
          <Champ label="Responsable">
            <select value={sansResponsable} onChange={(e) => setSansResponsable(e.target.value)} style={styleInput}>
              <option value="">Tous</option>
              <option value="true">Sans responsable</option>
              <option value="false">Avec responsable</option>
            </select>
          </Champ>
          <Champ label="Effectifs">
            <select value={avecEffectifs} onChange={(e) => setAvecEffectifs(e.target.value)} style={styleInput}>
              <option value="true">Afficher les effectifs</option>
              <option value="false">Ne pas calculer</option>
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

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {chargement ? (
          <div style={{ padding: 28, textAlign: 'center', color: '#78716c', fontSize: 13 }}>Chargement des départements…</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: '#78716c', fontSize: 13 }}>Aucun département{nbFiltres ? ' pour ces filtres' : ''}.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4' }}>
                  {['Code', 'Nom', 'Description', 'Responsable', 'Filiale', 'Effectif', 'Statut', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((dep, index) => (
                  <tr key={dep.id || dep.code || index} style={{ borderBottom: index < items.length - 1 ? '1px solid #f5f5f4' : 'none' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#007FE1', whiteSpace: 'nowrap' }}>{dep.code || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#1c1917', fontWeight: 600 }}>{dep.nom || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#57534e', maxWidth: 260 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{dep.description || '—'}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#57534e' }}>{dep.responsableNom || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#57534e' }}>{dep.filialeNom || '—'}</td>
                    <td style={{ padding: '12px 16px', color: '#57534e' }}>
                      {dep.id ? (
                        <Link to={`/agents?departementIds=${dep.id}`} style={{ color: '#007FE1', fontWeight: 700, textDecoration: 'none' }} title="Voir les agents du département">
                          {dep.effectif ?? '—'}
                        </Link>
                      ) : (dep.effectif ?? '—')}
                    </td>
                    <td style={{ padding: '12px 16px' }}><BadgeStatut actif={dep.actif} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {dep.id && (
                          <>
                            <Link
                              to={`/agents?departementIds=${dep.id}`}
                              title="Voir les agents"
                              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0369a1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            >
                              <Users size={14} />
                            </Link>
                            <Link
                              to={`/services?departementId=${dep.id}`}
                              title="Voir les services"
                              style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #ddd6fe', background: '#f5f3ff', color: '#6d28d9', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            >
                              <Layers size={14} />
                            </Link>
                          </>
                        )}
                        <button type="button" title="Modifier" onClick={() => ouvrirEdition(dep)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Pencil size={14} />
                        </button>
                        <button type="button" title="Supprimer" onClick={() => handleSupprimer(dep)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca', background: '#FEF2F1', color: '#b91c1c', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pageData.pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>{pageData.total} département(s) · page {pageData.page} sur {pageData.pages}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <BoutonPage disabled={pageData.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Précédent</BoutonPage>
            <BoutonPage disabled={pageData.page >= pageData.pages} onClick={() => setPage((p) => p + 1)}>Suivant</BoutonPage>
          </div>
        </div>
      )}

      {showModal && (
        <DepartementModal
          key={edition?.id || 'nouveau'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          departement={edition}
          agents={agents}
          filiales={filiales}
          onSubmit={handleSubmit}
        />
      )}
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
