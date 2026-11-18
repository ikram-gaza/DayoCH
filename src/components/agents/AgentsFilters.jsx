import { useEffect, useState } from 'react'
import { FilterX, Search } from 'lucide-react'
import { useDebounce } from '../../hooks/useDebounce'
import { useReferentielsAgents } from '../../hooks/useAgents'

export default function AgentsFilters({ filtres, definir, reinitialiser }) {
  const [recherche, setRecherche] = useState(filtres.recherche || '')
  const rechercheRetardee = useDebounce(recherche, 350)
  const referentiels = useReferentielsAgents()

  useEffect(() => {
    if ((filtres.recherche || '') !== rechercheRetardee) {
      definir('recherche', rechercheRetardee || null)
    }
  }, [rechercheRetardee, filtres.recherche, definir])

  const actifs = Object.entries(filtres).filter(
    ([cle, valeur]) => !['page', 'limit', 'triPar', 'sortOrder'].includes(cle) && valeur,
  ).length

  const departements = referentiels.data?.departements || []
  const services = (referentiels.data?.services || []).filter(
    (service) => !filtres.departementIds || service.departementId === filtres.departementIds,
  )

  return (
    <section style={{ background: 'white', border: '1px solid #e7e5e4', borderRadius: 14, padding: '14px 18px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, alignItems: 'end' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: '#57534e' }}>
          Recherche
          <span style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input
              type="search"
              value={recherche}
              onChange={(evenement) => setRecherche(evenement.target.value)}
              placeholder="Matricule, nom, fonction…"
              style={{ ...styleInput, paddingLeft: 32 }}
            />
          </span>
        </label>

        <Champ label="Département">
          <select value={filtres.departementIds || ''} onChange={(e) => { definir('departementIds', e.target.value || null); definir('serviceIds', null) }} style={styleInput}>
            <option value="">Tous</option>
            {departements.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </select>
        </Champ>

        <Champ label="Service">
          <select value={filtres.serviceIds || ''} onChange={(e) => definir('serviceIds', e.target.value || null)} style={styleInput}>
            <option value="">Tous</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.nom}</option>)}
          </select>
        </Champ>

        <Champ label="Statut">
          <select value={filtres.actif || ''} onChange={(e) => definir('actif', e.target.value || null)} style={styleInput}>
            <option value="">Tous</option>
            <option value="true">En poste</option>
            <option value="false">Sortis</option>
          </select>
        </Champ>

        <Champ label="Compte">
          <select value={filtres.avecCompte || ''} onChange={(e) => definir('avecCompte', e.target.value || null)} style={styleInput}>
            <option value="">Indifférent</option>
            <option value="true">Avec compte</option>
            <option value="false">Sans compte</option>
          </select>
        </Champ>

        <Champ label="Email">
          <select value={filtres.avecEmail || ''} onChange={(e) => definir('avecEmail', e.target.value || null)} style={styleInput}>
            <option value="">Indifférent</option>
            <option value="true">Avec email</option>
            <option value="false">Sans email</option>
          </select>
        </Champ>

        <Champ label="Gérant">
          <select value={filtres.estGerant || ''} onChange={(e) => definir('estGerant', e.target.value || null)} style={styleInput}>
            <option value="">Indifférent</option>
            <option value="true">Gérants</option>
            <option value="false">Non gérants</option>
          </select>
        </Champ>

        <Champ label="Embauche du">
          <input type="date" value={filtres.embaucheDu || ''} onChange={(e) => definir('embaucheDu', e.target.value || null)} style={styleInput} />
        </Champ>

        <Champ label="Embauche au">
          <input type="date" value={filtres.embaucheAu || ''} onChange={(e) => definir('embaucheAu', e.target.value || null)} style={styleInput} />
        </Champ>
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#78716c' }}>{actifs > 0 ? `${actifs} filtre(s) actif(s)` : 'Aucun filtre actif'}</span>
        <button
          type="button"
          disabled={actifs === 0}
          onClick={() => { setRecherche(''); reinitialiser() }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 10, border: '1px solid #e7e5e4',
            background: 'white', color: '#57534e', fontSize: 12, fontWeight: 600,
            cursor: actifs === 0 ? 'not-allowed' : 'pointer', opacity: actifs === 0 ? 0.55 : 1,
          }}
        >
          <FilterX size={14} />
          Tout effacer
        </button>
      </div>
    </section>
  )
}

const styleInput = {
  width: '100%', boxSizing: 'border-box',
  height: 36, padding: '0 10px', borderRadius: 10,
  border: '1px solid #e7e5e4', background: 'white',
  fontSize: 13, color: '#1c1917', outline: 'none',
}

function Champ({ label, children }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 600, color: '#57534e' }}>
      {label}
      {children}
    </label>
  )
}
