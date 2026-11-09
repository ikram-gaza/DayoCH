import { X, Clock, User, ArrowRight } from 'lucide-react'

function HistoriqueModal({ historique, onClose }) {
  // Trier par date décroissante
  const sortedHistorique = [...historique].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  )

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getActionLabel = (action) => {
    const labels = {
      creation: 'Création',
      modification: 'Modification',
      changement_hierarchie: 'Changement de hiérarchie',
      suppression: 'Suppression',
    }
    return labels[action] || action
  }

  const getActionColor = (action) => {
    const colors = {
      creation: 'bg-[#52784D]/10 text-[#52784D]',
      modification: 'bg-[#007FE1]/10 text-[#007FE1]',
      changement_hierarchie: 'bg-[#F24333]/10 text-[#F24333]',
      suppression: 'bg-gray-500/10 text-gray-600',
    }
    return colors[action] || 'bg-gray-100 text-gray-600'
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#007FE1] rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1D1D1B]">
                  Historique de l'Organigramme
                </h2>
                <p className="text-xs text-[#696969]">
                  {historique.length} modification(s) enregistrée(s)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#9B9B9A] hover:text-[#1D1D1B] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Liste des modifications */}
          <div className="flex-1 overflow-y-auto p-6">
            {sortedHistorique.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-[#D7D7D7] mx-auto mb-3" />
                <p className="text-sm text-[#9B9B9A]">Aucune modification enregistrée</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedHistorique.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:border-[#007FE1]/30 transition-colors"
                  >
                    {/* En-tête de l'entrée */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.action)}`}>
                          {getActionLabel(entry.action)}
                        </span>
                        <span className="text-xs text-[#9B9B9A]">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#696969]">
                        <User className="w-3 h-3" />
                        <span>{entry.auteur}</span>
                      </div>
                    </div>

                    {/* Détails */}
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-semibold text-[#1D1D1B]">
                          {entry.employeNom}
                        </span>
                        {entry.employePoste && (
                          <span className="text-xs text-[#696969] ml-2">
                            ({entry.employePoste})
                          </span>
                        )}
                      </div>

                      {entry.details && (
                        <p className="text-sm text-[#565655]">{entry.details}</p>
                      )}

                      {/* Changement de hiérarchie */}
                      {entry.action === 'changement_hierarchie' && entry.ancienResponsable && entry.nouveauResponsable && (
                        <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-white rounded-lg">
                          <span className="text-[#696969]">{entry.ancienResponsable}</span>
                          <ArrowRight className="w-4 h-4 text-[#007FE1]" />
                          <span className="text-[#007FE1] font-medium">{entry.nouveauResponsable}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <p className="text-xs text-[#9B9B9A]">
              Les modifications sont enregistrées automatiquement
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-[#007FE1] hover:bg-[#006AC0] rounded-lg transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default HistoriqueModal
