import { useEffect, useState, useMemo } from 'react'
import {
  Users, UserPlus, Search, Pencil, KeyRound, ShieldCheck, ShieldOff,
  UserCheck, UserX, Trash2, CheckCircle2, AlertCircle, Mail, Phone,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  utilisateursService,
  infoRole,
  messageErreur,
  STATUTS_UTILISATEUR,
} from '../../services/utilisateursService'
import UtilisateurModal from '../../components/utilisateurs/UtilisateurModal'

const AVATAR_COLORS = [
  { bg: '#E5F2FD', text: '#007FE1' },
  { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fef9c3', text: '#a16207' },
  { bg: '#f3e8ff', text: '#7e22ce' },
  { bg: '#f1f5f9', text: '#475569' },
]

function avatarColor(name) {
  const sum = [...(name || 'U')].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

function initiales(prenom, nom) {
  return `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase()
}

function StatCard({ label, value, hint, icon: Icon, color, bg }) {
  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: '18px 20px',
      border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span style={{
          width: 32, height: 32, borderRadius: 10, background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          <Icon size={16} />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#1c1917' }}>{value}</span>
        {hint && <span style={{ fontSize: 12, color: '#78716c' }}>{hint}</span>}
      </div>
    </div>
  )
}

function IconAction({ title, onClick, color, hoverBg, disabled, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 30, height: 30, borderRadius: 8, border: 'none',
        background: 'transparent', color: disabled ? '#d6d3d1' : color,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = hoverBg }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

export default function UtilisateursPage() {
  const { user } = useAuth()

  const [utilisateurs, setUtilisateurs] = useState([])
  const [rolesDisponibles, setRolesDisponibles] = useState(() => utilisateursService.getRolesDisponibles())
  const [filiales, setFiliales] = useState(() => utilisateursService.getFilialesDisponibles())
  const [chargement, setChargement] = useState(true)
  const [erreurChargement, setErreurChargement] = useState('')
  const [recherche, setRecherche] = useState('')
  const [filtreRole, setFiltreRole] = useState('all')
  const [filtreFiliale, setFiltreFiliale] = useState('all')
  const [filtreStatut, setFiltreStatut] = useState('all')

  const [showModal, setShowModal] = useState(false)
  const [edition, setEdition] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const recharger = async () => {
    const liste = await utilisateursService.lister()
    setUtilisateurs([...liste])
  }

  useEffect(() => {
    let actif = true
    const charger = async () => {
      setChargement(true)
      setErreurChargement('')
      try {
        const [liste, roles, filialesChargees] = await Promise.all([
          utilisateursService.lister(),
          utilisateursService.listerRoles(),
          utilisateursService.listerFiliales(),
        ])
        if (!actif) return
        setUtilisateurs([...liste])
        setRolesDisponibles(roles)
        setFiliales(filialesChargees)
      } catch (echec) {
        if (actif) setErreurChargement(messageErreur(echec))
      } finally {
        if (actif) setChargement(false)
      }
    }
    charger()
    return () => { actif = false }
  }, [])

  const afficherToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const stats = useMemo(() => utilisateursService.getStats(utilisateurs), [utilisateurs])

  const listeFiltree = useMemo(() => {
    const terme = recherche.trim().toLowerCase()
    return utilisateurs.filter((u) => {
      const matchRecherche = terme === '' ||
        u.nom?.toLowerCase().includes(terme) ||
        u.prenom?.toLowerCase().includes(terme) ||
        u.email?.toLowerCase().includes(terme) ||
        u.matricule?.toLowerCase().includes(terme) ||
        u.poste?.toLowerCase().includes(terme)
      const matchRole = filtreRole === 'all' || u.role === filtreRole
      const matchFiliale = filtreFiliale === 'all' || u.filiale === filtreFiliale || String(u.filialeId) === String(filtreFiliale)
      const matchStatut = filtreStatut === 'all' || u.statut === filtreStatut
      return matchRecherche && matchRole && matchFiliale && matchStatut
    })
  }, [utilisateurs, recherche, filtreRole, filtreFiliale, filtreStatut])

  const ouvrirCreation = () => { setEdition(null); setShowModal(true) }
  const ouvrirEdition = (u) => { setEdition(u); setShowModal(true) }

  const handleSubmit = async (data) => {
    try {
      if (edition) {
        await utilisateursService.modifier(edition.id, data)
        afficherToast('Collaborateur mis à jour avec succès.')
      } else {
        await utilisateursService.creer(data)
        afficherToast('Collaborateur créé avec succès.')
      }
      await recharger()
      return true
    } catch (echec) {
      afficherToast(`Erreur : ${messageErreur(echec)}`)
      return false
    }
  }

  const handleBasculerStatut = async (u) => {
    const activer = u.statut !== 'actif'
    if (!activer && !window.confirm(`Désactiver le compte de ${u.prenom} ${u.nom} ? Il ne pourra plus se connecter.`)) return
    try {
      await utilisateursService.changerStatut(u.id, activer ? 'actif' : 'inactif')
      await recharger()
      afficherToast(activer ? 'Compte réactivé.' : 'Compte désactivé.')
    } catch (echec) {
      afficherToast(`Erreur : ${messageErreur(echec)}`)
    }
  }

  const handleBasculer2FA = async (u) => {
    try {
      await utilisateursService.basculer2FA(u.id, !u.twoFactorEnabled)
      await recharger()
      afficherToast(u.twoFactorEnabled ? 'Double authentification désactivée.' : 'Double authentification activée.')
    } catch (echec) {
      afficherToast(`Erreur : ${messageErreur(echec)}`)
    }
  }

  const handleReinitialiser = async (u) => {
    if (!window.confirm(`Réinitialiser le mot de passe de ${u.prenom} ${u.nom} ?`)) return
    try {
      const motDePasse = await utilisateursService.reinitialiserMotDePasse(u.id)
      if (motDePasse) {
        window.alert(
          `Mot de passe temporaire pour ${u.prenom} ${u.nom} :\n\n${motDePasse}\n\n` +
          'Communiquez-le au collaborateur, il devra le changer à la première connexion.'
        )
      } else {
        window.alert(`La demande de réinitialisation de ${u.prenom} ${u.nom} a été enregistrée.`)
      }
      afficherToast('Réinitialisation du mot de passe traitée.')
    } catch (echec) {
      afficherToast(`Erreur : ${messageErreur(echec)}`)
    }
  }

  const handleSupprimer = async (u) => {
    if (!window.confirm(`Supprimer définitivement le compte de ${u.prenom} ${u.nom} ?`)) return
    try {
      await utilisateursService.supprimer(u.id)
      await recharger()
      afficherToast('Collaborateur supprimé.')
    } catch (echec) {
      afficherToast(`Erreur : ${messageErreur(echec)}`)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: '#1c1917', color: 'white', padding: '12px 20px',
          borderRadius: 14, fontSize: 13, fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Users size={24} style={{ color: '#007FE1' }} />
            Gestion des utilisateurs
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            Gérez les comptes, les rôles et les accès des collaborateurs du Groupe Dayo.
          </p>
        </div>
        <button
          onClick={ouvrirCreation}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #007FE1, #0066C0)',
            color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)',
          }}
        >
          <UserPlus size={16} />
          Nouvel utilisateur
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <StatCard label="Collaborateurs" value={stats.total} hint="comptes" icon={Users} color="#007FE1" bg="#E5F2FD" />
        <StatCard label="Actifs" value={stats.actifs} hint="en poste" icon={UserCheck} color="#15803d" bg="#dcfce7" />
        <StatCard label="Inactifs / suspendus" value={stats.inactifs} hint="comptes" icon={UserX} color="#b91c1c" bg="#FEF2F1" />
        <StatCard label="2FA activée" value={stats.deuxFA} hint="comptes sécurisés" icon={ShieldCheck} color="#7c3aed" bg="#f3e8ff" />
      </div>

      <div style={{
        background: 'white', borderRadius: 14, padding: '14px 18px',
        border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 240, maxWidth: 360 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un nom, e-mail, matricule…"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '9px 12px 9px 34px', fontSize: 13, borderRadius: 10,
                border: '1px solid #e7e5e4', outline: 'none', color: '#1c1917',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select
            value={filtreRole}
            onChange={(e) => setFiltreRole(e.target.value)}
            style={{
              padding: '9px 12px', fontSize: 13, borderRadius: 10,
              border: '1px solid #e7e5e4', background: 'white', color: '#57534e',
              fontWeight: 600, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="all">Tous les rôles</option>
            {rolesDisponibles.map((r) => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>

          <select
            value={filtreFiliale}
            onChange={(e) => setFiltreFiliale(e.target.value)}
            style={{
              padding: '9px 12px', fontSize: 13, borderRadius: 10,
              border: '1px solid #e7e5e4', background: 'white', color: '#57534e',
              fontWeight: 600, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="all">Toutes les filiales</option>
            {filiales.map((f) => (
              <option key={f.id || f.code || f.nom} value={f.nom}>{f.nom}</option>
            ))}
          </select>

          <select
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
            style={{
              padding: '9px 12px', fontSize: 13, borderRadius: 10,
              border: '1px solid #e7e5e4', background: 'white', color: '#57534e',
              fontWeight: 600, cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUTS_UTILISATEUR).map(([id, s]) => (
              <option key={id} value={id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {erreurChargement && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#FEF2F1', border: '1px solid #fecaca',
          borderRadius: 12, padding: '10px 14px', color: '#b91c1c', fontSize: 13,
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{erreurChargement}</span>
          <button
            type="button"
            onClick={recharger}
            style={{
              border: '1px solid #fecaca', background: 'white', color: '#b91c1c',
              padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
        </div>
      )}

      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
            <thead>
              <tr style={{ background: '#fafaf9', borderBottom: '1px solid #e7e5e4' }}>
                {['Collaborateur', 'Rôle', 'Filiale', 'Matricule', 'Statut', '2FA', 'Actions'].map((h) => (
                  <th key={h} style={{
                    textAlign: h === 'Actions' ? 'right' : 'left',
                    padding: '12px 16px', fontSize: 11, fontWeight: 700,
                    color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chargement && (
                <tr>
                  <td colSpan={7} style={{ padding: '28px 16px', textAlign: 'center', color: '#78716c', fontSize: 13 }}>
                    Chargement des collaborateurs…
                  </td>
                </tr>
              )}
              {!chargement && listeFiltree.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '28px 16px', textAlign: 'center', color: '#78716c', fontSize: 13 }}>
                    Aucun collaborateur ne correspond aux critères.
                  </td>
                </tr>
              )}
              {!chargement && listeFiltree.map((u) => {
                const role = infoRole(u.role)
                const statut = STATUTS_UTILISATEUR[u.statut] || STATUTS_UTILISATEUR.actif
                const avatar = avatarColor(`${u.prenom} ${u.nom}`)
                const estMoi = String(u.id) === String(user?.id)

                return (
                  <tr
                    key={u.id}
                    style={{ borderBottom: '1px solid #f5f5f4', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F8FF' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'white' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                          background: avatar.bg, color: avatar.text,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700,
                        }}>
                          {initiales(u.prenom, u.nom)}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                            {u.prenom} {u.nom}
                            {estMoi && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#007FE1', background: '#E5F2FD', padding: '1px 6px', borderRadius: 6 }}>
                                Vous
                              </span>
                            )}
                          </p>
                          <p style={{ fontSize: 11, color: '#78716c', margin: '1px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Mail size={10} /> {u.email || '—'}
                          </p>
                          <p style={{ fontSize: 11, color: '#a8a29e', margin: '1px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Phone size={10} /> {u.poste || '—'}{u.telephone ? ` · ${u.telephone}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                        color: role.color, background: role.bg,
                      }}>
                        {role.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#57534e', whiteSpace: 'nowrap' }}>{u.filiale || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#57534e', fontWeight: 600, whiteSpace: 'nowrap' }}>{u.matricule || '—'}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                        color: statut.color, background: statut.bg,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: statut.dot }} />
                        {statut.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      {u.twoFactorEnabled ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#15803d' }}>
                          <ShieldCheck size={14} /> Activée
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: '#a8a29e' }}>
                          <ShieldOff size={14} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                        <IconAction title="Modifier" onClick={() => ouvrirEdition(u)} color="#007FE1" hoverBg="#E5F2FD"><Pencil size={15} /></IconAction>
                        <IconAction title="Réinitialiser le mot de passe" onClick={() => handleReinitialiser(u)} color="#a16207" hoverBg="#fef9c3"><KeyRound size={15} /></IconAction>
                        <IconAction title={u.twoFactorEnabled ? 'Désactiver la 2FA' : 'Activer la 2FA'} onClick={() => handleBasculer2FA(u)} color="#7c3aed" hoverBg="#f3e8ff">{u.twoFactorEnabled ? <ShieldOff size={15} /> : <ShieldCheck size={15} />}</IconAction>
                        <IconAction title={u.statut === 'actif' ? 'Désactiver le compte' : 'Réactiver le compte'} onClick={() => handleBasculerStatut(u)} color={u.statut === 'actif' ? '#b91c1c' : '#15803d'} hoverBg={u.statut === 'actif' ? '#FEF2F1' : '#dcfce7'}>{u.statut === 'actif' ? <UserX size={15} /> : <UserCheck size={15} />}</IconAction>
                        <IconAction title="Supprimer" onClick={() => handleSupprimer(u)} color="#b91c1c" hoverBg="#FEF2F1" disabled={estMoi}><Trash2 size={15} /></IconAction>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <UtilisateurModal
          key={edition?.id || 'nouveau'}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          utilisateur={edition}
          onSubmit={handleSubmit}
          utilisateurs={utilisateurs}
          roles={rolesDisponibles}
          filiales={filiales}
          isMock={false}
        />
      )}
    </div>
  )
}
