import { Calendar, Package, MessageSquare, GraduationCap, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { animate, useMotionValue, useInView, useReducedMotion } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1]

// Compteur animé
function CountUp({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const val = useMotionValue(0)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    if (reduce) { setDisplay(String(to)); return }
    const ctrl = animate(val, to, {
      duration: 1.4, ease: EASE,
      onUpdate: (n) => setDisplay(Math.round(n).toString()),
    })
    return () => ctrl.stop()
  }, [inView, reduce, to, val])

  return <span ref={ref}>{display}{suffix}</span>
}

// Carte statistique
function StatCard({ label, value, hint, icon: Icon, bg, iconBg, iconColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      style={{
        background: 'white', borderRadius: 16,
        border: '1px solid #e7e5e4',
        padding: 20, position: 'relative', overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.25s', cursor: 'default',
      }}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
    >
      {/* Fond décoratif */}
      <div style={{
        position: 'absolute', right: -16, top: -16,
        width: 80, height: 80, borderRadius: '50%',
        background: iconBg, opacity: 0.5,
        transition: 'transform 0.3s',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, position: 'relative' }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#78716c' }}>{label}</p>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, color: '#1c1917', marginTop: 10, position: 'relative', lineHeight: 1 }}>
        <CountUp to={value} />
      </p>
      {hint && <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 6, position: 'relative' }}>{hint}</p>}
    </motion.div>
  )
}

// Ligne activité
function ActivityRow({ icon: Icon, text, time, iconBg, iconColor, badge, badgeBg, badgeColor }) {
  return (
    <li style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 0', borderBottom: '1px solid #fafaf9',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1,
      }}>
        <Icon size={15} style={{ color: iconColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: '#292524', lineHeight: 1.5 }}>{text}</p>
        <p style={{ fontSize: 11, color: '#a8a29e', marginTop: 3 }}>{time}</p>
      </div>
      {badge && (
        <span style={{
          flexShrink: 0, alignSelf: 'center',
          background: badgeBg, color: badgeColor,
          borderRadius: 999, padding: '3px 10px',
          fontSize: 11, fontWeight: 700,
        }}>
          {badge}
        </span>
      )}
    </li>
  )
}

// Bouton action rapide
function QuickAction({ icon: Icon, label, description, iconBg, iconColor, borderHover }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        padding: '12px 16px', borderRadius: 14, textAlign: 'left',
        background: 'white', border: `1px solid ${hovered ? borderHover : '#e7e5e4'}`,
        cursor: 'pointer',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s',
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: hovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.2s',
      }}>
        <Icon size={16} style={{ color: iconColor }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1c1917' }}>{label}</p>
        <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 1 }}>{description}</p>
      </div>
      <ArrowRight size={15} style={{
        flexShrink: 0, color: hovered ? '#007FE1' : '#d6d3d1',
        transform: hovered ? 'translateX(2px)' : 'none', transition: 'all 0.15s',
      }} />
    </button>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const fullName = `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim()
  const initials = fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')

  const stats = [
    { label: 'Jours de congé restants', value: 18, hint: 'Sur 26 jours annuels',       icon: Calendar,       iconBg: '#E5F2FD', iconColor: '#007FE1' },
    { label: 'Demandes en cours',        value: 2,  hint: '1 en attente de validation', icon: MessageSquare,  iconBg: '#fef9c3', iconColor: '#a16207' },
    { label: 'Équipements empruntés',    value: 1,  hint: 'Retour prévu le 15 nov.',    icon: Package,        iconBg: '#FEF2F1', iconColor: '#dc2626' },
    { label: 'Formations complétées',    value: 5,  hint: '2 certifications obtenues',  icon: GraduationCap,  iconBg: '#dcfce7', iconColor: '#16a34a' },
  ]

  const activities = [
    { icon: CheckCircle2, text: 'Demande de congé du 20 au 24 nov. validée par votre manager', time: 'Il y a 2 heures', iconBg: '#dcfce7', iconColor: '#16a34a', badge: 'Validé',     badgeBg: '#dcfce7', badgeColor: '#15803d' },
    { icon: Clock,        text: 'Demande de fournitures (Rame A4 × 5) en attente de validation', time: 'Il y a 5 heures', iconBg: '#fef9c3', iconColor: '#a16207', badge: 'En attente', badgeBg: '#fef9c3', badgeColor: '#a16207' },
    { icon: GraduationCap, text: 'Nouvelle formation disponible : Conformité RGPD 2026',       time: 'Hier, 14h30',    iconBg: '#E5F2FD', iconColor: '#007FE1', badge: 'Nouveau',     badgeBg: '#E5F2FD', badgeColor: '#007FE1' },
    { icon: AlertCircle,  text: 'Rappel : restitution du rétroprojecteur prévue demain',       time: 'Hier, 09h00',    iconBg: '#FEF2F1', iconColor: '#dc2626', badge: 'Rappel',      badgeBg: '#FEF2F1', badgeColor: '#dc2626' },
  ]

  const quickActions = [
    { icon: Calendar,      label: 'Demander un congé',        description: 'Soumettre une nouvelle demande', iconBg: '#E5F2FD', iconColor: '#007FE1', borderHover: 'rgba(0,127,225,0.3)'  },
    { icon: Package,       label: 'Commander des fournitures', description: 'Faire une demande de matériel', iconBg: '#fef9c3', iconColor: '#a16207', borderHover: 'rgba(161,98,7,0.3)'    },
    { icon: MessageSquare, label: 'Nouvelle sollicitation',    description: 'Envoyer une demande RH',        iconBg: '#dcfce7', iconColor: '#16a34a', borderHover: 'rgba(22,163,74,0.3)'   },
    { icon: GraduationCap, label: 'Voir les formations',       description: '3 formations disponibles',      iconBg: '#FEF2F1', iconColor: '#dc2626', borderHover: 'rgba(220,38,38,0.25)'  },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Bandeau de bienvenue ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: 20,
          background: 'linear-gradient(135deg, #00509A 0%, #007FE1 55%, #0066C0 100%)',
          padding: 28, color: 'white',
          boxShadow: '0 8px 32px rgba(0,127,225,0.25)',
        }}
      >
        {/* Grille décorative */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(147,197,253,0.9)', textTransform: 'capitalize' }}>{today}</p>
            <h1 style={{ fontFamily: 'Lora, Georgia, serif', fontSize: 26, fontWeight: 700, marginTop: 4, lineHeight: 1.2 }}>
              {greeting()}, {user?.prenom} 👋
            </h1>
            <p style={{ fontSize: 13, color: 'rgba(219,234,254,0.8)', marginTop: 6 }}>
              {user?.filiale}
              {user?.role && <> · {user.role === 'super_admin' ? 'Super Administrateur' : user.role.replace('_', ' ')}</>}
            </p>
          </div>
          {/* Avatar */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, color: 'white', border: '2px solid rgba(255,255,255,0.3)',
          }}>
            {initials}
          </div>
        </div>

        {/* Mini KPIs */}
        <div style={{
          position: 'relative', marginTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 20,
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
        }}>
          {[
            { label: 'Jours de congé', value: 18 },
            { label: 'Demandes',        value: 2  },
            { label: 'Formations',      value: 5  },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>
                <CountUp to={value} />
              </p>
              <p style={{ fontSize: 12, color: 'rgba(219,234,254,0.7)', marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Statistiques ── */}
      <section>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
          Vue d'ensemble
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: EASE }}
            >
              <StatCard {...stat} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Activité + Actions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 24 }}>

        {/* Activité récente */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE }}
          style={{
            background: 'white', borderRadius: 16,
            border: '1px solid #e7e5e4',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px', borderBottom: '1px solid #f5f5f4',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: '#007FE1' }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#1c1917' }}>Activité récente</p>
            </div>
            <button style={{ fontSize: 12, fontWeight: 600, color: '#007FE1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Tout voir
            </button>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: '0 20px' }}>
            {activities.map((a, i) => (
              <ActivityRow key={i} {...a} />
            ))}
          </ul>
        </motion.div>

        {/* Actions rapides */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            Actions rapides
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {quickActions.map((a, i) => (
              <QuickAction key={i} {...a} />
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Bandeau dev ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          background: '#F0F8FF', border: '1px solid rgba(0,127,225,0.15)',
          borderRadius: 14, padding: '14px 18px',
        }}
      >
        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>🚧</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#007FE1' }}>Tableau de bord en cours de développement</p>
          <p style={{ fontSize: 12, color: '#0066C0', marginTop: 3 }}>
            Les modules Congés, Fournitures, Formations et Évaluations seront disponibles progressivement.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
