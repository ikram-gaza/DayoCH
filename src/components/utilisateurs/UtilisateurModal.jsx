import { useState } from 'react'
import { X, UserPlus, UserCog, AlertCircle, ShieldCheck } from 'lucide-react'
import {
  utilisateursService,
  ROLES_UTILISATEUR,
  STATUTS_UTILISATEUR,
  FILIALES_UTILISATEUR,
} from '../../services/utilisateursService'

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

export default function UtilisateurModal({ isOpen, onClose, utilisateur, onSubmit }) {
  const estEdition = Boolean(utilisateur)

  const [prenom, setPrenom] = useState(utilisateur?.prenom || '')
  const [nom, setNom] = useState(utilisateur?.nom || '')
  const [email, setEmail] = useState(utilisateur?.email || '')
  const [telephone, setTelephone] = useState(utilisateur?.telephone || '')
  const [role, setRole] = useState(utilisateur?.role || 'employe')
  const [filiale, setFiliale] = useState(utilisateur?.filiale || FILIALES_UTILISATEUR[1].nom)
  const [poste, setPoste] = useState(utilisateur?.poste || '')
  const [matricule, setMatricule] = useState(utilisateur?.matricule || '')
  const [dateEmbauche, setDateEmbauche] = useState(utilisateur?.dateEmbauche || '')
  const [statut, setStatut] = useState(utilisateur?.statut || 'actif')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(Boolean(utilisateur?.twoFactorEnabled))
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!prenom.trim() || !nom.trim()) {
      setError('Le prénom et le nom sont obligatoires.')
      return
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Veuillez saisir une adresse e-mail valide.')
      return
    }

    if (utilisateursService.emailExiste(email, utilisateur?.id)) {
      setError('Cette adresse e-mail est déjà utilisée par un autre collaborateur.')
      return
    }

    onSubmit({
      prenom,
      nom,
      email,
      telephone,
      role,
      filiale,
      poste,
      matricule,
      dateEmbauche,
      statut,
      twoFactorEnabled,
    })

    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 640,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #e7e5e4',
      }}>
        {/* Header */}
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
              {estEdition ? 'Mettez à jour les informations et les accès.' : 'Créez un compte et attribuez un rôle.'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none',
              background: '#f5f5f4', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#78716c',
            }}
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

          {/* Identité */}
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

          {/* Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="email" style={labelStyle}>E-mail <span style={{ color: '#dc2626' }}>*</span></label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="prenom.nom@dayo.africa" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label htmlFor="telephone" style={labelStyle}>Téléphone</label>
              <input id="telephone" type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)}
                placeholder="+229 97 00 00 00" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          {/* Affectation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="role" style={labelStyle}>Rôle <span style={{ color: '#dc2626' }}>*</span></label>
              <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {Object.entries(ROLES_UTILISATEUR).map(([id, r]) => (
                  <option key={id} value={id}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filiale" style={labelStyle}>Filiale <span style={{ color: '#dc2626' }}>*</span></label>
              <select id="filiale" value={filiale} onChange={(e) => setFiliale(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {FILIALES_UTILISATEUR.map((f) => (
                  <option key={f.code} value={f.nom}>{f.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="poste" style={labelStyle}>Poste</label>
              <input id="poste" type="text" value={poste} onChange={(e) => setPoste(e.target.value)}
                placeholder="Chargé de Clientèle" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label htmlFor="matricule" style={labelStyle}>Matricule</label>
              <input id="matricule" type="text" value={matricule} onChange={(e) => setMatricule(e.target.value)}
                placeholder="Généré automatiquement" style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="dateEmbauche" style={labelStyle}>Date d'embauche</label>
              <input id="dateEmbauche" type="date" value={dateEmbauche} onChange={(e) => setDateEmbauche(e.target.value)}
                style={inputStyle} onFocus={focusBorder} onBlur={blurBorder} />
            </div>
            <div>
              <label htmlFor="statut" style={labelStyle}>Statut du compte</label>
              <select id="statut" value={statut} onChange={(e) => setStatut(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                {Object.entries(STATUTS_UTILISATEUR).map(([id, s]) => (
                  <option key={id} value={id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2FA */}
          <button
            type="button"
            onClick={() => setTwoFactorEnabled((v) => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              border: `1.5px solid ${twoFactorEnabled ? '#007FE1' : '#e7e5e4'}`,
              background: twoFactorEnabled ? '#F0F8FF' : '#fafaf9',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={18} style={{ color: twoFactorEnabled ? '#007FE1' : '#a8a29e' }} />
              <span>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#1c1917' }}>
                  Double authentification (2FA)
                </span>
                <span style={{ display: 'block', fontSize: 11, color: '#78716c' }}>
                  Exiger un code 2FAS à la connexion
                </span>
              </span>
            </span>
            <span style={{
              width: 40, height: 22, borderRadius: 999, flexShrink: 0, position: 'relative',
              background: twoFactorEnabled ? '#007FE1' : '#d6d3d1', transition: 'background 0.15s',
            }}>
              <span style={{
                position: 'absolute', top: 2, left: twoFactorEnabled ? 20 : 2,
                width: 18, height: 18, borderRadius: '50%', background: 'white',
                transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </span>
          </button>

          {/* Actions */}
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
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #007FE1, #0066C0)',
                color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,127,225,0.25)',
              }}
            >
              {estEdition ? 'Enregistrer les modifications' : 'Créer le collaborateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
