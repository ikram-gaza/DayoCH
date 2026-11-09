import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '../../context/AuthContext'

function MainLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-[#EEF2F7]">
      
      {/* Sidebar */}
      <Sidebar onLogout={handleLogout} />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <Header />

        {/* Zone de contenu scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout
