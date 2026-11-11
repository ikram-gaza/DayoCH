import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/auth/LoginPage'
import TwoFactorPage from './pages/auth/TwoFactorPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import OrganigrammePage from './pages/admin/OrganigrammePage'
import FilialesPage from './pages/admin/FilialesPage'
import ProfilPage from './pages/profil/ProfilPage'
import CongesPage from './pages/conges/CongesPage'
import FournituresPage from './pages/fournitures/FournituresPage'
import StockPage from './pages/fournitures/StockPage'
import TracabilitePage from './pages/fournitures/TracabilitePage'
import DemandesStockPage from './pages/fournitures/DemandesStockPage'
import AlertesStockPage from './pages/fournitures/AlertesStockPage'
import MainLayout from './components/layout/MainLayout'
import { AuthProvider, useAuth } from './context/AuthContext'

// Route protégée : redirige vers /login si non connecté
function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
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
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Modules opérationnels */}
            <Route path="conges" element={<CongesPage />} />
            <Route path="fournitures" element={<FournituresPage />} />
            <Route path="stock" element={<StockPage />} />
            <Route path="tracabilite" element={<TracabilitePage />} />
            <Route path="demandes-fournitures" element={<DemandesStockPage />} />
            <Route path="alertes" element={<AlertesStockPage />} />
            <Route path="profil" element={<ProfilPage />} />
            <Route path="organigramme" element={<OrganigrammePage />} />
            <Route path="filiales" element={<FilialesPage />} />

            {/* TODO: Routes à implémenter */}
            <Route path="sollicitations" element={<div className="p-6">Module Sollicitations (à venir)</div>} />
            <Route path="formations" element={<div className="p-6">Module Formations (à venir)</div>} />
            <Route path="evaluations" element={<div className="p-6">Module Évaluations (à venir)</div>} />
            <Route path="equipe" element={<div className="p-6">Mon Équipe (à venir)</div>} />
            <Route path="utilisateurs" element={<div className="p-6">Gestion Utilisateurs (à venir)</div>} />
            <Route path="statistiques" element={<div className="p-6">Statistiques (à venir)</div>} />
            <Route path="parametres" element={<div className="p-6">Paramètres (à venir)</div>} />
          </Route>

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
