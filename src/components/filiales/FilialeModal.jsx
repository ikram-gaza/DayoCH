import { useMemo, useState } from 'react'
import { X, Building2, MapPin, Hash, Mail, Phone, Globe, Landmark, Wallet, Clock, Link2 } from 'lucide-react'
import { City, Country } from 'country-state-city'

const TOUS_LES_PAYS = [...Country.getAllCountries()].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
const TOUTES_LES_DEVISES = [...new Set(TOUS_LES_PAYS.map((p) => p.currency).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr'))

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

const normaliser = (valeur) => (valeur || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

function trouverPays(nomPays) {
  if (!nomPays) return null
  return (
    TOUS_LES_PAYS.find((p) => p.name === nomPays)
    || TOUS_LES_PAYS.find((p) => normaliser(p.name) === normaliser(nomPays))
    || TOUS_LES_PAYS.find((p) => p.isoCode === nomPays)
    || null
  )
}

export default function FilialeModal({ isOpen, onClose, filiale, filiales = [], parentParDefaut = '', onSubmit }) {
  const estEdition = Boolean(filiale)
  const parentSource = !estEdition
    ? (filiales || []).find((f) => String(f.id) === String(parentParDefaut))
    : null
  const [code, setCode] = useState(filiale?.code || '')
  const [nom, setNom] = useState(filiale?.nom || '')
  const [pays, setPays] = useState(filiale?.pays || parentSource?.pays || '')
  const [ville, setVille] = useState(filiale?.ville || '')
  const [adresse, setAdresse] = useState(filiale?.adresse || '')
  const [email, setEmail] = useState(filiale?.email || '')
  const [telephone, setTelephone] = useState(filiale?.telephone || '')
  const [raisonSociale, setRaisonSociale] = useState(filiale?.raisonSociale || '')
  const [devise, setDevise] = useState(filiale?.devise || parentSource?.devise || '')
  const [timezone, setTimezone] = useState(filiale?.timezone || parentSource?.timezone || '')
  const [parentId, setParentId] = useState(filiale?.parentId || parentParDefaut || '')
  const [actif, setActif] = useState(filiale?.actif !== false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const parentsDisponibles = useMemo(
    () => (filiales || []).filter((f) => f && f.id && f.id !== filiale?.id),
    [filiales, filiale?.id],
  )

  const paysSelectionne = useMemo(() => trouverPays(pays), [pays])

  const villesOptions = useMemo(() => {
    if (!paysSelectionne) return []
    return City.getCitiesOfCountry(paysSelectionne.isoCode) || []
  }, [paysSelectionne])

  const timezonesOptions = useMemo(() => {
    if (paysSelectionne?.timezones?.length) return paysSelectionne.timezones.map((t) => t.zoneName).filter(Boolean)
    return []
  }, [paysSelectionne])

  if (!isOpen) return null

  const handlePaysChange = (valeur) => {
    const precedent = paysSelectionne
    setPays(valeur)
    const nouveau = trouverPays(valeur)
    if (nouveau && nouveau.isoCode !== precedent?.isoCode) {
      setVille('')
      if (nouveau.currency) setDevise(nouveau.currency)
      const tz = nouveau.timezones?.[0]?.zoneName
      if (tz) setTimezone(tz)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!nom.trim() || !pays.trim() || (!estEdition && !code.trim())) {
      setError('Code, nom et pays sont obligatoires.')
      return
    }

    setSubmitting(true)
    try {
      const resultat = await onSubmit({
        code,
        nom,
        pays,
        ville,
        adresse,
        email,
        telephone,
        raisonSociale,
        devise,
        timezone,
        parentId: parentId || null,
        actif,
      })
      if (resultat !== false) onClose()
    } catch {
      setError("Impossible d'enregistrer la filiale.")
    } finally {
      setSubmitting(false)
    }
  }

  const paysConnu = Boolean(paysSelectionne)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(28,25,23,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: 620, maxHeight: '92vh', overflowY: 'auto', background: 'white', borderRadius: 20, border: '1px solid #e7e5e4', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }} onClick={(e) => e.stopPropagation()}>
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

            <Field label="Pays" id="pays" icon={Globe} required>
              {(pl) => (
                <select id="pays" value={paysConnu ? paysSelectionne.name : pays} onChange={(e) => handlePaysChange(e.target.value)} style={{ ...inputStyle(pl), height: 38, cursor: 'pointer' }}>
                  <option value="">Sélectionner un pays</option>
                  {!paysConnu && pays && <option value={pays}>{pays}</option>}
                  {TOUS_LES_PAYS.map((p) => (
                    <option key={p.isoCode} value={p.name}>{p.name}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="Ville" id="ville" icon={MapPin}>
              {(pl) => (
                <>
                  <input
                    id="ville"
                    list="modal-filiale-villes"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder={paysConnu ? 'Sélectionner ou saisir une ville' : "Sélectionnez d'abord un pays"}
                    disabled={!pays && villesOptions.length === 0}
                    style={{ ...inputStyle(pl), background: (!pays && villesOptions.length === 0) ? '#fafaf9' : 'white' }}
                  />
                  <datalist id="modal-filiale-villes">
                    {villesOptions.map((v, i) => (
                      <option key={`${v.name}-${v.stateCode || ''}-${i}`} value={v.name} />
                    ))}
                  </datalist>
                </>
              )}
            </Field>

            <Field label="Raison sociale" id="raisonSociale" icon={Landmark}>
              {(pl) => <input id="raisonSociale" value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} style={inputStyle(pl)} />}
            </Field>
            <Field label="Filiale parente" id="parentId" icon={Link2}>
              {(pl) => (
                <select id="parentId" value={parentId || ''} onChange={(e) => setParentId(e.target.value)} style={{ ...inputStyle(pl), height: 38, cursor: 'pointer' }}>
                  <option value="">Aucune (racine)</option>
                  {parentsDisponibles.map((f) => <option key={f.id} value={f.id}>{f.nom}{f.code ? ` (${f.code})` : ''}</option>)}
                </select>
              )}
            </Field>

            <Field label="E-mail" id="email" icon={Mail}>
              {(pl) => <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle(pl)} />}
            </Field>
            <Field label="Téléphone" id="telephone" icon={Phone}>
              {(pl) => <input id="telephone" value={telephone} onChange={(e) => setTelephone(e.target.value)} style={inputStyle(pl)} />}
            </Field>

            <Field label="Devise" id="devise" icon={Wallet}>
              {(pl) => (
                <>
                  <input id="devise" list="modal-filiale-devises" value={devise} onChange={(e) => setDevise(e.target.value)} placeholder="Ex: XOF" style={inputStyle(pl)} />
                  <datalist id="modal-filiale-devises">
                    {TOUTES_LES_DEVISES.map((d) => <option key={d} value={d} />)}
                  </datalist>
                </>
              )}
            </Field>
            <Field label="Fuseau horaire" id="timezone" icon={Clock}>
              {(pl) => (
                <>
                  <input id="timezone" list="modal-filiale-timezones" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="Ex: Africa/Porto-Novo" style={inputStyle(pl)} />
                  <datalist id="modal-filiale-timezones">
                    {(timezonesOptions.length ? timezonesOptions : (paysSelectionne ? [] : [])).map((t) => <option key={t} value={t} />)}
                    {!timezonesOptions.length && timezone ? <option value={timezone} /> : null}
                  </datalist>
                </>
              )}
            </Field>

            <Field label="Adresse" id="adresse" icon={MapPin} full>
              {(pl) => <input id="adresse" value={adresse} onChange={(e) => setAdresse(e.target.value)} style={inputStyle(pl)} />}
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
