import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Image as ImageIcon, PenLine, UserRound } from 'lucide-react'
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
  const [signatureOuverte, setSignatureOuverte] = useState(false)
  const peutModifier = peut('agent:update')

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
        <Link
          to="/agents"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 12, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
        >
          <ArrowLeft size={15} /> Retour à la liste
        </Link>
      </div>

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
          <Donnee libelle="Département" valeur={fiche.departement?.nom} />
          <Donnee libelle="Service" valeur={fiche.service?.nom} />
          <Donnee libelle="Email" valeur={fiche.email} />
          <Donnee libelle="Téléphone" valeur={fiche.telephone} />
          <Donnee libelle="Date d'embauche" valeur={formaterDate(fiche.dateEmbauche)} />
          <Donnee libelle="Compte de connexion" valeur={fiche.userId ? 'Oui' : 'Non (connexion impossible)'} />
          <Donnee libelle="Filiale" valeur={fiche.filiale} />
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
