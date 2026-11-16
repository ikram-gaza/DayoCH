import { getFiliales } from './filiales'
import { appartientFiliale, filialesEmploye } from '../utils/organigramme'

const EMPLOYES_DEMO = [
  { id: 1, nom: 'KOTCHOFA', prenom: 'Boris', poste: 'Directeur Général', filiale: 'Dayo Bénin', filiales: ['Dayo Bénin', 'Dayo Guinée'], photo: null, responsableId: null, email: 'boris.kotchofa@dayo.africa', telephone: '+229 97 00 00 00', matricule: 'DG-001' },
  { id: 2, nom: 'DIALLO', prenom: 'Amadou', poste: 'Directeur Capital Humain', filiale: 'Dayo Bénin', photo: null, responsableId: 1, email: 'amadou.diallo@dayo.africa', telephone: '+229 97 00 00 01', matricule: 'BEN-001' },
  { id: 3, nom: 'KANE', prenom: 'Fatou', poste: 'Directrice Dayo Guinée', filiale: 'Dayo Guinée', photo: null, responsableId: 1, email: 'fatou.kane@dayo.africa', telephone: '+224 62 00 00 02', matricule: 'GIN-001' },
  { id: 4, nom: 'MENSAH', prenom: 'Koffi', poste: 'Manager Équipe Commerciale', filiale: 'Dayo Guinée', photo: null, responsableId: 3, email: 'koffi.mensah@dayo.africa', telephone: '+224 62 00 00 03', matricule: 'GIN-002' },
  { id: 5, nom: 'TRAORE', prenom: 'Aïcha', poste: 'Directrice Dayo Burkina Faso', filiale: 'Dayo Burkina Faso', photo: null, responsableId: null, email: 'aicha.traore@dayo.africa', telephone: '+226 70 00 00 04', matricule: 'BFA-001' },
  { id: 6, nom: 'OUEDRAOGO', prenom: 'Jean', poste: 'Chargé de Clientèle', filiale: 'Dayo Burkina Faso', photo: null, responsableId: 5, email: 'jean.ouedraogo@dayo.africa', telephone: '+226 70 00 00 05', matricule: 'BFA-002' },
  { id: 7, nom: 'SORO', prenom: 'Marie', poste: "Directrice Dayo Côte d'Ivoire", filiale: "Dayo Côte d'Ivoire", photo: null, responsableId: null, email: 'marie.soro@dayo.africa', telephone: '+225 07 00 00 06', matricule: 'CIV-001' },
]

export const MOCK_EMPLOYEES = EMPLOYES_DEMO.map((employe) => ({
  ...employe,
  filiales: filialesEmploye(employe),
}))

function construireAgent(employe, filiale, prefixe, estRacine, vus) {
  vus.add(employe.id)

  const enfants = MOCK_EMPLOYEES
    .filter((candidat) => (
      candidat.responsableId === employe.id
      && appartientFiliale(candidat, filiale)
      && !vus.has(candidat.id)
    ))
    .map((candidat) => construireAgent(candidat, filiale, prefixe, false, vus))

  return {
    id: `agent-${prefixe}-${employe.id}`,
    niveau: 'AGENT',
    code: employe.matricule,
    libelle: `${employe.prenom} ${employe.nom}`.trim(),
    sousTitre: employe.poste,
    effectif: 1,
    estGerant: estRacine,
    fonction: employe.poste,
    photoFichier: null,
    enfants,
  }
}

export function construireArbreGroupe() {
  const filiales = getFiliales()
    .map((filiale) => {
      const membres = MOCK_EMPLOYEES.filter((employe) => appartientFiliale(employe, filiale.nom))
      if (membres.length === 0) return null

      const idsFiliale = new Set(membres.map((employe) => employe.id))
      const vus = new Set()
      const racines = membres.filter(
        (employe) => !employe.responsableId || !idsFiliale.has(employe.responsableId),
      )

      return {
        id: `filiale-${filiale.code}`,
        niveau: 'FILIALE',
        code: filiale.code,
        libelle: filiale.nom,
        sousTitre: filiale.pays,
        effectif: membres.length,
        estGerant: false,
        enfants: racines.map((employe) => construireAgent(
          employe,
          filiale.nom,
          filiale.code,
          true,
          vus,
        )),
      }
    })
    .filter(Boolean)

  return {
    id: 'groupe-dayo',
    niveau: 'FILIALE',
    code: 'DG',
    libelle: 'Groupe Dayo',
    sousTitre: 'Organigramme consolidé',
    effectif: MOCK_EMPLOYEES.length,
    estGerant: false,
    enfants: filiales,
  }
}

export const MOCK_ORGANIGRAMME_GROUPE = construireArbreGroupe()
