export function filialesEmploye(employe) {
  if (!employe) return []
  if (Array.isArray(employe.filiales) && employe.filiales.length > 0) {
    return employe.filiales
  }
  return employe.filiale ? [employe.filiale] : []
}

export function appartientFiliale(employe, filiale) {
  return Boolean(filiale) && filialesEmploye(employe).includes(filiale)
}

export function libelleFiliales(employe) {
  return filialesEmploye(employe).join(' · ')
}

export function normaliserFiliales(employe) {
  return {
    ...employe,
    filiales: Array.from(new Set([
      employe.filiale,
      ...filialesEmploye(employe),
    ].filter(Boolean))),
  }
}
