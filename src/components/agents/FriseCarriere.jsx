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
    return (
      <div style={{ margin: 0, fontSize: 13, color: '#78716c', padding: '14px 12px', border: '1px dashed #d6d3d1', borderRadius: 12, background: '#fafaf9' }}>
        Aucune période enregistrée.
      </div>
    )
  }

  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {affectations.map((affectation, index) => {
        const dernier = index === affectations.length - 1
        return (
          <li key={affectation.id} style={{ position: 'relative', paddingLeft: 28, paddingBottom: dernier ? 0 : 14 }}>
            {!dernier && (
              <span
                aria-hidden="true"
                style={{ position: 'absolute', left: 6, top: 18, bottom: -2, width: 2, background: '#e7e5e4', borderRadius: 2 }}
              />
            )}
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                top: 14,
                width: 14,
                height: 14,
                borderRadius: '50%',
                border: `3px solid ${affectation.enCours ? '#007FE1' : '#d6d3d1'}`,
                background: affectation.enCours ? '#E5F2FD' : 'white',
                boxShadow: affectation.enCours ? '0 0 0 3px #E5F2FD' : 'none',
                boxSizing: 'border-box',
              }}
            />
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 14,
                border: `1px solid ${affectation.enCours ? '#bfdbfe' : '#f1f0ee'}`,
                background: affectation.enCours ? '#F8FBFF' : '#fafaf9',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                <strong style={{ fontSize: 13.5, color: '#1c1917' }}>
                  {affectation.fonction || 'Fonction non précisée'}
                </strong>
                {affectation.enCours && <Badge label="En cours" color="#15803d" bg="#dcfce7" />}
                {affectation.estGerant && <Badge label="Gérant" color="#b91c1c" bg="#FEF2F1" />}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#57534e' }}>
                {[affectation.departement, affectation.service].filter(Boolean).join(' · ') || 'Rattachement non précisé'}
              </p>
              <p style={{ margin: '5px 0 0', fontSize: 12, color: '#44403c' }}>
                Du {formaterDate(affectation.dateDebut)}{' '}
                {affectation.dateFin ? `au ${formaterDate(affectation.dateFin)}` : "à aujourd'hui"}{' '}
                <span style={{ color: '#78716c' }}>({formaterDuree(affectation.dureeMois)})</span>
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11.5, color: '#78716c' }}>
                <span style={{ fontWeight: 600, color: '#57534e' }}>{LIBELLES[affectation.motif] || affectation.motif}</span>
                {affectation.commentaire ? ` · ${affectation.commentaire}` : ''}
              </p>
            </div>
          </li>
        )
      })}
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
