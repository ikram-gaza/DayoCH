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
  Warehouse,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const menuConfig = {
  employe: [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Mes congés', path: '/conges', icon: Calendar },
    { label: 'Fournitures', path: '/fournitures', icon: Package },
    { label: 'Sollicitations', path: '/sollicitations', icon: MessageSquare },
    { label: 'Formations', path: '/formations', icon: GraduationCap },
    { label: 'Paramètres', path: '/profil', icon: Settings },
  ],
  manager: [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Congés', path: '/conges', icon: Calendar },
    { label: 'Fournitures', path: '/fournitures', icon: Package },
    { label: 'Évaluations', path: '/evaluations', icon: ClipboardCheck },
    { label: 'Formations', path: '/formations', icon: GraduationCap },
    { label: 'Mon équipe', path: '/equipe', icon: Users },
    { label: 'Paramètres', path: '/profil', icon: Settings },
  ],
  gestionnaire_stock: [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Gestion du stock', path: '/stock', icon: Warehouse },
    { label: 'Traçabilité', path: '/tracabilite', icon: Package },
    { label: 'Demandes', path: '/demandes-fournitures', icon: MessageSquare },
    { label: 'Alertes', path: '/alertes', icon: BarChart3 },
    { label: 'Paramètres', path: '/profil', icon: Settings },
  ],
  super_admin: [
    { label: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Utilisateurs', path: '/utilisateurs', icon: Users },
    { label: 'Organigramme', path: '/organigramme', icon: Briefcase },
    { label: 'Filiales', path: '/filiales', icon: LayoutDashboard },
    { label: 'Statistiques', path: '/statistiques', icon: BarChart3 },
    { label: 'Évaluations', path: '/evaluations', icon: ClipboardCheck },
    { label: 'Formations', path: '/formations', icon: GraduationCap },
    { label: 'Paramètres', path: '/parametres', icon: Settings },
  ],
}

const roleLabels = {
  employe: 'Employé',
  manager: 'Manager',
  gestionnaire_stock: 'Gestionnaire stock',
  super_admin: 'Super administrateur',
}

export default function Sidebar({ onLogout }) {
  const { user } = useAuth()
  const menuItems = menuConfig[user?.role] || menuConfig.employe
  const initials = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase()

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-stone-200 bg-white lg:flex">

      {/* Logo */}
      <div className="px-5 pb-4 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#007FE1] shadow-sm">
            <span className="text-sm font-bold leading-none text-white">D</span>
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight tracking-tight text-stone-900">Dayo RH</p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-stone-400">Capital Humain</p>
          </div>
        </div>

        {/* Nom de la filiale */}
        <p className="mt-4 truncate rounded-xl bg-stone-100 px-3 py-2 text-sm font-medium text-stone-700" title={user?.filiale}>
          {user?.filiale}
        </p>
      </div>

      {/* Navigation */}
      <nav aria-label="Menu principal" className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {menuItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition duration-150 ${
                isActive
                  ? 'bg-[#007FE1] text-white shadow-sm shadow-[#007FE1]/20'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400 group-hover:text-stone-600'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer : utilisateur + déconnexion */}
      <div className="space-y-0.5 border-t border-stone-200 p-3">

        {/* Info utilisateur */}
        <div className="mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E5F2FD] text-xs font-semibold text-[#007FE1]">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-stone-900">
              {user?.prenom} {user?.nom}
            </p>
            <p className="truncate text-xs text-stone-500">
              {roleLabels[user?.role] ?? user?.role}
            </p>
          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
        >
          <LogOut className="h-4 w-4 shrink-0 text-stone-400" />
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}
