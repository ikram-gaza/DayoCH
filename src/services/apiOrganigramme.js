import { lire, telecharger } from './apiClient'

function parametres(filtres = {}) {
  return {
    filialeId: filtres.filialeId || undefined,
    dateReference: filtres.dateReference || undefined,
    inclureAgents: filtres.inclureAgents === false ? 'false' : 'true',
    seulementActifs: filtres.seulementActifs === false ? 'false' : 'true',
  }
}

export const apiOrganigramme = {
  arbre: (filtres) => lire('/organisation/organigramme', parametres(filtres)),

  synthese: (filtres) => lire('/organisation/organigramme/synthese', parametres(filtres)),

  exporter: (filtres, format = 'pdf') =>
    telecharger('/organisation/organigramme/export', {
      ...parametres(filtres),
      format,
    }),
}
