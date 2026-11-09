import { Calendar, Package, MessageSquare, GraduationCap, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

// Composant carte statistique — style Bailo
function Stat({ label, value, hint, icon: Icon, tone = 'blue' }) {
  const tones = {
    blue:   { bg: 'bg-[#E5F2FD]', text: 'text-[#007FE1]' },
    red:    { bg: 'bg-red-50',    text: 'text-red-600'    },
    green:  { bg: 'bg-green-50',  text: 'text-green-700'  },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-700'  },
  }
  const { bg, text } = tones[tone]

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${bg}`}>
          <Icon className={`h-4 w-4 ${text}`} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-stone-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-stone-400">{hint}</p>}
    </div>
  )
}

// Ligne d'activité récente
function ActivityRow({ icon: Icon, text, time, tone = 'blue' }) {
  const tones = {
    blue:  { bg: 'bg-[#E5F2FD]', text: 'text-[#007FE1]' },
    green: { bg: 'bg-green-50',  text: 'text-green-600'  },
    amber: { bg: 'bg-amber-50',  text: 'text-amber-600'  },
    red:   { bg: 'bg-red-50',    text: 'text-red-600'    },
  }
  const { bg, text: iconText } = tones[tone]

  return (
    <div className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
      <span className={`grid mt-0.5 h-8 w-8 shrink-0 place-items-center rounded-xl ${bg}`}>
        <Icon className={`h-4 w-4 ${iconText}`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-stone-800">{text}</p>
        <p className="mt-0.5 text-xs text-stone-400">{time}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const stats = [
    { label: 'Jours de congé restants', value: 18, hint: 'Sur 26 jours annuels', icon: Calendar, tone: 'blue' },
    { label: 'Demandes en cours', value: 2, hint: '1 en attente de validation', icon: MessageSquare, tone: 'amber' },
    { label: 'Équipements empruntés', value: 1, hint: 'Retour prévu le 15 nov.', icon: Package, tone: 'red' },
    { label: 'Formations complétées', value: 5, hint: '2 certifications obtenues', icon: GraduationCap, tone: 'green' },
  ]

  const activities = [
    { icon: CheckCircle2, text: 'Demande de congé du 20 au 24 nov. validée par votre manager', time: 'Il y a 2 heures', tone: 'green' },
    { icon: Clock, text: 'Demande de fournitures (Rame A4 × 5) en attente de validation', time: 'Il y a 5 heures', tone: 'amber' },
    { icon: GraduationCap, text: 'Nouvelle formation disponible : Conformité RGPD 2026', time: 'Hier, 14h30', tone: 'blue' },
    { icon: AlertCircle, text: 'Rappel : restitution du rétroprojecteur prévue demain', time: 'Hier, 09h00', tone: 'red' },
  ]

  return (
    <div className="page-enter space-y-8">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
          Bonjour, {user?.prenom} 👋
        </h1>
        <p className="mt-1 text-stone-500">{user?.filiale} · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      {/* Grille stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Stat key={stat.label} {...stat} />
        ))}
      </div>

      {/* Activité récente */}
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-100 px-5 py-3.5">
          <h2 className="font-semibold text-stone-900">Activité récente</h2>
        </div>
        <div className="divide-y divide-stone-100 px-5">
          {activities.map((activity, i) => (
            <ActivityRow key={i} {...activity} />
          ))}
        </div>
      </div>

      {/* Bandeau info développement */}
      <div className="flex items-start gap-3 rounded-2xl border border-[#007FE1]/20 bg-[#F0F8FF] px-4 py-3.5">
        <span className="mt-0.5 text-base">🚧</span>
        <div>
          <p className="text-sm font-semibold text-[#007FE1]">Tableau de bord en cours de développement</p>
          <p className="mt-0.5 text-xs text-[#0066C0]">Les modules Congés, Fournitures, Formations et Évaluations seront disponibles progressivement.</p>
        </div>
      </div>
    </div>
  )
}
