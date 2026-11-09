import { useState } from 'react'
import { Bell, Search } from 'lucide-react'

const mockNotifications = [
  { id: 1, text: 'Votre demande de congé a été validée', time: 'Il y a 2h', unread: true },
  { id: 2, text: 'Nouvelle formation disponible : Conformité RGPD', time: 'Il y a 5h', unread: true },
  { id: 3, text: 'Rappel : Restitution du rétroprojecteur prévue demain', time: 'Hier', unread: false },
]

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = mockNotifications.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-4 px-6">

        {/* Recherche */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Rechercher…"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2 pl-9 pr-4 text-sm text-stone-900 placeholder-stone-400 transition hover:border-stone-300 focus:border-[#007FE1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007FE1]/20"
          />
        </div>

        {/* Actions droite */}
        <div className="flex shrink-0 items-center gap-2">

          {/* Cloche notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative grid h-9 w-9 place-items-center rounded-xl text-stone-500 transition hover:bg-stone-100 hover:text-stone-900"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#F24333]" />
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="animate-scale-in absolute right-0 z-20 mt-1 w-80 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
                  <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
                    <p className="text-sm font-semibold text-stone-900">Notifications</p>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-[#E5F2FD] px-2 py-0.5 text-xs font-semibold text-[#007FE1]">
                        {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <ul className="max-h-72 divide-y divide-stone-50 overflow-y-auto">
                    {mockNotifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`cursor-pointer px-4 py-3.5 transition hover:bg-stone-50 ${notif.unread ? 'bg-[#F0F8FF]' : ''}`}
                      >
                        <div className="flex items-start gap-2.5">
                          {notif.unread && (
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#007FE1]" />
                          )}
                          <div className={notif.unread ? '' : 'ml-4'}>
                            <p className="text-sm leading-snug text-stone-800">{notif.text}</p>
                            <p className="mt-0.5 text-xs text-stone-400">{notif.time}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-stone-100 p-2">
                    <button className="w-full rounded-xl py-2 text-xs font-semibold text-[#007FE1] transition hover:bg-[#E5F2FD]">
                      Tout marquer comme lu
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
