/**
 * Configuration des filiales du Groupe Dayo
 * Source : https://dayo.africa/
 * 
 * Le Groupe Dayo est présent dans plusieurs pays d'Afrique de l'Ouest
 * à travers ses filiales de courtage en assurances.
 */

export const FILIALES = [
  {
    id: 'dayo-benin',
    nom: 'Dayo Bénin',
    pays: 'Bénin',
    ville: 'Cotonou',
    code: 'BEN',
    couleur: '#007FE1', // Bleu principal
    actif: true,
    dateOuverture: '2023-01-01',
  },
  {
    id: 'dayo-guinee',
    nom: 'Dayo Guinée',
    pays: 'Guinée',
    ville: 'Conakry',
    code: 'GIN',
    couleur: '#52784D', // Vert
    actif: true,
    dateOuverture: '2024-02-01',
  },
  {
    id: 'dayo-burkina',
    nom: 'Dayo Burkina Faso',
    pays: 'Burkina Faso',
    ville: 'Ouagadougou',
    code: 'BFA',
    couleur: '#F24333', // Rouge ocre
    actif: true,
    dateOuverture: '2024-08-01',
  },
  {
    id: 'dayo-ci',
    nom: 'Dayo Côte d\'Ivoire',
    pays: 'Côte d\'Ivoire',
    ville: 'Abidjan',
    code: 'CIV',
    couleur: '#E1007F', // Rose
    actif: true,
    dateOuverture: '2025-12-01',
  },
]

export const getFilialeById = (id) => {
  return FILIALES.find(f => f.id === id)
}

export const getFilialeByCode = (code) => {
  return FILIALES.find(f => f.code === code)
}

export const getFiliales = (actifOnly = true) => {
  return actifOnly ? FILIALES.filter(f => f.actif) : FILIALES
}

export const getFilialeOptions = () => {
  return FILIALES.filter(f => f.actif).map(f => ({
    value: f.id,
    label: f.nom,
    code: f.code,
  }))
}
