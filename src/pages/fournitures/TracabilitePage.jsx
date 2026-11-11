import { useState, useMemo } from 'react'
import {
  Package, ArrowDownLeft, ArrowUpRight, RotateCcw,
  Search, Download
} from 'lucide-react'
import { fournituresService } from '../../services/fournituresService'
import { FILIALES } from '../../config/filiales'

const TYPES_MOUVEMENT = {
  entree_reassort: { label: 'Entrée (Réassort)', color: '#16a34a', bg: '#dcfce7', icon: ArrowDownLeft },
  sortie_demande:  { label: 'Sortie (Livraison)', color: '#dc2626', bg: '#FEF2F1', icon: ArrowUpRight },
  retour_emprunt:  { label: 'Retour (Restitution)', color: '#007FE1', bg: '#E5F2FD', icon: RotateCcw },
}

export default function TracabilitePage() {
  const [mouvements, setMouvements] = useState(() => fournituresService.getMouvements())
  const [recherche, setRecherche] = useState('')
  const [typeFiltre, setTypeFiltre] = useState('all')
  const [filialeFiltre, setFilialeFiltre] = useState('all')

  const mouvementsFiltres = useMemo(() => {
    return mouvements.filter(m => {
      const matchType = typeFiltre === 'all' || m.typeMouvement === typeFiltre
      const matchFiliale = filialeFiltre === 'all' || m.filiale === filialeFiltre
      const matchRech = recherche === '' ||
        m.articleNom.toLowerCase().includes(recherche.toLowerCase()) ||
        m.articleRef?.toLowerCase().includes(recherche.toLowerCase()) ||
        m.beneficiaire?.toLowerCase().includes(recherche.toLowerCase()) ||
        m.referenceDoc?.toLowerCase().includes(recherche.toLowerCase())
      return matchType && matchFiliale && matchRech
    })
  }, [mouvements, typeFiltre, filialeFiltre, recherche])

  const handleExportCSV = () => {
    if (mouvements.length === 0) return
    const headers = ['Date', 'Type Mouvement', 'Article', 'Réf', 'Quantité', 'Stock Avant', 'Stock Après', 'Bénéficiaire / Source', 'Filiale', 'Réf Doc']
    const rows = mouvements.map(m => [
      new Date(m.date).toLocaleString('fr-FR'),
      m.typeMouvement,
      `"${m.articleNom}"`,
      m.articleRef || '',
      m.quantite,
      m.stockAvant,
      m.stockApres,
      `"${m.beneficiaire || ''}"`,
      `"${m.filiale}"`,
      `"${m.referenceDoc || ''}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `journal_tracabilite_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Package size={24} style={{ color: '#007FE1' }} />
            Journal de Traçabilité & Mouvements de Stock
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            Historique complet des entrées de réassort, des remises de matériel et des restitutions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 14px', borderRadius: 12, border: '1px solid #e7e5e4',
            background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <Download size={15} />
          Export Traçabilité
        </button>
      </div>

      {/* Barre recherche & filtre */}
      <div style={{
        background: 'white', borderRadius: 14, padding: '14px 18px',
        border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input
            type="search"
            placeholder="Rechercher par article, bénéficiaire, réf..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px 8px 34px', borderRadius: 10,
              border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select
            value={typeFiltre}
            onChange={(e) => setTypeFiltre(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid #e7e5e4',
              background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917', outline: 'none',
            }}
          >
            <option value="all">Tous les types de mouvements</option>
            <option value="entree_reassort">Entrées (Réassort)</option>
            <option value="sortie_demande">Sorties (Livraisons)</option>
            <option value="retour_emprunt">Retours (Restitutions)</option>
          </select>

          <select
            value={filialeFiltre}
            onChange={(e) => setFilialeFiltre(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid #e7e5e4',
              background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917', outline: 'none',
            }}
          >
            <option value="all">Toutes filiales</option>
            {FILIALES.map(f => (
              <option key={f.id} value={f.nom}>{f.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tableau chronologique */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {mouvementsFiltres.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <Package size={36} style={{ color: '#d6d3d1', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>Aucun mouvement enregistré</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4', color: '#78716c', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 20px' }}>Date & Heure</th>
                <th style={{ padding: '14px 20px' }}>Mouvement</th>
                <th style={{ padding: '14px 20px' }}>Article & Référence</th>
                <th style={{ padding: '14px 20px' }}>Quantité</th>
                <th style={{ padding: '14px 20px' }}>Évolution Stock</th>
                <th style={{ padding: '14px 20px' }}>Acteur / Bénéficiaire</th>
                <th style={{ padding: '14px 20px' }}>Réf. Pièce</th>
              </tr>
            </thead>
            <tbody>
              {mouvementsFiltres.map(m => {
                const conf = TYPES_MOUVEMENT[m.typeMouvement] || TYPES_MOUVEMENT.entree_reassort
                const Icon = conf.icon
                const estEntree = m.typeMouvement === 'entree_reassort' || m.typeMouvement === 'retour_emprunt'

                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                    <td style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <p style={{ fontWeight: 600, color: '#1c1917', margin: 0 }}>
                        {new Date(m.date).toLocaleDateString('fr-FR')}
                      </p>
                      <p style={{ fontSize: 11, color: '#a8a29e', margin: '2px 0 0' }}>
                        {new Date(m.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '3px 8px', borderRadius: 6,
                        background: conf.bg, color: conf.color,
                        fontSize: 11, fontWeight: 700,
                      }}>
                        <Icon size={12} />
                        {conf.label}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 700, color: '#1c1917', margin: 0 }}>{m.articleNom}</p>
                      <p style={{ fontSize: 11, color: '#78716c', margin: '2px 0 0' }}>
                        {m.articleRef} · <span style={{ color: '#007FE1' }}>{m.filiale}</span>
                      </p>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontWeight: 800, fontSize: 14,
                        color: estEntree ? '#16a34a' : '#dc2626',
                      }}>
                        {estEntree ? `+${m.quantite}` : `-${m.quantite}`}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 12, color: '#78716c' }}>
                        {m.stockAvant} → <strong style={{ color: '#1c1917' }}>{m.stockApres}</strong>
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 600, color: '#1c1917', margin: 0 }}>{m.beneficiaire || 'Stock'}</p>
                      <p style={{ fontSize: 11, color: '#a8a29e', margin: '2px 0 0' }}>
                        Par : {m.auteur}
                      </p>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: '#57534e',
                        background: '#f5f5f4', padding: '2px 6px', borderRadius: 4,
                      }}>
                        {m.referenceDoc || '-'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
