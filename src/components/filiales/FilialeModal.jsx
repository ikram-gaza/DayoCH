import { useState } from 'react'
import { X, Building2, MapPin, Hash, Mail, Phone, Globe } from 'lucide-react'

const Field = ({ label, id, icon: Icon, required, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label htmlFor={id} style={{ fontSize: 12, fontWeight: 600, color: '#57534e' }}>
      {label}{required && <span style={{ color: '#EF4340' }}> *</span>}
    </label>
    <div style={{ position: 'relative' }}>
      {Icon && (
        <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e', pointerEvents: 'none' }} />
      )}
      {children(Icon ? 34 : 12)}
    </div>
  </div>
)

const inputStyle = (padLeft) => ({
  width: '100%', boxSizing: 'border-box',
  padding: `9px 12px 9px ${padLeft}px`,
  fontSize: 13, borderRadius: 10,
  border: '1px solid #e7e5e4',
  outline: 'none', color: '#1c1917', background: 'white',
})

export default function FilialeModal({ isOpen, onClose, filiale, onSubmit }) {
  const estEdition = Boolean(filiale)
  const [code, setCode] = useState(filiale?.code || '')
  const [nom, setNom] = useState(filiale?.nom || '')
  const [pays, setPays] = useState(filiale?.pays || '')
  const [ville, setVille] = useState(filiale?.ville || '')
  const [email, setEmail] = useState(filiale?.email || '')
  const [telephone, setTelephone] = useState(filiale?.telephone || '')
  const [raisonSociale, setRaisonSociale] = useState(filiale?.raisonSociale || '')
  const [devise, setDevise] = useState(filiale?.devise || '')
  const [actif, setActif] = useState(filiale?.actif !== false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!nom.trim() || !pays.trim() || (!estEdition && !code.trim())) {
      setError('Code, nom et pays sont obligatoires.')
      return
    }
    setSubmitting(true)
    try {
      const resultat = await onSubmit({ code, nom, pays, ville, email, telephone, raisonSociale, devise, actif })
      if (resultat !== false) onClose()
    } catch {
      setError("Impossible d'enregistrer la filiale.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(28,25,23,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', background: 'white', borderRadius: 20, border: '1px solid #e7e5e4', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f5f5f4' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1c1917', margin: 0 }}>{estEdition ? 'Modifier la filiale' : 'Nouvelle filiale'}</h2>
            <p style={{ fontSize: 12, color: '#78716c', margin: '3px 0 0' }}>{estEdition ? 'Mettez à jour les informations de la filiale.' : 'Créez une filiale dans le groupe.'}</p>
          </div>
          <button type="button" onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' }} aria-label="Fermer"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && <div style={{ padding: '10px 14px', borderRadius: 12, background: '#FEF2F1', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Code" id="code" icon={Hash} required={!estEdition}>
              {(pl) => <input id="code" value={code} onChange={(e) => setCode(e.target.value)} disabled={estEdition} style={{ ...inputStyle(pl), background: estEdition ? '#fafaf9' : 'white', color: estEdition ? '#a8a29e' : '#1c1917' }} />}
            </Field>
            <Field label="Nom" id="nom" icon={Building2} required>
              {(pl) => <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle(pl)} />}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Pays" id="pays" icon={Globe} required>
              {(pl) => <input id="pays" value={pays} onChange={(e) => setPays(e.target.value)} style={inputStyle(pl)} />}
            </Field>
            <Field label="Ville" id="ville" icon={MapPin}>
              {(pl) => <input id="ville" value={ville} onChange={(e) => setVille(e.target.value)} style={inputStyle(pl)} />}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="E-mail" id="email" icon={Mail}>
              {(pl) => <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(pl)} />}
            </Field>
            <Field label="Téléphone" id="telephone" icon={Phone}>
              {(pl) => <input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} style={inputStyle(pl)} />}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Raison sociale" id="raisonSociale">
              {(pl) => <input id="raisonSociale" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} style={inputStyle(pl)} />}
            </Field>
            <Field label="Devise" id="devise">
              {(pl) => <input id="devise" value={devise} onChange={(e) => setDevise(e.target.value)} placeholder="XOF" style={inputStyle(pl)} />}
            </Field>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input id="actif" type="checkbox" checked={actif} onChange={(e) => setActif(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#007FE1' }} />
            <label htmlFor="actif" style={{ fontSize: 13, color: '#44403c', fontWeight: 600 }}>Filiale active</label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6, borderTop: '1px solid #f5f5f4' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 18px', borderRadius: 12, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #007FE1, #0066C0)', color: 'white', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)' }}>
              {submitting ? 'Enregistrement…' : (estEdition ? 'Enregistrer' : 'Créer la filiale')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
