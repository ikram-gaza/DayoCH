import { formaterDate, formaterDuree } from '../../utils/format'

const LIBELLES = {
  EMBAUCHE: 'Embauche',
  MUTATION: 'Mutation',
  PROMOTION: 'Promotion',
  REORGANISATION: 'Réorganisation',
  INTERIM: 'Intérim',
  DESIGNATION_GERANT: 'Désignation comme gérant',
  FIN_GERANCE: 'Fin de gérance',
  SORTIE: "Sortie d'effectif",
}

export default function FriseCarriere({ affectations = [] }) {
  if (affectations.length === 0) {
    return <p style={{ margin: 0, fontSize: 13, color: '#78716c' }}>Aucune période enregistrée.</p>
  }

  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', borderLeft: '2px solid #e7e5e4', marginLeft: 10 }}>
      {affectations.map((affectation) => (
        <li key={affectation.id} style={{ position: 'relative', padding: '0 0 22px 26px' }}>
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: -7,
              top: 4,
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: `3px solid ${affectation.enCours ? '#007FE1' : '#e7e5e4'}`,
              background: 'white',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            <strong style={{ fontSize: 13, color: '#1c1917' }}>
              {affectation.fonction || 'Fonction non précisée'}
            </strong>
            {affectation.enCours && <Badge label="En cours" color="#15803d" bg="#dcfce7" />}
            {affectation.estGerant && <Badge label="Gérant" color="#b91c1c" bg="#FEF2F1" />}
          </div>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#78716c' }}>
            {[affectation.departement, affectation.service].filter(Boolean).join(' · ') || 'Rattachement non précisé'}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#44403c' }}>
            Du {formaterDate(affectation.dateDebut)}{' '}
            {affectation.dateFin ? `au ${formaterDate(affectation.dateFin)}` : "à aujourd'hui"} (
            {formaterDuree(affectation.dureeMois)})
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 11, color: '#a8a29e' }}>
            {LIBELLES[affectation.motif] || affectation.motif}
            {affectation.commentaire ? ` · ${affectation.commentaire}` : ''}
          </p>
        </li>
      ))}
    </ol>
  )
}

function Badge({ label, color, bg }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  )
}
