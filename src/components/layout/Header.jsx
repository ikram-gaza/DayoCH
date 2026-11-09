import { useState } from 'react'
import { Bell, Search } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1]

const mockNotifications = [
  { id: 1, text: 'Votre demande de congé a été validée',           time: 'Il y a 2h',  tone: 'green', unread: true  },
  { id: 2, text: 'Nouvelle formation disponible : Conformité RGPD', time: 'Il y a 5h', tone: 'blue',  unread: true  },
  { id: 3, text: 'Rappel : Restitution du rétroprojecteur demain',  time: 'Hier',       tone: 'amber', unread: false },
]

const badgeColors = {
  green: { bg: '#dcfce7', text: '#15803d' },
  blue:  { bg: '#E5F2FD', text: '#007FE1' },
  amber: { bg: '#fef9c3', text: '#a16207' },
  red:   { bg: '#FEF2F1', text: '#dc2626' },
}

export default function Header() {
  const [showNotif, setShowNotif] = useState(false)
  const unread = mockNotifications.filter((n) => n.unread).length

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 20,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e7e5e4',
      boxShadow: '0 1px 0 rgba(0,0,0,0.05)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, height: 56, padding: '0 24px' }}>

        {/* Recherche */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input
            type="search"
            placeholder="Rechercher un employé, un module…"
            style={{
              width: '100%', padding: '8px 16px 8px 40px',
              background: '#f5f5f4', border: '1px solid #e7e5e4',
              borderRadius: 12, fontSize: 13, color: '#1c1917',
              outline: 'none', transition: 'all 0.15s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.background = 'white'
              e.target.style.borderColor = '#007FE1'
              e.target.style.boxShadow = '0 0 0 3px rgba(0,127,225,0.12)'
            }}
            onBlur={(e) => {
              e.target.style.background = '#f5f5f4'
              e.target.style.borderColor = '#e7e5e4'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Cloche */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            aria-label={`Notifications${unread > 0 ? ` (${unread})` : ''}`}
            style={{
              position: 'relative', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 10, border: 'none', background: 'none',
              cursor: 'pointer', color: '#78716c',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f4' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
          >
            <Bell size={17} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 8, height: 8, borderRadius: '50%',
                background: '#F24333',
                border: '1.5px solid white',
              }} />
            )}
          </button>

          {/* Dropdown */}
          <AnimatePresence>
            {showNotif && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                  onClick={() => setShowNotif(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8,
                    zIndex: 20, width: 320,
                    background: 'white', borderRadius: 16,
                    border: '1px solid #e7e5e4',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Titre */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderBottom: '1px solid #f5f5f4',
                  }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1c1917' }}>Notifications</p>
                    {unread > 0 && (
                      <span style={{
                        background: '#E5F2FD', color: '#007FE1',
                        borderRadius: 999, padding: '2px 10px',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {unread} nouvelle{unread > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Liste */}
                  <ul style={{ maxHeight: 280, overflowY: 'auto', listStyle: 'none', padding: 0, margin: 0 }}>
                    {mockNotifications.map((n) => (
                      <li
                        key={n.id}
                        style={{
                          padding: '12px 16px', cursor: 'pointer',
                          borderBottom: '1px solid #fafaf9',
                          background: n.unread ? '#F0F8FF' : 'white',
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f5f4' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = n.unread ? '#F0F8FF' : 'white' }}
                      >
                        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          {n.unread && (
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#007FE1', flexShrink: 0, marginTop: 5 }} />
                          )}
                          <div style={{ marginLeft: n.unread ? 0 : 17 }}>
                            <p style={{ fontSize: 13, color: '#292524', lineHeight: 1.5 }}>{n.text}</p>
                            <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 3 }}>{n.time}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Action */}
                  <div style={{ padding: 8, borderTop: '1px solid #f5f5f4' }}>
                    <button style={{
                      width: '100%', padding: '8px', borderRadius: 10,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, color: '#007FE1',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#E5F2FD' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}
                    >
                      Tout marquer comme lu
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
