import { useState } from 'react'
import { X, Layers, Hash, User, Building2 } from 'lucide-react'

const Field = ({ label, id, icon: Icon, required, children, full = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, gridColumn: full ? '1 / -1' : undefined }}>
    <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#57534e' }}>
      {label}{required && <span style={{ color: '#EF4340' }}> *</span>}
    </label>
    <div style={{ position: 'relative' }}>
      {Icon && (
        <Icon size={15} style={{ position: 'absolute', left: 12, top: 11, color: '#a8a29e', pointerEvents: 'none' }} />
      )}
      {children(Icon ? 34 : 12)}
    </div>
  </div>
)

const inputStyle = (padLeft, extra = {}) => ({
  width: '100%', boxSizing: 'border-box',
  padding: `9px 12px 9px ${padLeft}px`,
  fontSize: 13, borderRadius: 10,
  border: '1px solid #e7e5e4',
  outline: 'none', color: '#1c1917', background: 'white',
  ...extra,
})

export default function ServiceModal({ isOpen, onClose, service, departements = [], agents = [], filiales = [], onSubmit }) {
  const estEdition = Boolean(service)
  const [code, setCode] = useState(service?.code || '')
  const [nom, setNom] = useState(service?.nom || '')
  const [departementId, setDepartementId] = useState(service?.departementId || '')
  const [description, setDescription] = useState(service?.description || '')
  const [responsableId, setResponsableId] = useState(service?.responsableId || '')
  const [filialeId, setFilialeId] = useState(service?.filialeId || '')
  const [actif, setActif] = useState(service?.actif !== false)
  const [erreur, setErreur] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    if (!nom.trim() || (!estEdition && !code.trim()) || !departementId) {
      setErreur('Le code, le nom et le département sont obligatoires.')
      return
    }

    setSubmitting(true)
    try {
      const resultat = await onSubmit({
        code,
        nom,
        departementId,
        description,
        responsableId: responsableId || null,
        filialeId: filialeId || null,
        actif,
      })
      if (resultat !== false) onClose()
    } catch {
      setErreur("Impossible d'enregistrer le service.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(28,25,23,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', background: 'white', borderRadius: 20, border: '1px solid #e7e5e4', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f5f5f4' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers size={18} style={{ color: '#007FE1' }} /> {estEdition ? 'Modifier le service' : 'Nouveau service'}
            </h2>
            <p style={{ fontSize: 12, color: '#78716c', margin: '3px 0 0' }}>{estEdition ? 'Mettez à jour les informations du service.' : 'Créez un service rattaché à un département.'}</p>
          </div>
          <button type="button" onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' }} aria-label="Fermer"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {erreur && <div style={{ padding: '10px 14px', borderRadius: 12, background: '#FEF2F1', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>{erreur}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Code" id="code" icon={Hash} required={!estEdition}>
              {(pl) => <input id="code" value={code} onChange={(e) => setCode(e.target.value)} disabled={estEdition} placeholder="Ex : DSI-DEV" style={{ ...inputStyle(pl), background: estEdition ? '#fafaf9' : 'white', color: estEdition ? '#a8a29e' : '#1c1917' }} />}
            </Field>
            <Field label="Nom" id="nom" icon={Layers} required>
              {(pl) => <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Études et développement" style={inputStyle(pl)} />}
            </Field>

            <Field label="Département" id="departementId" icon={Building2} required full>
              {(pl) => (
                <select id="departementId" value={departementId || ''} onChange={(e) => setDepartementId(e.target.value)} style={{ ...inputStyle(pl), height: 38, cursor: 'pointer' }}>
                  <option value="">Sélectionner un département</option>
                  {departements.map((d) => (
                    <option key={d.id} value={d.id}>{d.nom}{d.code ? ` (${d.code})` : ''}</option>
                  ))}
                </select>
              )}
            </Field>

            {!estEdition && (
              <Field label="Filiale" id="filialeId" icon={Building2} full>
                {(pl) => (
                  <select id="filialeId" value={filialeId || ''} onChange={(e) => setFilialeId(e.target.value)} style={{ ...inputStyle(pl), height: 38, cursor: 'pointer' }}>
                    <option value="">Aucune / non précisée</option>
                    {filiales.map((f) => (
                      <option key={f.id || f.code || f.nom} value={f.id || ''}>{f.nom}{f.code ? ` (${f.code})` : ''}</option>
                    ))}
                  </select>
                )}
              </Field>
            )}

            <Field label="Responsable" id="responsableId" icon={User} full>
              {(pl) => (
                <select id="responsableId" value={responsableId || ''} onChange={(e) => setResponsableId(e.target.value)} style={{ ...inputStyle(pl), height: 38, cursor: 'pointer' }}>
                  <option value="">Aucun responsable</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {`${a.prenom || ''} ${a.nom || ''}`.trim() || a.nomComplet || a.matricule || a.id}
                      {a.matricule ? ` (${a.matricule})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </Field>

            <Field label="Description" id="description" full>
              {(pl) => (
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Description du service"
                  style={{ ...inputStyle(pl, { paddingTop: 10, resize: 'vertical', minHeight: 80 }) }}
                />
              )}
            </Field>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input id="actif" type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#007FE1' }} />
            <label htmlFor="actif" style={{ fontSize: 13, color: '#44403c', fontWeight: 600 }}>Service actif</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6, borderTop: '1px solid #f5f5f4' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 18px', borderRadius: 12, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #007FE1, #0066C0)', color: 'white', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)' }}>
              {submitting ? 'Enregistrement…' : (estEdition ? 'Enregistrer' : 'Créer le service')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
