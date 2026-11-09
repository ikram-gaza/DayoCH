import { Building2, MapPin, Calendar, Users } from 'lucide-react'
import { FILIALES } from '../../config/filiales'

function FilialesPage() {
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('fr-FR', {
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1D1D1B] flex items-center gap-2">
          <Building2 className="w-7 h-7 text-[#007FE1]" />
          Filiales du Groupe Dayo
        </h1>
        <p className="text-sm text-[#696969] mt-1">
          {FILIALES.length} filiales actives en Afrique de l'Ouest
        </p>
      </div>

      {/* Carte présence géographique */}
      <div className="bg-gradient-to-br from-[#007FE1] to-[#305B9E] rounded-2xl p-6 text-white">
        <h2 className="text-lg font-bold mb-2">Présence géographique</h2>
        <p className="text-sm opacity-90 mb-4">
          Le Groupe Dayo est spécialisé dans le courtage en assurances et accompagne ses clients
          dans 4 pays d'Afrique de l'Ouest.
        </p>
        <div className="flex flex-wrap gap-3">
          {FILIALES.map(filiale => (
            <div 
              key={filiale.id}
              className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium"
            >
              {filiale.pays}
            </div>
          ))}
        </div>
      </div>

      {/* Grille des filiales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {FILIALES.map((filiale) => (
          <div
            key={filiale.id}
            className="bg-white rounded-xl border-2 border-gray-200 hover:border-[#007FE1] transition-all overflow-hidden group"
          >
            {/* Barre colorée */}
            <div 
              className="h-2"
              style={{ backgroundColor: filiale.couleur }}
            />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1D1D1B] mb-1">
                    {filiale.nom}
                  </h3>
                  <span 
                    className="inline-block px-2 py-0.5 text-xs font-semibold rounded uppercase tracking-wide"
                    style={{ 
                      backgroundColor: `${filiale.couleur}15`,
                      color: filiale.couleur 
                    }}
                  >
                    {filiale.code}
                  </span>
                </div>

                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${filiale.couleur}15` }}
                >
                  <Building2 
                    className="w-6 h-6"
                    style={{ color: filiale.couleur }}
                  />
                </div>
              </div>

              {/* Infos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-[#696969]">
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: filiale.couleur }} />
                  <span>{filiale.ville}, {filiale.pays}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#696969]">
                  <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: filiale.couleur }} />
                  <span>Ouverture : {formatDate(filiale.dateOuverture)}</span>
                </div>

                {/* Stats mock (à remplacer par API) */}
                <div className="flex items-center gap-2 text-sm text-[#696969]">
                  <Users className="w-4 h-4 flex-shrink-0" style={{ color: filiale.couleur }} />
                  <span className="font-medium text-[#1D1D1B]">
                    {Math.floor(Math.random() * 30) + 10} collaborateurs
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-5 border-t border-gray-100 flex gap-2">
                <button className="flex-1 px-3 py-2 text-sm font-medium text-[#007FE1] border border-[#007FE1] hover:bg-[#D9EBFF] rounded-lg transition-colors">
                  Voir l'équipe
                </button>
                <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-[#007FE1] hover:bg-[#006AC0] rounded-lg transition-colors">
                  Statistiques
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info complémentaire */}
      <div className="bg-[#D9EBFF] border border-[#007FE1]/30 rounded-xl p-5">
        <p className="text-sm text-[#007FE1] font-semibold mb-1">
          💡 Information
        </p>
        <p className="text-sm text-[#006AC0]">
          Les filiales sont configurées dans le fichier <code className="px-1.5 py-0.5 bg-white/60 rounded text-xs font-mono">src/config/filiales.js</code>.
          Vous pouvez modifier cette configuration selon l'évolution du Groupe.
        </p>
      </div>
    </div>
  )
}

export default FilialesPage
