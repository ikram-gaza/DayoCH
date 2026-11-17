import { useState } from 'react'
import { X, User, Mail, Phone, Building2, Briefcase, Hash, Shield } from 'lucide-react'
import {
  utilisateursService,
  ROLES_UTILISATEUR,
  FILIALES_UTILISATEUR,
} from '../../services/utilisateursService'

const Field = ({ label, id, icon: Icon, error, hint, required, children }) => (
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
    {hint && !error && <span style={{ fontSize: 11, color: '#78716c' }}>{hint}</span>}
    {error && <span style={{ fontSize: 11, color: '#b91c1c' }}>{error}</span>}
  </div>
)

const inputStyle = (padLeft, hasError) => ({
  width: '100%', boxSizing: 'border-box',
  padding: `9px 12px 9px ${padLeft}px`,
  fontSize: 13, borderRadius: 10,
  border: `1px solid ${hasError ? '#fca5a5' : '#e7e5e4'}`,
  outline: 'none', color: '#1c1917', background: 'white',
})

export default function UtilisateurModal({
  isOpen,
  onClose,
  utilisateur,
  onSubmit,
  utilisateurs = [],
  roles = [],
  filiales = [],
  isMock = false,
}) {
  const estEdition = Boolean(utilisateur)
  const rolesDisponibles = roles.length
    ? roles
    : Object.entries(ROLES_UTILISATEUR).map(([code, info]) => ({ code, ...info }))
  const filialesDisponibles = filiales.length ? filiales : FILIALES_UTILISATEUR

  const [prenom, setPrenom] = useState(utilisateur?.prenom || '')
  const [nom, setNom] = useState(utilisateur?.nom || '')
  const [email, setEmail] = useState(utilisateur?.email || '')
  const [telephone, setTelephone] = useState(utilisateur?.telephone || '')
  const [role, setRole] = useState(utilisateur?.role || rolesDisponibles[0]?.code || 'employe')
  const [filiale, setFiliale] = useState(
    utilisateur?.filialeId ||
    utilisateur?.filiale ||
    filialesDisponibles[1]?.id ||
    filialesDisponibles[1]?.nom ||
    filialesDisponibles[0]?.id ||
    filialesDisponibles[0]?.nom ||
    ''
  )
  const [poste, setPoste] = useState(utilisateur?.poste || '')
  const [matricule, setMatricule] = useState(utilisateur?.matricule || '')
  const [dateEmbauche, setDateEmbauche] = useState(utilisateur?.dateEmbauche || '')
  const [statut, setStatut] = useState(utilisateur?.statut || 'actif')
  const [passwordInitial, setPasswordInitial] = useState('')
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

    if (!matricule.trim() && !isMock && !estEdition) {
      setError('Le matricule est obligatoire pour la création d’un compte réel.')
      return
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Veuillez saisir une adresse e-mail valide.')
      return
    }

    if (!isMock && !estEdition && !passwordInitial.trim()) {
      setError('Le mot de passe provisoire est obligatoire pour la création d’un compte réel.')
      return
    }

    if (utilisateursService.emailExiste(email, utilisateur?.id, utilisateurs)) {
      setError('Cette adresse e-mail est déjà utilisée par un autre collaborateur.')
      return
    }

    const selection = filialesDisponibles.find(
      (item) => String(item.id ?? item.nom) === String(filiale)
    )

    setSubmitting(true)
    try {
      const resultat = await onSubmit({
        prenom,
        nom,
        email,
        telephone,
        role,
        filiale: selection?.nom || filiale,
        filialeId: selection?.id || utilisateur?.filialeId || null,
        poste,
        matricule,
        dateEmbauche,
        statut,
        passwordInitial: passwordInitial || undefined,
        actif: statut === 'actif',
      })
      if (resultat !== false) onClose()
    } catch {
      setError("Impossible d'enregistrer le collaborateur.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(28,25,23,0.45)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto',
          background: 'white', borderRadius: 20, border: '1px solid #e7e5e4',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid #f5f5f4',
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#1c1917', margin: 0 }}>
              {estEdition ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
            </h2>
            <p style={{ fontSize: 12, color: '#78716c', margin: '3px 0 0' }}>
              {estEdition ? 'Mettez à jour les informations et le rôle du compte.' : 'Créez un compte et assignez son rôle dans la plateforme.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #e7e5e4', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716c' }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: '#FEF2F1', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Prénom" id="prenom" icon={User} required>
              {(pl) => <input id="prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)} style={inputStyle(pl)} />}
            </Field>
            <Field label="Nom" id="nom" icon={User} required>
              {(pl) => <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} style={inputStyle(pl)} />}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Adresse e-mail" id="email" icon={Mail}>
              {(pl) => <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(pl)} />}
            </Field>
            <Field label="Téléphone" id="telephone" icon={Phone}>
              {(pl) => <input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} style={inputStyle(pl)} />}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Rôle" id="role" icon={Shield} required>
              {(pl) => (
                <select id="role" value={role} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle(pl), cursor: 'pointer' }}>
                  {rolesDisponibles.map((r) => (
                    <option key={r.code} value={r.code}>{r.label}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Filiale" id="filiale" icon={Building2}>
              {(pl) => (
                <select id="filiale" value={filiale} onChange={(e) => setFiliale(e.target.value)} style={{ ...inputStyle(pl), cursor: 'pointer' }}>
                  {filialesDisponibles.map((f) => (
                    <option key={f.id || f.code || f.nom} value={f.id || f.nom}>{f.nom}</option>
                  ))}
                </select>
              )}
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Poste" id="poste" icon={Briefcase}>
              {(pl) => <input id="poste" value={poste} onChange={(e) => setPoste(e.target.value)} style={inputStyle(pl)} />}
            </Field>
            <Field label="Matricule" id="matricule" icon={Hash} hint={estEdition ? 'Laissez vide pour conserver le matricule actuel.' : 'Requis pour un compte réel. Généré en mock si vide.'}>
              {(pl) => <input id="matricule" value={matricule} onChange={(e) => setMatricule(e.target.value)} style={inputStyle(pl)} />}
            </Field>
          </div>

          {!estEdition && (
            <Field label="Mot de passe provisoire" id="passwordInitial" icon={Shield} required={!isMock} hint={isMock ? 'Ignoré en mode mock.' : 'Sera exigé à changer à la première connexion.'}>
              {(pl) => <input id="passwordInitial" type="password" value={passwordInitial} onChange={(e) => setPasswordInitial(e.target.value)} style={inputStyle(pl)} />}
            </Field>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Date d'embauche" id="dateEmbauche">
              {(pl) => <input id="dateEmbauche" type="date" value={dateEmbauche} onChange={(e) => setDateEmbauche(e.target.value)} style={inputStyle(pl)} />}
            </Field>
            <Field label="Statut du compte" id="statut">
              {(pl) => (
                <select id="statut" value={statut} onChange={(e) => setStatut(e.target.value)} style={{ ...inputStyle(pl), cursor: 'pointer' }}>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                </select>
              )}
            </Field>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 6, borderTop: '1px solid #f5f5f4' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 18px', borderRadius: 12, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Annuler
            </button>
            <button type="submit" disabled={submitting} style={{ padding: '10px 20px', borderRadius: 12, border: 'none', background: submitting ? '#93c5fd' : 'linear-gradient(135deg, #007FE1, #0066C0)', color: 'white', fontSize: 13, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)' }}>
              {submitting ? 'Enregistrement…' : (estEdition ? 'Enregistrer les modifications' : 'Créer le collaborateur')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
