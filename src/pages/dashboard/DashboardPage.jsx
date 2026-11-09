import { useAuth } from '../../context/AuthContext'
import { Calendar, Package, MessageSquare, CheckCircle } from 'lucide-react'

function DashboardPage() {
  const { user } = useAuth()

  // Mock data (à remplacer par API)
  const stats = {
    congesRestants: 18,
    demandesEnCours: 2,
    formationsCompletees: 5,
    notificationsPendantes: 3,
  }

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1B]">
          Bienvenue, {user?.prenom} {user?.nom} !
        </h1>
        <p className="text-sm text-[#696969] mt-1">{user?.filiale}</p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Congés restants */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-[#007FE1]" />
          </div>
          <p className="text-2xl font-bold text-[#1D1D1B]">{stats.congesRestants}</p>
          <p className="text-sm text-[#696969] mt-1">Jours de congé restants</p>
        </div>

        {/* Demandes en cours */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <MessageSquare className="w-8 h-8 text-[#F24333]" />
          </div>
          <p className="text-2xl font-bold text-[#1D1D1B]">{stats.demandesEnCours}</p>
          <p className="text-sm text-[#696969] mt-1">Demandes en cours</p>
        </div>

        {/* Fournitures */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-8 h-8 text-[#52784D]" />
          </div>
          <p className="text-2xl font-bold text-[#1D1D1B]">3</p>
          <p className="text-sm text-[#696969] mt-1">Équipements empruntés</p>
        </div>

        {/* Formations */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-[#E1007F]" />
          </div>
          <p className="text-2xl font-bold text-[#1D1D1B]">{stats.formationsCompletees}</p>
          <p className="text-sm text-[#696969] mt-1">Formations complétées</p>
        </div>
      </div>

      {/* Message temporaire */}
      <div className="bg-[#D9EBFF] border border-[#007FE1]/30 rounded-xl p-5">
        <p className="text-sm text-[#007FE1] font-semibold">
          🚧 Tableau de bord en cours de développement
        </p>
        <p className="text-sm text-[#006AC0] mt-1">
          Les modules CH seront disponibles progressivement.
        </p>
      </div>
    </div>
  )
}

export default DashboardPage
