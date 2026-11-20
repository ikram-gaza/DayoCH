import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import TwoFactorPage from './pages/auth/TwoFactorPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import OrganigrammePage from './pages/admin/OrganigrammePage'
import FilialesPage from './pages/admin/FilialesPage'
import FilialeDetailPage from './pages/admin/FilialeDetailPage'
import DepartementsPage from './pages/admin/DepartementsPage'
import ServicesPage from './pages/admin/ServicesPage'
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
import AgentsPage from './pages/agents/AgentsPage'
import AgentDetailPage from './pages/agents/AgentDetailPage'
import TrombinoscopePage from './pages/trombinoscope/TrombinoscopePage'
import PilotagePage from './pages/pilotage/PilotagePage'
import ModuleAVenirPage from './pages/avenir/ModuleAVenirPage'
import MainLayout from './components/layout/MainLayout'
import { AuthProvider, useAuth } from './context/AuthContext'
import { PERMISSIONS } from './config/permissions'

const ALL_ROLES = ['employe', 'manager', 'gestionnaire_stock', 'super_admin']
const STAFF_ROLES = ['employe', 'manager', 'super_admin']
const STOCK_ROLES = ['gestionnaire_stock', 'super_admin']
const MANAGER_ROLES = ['manager', 'super_admin']
const ADMIN_ROLES = ['super_admin']

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

function RoleRoute({ roles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.doitChangerMotDePasse && !location.pathname.startsWith('/profil')) {
    return <Navigate to="/profil?changer-mot-de-passe=1" replace />
  }
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function PermissionRoute({ permission, children }) {
  const { user, loading, peut } = useAuth()
  const location = useLocation()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.doitChangerMotDePasse && !location.pathname.startsWith('/profil')) {
    return <Navigate to="/profil?changer-mot-de-passe=1" replace />
  }
  if (!peut(permission)) return <Navigate to="/dashboard" replace />
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
            <Route path="agents" element={<PermissionRoute permission={PERMISSIONS.AGENT_READ}><AgentsPage /></PermissionRoute>} />
            <Route path="agents/:id" element={<PermissionRoute permission={PERMISSIONS.AGENT_READ}><AgentDetailPage /></PermissionRoute>} />
            <Route path="trombinoscope" element={<PermissionRoute permission={PERMISSIONS.TROMBINOSCOPE_READ}><TrombinoscopePage /></PermissionRoute>} />
            <Route path="pilotage" element={<PermissionRoute permission={PERMISSIONS.PILOTAGE_READ}><PilotagePage /></PermissionRoute>} />

            {/* Modules opérationnels */}
            <Route path="conges" element={<RoleRoute roles={STAFF_ROLES}><CongesPage /></RoleRoute>} />
            <Route path="sollicitations" element={<RoleRoute roles={STAFF_ROLES}><SollicitationsPage /></RoleRoute>} />
            <Route path="fournitures" element={<RoleRoute roles={STAFF_ROLES}><FournituresPage /></RoleRoute>} />
            <Route path="stock" element={<RoleRoute roles={STOCK_ROLES}><StockPage /></RoleRoute>} />
            <Route path="tracabilite" element={<RoleRoute roles={STOCK_ROLES}><TracabilitePage /></RoleRoute>} />
            <Route path="demandes-fournitures" element={<RoleRoute roles={STOCK_ROLES}><DemandesStockPage /></RoleRoute>} />
            <Route path="alertes" element={<RoleRoute roles={STOCK_ROLES}><AlertesStockPage /></RoleRoute>} />
            <Route path="profil" element={<RoleRoute roles={ALL_ROLES}><ProfilPage /></RoleRoute>} />
            <Route path="organigramme" element={<PermissionRoute permission={PERMISSIONS.ORGANIGRAMME_READ}><OrganigrammePage /></PermissionRoute>} />
            <Route path="filiales" element={<RoleRoute roles={ADMIN_ROLES}><FilialesPage /></RoleRoute>} />
            <Route path="filiales/:id" element={<RoleRoute roles={ADMIN_ROLES}><FilialeDetailPage /></RoleRoute>} />
            <Route path="departements" element={<RoleRoute roles={ADMIN_ROLES}><DepartementsPage /></RoleRoute>} />
            <Route path="services" element={<RoleRoute roles={ADMIN_ROLES}><ServicesPage /></RoleRoute>} />

            {/* TODO: Routes à implémenter */}
            <Route path="formations" element={<RoleRoute roles={STAFF_ROLES}><ModuleAVenirPage titre="Formations" description="Gestion des formations, inscriptions et suivi des parcours de développement des compétences." /></RoleRoute>} />
            <Route path="evaluations" element={<RoleRoute roles={MANAGER_ROLES}><ModuleAVenirPage titre="Évaluations" description="Campagnes d'évaluation, objectifs et suivi des performances des collaborateurs." /></RoleRoute>} />
            <Route path="equipe" element={<RoleRoute roles={MANAGER_ROLES}><EquipePage /></RoleRoute>} />
            <Route path="utilisateurs" element={<RoleRoute roles={ADMIN_ROLES}><UtilisateursPage /></RoleRoute>} />
            <Route path="statistiques" element={<RoleRoute roles={ADMIN_ROLES}><ModuleAVenirPage titre="Statistiques" description="Tableaux de bord statistiques et rapports consolidés sur l'activité et les effectifs." /></RoleRoute>} />
            <Route path="parametres" element={<RoleRoute roles={ADMIN_ROLES}><ModuleAVenirPage titre="Paramètres" description="Configuration de l'application, des préférences et des options d'administration." /></RoleRoute>} />
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
