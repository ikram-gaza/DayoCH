import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Crown, Image as ImageIcon, Pencil, PenLine, Save, UserMinus, UserRound, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAgent, useCarriere, useEnvoyerPhoto, useInvalidationAgent, useReferentielsAgents } from '../../hooks/useAgents'
import { useImageProtegee } from '../../hooks/useImageProtegee'
import { apiAgents } from '../../services/agentsService'
import { normaliserErreur } from '../../services/apiClient'
import { formaterDate, formaterDateHeure } from '../../utils/format'
import { Badge, Spinner } from '../../components/ui/ui'
import ExportButtons from '../../components/common/ExportButtons'
import PhotoAgent from '../../components/agents/PhotoAgent'
import PaveSignature from '../../components/agents/PaveSignature'
import FriseCarriere from '../../components/agents/FriseCarriere'

export default function AgentDetailPage() {
  const { id } = useParams()
  const { peut } = useAuth()
  const agent = useAgent(id)
  const carriere = useCarriere(id)
  const referentiels = useReferentielsAgents()
  const invalider = useInvalidationAgent(id)
  const [signatureOuverte, setSignatureOuverte] = useState(false)
  const [editionOuverte, setEditionOuverte] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const peutModifier = peut('agent:update')

  const notifier = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 3500)
  }

  if (agent.isLoading) {
    return <div style={{ display: 'grid', placeItems: 'center', padding: 48 }}><Spinner /></div>
  }

  if (agent.isError || !agent.data) {
    return (
      <div style={{ background: '#FEF2F1', border: '1px solid #fecaca', borderRadius: 14, padding: 16, color: '#b91c1c', fontSize: 13 }}>
        <p style={{ margin: 0, fontWeight: 700 }}>Agent introuvable</p>
        <p style={{ margin: '4px 0 10px' }}>{normaliserErreur(agent.error).message}</p>
        <Link to="/agents" style={{ color: '#007FE1', fontWeight: 700 }}>Retour à la liste</Link>
      </div>
    )
  }

  const fiche = agent.data

  const handleDesignerGerant = async () => {
    if (!window.confirm(`Désigner ${fiche.prenom || ''} ${fiche.nom || ''} comme gérant ? L’ancien gérant perdra le pouvoir de validation.`)) return
    try {
      await apiAgents.designerGerant(id)
      await invalider()
      notifier('succes', 'Agent désigné comme gérant.')
    } catch (e) {
      notifier('erreur', normaliserErreur(e).message)
    }
  }

  const handleSortie = async () => {
    if (!window.confirm(`Enregistrer la sortie d’effectif de ${fiche.prenom || ''} ${fiche.nom || ''} ? L’agent et son compte seront désactivés.`)) return
    try {
      await apiAgents.sortie(id)
      await invalider()
      notifier('succes', 'Sortie d’effectif enregistrée.')
    } catch (e) {
      notifier('erreur', normaliserErreur(e).message)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {feedback && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100, background: '#1c1917', color: 'white', padding: '12px 20px', borderRadius: 14, fontSize: 13, fontWeight: 600, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: 420 }}>
          {feedback.type === 'erreur' ? <AlertCircle size={16} style={{ color: '#f87171', flexShrink: 0 }} /> : <CheckCircle2 size={16} style={{ color: '#22c55e', flexShrink: 0 }} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserRound size={24} style={{ color: '#007FE1' }} />
            {fiche.prenom} {fiche.nom}
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span>{fiche.matricule} · {fiche.fonction || 'Fonction non précisée'}</span>
            <Badge tone={fiche.actif ? 'green' : 'stone'}>{fiche.actif ? 'Actif' : 'Sorti'}</Badge>
            {fiche.estGerant && <Badge tone="red">Gérant</Badge>}
            {!fiche.email && <Badge tone="stone">Sans email</Badge>}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Link
            to="/agents"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            <ArrowLeft size={15} /> Retour
          </Link>
          {peutModifier && (
            <>
              <button type="button" onClick={() => setEditionOuverte((o) => !o)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: '1px solid #e7e5e4', background: editionOuverte ? '#f5f5f4' : 'white', color: '#57534e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {editionOuverte ? <X size={15} /> : <Pencil size={15} />} {editionOuverte ? 'Fermer' : 'Modifier'}
              </button>
              <button type="button" onClick={handleDesignerGerant} disabled={fiche.estGerant} title={fiche.estGerant ? 'Déjà gérant' : ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: '1px solid #fde68a', background: '#fffbeb', color: '#92400e', fontSize: 13, fontWeight: 600, cursor: fiche.estGerant ? 'not-allowed' : 'pointer', opacity: fiche.estGerant ? 0.6 : 1 }}>
                <Crown size={15} /> Désigner gérant
              </button>
              <button type="button" onClick={handleSortie} disabled={!fiche.actif} title={!fiche.actif ? 'Agent déjà sorti' : ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: '1px solid #fecaca', background: '#FEF2F1', color: '#b91c1c', fontSize: 13, fontWeight: 600, cursor: !fiche.actif ? 'not-allowed' : 'pointer', opacity: !fiche.actif ? 0.6 : 1 }}>
                <UserMinus size={15} /> Sortie d’effectif
              </button>
            </>
          )}
        </div>
      </div>

      {editionOuverte && peutModifier && (
        <ModifierAgent
          key={fiche.id + (fiche.updatedAt || '')}
          agent={fiche}
          referentiels={referentiels.data || { departements: [], services: [] }}
          onFermer={() => setEditionOuverte(false)}
          onSucces={async () => { await invalider(); setEditionOuverte(false); notifier('succes', 'Informations mises à jour.') }}
          onErreur={(msg) => notifier('erreur', msg)}
        />
      )}

      <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <PhotoAgent
            agentId={fiche.id}
            prenom={fiche.prenom}
            nom={fiche.nom}
            aPhoto={Boolean(fiche.photoFichier || fiche.photoUrl)}
            photoUrl={fiche.photoUrl}
            taille={96}
          />
          {peutModifier && <TeleverserPhoto agentId={fiche.id} majAt={fiche.photoMajAt} />}
        </div>

        <dl style={{ flex: 1, minWidth: 260, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, margin: 0 }}>
          <Donnee
            libelle="Département"
            valeur={fiche.departement?.id
              ? <Link to={`/services?departementId=${fiche.departement.id}`} style={{ color: '#007FE1', fontWeight: 600, textDecoration: 'none' }}>{fiche.departement.nom || '—'}</Link>
              : fiche.departement?.nom}
          />
          <Donnee
            libelle="Service"
            valeur={fiche.service?.id
              ? <Link to={`/agents?serviceIds=${fiche.service.id}${fiche.departement?.id ? `&departementIds=${fiche.departement.id}` : ''}`} style={{ color: '#007FE1', fontWeight: 600, textDecoration: 'none' }}>{fiche.service.nom || '—'}</Link>
              : fiche.service?.nom}
          />
          <Donnee libelle="Email" valeur={fiche.email} />
          <Donnee libelle="Téléphone" valeur={fiche.telephone} />
          <Donnee libelle="Date d'embauche" valeur={formaterDate(fiche.dateEmbauche)} />
          <Donnee libelle="Date de sortie" valeur={formaterDate(fiche.dateSortie)} />
          <Donnee libelle="Compte de connexion" valeur={fiche.userId ? 'Oui' : 'Non (connexion impossible)'} />
          <Donnee libelle="Filiale" valeur={fiche.filiale?.nom || fiche.filiale} />
        </dl>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, alignItems: 'start' }}>
        <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c1917' }}>Carrière</h2>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: '#78716c' }}>Historique des postes, du plus récent au plus ancien.</p>
            </div>
            <ExportButtons formats={['xlsx', 'pdf']} onExport={(format) => apiAgents.exporterCarriere(fiche.id, format)} />
          </div>
          {carriere.isLoading && <Spinner />}
          {carriere.isError && <p style={{ color: '#b91c1c', fontSize: 13 }}>{normaliserErreur(carriere.error).message}</p>}
          {carriere.data && <FriseCarriere affectations={carriere.data} />}
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c1917' }}>Signature</h2>
              {peutModifier && (
                <button
                  type="button"
                  onClick={() => setSignatureOuverte((ouverte) => !ouverte)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  <PenLine size={14} />
                  {signatureOuverte ? 'Fermer' : fiche.signatureFichier || fiche.signatureUrl ? 'Remplacer' : 'Signer'}
                </button>
              )}
            </div>
            {fiche.signatureFichier || fiche.signatureUrl ? (
              <SignatureEnregistree agent={fiche} />
            ) : (
              <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>Aucune signature enregistrée.</p>
            )}
            {signatureOuverte && (
              <div style={{ marginTop: 14 }}>
                <PaveSignature agentId={fiche.id} surEnregistrement={() => setSignatureOuverte(false)} />
              </div>
            )}
          </section>

          {peutModifier && <MutationAgent agent={fiche} />}
        </div>
      </div>
    </div>
  )
}

function Donnee({ libelle, valeur }) {
  return (
    <div>
      <dt style={{ fontSize: 11, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{libelle}</dt>
      <dd style={{ margin: '4px 0 0', fontSize: 13, color: '#1c1917' }}>{valeur || '—'}</dd>
    </div>
  )
}

function SignatureEnregistree({ agent }) {
  const { url } = useImageProtegee(
    !agent.signatureUrl && agent.signatureFichier ? `/organisation/agents/${agent.id}/signature` : null,
  )
  const source = agent.signatureUrl || url

  if (!source) return <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>Signature illisible.</p>

  return (
    <figure style={{ margin: 0 }}>
      <img src={source} alt="Signature de l'agent" style={{ maxWidth: 320, borderRadius: 8, border: '1px solid #e7e5e4', background: 'white' }} />
      {agent.signatureMajAt && (
        <figcaption style={{ marginTop: 6, fontSize: 11, color: '#a8a29e' }}>
          Enregistrée le {formaterDateHeure(agent.signatureMajAt)}
        </figcaption>
      )}
    </figure>
  )
}

function TeleverserPhoto({ agentId, majAt }) {
  const champ = useRef(null)
  const [erreur, setErreur] = useState(null)
  const envoi = useEnvoyerPhoto(agentId)

  const surChoix = async (evenement) => {
    const fichier = evenement.target.files?.[0]
    if (!fichier) return
    setErreur(null)
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(fichier.type)) {
      setErreur('Formats acceptés : JPEG, PNG ou WebP.')
      return
    }
    if (fichier.size > 2 * 1024 * 1024) {
      setErreur('Photo trop lourde (2 Mio maximum).')
      return
    }
    try {
      await envoi.mutateAsync(fichier)
    } catch (echec) {
      setErreur(normaliserErreur(echec).message)
    } finally {
      if (champ.current) champ.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center' }}>
      <input ref={champ} type="file" accept="image/jpeg,image/png,image/webp" onChange={surChoix} hidden />
      <button
        type="button"
        onClick={() => champ.current?.click()}
        disabled={envoi.isPending}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 12, fontWeight: 600, cursor: envoi.isPending ? 'not-allowed' : 'pointer' }}
      >
        {envoi.isPending ? <Spinner className="h-3.5 w-3.5" /> : <ImageIcon size={14} />}
        Changer la photo
      </button>
      <span style={{ fontSize: 11, color: '#a8a29e', textAlign: 'center' }}>
        JPEG, PNG ou WebP, 2 Mio maximum.
        {majAt ? ` Mise à jour le ${formaterDateHeure(majAt)}.` : ''}
      </span>
      {erreur && <span style={{ fontSize: 11, color: '#b91c1c' }}>{erreur}</span>}
    </div>
  )
}

function valeurDate(d) {
  if (!d) return ''
  const s = String(d)
  return s.length >= 10 ? s.slice(0, 10) : s
}

function ModifierAgent({ agent, referentiels, onFermer, onSucces, onErreur }) {
  const [form, setForm] = useState({
    nom: agent.nom || '',
    prenom: agent.prenom || '',
    email: agent.email || '',
    telephone: agent.telephone || '',
    fonction: agent.fonction || '',
    dateEmbauche: valeurDate(agent.dateEmbauche),
    dateSortie: valeurDate(agent.dateSortie),
    departementId: agent.departement?.id || '',
    serviceId: agent.service?.id || '',
    estGerant: Boolean(agent.estGerant),
    actif: agent.actif !== false,
  })
  const [envoi, setEnvoi] = useState(false)

  const services = useMemo(
    () => (referentiels.services || []).filter((s) => !form.departementId || s.departementId === form.departementId),
    [referentiels.services, form.departementId],
  )

  useEffect(() => {
    if (form.serviceId && !services.some((s) => s.id === form.serviceId)) {
      setForm((f) => ({ ...f, serviceId: '' }))
    }
  }, [services, form.serviceId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom.trim() || !form.prenom.trim()) {
      onErreur('Nom et prénom sont obligatoires.')
      return
    }
    const corps = {
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      email: form.email.trim() || undefined,
      telephone: form.telephone.trim() || undefined,
      fonction: form.fonction.trim() || undefined,
      dateEmbauche: form.dateEmbauche || undefined,
      dateSortie: form.dateSortie || null,
      departementId: form.departementId || undefined,
      serviceId: form.serviceId || undefined,
      estGerant: form.estGerant,
      actif: form.actif,
    }
    // éviter d'envoyer undefined inutiles sauf champs nullable explicites
    Object.keys(corps).forEach((k) => { if (corps[k] === undefined) delete corps[k] })
    setEnvoi(true)
    try {
      await apiAgents.modifier(agent.id, corps)
      await onSucces()
    } catch (err) {
      onErreur(normaliserErreur(err).message)
    } finally {
      setEnvoi(false)
    }
  }

  return (
    <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c1917' }}>Modifier les informations</h2>
          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#78716c' }}>Mise à jour de la fiche agent (hors mutation tracée).</p>
        </div>
        <button type="button" onClick={onFermer} style={{ width: 32, height: 32, borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' }} aria-label="Fermer"><X size={15} /></button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <Champ label="Prénom"><input value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} style={styleSelect} /></Champ>
          <Champ label="Nom"><input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} style={styleSelect} /></Champ>
          <Champ label="E-mail"><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={styleSelect} /></Champ>
          <Champ label="Téléphone"><input value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))} style={styleSelect} /></Champ>
          <Champ label="Fonction"><input value={form.fonction} onChange={(e) => setForm((f) => ({ ...f, fonction: e.target.value }))} style={styleSelect} /></Champ>
          <Champ label="Date d'embauche"><input type="date" value={form.dateEmbauche} onChange={(e) => setForm((f) => ({ ...f, dateEmbauche: e.target.value }))} style={styleSelect} /></Champ>
          <Champ label="Date de sortie"><input type="date" value={form.dateSortie} onChange={(e) => setForm((f) => ({ ...f, dateSortie: e.target.value }))} style={styleSelect} /></Champ>
          <Champ label="Département">
            <select value={form.departementId} onChange={(e) => setForm((f) => ({ ...f, departementId: e.target.value, serviceId: '' }))} style={styleSelect}>
              <option value="">Aucun</option>
              {(referentiels.departements || []).map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
          </Champ>
          <Champ label="Service">
            <select value={form.serviceId} onChange={(e) => setForm((f) => ({ ...f, serviceId: e.target.value }))} style={styleSelect}>
              <option value="">Aucun</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
            </select>
          </Champ>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#44403c', fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.estGerant} onChange={(e) => setForm((f) => ({ ...f, estGerant: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#007FE1' }} /> Gérant
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#44403c', fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.actif} onChange={(e) => setForm((f) => ({ ...f, actif: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#007FE1' }} /> Actif
          </label>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onFermer} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
          <button type="submit" disabled={envoi} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 10, border: 'none', background: envoi ? '#93c5fd' : '#007FE1', color: 'white', fontSize: 13, fontWeight: 700, cursor: envoi ? 'not-allowed' : 'pointer' }}>
            <Save size={15} /> {envoi ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </section>
  )
}

function MutationAgent({ agent }) {
  const referentiels = useReferentielsAgents()
  const invalider = useInvalidationAgent(agent.id)
  const [formulaire, setFormulaire] = useState({
    departementId: agent.departement?.id || '',
    serviceId: agent.service?.id || '',
    fonction: agent.fonction || '',
    motif: '',
    dateEffet: DATE_AUJOURDHUI,
  })
  const [erreur, setErreur] = useState(null)
  const [succes, setSucces] = useState(false)

  const mutation = useMutation({
    mutationFn: () => apiAgents.muter(agent.id, formulaire),
    onSuccess: async () => {
      await invalider()
      setSucces(true)
      setErreur(null)
    },
    onError: (echec) => setErreur(normaliserErreur(echec).message),
  })

  const services = (referentiels.data?.services || []).filter(
    (service) => !formulaire.departementId || service.departementId === formulaire.departementId,
  )

  return (
    <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1c1917' }}>Mutation</h2>
      <p style={{ margin: '2px 0 14px', fontSize: 12, color: '#78716c' }}>Modifier le rattachement de l'agent et enregistrer le motif.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <Champ label="Département">
          <select value={formulaire.departementId} onChange={(e) => setFormulaire((a) => ({ ...a, departementId: e.target.value, serviceId: '' }))} style={styleSelect}>
            <option value="">Non modifié</option>
            {(referentiels.data?.departements || []).map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </select>
        </Champ>
        <Champ label="Service">
          <select value={formulaire.serviceId} onChange={(e) => setFormulaire((a) => ({ ...a, serviceId: e.target.value }))} style={styleSelect}>
            <option value="">Non modifié</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        </Champ>
        <Champ label="Fonction">
          <input value={formulaire.fonction} onChange={(e) => setFormulaire((a) => ({ ...a, fonction: e.target.value }))} style={styleSelect} />
        </Champ>
        <Champ label="Motif">
          <input value={formulaire.motif} onChange={(e) => setFormulaire((a) => ({ ...a, motif: e.target.value }))} placeholder="Obligatoire" style={styleSelect} />
        </Champ>
        <Champ label="Date d'effet">
          <input type="date" value={formulaire.dateEffet} onChange={(e) => setFormulaire((a) => ({ ...a, dateEffet: e.target.value }))} style={styleSelect} />
        </Champ>
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => { setSucces(false); mutation.mutate() }}
          disabled={mutation.isPending || !formulaire.motif.trim()}
          style={{ padding: '9px 14px', borderRadius: 10, border: 'none', background: '#007FE1', color: 'white', fontSize: 13, fontWeight: 700, cursor: mutation.isPending || !formulaire.motif.trim() ? 'not-allowed' : 'pointer', opacity: mutation.isPending || !formulaire.motif.trim() ? 0.6 : 1 }}
        >
          {mutation.isPending ? 'Enregistrement…' : 'Enregistrer la mutation'}
        </button>
        {succes && <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>Mutation enregistrée.</span>}
        {erreur && <span style={{ fontSize: 13, color: '#b91c1c' }}>{erreur}</span>}
      </div>
    </section>
  )
}

const DATE_AUJOURDHUI = new Date().toISOString().slice(0, 10)

const styleSelect = {
  width: '100%', boxSizing: 'border-box',
  height: 36, borderRadius: 10, border: '1px solid #e7e5e4',
  background: 'white', color: '#1c1917', fontSize: 13, padding: '0 10px',
}

function Champ({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: '#57534e' }}>
      {label}
      {children}
    </label>
  )
}
