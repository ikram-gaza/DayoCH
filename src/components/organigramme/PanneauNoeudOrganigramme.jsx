import { useEffect, useMemo, useState } from 'react'
import { X, Save, History, UserRound, Building2, Network, ArrowRightLeft } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiAgents } from '../../services/agentsService'
import { departementsService } from '../../services/departementsService'
import { servicesService } from '../../services/servicesService'
import { normaliserErreur } from '../../services/apiClient'
import { useAgent, useCarriere, useReferentielsAgents } from '../../hooks/useAgents'
import { formaterDate } from '../../utils/format'
import { Badge, Spinner } from '../ui/ui'
import FriseCarriere from '../agents/FriseCarriere'
import { Link } from 'react-router-dom'

const styleInput = {
  width: '100%', boxSizing: 'border-box', height: 36, padding: '0 10px', borderRadius: 10,
  border: '1px solid #e7e5e4', background: 'white', fontSize: 13, color: '#1c1917', outline: 'none',
}

function Champ({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: '#57534e' }}>
      {label}
      {children}
    </label>
  )
}

function Entete({ titre, sousTitre, onClose, icon: Icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '18px 18px 14px', borderBottom: '1px solid #f5f5f4' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1c1917' }}>
          {Icon && <Icon size={18} style={{ color: '#007FE1', flexShrink: 0 }} />}
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{titre}</h3>
        </div>
        {sousTitre && <p style={{ margin: '4px 0 0', fontSize: 12, color: '#78716c' }}>{sousTitre}</p>}
      </div>
      <button type="button" onClick={onClose} aria-label="Fermer" style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', color: '#78716c', display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
        <X size={15} />
      </button>
    </div>
  )
}

function Message({ type, children }) {
  if (!children) return null
  const err = type === 'erreur'
  return <div style={{ padding: '9px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600, background: err ? '#FEF2F1' : '#f0fdf4', color: err ? '#b91c1c' : '#15803d', border: `1px solid ${err ? '#fecaca' : '#bbf7d0'}` }}>{children}</div>
}

export default function PanneauNoeudOrganigramme({ noeud, onClose, onChanged }) {
  if (!noeud) return null
  const niveau = noeud.niveau

  return (
    <aside style={{
      width: 380, maxWidth: '100%', background: 'white', border: '1px solid #e7e5e4', borderRadius: 16,
      boxShadow: '0 10px 30px rgba(28,25,23,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '70vh',
    }}>
      {niveau === 'AGENT' ? <PanneauAgent noeud={noeud} onClose={onClose} onChanged={onChanged} />
        : niveau === 'DEPARTEMENT' ? <PanneauDepartement noeud={noeud} onClose={onClose} onChanged={onChanged} />
        : niveau === 'SERVICE' ? <PanneauService noeud={noeud} onClose={onClose} onChanged={onChanged} />
        : <PanneauInfo noeud={noeud} onClose={onClose} />}
    </aside>
  )
}

function PanneauInfo({ noeud, onClose }) {
  return (
    <>
      <Entete titre={noeud.libelle || 'Entité'} sousTitre={noeud.sousTitre || noeud.niveau} icon={Building2} onClose={onClose} />
      <div style={{ padding: 18, fontSize: 13, color: '#57534e', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div><strong>Niveau :</strong> {noeud.niveau || '—'}</div>
        {noeud.code && <div><strong>Code :</strong> {noeud.code}</div>}
        <div><strong>Effectif :</strong> {noeud.effectif ?? '—'}</div>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#78716c' }}>Sélectionnez un agent, département ou service pour modifier le poste, déplacer l’entité ou consulter l’historique.</p>
      </div>
    </>
  )
}

function PanneauAgent({ noeud, onClose, onChanged }) {
  const agentId = noeud.agentId || noeud.id
  const agent = useAgent(agentId)
  const carriere = useCarriere(agentId)
  const refs = useReferentielsAgents()
  const queryClient = useQueryClient()
  const [onglet, setOnglet] = useState('mutation')
  const [feedback, setFeedback] = useState(null)
  const [form, setForm] = useState({ departementId: '', serviceId: '', fonction: '', motif: '', dateEffet: new Date().toISOString().slice(0, 10) })

  useEffect(() => {
    if (agent.data) {
      setForm({
        departementId: agent.data.departement?.id || '',
        serviceId: agent.data.service?.id || '',
        fonction: agent.data.fonction || '',
        motif: '',
        dateEffet: new Date().toISOString().slice(0, 10),
      })
    }
  }, [agent.data?.id])

  const services = useMemo(
    () => (refs.data?.services || []).filter((s) => !form.departementId || s.departementId === form.departementId),
    [refs.data?.services, form.departementId],
  )
  useEffect(() => {
    if (form.serviceId && !services.some((s) => s.id === form.serviceId)) setForm((f) => ({ ...f, serviceId: '' }))
  }, [services, form.serviceId])

  const mutation = useMutation({
    mutationFn: () => apiAgents.muter(agentId, {
      departementId: form.departementId || undefined,
      serviceId: form.serviceId || undefined,
      fonction: form.fonction || undefined,
      motif: form.motif.trim(),
      dateEffet: form.dateEffet || undefined,
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'agents' }),
        onChanged?.(),
      ])
      setFeedback({ type: 'succes', message: 'Mutation enregistrée.' })
      setForm((f) => ({ ...f, motif: '' }))
    },
    onError: (e) => setFeedback({ type: 'erreur', message: normaliserErreur(e).message }),
  })

  const fiche = agent.data

  return (
    <>
      <Entete
        titre={fiche ? `${fiche.prenom || ''} ${fiche.nom || ''}`.trim() || noeud.libelle : noeud.libelle}
        sousTitre={fiche?.fonction || noeud.sousTitre || 'Agent'}
        icon={UserRound}
        onClose={onClose}
      />
      <div style={{ padding: '12px 18px 0', display: 'flex', gap: 8 }}>
        {[['mutation', 'Mutation / déplacement', ArrowRightLeft], ['historique', 'Historique poste', History]].map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setOnglet(id)} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 10px', borderRadius: 10, border: onglet === id ? '1px solid #007FE1' : '1px solid #e7e5e4', background: onglet === id ? '#E5F2FD' : 'white', color: onglet === id ? '#007FE1' : '#57534e', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            <Icon size={14} /> {id === 'mutation' ? 'Mutation' : 'Historique'}
          </button>
        ))}
      </div>

      <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {agent.isLoading && <div style={{ display: 'grid', placeItems: 'center', padding: 20 }}><Spinner /></div>}
        {agent.isError && <Message type="erreur">{normaliserErreur(agent.error).message}</Message>}
        {feedback && <Message type={feedback.type}>{feedback.message}</Message>}

        {fiche && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <Badge tone={fiche.actif ? 'green' : 'stone'}>{fiche.actif ? 'Actif' : 'Sorti'}</Badge>
            {fiche.estGerant && <Badge tone="red">Gérant</Badge>}
            <Link to={`/agents/${agentId}`} style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 700, color: '#007FE1', textDecoration: 'none' }}>Fiche complète</Link>
          </div>
        )}

        {onglet === 'mutation' && (
          <>
            <p style={{ margin: 0, fontSize: 12, color: '#78716c' }}>Modifiez le poste/rattachement. Le motif est obligatoire pour tracer la mutation.</p>
            <div style={{ display: 'grid', gap: 10 }}>
              <Champ label="Département">
                <select value={form.departementId} onChange={(e) => setForm((f) => ({ ...f, departementId: e.target.value, serviceId: '' }))} style={styleInput}>
                  <option value="">Non modifié</option>
                  {(refs.data?.departements || []).map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
                </select>
              </Champ>
              <Champ label="Service">
                <select value={form.serviceId} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))} style={styleInput}>
                  <option value="">Non modifié</option>
                  {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
                </select>
              </Champ>
              <Champ label="Fonction / poste">
                <input value={form.fonction} onChange={(e) => setForm((f) => ({ ...f, fonction: e.target.value }))} style={styleInput} />
              </Champ>
              <Champ label="Motif *">
                <input value={form.motif} onChange={(e) => setForm((f) => ({ ...f, motif: e.target.value }))} placeholder="Obligatoire" style={styleInput} />
              </Champ>
              <Champ label="Date d'effet">
                <input type="date" value={form.dateEffet} onChange={(e) => setForm((f) => ({ ...f, dateEffet: e.target.value }))} style={styleInput} />
              </Champ>
            </div>
            <button
              type="button"
              onClick={() => { setFeedback(null); mutation.mutate() }}
              disabled={mutation.isPending || !form.motif.trim()}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: 'none', background: '#007FE1', color: 'white', fontSize: 13, fontWeight: 700, cursor: mutation.isPending || !form.motif.trim() ? 'not-allowed' : 'pointer', opacity: mutation.isPending || !form.motif.trim() ? 0.65 : 1 }}
            >
              <Save size={15} /> {mutation.isPending ? 'Enregistrement…' : 'Enregistrer la mutation'}
            </button>
          </>
        )}

        {onglet === 'historique' && (
          <>
            <p style={{ margin: 0, fontSize: 12, color: '#78716c' }}>Historique des postes/mutations, du plus récent au plus ancien.</p>
            {carriere.isLoading && <Spinner />}
            {carriere.isError && <Message type="erreur">{normaliserErreur(carriere.error).message}</Message>}
            {carriere.data && <FriseCarriere affectations={carriere.data} />}
          </>
        )}
      </div>
    </>
  )
}

function PanneauDepartement({ noeud, onClose, onChanged }) {
  const queryClient = useQueryClient()
  const refs = useReferentielsAgents()
  const [detail, setDetail] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [form, setForm] = useState({ nom: '', description: '', responsableId: '', actif: true })

  useEffect(() => {
    let actif = true
    setChargement(true); setErreur('')
    departementsService.detail(noeud.id)
      .then((d) => { if (!actif) return; setDetail(d); setForm({ nom: d.nom || '', description: d.description || '', responsableId: d.responsableId || '', actif: d.actif !== false }) })
      .catch((e) => { if (actif) setErreur(normaliserErreur(e).message) })
      .finally(() => { if (actif) setChargement(false) })
    return () => { actif = false }
  }, [noeud.id])

  const mutation = useMutation({
    mutationFn: () => departementsService.modifier(noeud.id, {
      nom: form.nom.trim(),
      description: form.description,
      responsableId: form.responsableId || null,
      actif: form.actif,
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'agents' && q.queryKey.includes('referentiels') }),
        onChanged?.(),
      ])
      setFeedback({ type: 'succes', message: 'Département mis à jour.' })
    },
    onError: (e) => setFeedback({ type: 'erreur', message: normaliserErreur(e).message }),
  })

  return (
    <>
      <Entete titre={detail?.nom || noeud.libelle || 'Département'} sousTitre={detail?.code ? `Code ${detail.code}` : 'Département'} icon={Building2} onClose={onClose} />
      <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {chargement && <div style={{ display: 'grid', placeItems: 'center', padding: 20 }}><Spinner /></div>}
        {erreur && <Message type="erreur">{erreur}</Message>}
        {feedback && <Message type={feedback.type}>{feedback.message}</Message>}
        {!chargement && detail && (
          <>
            <p style={{ margin: 0, fontSize: 12, color: '#78716c' }}>Modifiez les informations du département. Le rattachement hiérarchique au-dessus du département dépend du modèle backend.</p>
            <div style={{ display: 'grid', gap: 10 }}>
              <Champ label="Nom"><input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} style={styleInput} /></Champ>
              <Champ label="Description"><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ ...styleInput, height: 'auto', padding: '8px 10px', resize: 'vertical' }} /></Champ>
              <Champ label="Responsable">
                <select value={form.responsableId} onChange={(e) => setForm((f) => ({ ...f, responsableId: e.target.value }))} style={styleInput}>
                  <option value="">Aucun</option>
                  {(refs.data?.departements ? [] : []) /* keep lint calm */}
                  {(refs.data?.services ? null : null)}
                </select>
              </Champ>
            </div>
            <ResponsableSelect value={form.responsableId} onChange={(v) => setForm((f) => ({ ...f, responsableId: v }))} />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#44403c', fontWeight: 600 }}>
              <input type="checkbox" checked={form.actif} onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#007FE1' }} /> Actif
            </label>
            <button type="button" onClick={() => { setFeedback(null); mutation.mutate() }} disabled={mutation.isPending || !form.nom.trim()} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: 'none', background: '#007FE1', color: 'white', fontSize: 13, fontWeight: 700, cursor: mutation.isPending || !form.nom.trim() ? 'not-allowed' : 'pointer', opacity: mutation.isPending || !form.nom.trim() ? 0.65 : 1 }}>
              <Save size={15} /> {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        )}
      </div>
    </>
  )
}

function ResponsableSelect({ value, onChange }) {
  const [agents, setAgents] = useState([])
  useEffect(() => {
    let actif = true
    apiAgents.lister({ page: '1', limit: '200', sortOrder: 'ASC', triPar: 'nom' })
      .then((p) => { if (actif) setAgents(Array.isArray(p?.items) ? p.items : []) })
      .catch(() => {})
    return () => { actif = false }
  }, [])
  return (
    <Champ label="Responsable">
      <select value={value} onChange={(e) => onChange(e.target.value)} style={styleInput}>
        <option value="">Aucun</option>
        {agents.map((a) => <option key={a.id} value={a.id}>{`${a.prenom || ''} ${a.nom || ''}`.trim() || a.nomComplet || a.id}</option>)}
      </select>
    </Champ>
  )
}

function PanneauService({ noeud, onClose, onChanged }) {
  const queryClient = useQueryClient()
  const refs = useReferentielsAgents()
  const [detail, setDetail] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [form, setForm] = useState({ nom: '', description: '', departementId: '', responsableId: '', actif: true })

  useEffect(() => {
    let actif = true
    setChargement(true); setErreur('')
    servicesService.detail(noeud.id)
      .then((d) => { if (!actif) return; setDetail(d); setForm({ nom: d.nom || '', description: d.description || '', departementId: d.departementId || '', responsableId: d.responsableId || '', actif: d.actif !== false }) })
      .catch((e) => { if (actif) setErreur(normaliserErreur(e).message) })
      .finally(() => { if (actif) setChargement(false) })
    return () => { actif = false }
  }, [noeud.id])

  const mutation = useMutation({
    mutationFn: () => servicesService.modifier(noeud.id, {
      nom: form.nom.trim(),
      description: form.description,
      departementId: form.departementId || undefined,
      responsableId: form.responsableId || null,
      actif: form.actif,
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'agents' && q.queryKey.includes('referentiels') }),
        onChanged?.(),
      ])
      setFeedback({ type: 'succes', message: 'Service mis à jour / déplacé.' })
    },
    onError: (e) => setFeedback({ type: 'erreur', message: normaliserErreur(e).message }),
  })

  return (
    <>
      <Entete titre={detail?.nom || noeud.libelle || 'Service'} sousTitre={detail?.code ? `Code ${detail.code}` : 'Service'} icon={Network} onClose={onClose} />
      <div style={{ padding: 18, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {chargement && <div style={{ display: 'grid', placeItems: 'center', padding: 20 }}><Spinner /></div>}
        {erreur && <Message type="erreur">{erreur}</Message>}
        {feedback && <Message type={feedback.type}>{feedback.message}</Message>}
        {!chargement && detail && (
          <>
            <p style={{ margin: 0, fontSize: 12, color: '#78716c' }}>Déplacez le service en changeant son département, ou modifiez ses informations.</p>
            <div style={{ display: 'grid', gap: 10 }}>
              <Champ label="Nom"><input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} style={styleInput} /></Champ>
              <Champ label="Département (déplacement)">
                <select value={form.departementId} onChange={(e) => setForm((f) => ({ ...f, departementId: e.target.value }))} style={styleInput}>
                  <option value="">Sélectionner…</option>
                  {(refs.data?.departements || []).map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
                </select>
              </Champ>
              <Champ label="Description"><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ ...styleInput, height: 'auto', padding: '8px 10px', resize: 'vertical' }} /></Champ>
            </div>
            <ResponsableSelect value={form.responsableId} onChange={(v) => setForm((f) => ({ ...f, responsableId: v }))} />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#44403c', fontWeight: 600 }}>
              <input type="checkbox" checked={form.actif} onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#007FE1' }} /> Actif
            </label>
            <button type="button" onClick={() => { setFeedback(null); mutation.mutate() }} disabled={mutation.isPending || !form.nom.trim()} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: 'none', background: '#007FE1', color: 'white', fontSize: 13, fontWeight: 700, cursor: mutation.isPending || !form.nom.trim() ? 'not-allowed' : 'pointer', opacity: mutation.isPending || !form.nom.trim() ? 0.65 : 1 }}>
              <Save size={15} /> {mutation.isPending ? 'Enregistrement…' : 'Enregistrer / déplacer'}
            </button>
          </>
        )}
      </div>
    </>
  )
}
