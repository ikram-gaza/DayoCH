import { Handle, Position } from 'reactflow'
import { User, Mail, Phone, Briefcase } from 'lucide-react'

function EmployeeNode({ data }) {
  const { employee, onClick } = data

  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-[#007FE1] rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-move min-w-[240px] hover:scale-105"
      title="Cliquez pour éditer, glissez-déposez pour changer de responsable"
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-[#007FE1]" />

      {/* Avatar */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-[#D9EBFF] rounded-full flex items-center justify-center flex-shrink-0">
          {employee.photo ? (
            <img src={employee.photo} alt={employee.prenom} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-[#007FE1]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#1D1D1B] truncate">
            {employee.prenom} {employee.nom}
          </p>
          <p className="text-xs text-[#007FE1] font-medium truncate">
            {employee.poste}
          </p>
        </div>
      </div>

      {/* Infos */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-[#696969]">
          <Briefcase className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{employee.filiale}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#696969]">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#696969]">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{employee.telephone}</span>
        </div>
      </div>

      {/* Badge matricule */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <span className="inline-block px-2 py-0.5 bg-[#D9EBFF] text-[#007FE1] text-[10px] font-semibold rounded uppercase tracking-wide">
          {employee.matricule}
        </span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-[#007FE1]" />
    </div>
  )
}

export default EmployeeNode
