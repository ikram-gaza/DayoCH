import { useState } from 'react'
import { X, UserPlus, UserCog, AlertCircle } from 'lucide-react'
import { utilisateursService, STATUTS_UTILISATEUR } from '../../services/utilisateursService'

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 14px', fontSize: 14, borderRadius: 12,
  border: '1px solid #d6d3d1', outline: 'none', color: '#1c1917',
  background: 'white', fontFamily: 'inherit',
}

const labelStyle = {
  fontSize: 12, fontWeight: 700, color: '#78716c',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  display: 'block', marginBottom: 8,
}

function focusBorder(e) {
  e.target.style.borderColor = '#007FE1'
  e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.12)'
}

function blurBorder(e) {
  e.target.style.borderColor = '#d6d3d1'
  e.target.style.boxShadow = 'none'
}

export default function UtilisateurModal({
  isOpen,
  onClose,
  utilisateur,
  onSubmit,
  utilisateurs = [],
  roles = [],
  filiales = [],
}) {
  const estEdition = Boolean(utilisateur)
  const rolesOptions = roles.length ? roles : utilisateursService.getRolesDisponibles()
  const filialesOptions = filiales.length ? filiales : utilisateursService.getFilialesDisponibles()

  const [prenom, setPrenom] = useState(utilisateur?.prenom || '')
  const [nom, setNom] = useState(utilisateur?.nom || '')
  const [email, setEmail] = useState(utilisateur?.email || '')
  const [telephone, setTelephone] = useState(utilisateur?.telephone || '')
  const [matricule, setMatricule] = useState(utilisateur?.matricule || '')
  const [passwordInitial, setPasswordInitial] = useState('')
  const [role, setRole] = useState(utilisateur?.role || rolesOptions.find((r) => r.code === 'AGENT')?.code || rolesOptions[rolesOptions.length - 1]?.code || 'AGENT')
  const [filialeId, setFilialeId] = useState(utilisateur?.filialeId || '')
  const [statut, setStatut] = useState(utilisateur?.statut || (utilisateur?.actif === false ? 'inactif' : 'actif'))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!prenom.trim() || !nom.trim()) {
      setError('Le prénom et le nom sont obligatoires.')
      return
    }

    if (!estEdition && !matricule.trim()) {
      setError('Le matricule est obligatoire.')
      return
    }

    if (!estEdition && !passwordInitial) {
      setError('Le mot de passe initial est obligatoire.')
      return
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Veuillez saisir une adresse e-mail valide.')
      return
    }

    if (utilisateursService.emailExiste(email, utilisateur?.id, utilisateurs)) {
      setError('Cette adresse e-mail est déjà utilisée par un autre collaborateur.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        prenom,
        nom,
        email,
        telephone,
        role,
        filialeId: filialeId || undefined,
        statut,
      }
      if (!estEdition) {
        payload.matricule = matricule
        payload.passwordInitial = passwordInitial
      }
      const ok = await onSubmit(payload)
      if (ok !== false) onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }} onClick={onClose}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 640,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #e7e5e4',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f5f5f4',
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              {estEdition ? <UserCog size={20} style={{ color: '#007FE1' }} /> : <UserPlus size={20} style={{ color: '#007FE1' }} />}
              {estEdition ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
            </h2>
            <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
              {estEdition ? 'Mettez à jour les informations et les accès.' : 'Créez un compte utilisateur (API).'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none',
              background: '#f5f5f4', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#78716c',
            }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#FEF2F1', border: '1px solid #fecaca',
              borderRadius: 12, padding: '10px 14px', color: '#b91c1c', fontSize: 13,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="prenom" style={labelStyle}>Prénom <span style={{ color: '#dc2626' }}>*</span></label>
              <input id="prenom" type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                placeholder="Boris" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label htmlFor="nom" style={labelStyle}>Nom <span style={{ color: '#dc2626' }}>*</span></label>
              <input id="nom" type="text" value={nom} onChange={(e) => setNom(e.target.value)}
                placeholder="KOTCHOFA" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="email" style={labelStyle}>E-mail</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@dayo.africa" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label htmlFor="telephone" style={labelStyle}>Téléphone</label>
              <input id="telephone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                placeholder="+229 97 00 00 00" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="matricule" style={labelStyle}>Matricule {!estEdition && <span style={{ color: '#dc2626' }}>*</span>}</label>
              <input
                id="matricule"
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                placeholder="Ex : SA-0002"
                disabled={estEdition}
                style={{ ...inputStyle, background: estEdition ? '#fafaf9' : 'white', color: estEdition ? '#a8a29e' : '#1c1917' }}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
            <div>
              {!estEdition ? (
                <>
                  <label htmlFor="passwordInitial" style={labelStyle}>Mot de passe initial <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    id="passwordInitial"
                    type="password"
                    value={passwordInitial}
                    onChange={(e) => setPasswordInitial(e.target.value)}
                    placeholder="Mot de passe provisoire"
                    style={inputStyle}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                    autoComplete="new-password"
                  />
                </>
              ) : (
                <>
                  <label style={labelStyle}>Mot de passe</label>
                  <div style={{ ...inputStyle, background: '#fafaf9', color: '#78716c', display: 'flex', alignItems: 'center' }}>
                    Non modifiable ici
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="role" style={labelStyle}>Rôle <span style={{ color: '#dc2626' }}>*</span></label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {rolesOptions.map((r) => (
                  <option key={r.code} value={r.code}>{r.label || r.code}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filialeId" style={labelStyle}>Filiale</label>
              <select id="filialeId" value={filialeId} onChange={(e) => setFilialeId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Aucune (groupe)</option>
                {filialesOptions.map((f) => (
                  <option key={f.id || f.code || f.nom} value={f.id || ''}>{f.nom}{f.code ? ` (${f.code})` : ''}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="statut" style={labelStyle}>Statut du compte</label>
              <select id="statut" value={statut} onChange={(e) => setStatut(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {Object.entries(STATUTS_UTILISATEUR).map(([id, s]) => (
                  <option key={id} value={id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px', borderRadius: 12, border: '1px solid #e7e5e4',
                background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #007FE1, #0066C0)',
                color: 'white', fontSize: 13, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(0,127,225,0.25)',
              }}
            >
              {submitting ? 'Enregistrement…' : (estEdition ? 'Enregistrer les modifications' : 'Créer le collaborateur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
