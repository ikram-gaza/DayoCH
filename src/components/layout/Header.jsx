import { Bell, Search } from 'lucide-react'
import { useState } from 'react'

function Header() {
  const [showNotifications, setShowNotifications] = useState(false)

  // Mock notifications (à remplacer par des vraies données API)
  const notifications = [
    { id: 1, text: 'Votre demande de congé a été validée', time: 'Il y a 2h', unread: true },
    { id: 2, text: 'Nouvelle formation disponible : Conformité RGPD', time: 'Il y a 5h', unread: true },
    { id: 3, text: 'Rappel : Restitution du rétroprojecteur prévue aujourd\'hui', time: 'Hier', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      
      {/* Barre de recherche (optionnelle) */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9B9A]" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
          />
        </div>
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#565655] hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#F24333] rounded-full" />
            )}
          </button>

          {/* Dropdown notifications */}
          {showNotifications && (
            <>
              {/* Overlay pour fermer au clic extérieur */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-20">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-[#1D1D1B]">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-xs text-[#9B9B9A] mt-0.5">{unreadCount} non lue(s)</p>
                  )}
                </div>

                <ul className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <li className="p-4 text-center text-sm text-[#9B9B9A]">
                      Aucune notification
                    </li>
                  ) : (
                    notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                          notif.unread ? 'bg-[#D9EBFF]/20' : ''
                        }`}
                      >
                        <p className="text-sm text-[#1D1D1B] leading-tight">{notif.text}</p>
                        <p className="text-xs text-[#9B9B9A] mt-1">{notif.time}</p>
                      </li>
                    ))
                  )}
                </ul>

                <div className="p-2 border-t border-gray-100">
                  <button className="w-full py-2 text-xs font-medium text-[#007FE1] hover:bg-[#D9EBFF] rounded-lg transition-colors">
                    Tout marquer comme lu
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
