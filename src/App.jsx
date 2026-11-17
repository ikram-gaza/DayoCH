import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import TwoFactorPage from './pages/auth/TwoFactorPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import OrganigrammePage from './pages/admin/OrganigrammePage'
import FilialesPage from './pages/admin/FilialesPage'
import UtilisateursPage from './pages/admin/UtilisateursPage'
import ProfilPage from './pages/profil/ProfilPage'
import CongesPage from './pages/conges/CongesPage'
import SollicitationsPage from './pages/sollicitations/SollicitationsPage'
import FournituresPage from './pages/fournitures/FournituresPage'
import StockPage from './pages/fournitures/StockPage'
import TracabilitePage from './pages/fournitures/TracabilitePage'
import DemandesStockPage from './pages/fournitures/DemandesStockPage'
import AlertesStockPage from './pages/fournitures/AlertesStockPage'
import EquipePage from './pages/equipe/EquipePage'
import MainLayout from './components/layout/MainLayout'
import { AuthProvider, useAuth } from './context/AuthContext'

const ALL_ROLES = ['employe', 'manager', 'gestionnaire_stock', 'super_admin']
const STAFF_ROLES = ['employe', 'manager', 'super_admin']
const STOCK_ROLES = ['gestionnaire_stock', 'super_admin']
const MANAGER_ROLES = ['manager', 'super_admin']
const ADMIN_ROLES = ['super_admin']

// Route protégée : redirige vers /login si non connecté
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="p-6">Chargement…</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.doitChangerMotDePasse && !location.pathname.startsWith('/profil')) {
    return <Navigate to="/profil?changer-mot-de-passe=1" replace />
  }
  return children
}

// Route protégée par rôle : redirige vers /dashboard si le rôle n'est pas autorisé
function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="p-6">Chargement…</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.doitChangerMotDePasse && !location.pathname.startsWith('/profil')) {
    return <Navigate to="/profil?changer-mot-de-passe=1" replace />
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/2fa" element={<TwoFactorPage />} />

          {/* Routes protégées avec layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<RoleRoute roles={ALL_ROLES}><DashboardPage /></RoleRoute>} />

            {/* Modules opérationnels */}
            <Route path="conges" element={<RoleRoute roles={STAFF_ROLES}><CongesPage /></RoleRoute>} />
            <Route path="sollicitations" element={<RoleRoute roles={STAFF_ROLES}><SollicitationsPage /></RoleRoute>} />
            <Route path="fournitures" element={<RoleRoute roles={STAFF_ROLES}><FournituresPage /></RoleRoute>} />
            <Route path="stock" element={<RoleRoute roles={STOCK_ROLES}><StockPage /></RoleRoute>} />
            <Route path="tracabilite" element={<RoleRoute roles={STOCK_ROLES}><TracabilitePage /></RoleRoute>} />
            <Route path="demandes-fournitures" element={<RoleRoute roles={STOCK_ROLES}><DemandesStockPage /></RoleRoute>} />
            <Route path="alertes" element={<RoleRoute roles={STOCK_ROLES}><AlertesStockPage /></RoleRoute>} />
            <Route path="profil" element={<RoleRoute roles={ALL_ROLES}><ProfilPage /></RoleRoute>} />
            <Route path="organigramme" element={<RoleRoute roles={ADMIN_ROLES}><OrganigrammePage /></RoleRoute>} />
            <Route path="filiales" element={<RoleRoute roles={ADMIN_ROLES}><FilialesPage /></RoleRoute>} />

            {/* TODO: Routes à implémenter */}
            <Route path="formations" element={<RoleRoute roles={STAFF_ROLES}><div className="p-6">Module Formations (à venir)</div></RoleRoute>} />
            <Route path="evaluations" element={<RoleRoute roles={MANAGER_ROLES}><div className="p-6">Module Évaluations (à venir)</div></RoleRoute>} />
            <Route path="equipe" element={<RoleRoute roles={MANAGER_ROLES}><EquipePage /></RoleRoute>} />
            <Route path="utilisateurs" element={<RoleRoute roles={ADMIN_ROLES}><UtilisateursPage /></RoleRoute>} />
            <Route path="statistiques" element={<RoleRoute roles={ADMIN_ROLES}><div className="p-6">Statistiques (à venir)</div></RoleRoute>} />
            <Route path="parametres" element={<RoleRoute roles={ADMIN_ROLES}><div className="p-6">Paramètres (à venir)</div></RoleRoute>} />
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
