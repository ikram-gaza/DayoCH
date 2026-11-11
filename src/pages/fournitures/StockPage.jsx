import { useState, useMemo } from 'react'
import {
  Warehouse, Plus, Search, Download, AlertTriangle,
  CheckCircle2, Package, Layers, Edit, PlusCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  fournituresService,
  CATEGORIES_ARTICLES,
} from '../../services/fournituresService'
import { FILIALES } from '../../config/filiales'
import ArticleModal from '../../components/fournitures/ArticleModal'
import ReapprovisionnementModal from '../../components/fournitures/ReapprovisionnementModal'

export default function StockPage() {
  const { user } = useAuth()

  const [articles, setArticles] = useState(() => fournituresService.getArticles())
  const [recherche, setRecherche] = useState('')
  const [filialeFiltre, setFilialeFiltre] = useState('all')
  const [categorieFiltre, setCategorieFiltre] = useState('all')
  const [etatFiltre, setEtatFiltre] = useState('all') // all, normal, alerte, rupture

  // Modales
  const [showArticleModal, setShowArticleModal] = useState(false)
  const [articleEnEdition, setArticleEnEdition] = useState(null)
  const [articleAReappro, setArticleAReappro] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const recharger = () => {
    setArticles([...fournituresService.getArticles()])
  }

  const afficherToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // KPIs
  const kpis = useMemo(() => {
    const totalRef = articles.length
    const ruptures = articles.filter(a => a.stockActuel === 0).length
    const alertes = articles.filter(a => a.stockActuel > 0 && a.stockActuel <= a.stockMin).length
    const valeurTotale = articles.reduce((sum, a) => sum + (a.stockActuel * (a.prixUnitaire || 0)), 0)

    return { totalRef, ruptures, alertes, valeurTotale }
  }, [articles])

  // Articles filtrés
  const articlesFiltres = useMemo(() => {
    return articles.filter(a => {
      const matchRech = recherche === '' ||
        a.nom.toLowerCase().includes(recherche.toLowerCase()) ||
        a.reference.toLowerCase().includes(recherche.toLowerCase())
      const matchFiliale = filialeFiltre === 'all' || a.filiale === filialeFiltre
      const matchCat = categorieFiltre === 'all' || a.categorie === categorieFiltre

      let matchEtat = true
      if (etatFiltre === 'rupture') matchEtat = a.stockActuel === 0
      else if (etatFiltre === 'alerte') matchEtat = a.stockActuel > 0 && a.stockActuel <= a.stockMin
      else if (etatFiltre === 'normal') matchEtat = a.stockActuel > a.stockMin

      return matchRech && matchFiliale && matchCat && matchEtat
    })
  }, [articles, recherche, filialeFiltre, categorieFiltre, etatFiltre])

  const handleSaveArticle = (articleData) => {
    if (articleData.id) {
      fournituresService.modifierArticle(articleData.id, articleData)
      afficherToast('Article mis à jour avec succès.')
    } else {
      fournituresService.ajouterArticle(articleData)
      afficherToast('Nouvelle référence créée et ajoutée au catalogue.')
    }
    recharger()
  }

  const handleReapprovisionner = (articleId, quantite, motif) => {
    fournituresService.reapprovisionnerArticle(articleId, quantite, user, motif)
    recharger()
    afficherToast(`Réapprovisionnement de +${quantite} unités enregistré.`)
  }

  // Export CSV inventaire
  const handleExportCSV = () => {
    if (articles.length === 0) return
    const headers = ['Référence', 'Désignation', 'Catégorie', 'Filiale', 'Stock Actuel', 'Stock Min', 'Unité', 'Prix Unitaire (FCFA)', 'Valeur Stock']
    const rows = articles.map(a => [
      a.reference,
      `"${a.nom.replace(/"/g, '""')}"`,
      a.categorie,
      `"${a.filiale}"`,
      a.stockActuel,
      a.stockMin,
      a.unite,
      a.prixUnitaire || 0,
      (a.stockActuel * (a.prixUnitaire || 0)),
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `inventaire_stock_dayo_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    afficherToast('Export inventaire CSV téléchargé.')
  }

  const getCat = (catId) => CATEGORIES_ARTICLES.find(c => c.id === catId) || CATEGORIES_ARTICLES[0]

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Warehouse size={24} style={{ color: '#007FE1' }} />
            Gestion des Stocks & Inventaire
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            Suivez les niveaux de stock par filiale, réapprovisionnez et gérez les fiches articles.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            Export Inventaire
          </button>
          <button
            onClick={() => { setArticleEnEdition(null); setShowArticleModal(true) }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #007FE1, #0066C0)',
              color: 'white', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)',
            }}
          >
            <Plus size={16} />
            Nouvel article
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#007FE1', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Références en catalogue
            </span>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: '#E5F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#007FE1' }}>
              <Layers size={16} />
            </span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#1c1917', margin: '10px 0 0' }}>{kpis.totalRef}</p>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '4px 0 0' }}>Articles actifs référencés</p>
        </div>

        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Valeur du stock estimée
            </span>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <Package size={16} />
            </span>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#1c1917', margin: '10px 0 0' }}>
            {new Intl.NumberFormat('fr-FR').format(kpis.valeurTotale)} <span style={{ fontSize: 13, color: '#78716c' }}>FCFA</span>
          </p>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '4px 0 0' }}>Valorisation globale</p>
        </div>

        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Stock sous seuil critique
            </span>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#1c1917', margin: '10px 0 0' }}>{kpis.alertes}</p>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '4px 0 0' }}>À réapprovisionner rapidement</p>
        </div>

        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ruptures complètes
            </span>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: '#FEF2F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <AlertTriangle size={16} />
            </span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#1c1917', margin: '10px 0 0' }}>{kpis.ruptures}</p>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '4px 0 0' }}>Stock à zéro</p>
        </div>
      </div>

      {/* Barre de filtres */}
      <div style={{
        background: 'white', borderRadius: 14, padding: '14px 18px',
        border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input
            type="search"
            placeholder="Rechercher par référence, désignation..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px 8px 34px', borderRadius: 10,
              border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Filiale */}
          <select
            value={filialeFiltre}
            onChange={(e) => setFilialeFiltre(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid #e7e5e4',
              background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917', outline: 'none',
            }}
          >
            <option value="all">Toutes les filiales</option>
            {FILIALES.map(f => (
              <option key={f.id} value={f.nom}>{f.nom}</option>
            ))}
          </select>

          {/* Catégorie */}
          <select
            value={categorieFiltre}
            onChange={(e) => setCategorieFiltre(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid #e7e5e4',
              background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917', outline: 'none',
            }}
          >
            <option value="all">Toutes catégories</option>
            {CATEGORIES_ARTICLES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* État du stock */}
          <select
            value={etatFiltre}
            onChange={(e) => setEtatFiltre(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: 8, border: '1px solid #e7e5e4',
              background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917', outline: 'none',
            }}
          >
            <option value="all">Tous les états</option>
            <option value="normal">Stock suffisant</option>
            <option value="alerte">Sous seuil critique</option>
            <option value="rupture">En rupture (0)</option>
          </select>
        </div>
      </div>

      {/* Tableau d'inventaire */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {articlesFiltres.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <Warehouse size={36} style={{ color: '#d6d3d1', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>Aucun article trouvé</p>
            <p style={{ fontSize: 13, color: '#a8a29e', margin: '4px 0 0' }}>Modifiez vos critères de recherche ou de filtre.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4', color: '#78716c', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 20px' }}>Article & Référence</th>
                <th style={{ padding: '14px 20px' }}>Catégorie</th>
                <th style={{ padding: '14px 20px' }}>Filiale</th>
                <th style={{ padding: '14px 20px' }}>Stock Actuel</th>
                <th style={{ padding: '14px 20px' }}>Seuil Alerte</th>
                <th style={{ padding: '14px 20px' }}>Prix Unitaire</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articlesFiltres.map(art => {
                const cat = getCat(art.categorie)
                const estRupture = art.stockActuel === 0
                const estAlerte = art.stockActuel > 0 && art.stockActuel <= art.stockMin

                return (
                  <tr key={art.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 700, color: '#1c1917', margin: 0 }}>{art.nom}</p>
                      <p style={{ fontSize: 11, color: '#a8a29e', margin: '2px 0 0' }}>
                        Réf. {art.reference} · {art.typeDotation === 'emprunt' ? 'Matériel (Emprunt)' : 'Consommable'}
                      </p>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                        background: cat.bg, color: cat.color,
                      }}>
                        {cat.label}
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontWeight: 600, color: '#1c1917' }}>{art.filiale}</span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        fontWeight: 800, fontSize: 14,
                        color: estRupture ? '#dc2626' : (estAlerte ? '#d97706' : '#16a34a'),
                      }}>
                        <span style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: estRupture ? '#dc2626' : (estAlerte ? '#d97706' : '#16a34a'),
                        }} />
                        {art.stockActuel} {art.unite}s
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ color: '#78716c', fontWeight: 600 }}>
                        min. {art.stockMin} {art.unite}s
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontWeight: 600, color: '#1c1917' }}>
                        {new Intl.NumberFormat('fr-FR').format(art.prixUnitaire || 0)} FCFA
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          onClick={() => setArticleAReappro(art)}
                          title="Réapprovisionner le stock"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '6px 10px', borderRadius: 8, border: '1px solid #bbf7d0',
                            background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <PlusCircle size={14} />
                          + Stock
                        </button>
                        <button
                          onClick={() => { setArticleEnEdition(art); setShowArticleModal(true) }}
                          title="Modifier l'article"
                          style={{
                            padding: '6px 8px', borderRadius: 8, border: '1px solid #e7e5e4',
                            background: 'white', color: '#57534e', fontSize: 12,
                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                          }}
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modale Article */}
      <ArticleModal
        isOpen={showArticleModal}
        article={articleEnEdition}
        onClose={() => { setShowArticleModal(false); setArticleEnEdition(null) }}
        onSave={handleSaveArticle}
      />

      {/* Modale Réapprovisionnement */}
      <ReapprovisionnementModal
        isOpen={!!articleAReappro}
        article={articleAReappro}
        onClose={() => setArticleAReappro(null)}
        onConfirm={handleReapprovisionner}
      />
    </div>
  )
}
