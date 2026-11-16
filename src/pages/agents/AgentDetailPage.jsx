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
import { Badge, Empty, PageHeader, Spinner } from '../../components/ui/ui'
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
    return <div style={{ display: 'grid', placeItems: 'center', padding: 64 }}><Spinner /></div>
  }

  if (agent.isError || !agent.data) {
    return (
      <Empty
        icon={UserRound}
        title="Agent introuvable"
        description={normaliserErreur(agent.error).message}
        action={<Link to="/agents" style={{ color: '#007FE1', fontWeight: 700 }}>Retour à la liste</Link>}
      />
    )
  }

  const fiche = agent.data

  return (
    <>
      <PageHeader
        icon={UserRound}
        title={`${fiche.prenom} ${fiche.nom}`}
        subtitle={
          <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            {fiche.matricule} · {fiche.fonction || 'Fonction non précisée'}
            <Badge tone={fiche.actif ? 'green' : 'stone'}>{fiche.actif ? 'Actif' : 'Sorti'}</Badge>
            {fiche.estGerant && <Badge tone="red">Gérant</Badge>}
            {!fiche.email && <Badge tone="stone">Sans email</Badge>}
          </span>
        }
        actions={
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Link
              to="/agents"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 34,
                padding: '0 12px',
                borderRadius: 9,
                border: '1px solid #e7e5e4',
                background: 'white',
                color: '#57534e',
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={14} /> Retour à la liste
            </Link>
          </div>
        }
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 18, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
          <PhotoAgent
            agentId={fiche.id}
            prenom={fiche.prenom}
            nom={fiche.nom}
            aPhoto={Boolean(fiche.photoFichier || fiche.photoUrl)}
            photoUrl={fiche.photoUrl}
            taille={96}
          />

          <dl style={{ flex: 1, minWidth: 260, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, margin: 0 }}>
            <Donnee libelle="Département" valeur={fiche.departement?.nom} />
            <Donnee libelle="Service" valeur={fiche.service?.nom} />
            <Donnee libelle="Email" valeur={fiche.email} />
            <Donnee libelle="Téléphone" valeur={fiche.telephone} />
            <Donnee libelle="Date d'embauche" valeur={formaterDate(fiche.dateEmbauche)} />
            <Donnee libelle="Compte de connexion" valeur={fiche.userId ? 'Oui' : 'Non (connexion impossible)'} />
            <Donnee libelle="Filiale" valeur={fiche.filiale} />
          </dl>

          {peutModifier && <TeleverserPhoto agentId={fiche.id} majAt={fiche.photoMajAt} />}
        </section>

        <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1c1917' }}>Signature</h2>
            {peutModifier && (
              <button
                type="button"
                onClick={() => setSignatureOuverte((ouverte) => !ouverte)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  height: 32,
                  padding: '0 12px',
                  borderRadius: 8,
                  border: '1px solid #e7e5e4',
                  background: 'white',
                  color: '#57534e',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <PenLine size={14} />
                {signatureOuverte ? 'Fermer' : fiche.signatureFichier || fiche.signatureUrl ? 'Remplacer' : 'Signer'}
              </button>
            )}
          </div>

          {fiche.signatureFichier || fiche.signatureUrl ? (
            <SignatureEnregistree agent={fiche} />
          ) : (
            <p style={{ margin: '12px 0 0', fontSize: 13, color: '#78716c' }}>Aucune signature enregistrée.</p>
          )}

          {signatureOuverte && (
            <div style={{ marginTop: 14 }}>
              <PaveSignature agentId={fiche.id} surEnregistrement={() => setSignatureOuverte(false)} />
            </div>
          )}
        </section>

        <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 18 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1c1917' }}>Carrière</h2>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: '#78716c' }}>Historique des postes, du plus récent au plus ancien.</p>
            </div>
            <ExportButtons
              formats={['xlsx', 'pdf']}
              onExport={(format) => apiAgents.exporterCarriere(fiche.id, format)}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            {carriere.isLoading && <Spinner />}
            {carriere.isError && <p style={{ color: '#b91c1c', fontSize: 13 }}>{normaliserErreur(carriere.error).message}</p>}
            {carriere.data && <FriseCarriere affectations={carriere.data} />}
          </div>
        </section>

        {peutModifier && <MutationAgent agent={fiche} />}
      </div>
    </>
  )
}

function Donnee({ libelle, valeur }) {
  return (
    <div>
      <dt style={{ fontSize: 11, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{libelle}</dt>
      <dd style={{ margin: '3px 0 0', fontSize: 13, color: '#292524' }}>{valeur || '-'}</dd>
    </div>
  )
}

function SignatureEnregistree({ agent }) {
  const { url } = useImageProtegee(
    !agent.signatureUrl && agent.signatureFichier ? `/organisation/agents/${agent.id}/signature` : null,
  )
  const source = agent.signatureUrl || url

  if (!source) return <p style={{ margin: '12px 0 0', fontSize: 13, color: '#78716c' }}>Signature illisible.</p>

  return (
    <figure style={{ margin: '12px 0 0' }}>
      <img src={source} alt="Signature de l'agent" style={{ maxWidth: 320, borderRadius: 8, border: '1px solid #e7e5e4', background: 'white' }} />
      {agent.signatureMajAt && (
        <figcaption style={{ marginTop: 4, fontSize: 11, color: '#a8a29e' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <input ref={champ} type="file" accept="image/jpeg,image/png,image/webp" onChange={surChoix} hidden />
      <button
        type="button"
        onClick={() => champ.current?.click()}
        disabled={envoi.isPending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          height: 34,
          padding: '0 12px',
          borderRadius: 9,
          border: '1px solid #e7e5e4',
          background: 'white',
          color: '#57534e',
          fontSize: 12,
          fontWeight: 700,
          cursor: envoi.isPending ? 'not-allowed' : 'pointer',
        }}
      >
        {envoi.isPending ? <Spinner className="h-3.5 w-3.5" /> : <ImageIcon size={14} />}
        Changer la photo
      </button>
      <span style={{ fontSize: 11, color: '#a8a29e' }}>
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
    <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 16, padding: 18 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1c1917' }}>Mutation</h2>
      <p style={{ margin: '3px 0 14px', fontSize: 12, color: '#78716c' }}>Modifier le rattachement de l'agent et enregistrer le motif.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <Champ label="Département">
          <select
            value={formulaire.departementId}
            onChange={(evenement) => setFormulaire((actuel) => ({ ...actuel, departementId: evenement.target.value, serviceId: '' }))}
            style={styleSelect}
          >
            <option value="">Non modifié</option>
            {(referentiels.data?.departements || []).map((departement) => (
              <option key={departement.id} value={departement.id}>{departement.nom}</option>
            ))}
          </select>
        </Champ>

        <Champ label="Service">
          <select
            value={formulaire.serviceId}
            onChange={(evenement) => setFormulaire((actuel) => ({ ...actuel, serviceId: evenement.target.value }))}
            style={styleSelect}
          >
            <option value="">Non modifié</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.nom}</option>
            ))}
          </select>
        </Champ>

        <Champ label="Fonction">
          <input
            value={formulaire.fonction}
            onChange={(evenement) => setFormulaire((actuel) => ({ ...actuel, fonction: evenement.target.value }))}
            style={styleSelect}
          />
        </Champ>

        <Champ label="Motif">
          <input
            value={formulaire.motif}
            onChange={(evenement) => setFormulaire((actuel) => ({ ...actuel, motif: evenement.target.value }))}
            placeholder="Obligatoire"
            style={styleSelect}
          />
        </Champ>

        <Champ label="Date d'effet">
          <input
            type="date"
            value={formulaire.dateEffet}
            onChange={(evenement) => setFormulaire((actuel) => ({ ...actuel, dateEffet: evenement.target.value }))}
            style={styleSelect}
          />
        </Champ>
      </div>

      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          onClick={() => {
            setSucces(false)
            mutation.mutate()
          }}
          disabled={mutation.isPending || !formulaire.motif.trim()}
          style={{
            height: 34,
            padding: '0 14px',
            borderRadius: 9,
            border: 'none',
            background: '#007FE1',
            color: 'white',
            fontSize: 12,
            fontWeight: 700,
            cursor: mutation.isPending || !formulaire.motif.trim() ? 'not-allowed' : 'pointer',
            opacity: mutation.isPending || !formulaire.motif.trim() ? 0.6 : 1,
          }}
        >
          {mutation.isPending ? 'Enregistrement…' : 'Enregistrer la mutation'}
        </button>
        {succes && <span style={{ fontSize: 12, color: '#15803d', fontWeight: 700 }}>Mutation enregistrée.</span>}
        {erreur && <span style={{ fontSize: 12, color: '#b91c1c' }}>{erreur}</span>}
      </div>
    </section>
  )
}

const DATE_AUJOURDHUI = new Date().toISOString().slice(0, 10)

const styleSelect = {
  width: '100%',
  height: 36,
  borderRadius: 9,
  border: '1px solid #e7e5e4',
  background: '#fafaf9',
  color: '#1c1917',
  fontSize: 12,
  padding: '0 10px',
  boxSizing: 'border-box',
}

function Champ({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, fontWeight: 700, color: '#57534e' }}>
      <span>{label}</span>
      {children}
    </label>
  )
}
