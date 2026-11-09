import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuth } from '../../context/AuthContext'

export default function MainLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafaf9' }}>
      <Sidebar onLogout={handleLogout} />

      {/* Zone contenu : marge gauche exactement égale à la largeur de la sidebar */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginLeft: 256, minWidth: 0 }}>
        <Header />
        <main style={{ flex: 1, width: '100%', maxWidth: 1100, margin: '0 auto', padding: '32px 40px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
