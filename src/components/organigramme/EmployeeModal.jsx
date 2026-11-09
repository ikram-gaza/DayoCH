import { useState, useEffect } from 'react'
import { X, User, Save } from 'lucide-react'
import { getFilialeOptions } from '../../config/filiales'

function EmployeeModal({ employee, employees, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: employee?.id || null,
    nom: employee?.nom || '',
    prenom: employee?.prenom || '',
    email: employee?.email || '',
    telephone: employee?.telephone || '',
    poste: employee?.poste || '',
    filiale: employee?.filiale || '',
    responsableId: employee?.responsableId || null,
    matricule: employee?.matricule || '',
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  // Liste des responsables potentiels (exclure l'employé actuel)
  const availableManagers = employees.filter(emp => emp.id !== employee?.id)

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#007FE1] rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#1D1D1B]">
                  {employee ? 'Modifier le collaborateur' : 'Nouveau collaborateur'}
                </h2>
                <p className="text-xs text-[#696969]">
                  {employee ? `Matricule: ${employee.matricule}` : 'Créer un nouveau profil'}
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

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Nom & Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1B] mb-1.5">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleChange('nom', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D1D1B] mb-1.5">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => handleChange('prenom', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
                />
              </div>
            </div>

            {/* Email & Téléphone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1B] mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1D1D1B] mb-1.5">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleChange('telephone', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
                />
              </div>
            </div>

            {/* Poste */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1B] mb-1.5">
                Poste <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.poste}
                onChange={(e) => handleChange('poste', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
              />
            </div>

            {/* Filiale */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1B] mb-1.5">
                Filiale <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.filiale}
                onChange={(e) => handleChange('filiale', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
              >
                <option value="">-- Sélectionner une filiale --</option>
                {getFilialeOptions().map(option => (
                  <option key={option.value} value={option.label}>
                    {option.label} ({option.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#9B9B9A] mt-1">
                Filiale d'affectation du collaborateur
              </p>
            </div>

            {/* Responsable Hiérarchique */}
            <div>
              <label className="block text-sm font-medium text-[#1D1D1B] mb-1.5">
                Responsable Hiérarchique (N+1)
              </label>
              <select
                value={formData.responsableId || ''}
                onChange={(e) => handleChange('responsableId', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007FE1] focus:border-[#007FE1] transition-colors"
              >
                <option value="">-- Aucun (Poste racine) --</option>
                {availableManagers.map(mgr => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.prenom} {mgr.nom} ({mgr.poste})
                  </option>
                ))}
              </select>
              <p className="text-xs text-[#9B9B9A] mt-1">
                Ce champ définit le circuit de validation automatique des demandes.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[#565655] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#007FE1] hover:bg-[#006AC0] rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {employee ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default EmployeeModal
