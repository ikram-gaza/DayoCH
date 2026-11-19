import { useEffect, useMemo, useState } from 'react'
import { X, UserPlus, AlertCircle } from 'lucide-react'

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  height: 38, padding: '0 12px', borderRadius: 10,
  border: '1px solid #e7e5e4', background: 'white',
  fontSize: 13, color: '#1c1917', outline: 'none',
}

const labelStyle = {
  display: 'flex', flexDirection: 'column', gap: 5,
  fontSize: 12, fontWeight: 600, color: '#57534e',
}

export default function AgentModal({
  isOpen,
  onClose,
  onSubmit,
  filiales = [],
  departements = [],
  services = [],
  roles = [],
  filialeParDefaut = '',
}) {
  const [matricule, setMatricule] = useState('')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [fonction, setFonction] = useState('')
  const [dateEmbauche, setDateEmbauche] = useState('')
  const [departementId, setDepartementId] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [filialeId, setFilialeId] = useState(filialeParDefaut || '')
  const [estGerant, setEstGerant] = useState(false)
  const [creerCompte, setCreerCompte] = useState(false)
  const [roleCode, setRoleCode] = useState('AGENT')
  const [erreur, setErreur] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) setFilialeId((v) => v || filialeParDefaut || '')
  }, [isOpen, filialeParDefaut])

  const servicesFiltres = useMemo(
    () => (services || []).filter((s) => !departementId || s.departementId === departementId),
    [services, departementId],
  )

  if (!isOpen) return null

  const fermer = () => {
    if (submitting) return
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErreur('')
    if (!matricule.trim() || !nom.trim() || !prenom.trim()) {
      setErreur('Matricule, nom et prénom sont obligatoires.')
      return
    }

    const corps = {
      matricule: matricule.trim(),
      nom: nom.trim(),
      prenom: prenom.trim(),
    }
    if (email.trim()) corps.email = email.trim()
    if (telephone.trim()) corps.telephone = telephone.trim()
    if (fonction.trim()) corps.fonction = fonction.trim()
    if (dateEmbauche) corps.dateEmbauche = dateEmbauche
    if (departementId) corps.departementId = departementId
    if (serviceId) corps.serviceId = serviceId
    if (filialeId) corps.filialeId = filialeId
    if (estGerant) corps.estGerant = true
    if (creerCompte) {
      corps.creerCompte = true
      corps.roleCodes = [roleCode || 'AGENT']
    }

    setSubmitting(true)
    try {
      const ok = await onSubmit(corps)
      if (ok !== false) onClose()
    } catch (err) {
      setErreur(err?.message || "Impossible de créer l'agent.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(28,25,23,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={fermer}>
      <div style={{ width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', background: 'white', borderRadius: 20, border: '1px solid #e7e5e4', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f5f5f4' }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserPlus size={18} style={{ color: '#007FE1' }} /> Nouvel agent
            </h2>
            <p style={{ fontSize: 12, color: '#78716c', margin: '3px 0 0' }}>Créez une fiche agent dans l’organisation.</p>
          </div>
          <button type="button" onClick={fermer} style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' }} aria-label="Fermer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {erreur && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: '#FEF2F1', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{erreur}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label style={labelStyle}>Matricule <span style={{ color: '#dc2626' }}>*</span>
              <input value={matricule} onChange={(e) => setMatricule(e.target.value)} placeholder="Ex : BEN-AG-0457" style={inputStyle} />
            </label>
            <label style={labelStyle}>Date d’embauche
              <input type="date" value={dateEmbauche} onChange={(e) => setDateEmbauche(e.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>Prénom <span style={{ color: '#dc2626' }}>*</span>
              <input value={prenom} onChange={(e) => setPrenom(e.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>Nom <span style={{ color: '#dc2626' }}>*</span>
              <input value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>E-mail
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@dayo.africa" style={inputStyle} />
            </label>
            <label style={labelStyle}>Téléphone
              <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+229 00 00 00 00" style={inputStyle} />
            </label>
            <label style={labelStyle}>Fonction
              <input value={fonction} onChange={(e) => setFonction(e.target.value)} style={inputStyle} />
            </label>
            <label style={labelStyle}>Filiale
              <select value={filialeId} onChange={(e) => setFilialeId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Aucune / non précisée</option>
                {filiales.map((f) => (
                  <option key={f.id || f.code || f.nom} value={f.id || ''}>{f.nom}{f.code ? ` (${f.code})` : ''}</option>
                ))}
              </select>
            </label>
            <label style={labelStyle}>Département
              <select value={departementId} onChange={(e) => { setDepartementId(e.target.value); setServiceId('') }} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Aucun</option>
                {departements.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
            </label>
            <label style={labelStyle}>Service
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Aucun</option>
                {servicesFiltres.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, alignItems: 'center' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#44403c', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={estGerant} onChange={(e) => setEstGerant(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#007FE1' }} />
              Désigner comme gérant
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#44403c', fontWeight: 600, cursor: 'pointer' }}>
              <input type="checkbox" checked={creerCompte} onChange={(e) => setCreerCompte(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#007FE1' }} />
              Créer un compte de connexion
            </label>
            {creerCompte && (
              <label style={{ ...labelStyle, minWidth: 220 }}>
                Rôle du compte
                <select value={roleCode} onChange={(e) => setRoleCode(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {(roles.length ? roles : [{ code: 'AGENT', label: 'Agent' }]).map((r) => (
                    <option key={r.code} value={r.code}>{r.label || r.code}</option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6, borderTop: '1px solid #f5f5f4' }}>
            <button type="button" onClick={fermer} style={{ padding: '10px 18px', borderRadius: 12, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #007FE1, #0066C0)', color: 'white', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)' }}>
              {submitting ? 'Création…' : 'Créer l’agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
