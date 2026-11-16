import { useState } from 'react'
import { X, UserCog, UserPlus } from 'lucide-react'
import { getFilialeOptions } from '../../config/filiales'
import { filialesEmploye } from '../../utils/organigramme'

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

const helperStyle = {
  fontSize: 11, lineHeight: 1.45, color: '#a8a29e',
  margin: '6px 0 0',
}

function focusBorder(e) {
  e.target.style.borderColor = '#007FE1'
  e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.12)'
}

function blurBorder(e) {
  e.target.style.borderColor = '#d6d3d1'
  e.target.style.boxShadow = 'none'
}

function EmployeeModal({ employee, employees, onClose, onSave, filialeCourante = null }) {
  const estModification = Boolean(employee?.id)
  const filialePrincipale = estModification
    ? (employee?.filiale || filialeCourante || '')
    : (filialeCourante || '')
  const filialesInitiales = Array.from(new Set([
    filialePrincipale,
    ...(estModification
      ? filialesEmploye(employee)
      : (filialeCourante ? [filialeCourante] : [])),
  ].filter(Boolean)))
  const [formData, setFormData] = useState({
    id: employee?.id || null,
    nom: employee?.nom || '',
    prenom: employee?.prenom || '',
    email: employee?.email || '',
    telephone: employee?.telephone || '',
    poste: employee?.poste || '',
    filiale: filialePrincipale,
    filiales: filialesInitiales,
    responsableId: employee?.responsableId || null,
    matricule: employee?.matricule || '',
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFilialeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      filiale: value,
      filiales: Array.from(new Set([
        value,
        ...prev.filiales.filter(filiale => filiale !== prev.filiale && filiale !== value),
      ])),
    }))
  }

  const toggleFiliale = (nom) => {
    setFormData(prev => {
      if (nom === prev.filiale) return prev

      return {
        ...prev,
        filiales: prev.filiales.includes(nom)
          ? prev.filiales.filter(filiale => filiale !== nom)
          : [...prev.filiales, nom],
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const filiales = Array.from(new Set([
      formData.filiale,
      ...formData.filiales,
    ].filter(Boolean)))
    onSave({ ...formData, filiales })
  }

  const filialesSupplementaires = getFilialeOptions()
    .filter(option => option.label !== formData.filiale)
  const filialesActuelles = formData.filiales.length > 0
    ? formData.filiales
    : [formData.filiale].filter(Boolean)
  const availableManagers = employees.filter(emp => {
    if (emp.id === employee?.id) return false
    if (emp.id === formData.responsableId) return true
    return filialesEmploye(emp).some(filiale => filialesActuelles.includes(filiale))
  })
  const initiales = `${employee?.prenom?.[0] || ''}${employee?.nom?.[0] || ''}`.toUpperCase()

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: 'white', borderRadius: 20, width: '100%', maxWidth: 680,
          boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
          maxHeight: '90vh', overflowY: 'auto',
          border: '1px solid #e7e5e4',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f5f5f4', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <span style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: '#E5F2FD', color: '#007FE1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700,
            }}>
              {estModification
                ? (initiales || <UserCog size={20} />)
                : <UserPlus size={20} />}
            </span>
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: 0 }}>
                {estModification ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
              </h2>
              <p style={{ fontSize: 13, color: '#78716c', margin: '3px 0 0' }}>
                {estModification
                  ? `${employee.matricule || 'Sans matricule'} · ${employee.poste || 'Poste non renseigné'}`
                  : 'Créez un profil et rattachez-le à une ou plusieurs filiales.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none', flexShrink: 0,
              background: '#f5f5f4', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#78716c',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="employee-prenom" style={labelStyle}>
                Prénom <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="employee-prenom"
                type="text"
                value={formData.prenom}
                onChange={(e) => handleChange('prenom', e.target.value)}
                required
                placeholder="Boris"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
            <div>
              <label htmlFor="employee-nom" style={labelStyle}>
                Nom <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="employee-nom"
                type="text"
                value={formData.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                required
                placeholder="KOTCHOFA"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="employee-email" style={labelStyle}>
                E-mail <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="employee-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="prenom.nom@dayo.africa"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
            <div>
              <label htmlFor="employee-telephone" style={labelStyle}>Téléphone</label>
              <input
                id="employee-telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleChange('telephone', e.target.value)}
                placeholder="+229 97 00 00 00"
                style={inputStyle}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>
          </div>

          <div>
            <label htmlFor="employee-poste" style={labelStyle}>
              Poste <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              id="employee-poste"
              type="text"
              value={formData.poste}
              onChange={(e) => handleChange('poste', e.target.value)}
              required
              placeholder="Directeur Général"
              style={inputStyle}
              onFocus={focusBorder}
              onBlur={blurBorder}
            />
          </div>

          <div>
            <label htmlFor="employee-filiale" style={labelStyle}>
              Filiale principale <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              id="employee-filiale"
              value={formData.filiale}
              onChange={(e) => handleFilialeChange(e.target.value)}
              required
              disabled={Boolean(filialeCourante)}
              style={{
                ...inputStyle,
                cursor: filialeCourante ? 'not-allowed' : 'pointer',
                background: filialeCourante ? '#f5f5f4' : 'white',
                color: filialeCourante ? '#78716c' : '#1c1917',
              }}
            >
              <option value="">-- Sélectionner une filiale --</option>
              {getFilialeOptions().map(option => (
                <option key={option.value} value={option.label}>
                  {option.label} ({option.code})
                </option>
              ))}
            </select>
            <p style={helperStyle}>
              {filialeCourante
                ? 'Filiale principale verrouillée. Cochez ci-dessous les autres filiales couvertes.'
                : "Filiale principale de rattachement du collaborateur."}
            </p>
          </div>

          {filialesSupplementaires.length > 0 && (
            <div>
              <span style={labelStyle}>Autres filiales rattachées</span>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                border: '1px solid #e7e5e4', borderRadius: 12,
                background: '#fafaf9', padding: 14,
              }}>
                {filialesSupplementaires.map(option => (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontSize: 13, color: '#57534e', cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.filiales.includes(option.label)}
                      onChange={() => toggleFiliale(option.label)}
                      style={{ width: 16, height: 16, accentColor: '#007FE1', cursor: 'pointer' }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              <p style={helperStyle}>
                Une personne peut couvrir plusieurs filiales, par exemple un directeur général partagé.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="employee-responsable" style={labelStyle}>
              Responsable hiérarchique (N+1)
            </label>
            <select
              id="employee-responsable"
              value={formData.responsableId || ''}
              onChange={(e) => handleChange('responsableId', e.target.value ? parseInt(e.target.value) : null)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">-- Aucun (poste racine) --</option>
              {availableManagers.map(mgr => (
                <option key={mgr.id} value={mgr.id}>
                  {mgr.prenom} {mgr.nom} ({mgr.poste})
                </option>
              ))}
            </select>
            <p style={helperStyle}>
              Ce champ définit le circuit de validation automatique des demandes.
            </p>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            marginTop: 4, paddingTop: 18, borderTop: '1px solid #f5f5f4',
          }}>
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
              {estModification ? 'Enregistrer les modifications' : 'Créer le collaborateur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmployeeModal
