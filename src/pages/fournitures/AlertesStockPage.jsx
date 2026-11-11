import { useState, useMemo } from 'react'
import {
  AlertTriangle, AlertCircle, PlusCircle, CheckCircle2, Search
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { fournituresService } from '../../services/fournituresService'
import ReapprovisionnementModal from '../../components/fournitures/ReapprovisionnementModal'

export default function AlertesStockPage() {
  const { user } = useAuth()

  const [articles, setArticles] = useState(() => fournituresService.getArticles())
  const [recherche, setRecherche] = useState('')
  const [typeAlerte, setTypeAlerte] = useState('all') // all, rupture, seuil
  const [articleAReappro, setArticleAReappro] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const recharger = () => {
    setArticles([...fournituresService.getArticles()])
  }

  const afficherToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Articles en alerte
  const alertes = useMemo(() => {
    return articles.filter(a => a.stockActuel <= a.stockMin)
  }, [articles])

  const alertesFiltrees = useMemo(() => {
    return alertes.filter(a => {
      const matchRech = recherche === '' ||
        a.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        a.reference.toLowerCase().includes(recherche.toLowerCase())

      let matchType = true
      if (typeAlerte === 'rupture') matchType = a.stockActuel === 0
      else if (typeAlerte === 'seuil') matchType = a.stockActuel > 0

      return matchRech && matchType
    })
  }, [alertes, recherche, typeAlerte])

  const handleReapprovisionner = (articleId, quantite, motif) => {
    fournituresService.reapprovisionnerArticle(articleId, quantite, user, motif)
    recharger()
    afficherToast(`Réapprovisionnement de +${quantite} unités enregistré.`)
  }

  const rupturesCount = alertes.filter(a => a.stockActuel === 0).length
  const seuilCount = alertes.filter(a => a.stockActuel > 0).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: '#1c1917', color: 'white', padding: '12px 20px',
          borderRadius: 14, fontSize: 13, fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CheckCircle2 size={16} style={{ color: '#22c55e' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={24} style={{ color: '#dc2626' }} />
          Alertes de Stock & Ruptures
        </h1>
        <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
          Surveillez les articles ayant atteint leur stock de sécurité ou en rupture complète.
        </p>
      </div>

      {/* KPIs Alertes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <div style={{
          background: '#FEF2F1', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #fecaca', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ruptures Totales (0 stock)
            </span>
            <AlertCircle size={18} style={{ color: '#dc2626' }} />
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: '#991b1b', margin: '10px 0 0' }}>{rupturesCount}</p>
          <p style={{ fontSize: 11, color: '#b91c1c', margin: '4px 0 0' }}>Commandes impossibles à honorer</p>
        </div>

        <div style={{
          background: '#fffbeb', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #fde68a', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Sous le seuil critique
            </span>
            <AlertTriangle size={18} style={{ color: '#d97706' }} />
          </div>
          <p style={{ fontSize: 32, fontWeight: 800, color: '#92400e', margin: '10px 0 0' }}>{seuilCount}</p>
          <p style={{ fontSize: 11, color: '#b45309', margin: '4px 0 0' }}>Commande fournisseur recommandée</p>
        </div>
      </div>

      {/* Filtres */}
      <div style={{
        background: 'white', borderRadius: 14, padding: '14px 18px',
        border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input
            type="search"
            placeholder="Rechercher par article..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px 8px 34px', borderRadius: 10,
              border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setTypeAlerte('all')}
            style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: '1px solid', cursor: 'pointer',
              background: typeAlerte === 'all' ? '#1c1917' : 'white',
              borderColor: typeAlerte === 'all' ? '#1c1917' : '#e7e5e4',
              color: typeAlerte === 'all' ? 'white' : '#57534e',
            }}
          >
            Toutes les alertes ({alertes.length})
          </button>
          <button
            onClick={() => setTypeAlerte('rupture')}
            style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: '1px solid', cursor: 'pointer',
              background: typeAlerte === 'rupture' ? '#dc2626' : 'white',
              borderColor: typeAlerte === 'rupture' ? '#dc2626' : '#e7e5e4',
              color: typeAlerte === 'rupture' ? 'white' : '#dc2626',
            }}
          >
            Ruptures ({rupturesCount})
          </button>
          <button
            onClick={() => setTypeAlerte('seuil')}
            style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: '1px solid', cursor: 'pointer',
              background: typeAlerte === 'seuil' ? '#d97706' : 'white',
              borderColor: typeAlerte === 'seuil' ? '#d97706' : '#e7e5e4',
              color: typeAlerte === 'seuil' ? 'white' : '#d97706',
            }}
          >
            Seuil critique ({seuilCount})
          </button>
        </div>
      </div>

      {/* Tableau des alertes */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {alertesFiltrees.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <CheckCircle2 size={36} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>Aucune alerte active</p>
            <p style={{ fontSize: 13, color: '#a8a29e', margin: '4px 0 0' }}>Tous les stocks respectent les quotas de sécurité minimaux.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4', color: '#78716c', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 20px' }}>Article & Référence</th>
                <th style={{ padding: '14px 20px' }}>Filiale</th>
                <th style={{ padding: '14px 20px' }}>Niveau de Stock</th>
                <th style={{ padding: '14px 20px' }}>Seuil Minimum</th>
                <th style={{ padding: '14px 20px' }}>Statut d'alerte</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {alertesFiltrees.map(art => {
                const estRupture = art.stockActuel === 0

                return (
                  <tr key={art.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 700, color: '#1c1917', margin: 0 }}>{art.nom}</p>
                      <p style={{ fontSize: 11, color: '#a8a29e', margin: '2px 0 0' }}>Réf. {art.reference}</p>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontWeight: 600, color: '#1c1917' }}>{art.filiale}</span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: 15, fontWeight: 800,
                        color: estRupture ? '#dc2626' : '#d97706',
                      }}>
                        {art.stockActuel} {art.unite}s
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: '#78716c', fontWeight: 600 }}>
                        {art.stockMin} {art.unite}s
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '4px 10px', borderRadius: 999,
                        background: estRupture ? '#FEF2F1' : '#fffbeb',
                        color: estRupture ? '#b91c1c' : '#b45309',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: estRupture ? '#dc2626' : '#d97706',
                        }} />
                        {estRupture ? 'Rupture complète' : 'Stock faible'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => setArticleAReappro(art)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '6px 12px', borderRadius: 8, border: 'none',
                          background: '#16a34a', color: 'white', fontSize: 12, fontWeight: 700,
                          cursor: 'pointer', boxShadow: '0 2px 6px rgba(22,163,74,0.25)',
                        }}
                      >
                        <PlusCircle size={14} />
                        Réapprovisionner
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modale Réappro */}
      <ReapprovisionnementModal
        isOpen={!!articleAReappro}
        article={articleAReappro}
        onClose={() => setArticleAReappro(null)}
        onConfirm={handleReapprovisionner}
      />
    </div>
  )
}
