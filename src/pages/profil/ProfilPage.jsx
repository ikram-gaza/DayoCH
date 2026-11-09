import { useState, useRef } from 'react'
import {
  User, Mail, Phone, Building2, Briefcase, Hash,
  Camera, Save, Lock, Eye, EyeOff, CheckCircle2,
  Shield, Bell, Smartphone,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const ROLE_LABELS = {
  super_admin: 'Super Administrateur',
  manager: 'Manager',
  employe: 'Employé',
  gestionnaire_stock: 'Gestionnaire Stock',
}

const ROLE_COLORS = {
  super_admin: { bg: '#E5F2FD', color: '#007FE1' },
  manager: { bg: '#dcfce7', color: '#16a34a' },
  employe: { bg: '#fef9c3', color: '#a16207' },
  gestionnaire_stock: { bg: '#fef2ff', color: '#a21caf' },
}

// ── Champ de saisie réutilisable ──────────────────────────────
function Field({ label, value, onChange, type = 'text', icon: Icon, disabled = false, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon size={15} style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: disabled ? '#d6d3d1' : '#a8a29e', flexShrink: 0,
          }} />
        )}
        <input
          type={type}
          value={value}
          onChange={onChange ? e => onChange(e.target.value) : undefined}
          readOnly={disabled}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: Icon ? '9px 12px 9px 34px' : '9px 12px',
            fontSize: 14, borderRadius: 10,
            border: `1px solid ${disabled ? '#f0efee' : '#e7e5e4'}`,
            background: disabled ? '#fafaf9' : 'white',
            color: disabled ? '#a8a29e' : '#1c1917',
            outline: 'none',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => { if (!disabled) { e.target.style.borderColor = '#007FE1'; e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.1)' } }}
          onBlur={e => { e.target.style.borderColor = disabled ? '#f0efee' : '#e7e5e4'; e.target.style.boxShadow = 'none' }}
        />
      </div>
      {hint && <p style={{ fontSize: 11, color: '#a8a29e', margin: 0 }}>{hint}</p>}
    </div>
  )
}

// ── Champ mot de passe ────────────────────────────────────────
function PasswordField({ label, value, onChange, hint }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '9px 40px 9px 34px', fontSize: 14, borderRadius: 10,
            border: '1px solid #e7e5e4', background: 'white', color: '#1c1917',
            outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#007FE1'; e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.1)' }}
          onBlur={e => { e.target.style.borderColor = '#e7e5e4'; e.target.style.boxShadow = 'none' }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: '#a8a29e', display: 'flex', alignItems: 'center',
          }}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {hint && <p style={{ fontSize: 11, color: '#a8a29e', margin: 0 }}>{hint}</p>}
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden',
    }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #f5f5f4' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1c1917', margin: 0 }}>{title}</h2>
        {description && <p style={{ fontSize: 12, color: '#a8a29e', margin: '2px 0 0' }}>{description}</p>}
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  )
}

// ── Toast de confirmation ─────────────────────────────────────
function Toast({ message, onClose }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: 10,
      background: '#1c1917', color: 'white',
      padding: '12px 18px', borderRadius: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      fontSize: 13, fontWeight: 600,
      animation: 'slideUp 0.3s ease',
    }}>
      <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
      {message}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function ProfilPage() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  const [photo, setPhoto] = useState(user?.photo || null)
  const [form, setForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
  })

  const [passwords, setPasswords] = useState({ ancien: '', nouveau: '', confirmation: '' })
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdError, setPwdError] = useState('')

  const initials = `${user?.prenom?.[0] || ''}${user?.nom?.[0] || ''}`.toUpperCase()
  const roleStyle = ROLE_COLORS[user?.role] || ROLE_COLORS.employe

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Photo de profil
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setPhoto(dataUrl)
      updateUser({ photo: dataUrl })
      showToast('Photo de profil mise à jour')
    }
    reader.readAsDataURL(file)
  }

  // Sauvegarde infos
  const handleSaveInfo = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 700)) // simulation API
    updateUser({ ...form, photo })
    setSaving(false)
    showToast('Profil mis à jour avec succès')
  }

  // Changement de mot de passe
  const handleSavePassword = async () => {
    setPwdError('')
    if (!passwords.ancien) return setPwdError('Saisissez votre mot de passe actuel.')
    if (passwords.nouveau.length < 8) return setPwdError('Le nouveau mot de passe doit faire au moins 8 caractères.')
    if (passwords.nouveau !== passwords.confirmation) return setPwdError('Les mots de passe ne correspondent pas.')
    setSavingPwd(true)
    await new Promise(r => setTimeout(r, 700))
    setSavingPwd(false)
    setPasswords({ ancien: '', nouveau: '', confirmation: '' })
    showToast('Mot de passe modifié avec succès')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ── Header page ── */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <User size={24} style={{ color: '#007FE1' }} />
          Mon Profil
        </h1>
        <p style={{ fontSize: 13, color: '#a8a29e', marginTop: 4 }}>
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      {/* ── Layout 2 colonnes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Colonne gauche : carte identité ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Carte avatar */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: 24,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 88, height: 88, borderRadius: '50%', overflow: 'hidden',
                border: '3px solid #E5F2FD',
                background: photo ? 'transparent' : 'linear-gradient(135deg, #007FE1, #0066C0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {photo
                  ? <img src={photo} alt="Photo de profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 28, fontWeight: 700, color: 'white' }}>{initials}</span>
                }
              </div>
              {/* Bouton changer photo */}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#007FE1', border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#006AC0'}
                onMouseLeave={e => e.currentTarget.style.background = '#007FE1'}
                title="Changer la photo"
              >
                <Camera size={12} style={{ color: 'white' }} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* Nom + rôle */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#1c1917', margin: 0 }}>
                {user?.prenom} {user?.nom}
              </p>
              <p style={{ fontSize: 13, color: '#78716c', marginTop: 3 }}>{user?.poste || '—'}</p>
              <span style={{
                display: 'inline-block', marginTop: 8,
                padding: '3px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                background: roleStyle.bg, color: roleStyle.color,
              }}>
                {ROLE_LABELS[user?.role] || user?.role}
              </span>
            </div>

            {/* Bouton changer photo (texte) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%', padding: '8px 12px', fontSize: 12, fontWeight: 600,
                border: '1px solid #e7e5e4', borderRadius: 8, background: 'white',
                color: '#78716c', cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fafaf9'; e.currentTarget.style.borderColor = '#d6d3d1' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e7e5e4' }}
            >
              <Camera size={13} />
              Changer la photo
            </button>
          </div>

          {/* Infos non modifiables */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f5f5f4' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Informations de poste
              </p>
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: Hash, label: 'Matricule', value: user?.matricule || '—' },
                { icon: Building2, label: 'Filiale', value: user?.filiale || '—' },
                { icon: Briefcase, label: 'Poste', value: user?.poste || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, background: '#E5F2FD',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={14} style={{ color: '#007FE1' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#a8a29e', margin: 0, fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: 13, color: '#1c1917', margin: 0, fontWeight: 600 }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sécurité : statut 2FA */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f5f5f4' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Sécurité du compte
              </p>
            </div>
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Smartphone size={14} style={{ color: '#007FE1' }} />
                  <span style={{ fontSize: 13, color: '#1c1917', fontWeight: 600 }}>Authentification 2FA</span>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: user?.twoFactorEnabled ? '#dcfce7' : '#fef2f2',
                  color: user?.twoFactorEnabled ? '#16a34a' : '#dc2626',
                }}>
                  {user?.twoFactorEnabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={14} style={{ color: '#007FE1' }} />
                  <span style={{ fontSize: 13, color: '#1c1917', fontWeight: 600 }}>Niveau d'accès</span>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: roleStyle.bg, color: roleStyle.color,
                }}>
                  {ROLE_LABELS[user?.role] || user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Colonne droite : formulaires ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Informations personnelles */}
          <Section title="Informations personnelles" description="Ces informations sont visibles par votre équipe">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field
                  label="Prénom"
                  value={form.prenom}
                  onChange={v => setForm(f => ({ ...f, prenom: v }))}
                  icon={User}
                />
                <Field
                  label="Nom"
                  value={form.nom}
                  onChange={v => setForm(f => ({ ...f, nom: v }))}
                  icon={User}
                />
              </div>
              <Field
                label="Adresse email"
                value={form.email}
                onChange={v => setForm(f => ({ ...f, email: v }))}
                icon={Mail}
                type="email"
              />
              <Field
                label="Numéro de téléphone"
                value={form.telephone}
                onChange={v => setForm(f => ({ ...f, telephone: v }))}
                icon={Phone}
                type="tel"
              />

              {/* Bouton sauvegarder */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  onClick={handleSaveInfo}
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 20px', fontSize: 13, fontWeight: 700,
                    background: saving ? '#93c5fd' : '#007FE1',
                    color: 'white', border: 'none', borderRadius: 10,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0,127,225,0.25)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#006AC0' }}
                  onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#007FE1' }}
                >
                  <Save size={14} />
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>
          </Section>

          {/* Changer mot de passe */}
          <Section title="Changer le mot de passe" description="Utilisez un mot de passe fort d'au moins 8 caractères">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <PasswordField
                label="Mot de passe actuel"
                value={passwords.ancien}
                onChange={v => setPasswords(p => ({ ...p, ancien: v }))}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <PasswordField
                  label="Nouveau mot de passe"
                  value={passwords.nouveau}
                  onChange={v => setPasswords(p => ({ ...p, nouveau: v }))}
                  hint="Minimum 8 caractères"
                />
                <PasswordField
                  label="Confirmer le mot de passe"
                  value={passwords.confirmation}
                  onChange={v => setPasswords(p => ({ ...p, confirmation: v }))}
                />
              </div>

              {/* Indicateur force mot de passe */}
              {passwords.nouveau && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4].map(i => {
                      const strength = [
                        passwords.nouveau.length >= 8,
                        /[A-Z]/.test(passwords.nouveau),
                        /[0-9]/.test(passwords.nouveau),
                        /[^A-Za-z0-9]/.test(passwords.nouveau),
                      ].filter(Boolean).length
                      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e']
                      return (
                        <div key={i} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i <= strength ? colors[strength - 1] : '#e7e5e4',
                          transition: 'background 0.2s',
                        }} />
                      )
                    })}
                  </div>
                  <p style={{ fontSize: 11, color: '#a8a29e', margin: 0 }}>
                    Force : {['', 'Faible', 'Moyen', 'Fort', 'Très fort'][[
                      passwords.nouveau.length >= 8,
                      /[A-Z]/.test(passwords.nouveau),
                      /[0-9]/.test(passwords.nouveau),
                      /[^A-Za-z0-9]/.test(passwords.nouveau),
                    ].filter(Boolean).length]}
                  </p>
                </div>
              )}

              {pwdError && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: '#fef2f2', border: '1px solid #fecaca',
                  fontSize: 13, color: '#dc2626', fontWeight: 500,
                }}>
                  {pwdError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  onClick={handleSavePassword}
                  disabled={savingPwd}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 20px', fontSize: 13, fontWeight: 700,
                    background: savingPwd ? '#93c5fd' : '#007FE1',
                    color: 'white', border: 'none', borderRadius: 10,
                    cursor: savingPwd ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(0,127,225,0.25)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!savingPwd) e.currentTarget.style.background = '#006AC0' }}
                  onMouseLeave={e => { if (!savingPwd) e.currentTarget.style.background = '#007FE1' }}
                >
                  <Lock size={14} />
                  {savingPwd ? 'Modification...' : 'Modifier le mot de passe'}
                </button>
              </div>
            </div>
          </Section>

          {/* Préférences notifications */}
          <Section title="Notifications" description="Choisissez les notifications que vous souhaitez recevoir">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Validation de congés', description: 'Recevoir une notification quand une demande est traitée', defaultOn: true },
                { label: 'Nouvelles formations', description: 'Être notifié des nouvelles formations disponibles', defaultOn: true },
                { label: 'Rappels d\'échéances', description: 'Rappels pour les restitutions d\'équipements', defaultOn: false },
                { label: 'Mises à jour RH', description: 'Annonces et actualités de l\'équipe RH', defaultOn: true },
              ].map((notif, i) => (
                <NotifToggle key={i} {...notif} />
              ))}
            </div>
          </Section>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} />}
    </div>
  )
}

// ── Toggle notification ───────────────────────────────────────
function NotifToggle({ label, description, defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9, flexShrink: 0,
          background: '#E5F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Bell size={15} style={{ color: '#007FE1' }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#1c1917', margin: 0 }}>{label}</p>
          <p style={{ fontSize: 12, color: '#a8a29e', margin: '1px 0 0' }}>{description}</p>
        </div>
      </div>
      {/* Toggle switch */}
      <button
        onClick={() => setOn(v => !v)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none',
          background: on ? '#007FE1' : '#e7e5e4',
          cursor: 'pointer', position: 'relative', flexShrink: 0,
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: 3,
          left: on ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  )
}
