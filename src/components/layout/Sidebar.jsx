import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Package, MessageSquare,
  GraduationCap, BarChart3, Users, Briefcase,
  ClipboardCheck, Settings, LogOut, Warehouse,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const menuConfig = {
  employe: [
    { label: 'Tableau de bord', path: '/dashboard',     icon: LayoutDashboard },
    { label: 'Mes congés',      path: '/conges',         icon: Calendar },
    { label: 'Fournitures',     path: '/fournitures',    icon: Package },
    { label: 'Sollicitations',  path: '/sollicitations', icon: MessageSquare },
    { label: 'Formations',      path: '/formations',     icon: GraduationCap },
    { label: 'Paramètres',      path: '/profil',         icon: Settings },
  ],
  manager: [
    { label: 'Tableau de bord', path: '/dashboard',   icon: LayoutDashboard },
    { label: 'Congés',          path: '/conges',       icon: Calendar },
    { label: 'Fournitures',     path: '/fournitures',  icon: Package },
    { label: 'Évaluations',     path: '/evaluations',  icon: ClipboardCheck },
    { label: 'Formations',      path: '/formations',   icon: GraduationCap },
    { label: 'Mon équipe',      path: '/equipe',       icon: Users },
    { label: 'Paramètres',      path: '/profil',       icon: Settings },
  ],
  gestionnaire_stock: [
    { label: 'Tableau de bord',  path: '/dashboard',            icon: LayoutDashboard },
    { label: 'Gestion du stock', path: '/stock',                icon: Warehouse },
    { label: 'Traçabilité',      path: '/tracabilite',          icon: Package },
    { label: 'Demandes',         path: '/demandes-fournitures', icon: MessageSquare },
    { label: 'Alertes',          path: '/alertes',              icon: BarChart3 },
    { label: 'Paramètres',       path: '/profil',               icon: Settings },
  ],
  super_admin: [
    { label: 'Tableau de bord', path: '/dashboard',    icon: LayoutDashboard },
    { label: 'Utilisateurs',    path: '/utilisateurs', icon: Users },
    { label: 'Organigramme',    path: '/organigramme', icon: Briefcase },
    { label: 'Filiales',        path: '/filiales',     icon: LayoutDashboard },
    { label: 'Statistiques',    path: '/statistiques', icon: BarChart3 },
    { label: 'Évaluations',     path: '/evaluations',  icon: ClipboardCheck },
    { label: 'Formations',      path: '/formations',   icon: GraduationCap },
    { label: 'Paramètres',      path: '/parametres',   icon: Settings },
  ],
}

const roleLabels = {
  employe:            'Employé',
  manager:            'Manager',
  gestionnaire_stock: 'Gestionnaire stock',
  super_admin:        'Super administrateur',
}

// Couleur avatar stable selon le nom
const AVATAR_COLORS = [
  { bg: '#E5F2FD', text: '#007FE1' },
  { bg: '#dcfce7', text: '#16a34a' },
  { bg: '#fef9c3', text: '#a16207' },
  { bg: '#f3e8ff', text: '#7e22ce' },
  { bg: '#f1f5f9', text: '#475569' },
]

function getAvatarColor(name) {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[sum % AVATAR_COLORS.length]
}

export default function Sidebar({ onLogout }) {
  const { user } = useAuth()
  const menuItems = menuConfig[user?.role] || menuConfig.employe
  const fullName = `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim()
  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')
  const avatarColor = getAvatarColor(fullName || 'U')

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0,
      width: 256, display: 'flex', flexDirection: 'column',
      background: 'white', borderRight: '1px solid #e7e5e4',
      zIndex: 30,
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '24px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, #007FE1, #00509A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,127,225,0.3)',
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 18, fontStyle: 'italic', fontFamily: 'Lora, Georgia, serif' }}>D</span>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: '#1c1917', fontFamily: 'Lora, Georgia, serif', letterSpacing: '-0.3px' }}>Dayo RH</p>
            <p style={{ fontSize: 10, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>Capital Humain</p>
          </div>
        </div>

        {/* Filiale */}
        <div style={{
          marginTop: 14,
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F0F8FF', borderRadius: 12,
          border: '1px solid rgba(0,127,225,0.15)',
          padding: '8px 12px',
        }}>
          <span style={{ fontSize: 14 }}>🏢</span>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#007FE1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.filiale}
          </p>
        </div>
      </div>

      {/* Séparateur */}
      <div style={{ margin: '0 16px', height: 1, background: '#f5f5f4' }} />

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '9px 12px', borderRadius: 12,
              fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s',
              ...(isActive
                ? {
                    background: 'linear-gradient(135deg, #007FE1, #0066C0)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0,127,225,0.25)',
                  }
                : {
                    color: '#57534e',
                    background: 'transparent',
                  }),
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={16} style={{ flexShrink: 0, color: isActive ? 'white' : '#a8a29e' }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Utilisateur + déconnexion ── */}
      <div style={{ borderTop: '1px solid #f5f5f4', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Info user */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fafaf9', borderRadius: 12, padding: '10px 12px',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            background: avatarColor.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: avatarColor.text,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1c1917', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fullName}
            </p>
            <p style={{ fontSize: 11, color: '#78716c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {roleLabels[user?.role] ?? user?.role}
            </p>
          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', padding: '8px 12px', borderRadius: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#78716c',
            transition: 'all 0.15s', textAlign: 'left',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F1'; e.currentTarget.style.color = '#dc2626' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#78716c' }}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
