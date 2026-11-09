import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Calendar, 
  Package, 
  MessageSquare, 
  GraduationCap,
  BarChart3,
  Users,
  Briefcase,
  ClipboardCheck,
  Settings,
  LogOut,
  Warehouse
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Configuration des menus selon les rôles
const menuConfig = {
  employe: [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mes Congés', path: '/conges', icon: Calendar },
    { label: 'Fournitures', path: '/fournitures', icon: Package },
    { label: 'Sollicitations', path: '/sollicitations', icon: MessageSquare },
    { label: 'Formations', path: '/formations', icon: GraduationCap },
    { label: 'Mon Profil', path: '/profil', icon: Settings },
  ],
  manager: [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Validation Congés', path: '/conges', icon: Calendar },
    { label: 'Validation Fournitures', path: '/fournitures', icon: Package },
    { label: 'Évaluations', path: '/evaluations', icon: ClipboardCheck },
    { label: 'Formations', path: '/formations', icon: GraduationCap },
    { label: 'Mon Équipe', path: '/equipe', icon: Users },
    { label: 'Mon Profil', path: '/profil', icon: Settings },
  ],
  gestionnaire_stock: [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Gestion du Stock', path: '/stock', icon: Warehouse },
    { label: 'Traçabilité', path: '/tracabilite', icon: Package },
    { label: 'Demandes', path: '/demandes-fournitures', icon: MessageSquare },
    { label: 'Alertes', path: '/alertes', icon: BarChart3 },
    { label: 'Mon Profil', path: '/profil', icon: Settings },
  ],
  super_admin: [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Gestion Utilisateurs', path: '/utilisateurs', icon: Users },
    { label: 'Organigramme', path: '/organigramme', icon: Briefcase },
    { label: 'Filiales', path: '/filiales', icon: LayoutDashboard },
    { label: 'Statistiques', path: '/statistiques', icon: BarChart3 },
    { label: 'Évaluations', path: '/evaluations', icon: ClipboardCheck },
    { label: 'Formations & Quiz', path: '/formations', icon: GraduationCap },
    { label: 'Paramètres', path: '/parametres', icon: Settings },
  ],
}

function Sidebar({ onLogout }) {
  const { user } = useAuth()
  
  // Récupérer le menu selon le rôle
  const menuItems = menuConfig[user?.role] || menuConfig.employe

  return (
    <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col h-screen">
      
      {/* Header avec logo */}
      <div className="h-20 border-b border-gray-200/50 flex items-center px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#007FE1] to-[#0066C0] rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-lg font-bold">D</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#000000] text-lg font-semibold tracking-tight">Dayo</span>
            <span className="text-[10px] font-medium text-[#6e6e73] tracking-wider uppercase">Capital Humain</span>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#007FE1] to-[#0066C0] text-white shadow-lg shadow-blue-500/25'
                        : 'text-[#1d1d1f] hover:bg-gray-100/80 active:scale-[0.98]'
                    }`
                  }
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110`} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer : User info + Déconnexion */}
      <div className="border-t border-gray-200/50 p-5">
        {/* Info utilisateur */}
        <div className="mb-4 px-3 py-3 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#007FE1] to-[#0066C0] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1d1d1f] truncate leading-tight">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-[#6e6e73] truncate">{user?.filiale}</p>
            </div>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 bg-white text-[#007FE1] text-[10px] font-semibold rounded-lg uppercase tracking-wide shadow-sm">
            {user?.role?.replace('_', ' ')}
          </span>
        </div>

        {/* Bouton déconnexion */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[#F24333] hover:bg-red-50 rounded-xl transition-all active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>Se déconnecter</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
