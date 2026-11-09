import { User, Mail, Phone, Briefcase, MapPin } from 'lucide-react'

function EmployeeCard({ employee, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#007FE1] hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-[#D9EBFF] rounded-full flex items-center justify-center flex-shrink-0">
          {employee.photo ? (
            <img src={employee.photo} alt={employee.prenom} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-[#007FE1]" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1D1D1B] truncate">
            {employee.prenom} {employee.nom}
          </p>
          <p className="text-xs text-[#007FE1] font-medium truncate mb-2">
            {employee.poste}
          </p>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#696969]">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{employee.filiale}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#696969]">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmployeeCard
