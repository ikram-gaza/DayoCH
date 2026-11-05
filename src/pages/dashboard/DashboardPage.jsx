import { useNavigate } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'

function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  // Badge couleur selon le rôle
  const roleBadge = {
    employe: { label: 'Employé', color: 'bg-blue-100 text-blue-700' },
    manager: { label: 'Manager', color: 'bg-purple-100 text-purple-700' },
    gestionnaire_stock: { label: 'Gestionnaire Stock', color: 'bg-amber-100 text-amber-700' },
    super_admin: { label: 'Super Administrateur', color: 'bg-red-100 text-red-700' },
  }

  const badge = roleBadge[user?.role] || { label: user?.role, color: 'bg-slate-100 text-slate-700' }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">

          {/* Avatar */}
          <div className="w-20 h-20 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-white" />
          </div>

          {/* Info utilisateur */}
          <h1 className="text-xl font-bold text-slate-900 mb-1">
            Bienvenue, {user?.prenom} {user?.nom} !
          </h1>
          <p className="text-slate-500 text-sm mb-3">{user?.filiale}</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            {badge.label}
          </span>

          {/* Séparateur */}
          <div className="border-t border-slate-100 my-6" />

          {/* Message temporaire */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-700 font-medium">
              🚧 Tableau de bord en cours de développement
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Les modules RH seront disponibles prochainement.
            </p>
          </div>

          <Button variant="secondary" onClick={handleLogout} fullWidth>
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
