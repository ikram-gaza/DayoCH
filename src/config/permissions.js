export const PERMISSIONS = {
  PILOTAGE_READ: 'pilotage:read',
  AGENT_READ: 'agent:read',
  AGENT_UPDATE: 'agent:update',
  TROMBINOSCOPE_READ: 'trombinoscope:read',
  ORGANIGRAMME_READ: 'organigramme:read',
  ORGANIGRAMME_EXPORT: 'organigramme:export',
}

export const PERMISSIONS_PAR_ROLE = {
  super_admin: Object.values(PERMISSIONS),
  manager: [
    PERMISSIONS.PILOTAGE_READ,
    PERMISSIONS.AGENT_READ,
    PERMISSIONS.TROMBINOSCOPE_READ,
    PERMISSIONS.ORGANIGRAMME_READ,
    PERMISSIONS.ORGANIGRAMME_EXPORT,
  ],
  gestionnaire_stock: [PERMISSIONS.AGENT_READ, PERMISSIONS.TROMBINOSCOPE_READ],
  employe: [PERMISSIONS.AGENT_READ, PERMISSIONS.TROMBINOSCOPE_READ],
}

export function permissionsPourRoles(roles = [], permissions = []) {
  if (permissions.length > 0) return [...new Set(permissions)]
  return [...new Set(roles.flatMap((role) => PERMISSIONS_PAR_ROLE[role] || []))]
}
