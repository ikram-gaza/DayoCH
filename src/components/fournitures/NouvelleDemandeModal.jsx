import { useState, useMemo } from 'react'
import { X, ShoppingBag, Plus, Minus, Trash2, Calendar, AlertCircle } from 'lucide-react'
import { CATEGORIES_ARTICLES } from '../../services/fournituresService'

export default function NouvelleDemandeModal({ isOpen, onClose, onSubmit, articles = [] }) {
  const [selectedArticles, setSelectedArticles] = useState([]) // [{ articleId, quantite, nom, typeDotation }]
  const [motif, setMotif] = useState('')
  const [dateRestitutionPrevue, setDateRestitutionPrevue] = useState('')
  const [searchArticle, setSearchArticle] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')
  const [error, setError] = useState('')

  // Articles disponibles au catalogue
  const articlesFiltres = useMemo(() => {
    return articles.filter(a => {
      const matchCat = selectedCat === 'all' || a.categorie === selectedCat
      const matchSearch = searchArticle === '' ||
        a.nom.toLowerCase().includes(searchArticle.toLowerCase()) ||
        a.reference.toLowerCase().includes(searchArticle.toLowerCase())
      return matchCat && matchSearch
    })
  }, [articles, selectedCat, searchArticle])

  // Détecte s'il y a au moins un article de type emprunt
  const contientEmprunt = useMemo(() => {
    return selectedArticles.some(item => item.typeDotation === 'emprunt')
  }, [selectedArticles])

  if (!isOpen) return null

  const handleAjouterArticle = (article) => {
    if (article.stockActuel <= 0) return

    const existant = selectedArticles.find(item => item.articleId === article.id)
    if (existant) {
      if (existant.quantite >= article.stockActuel) {
        setError(`Stock maximal disponible atteint pour ${article.nom} (${article.stockActuel} disp.)`)
        return
      }
      setSelectedArticles(prev => prev.map(item =>
        item.articleId === article.id ? { ...item, quantite: item.quantite + 1 } : item
      ))
    } else {
      setSelectedArticles(prev => [
        ...prev,
        {
          articleId: article.id,
          nom: article.nom,
          typeDotation: article.typeDotation,
          quantite: 1,
          maxStock: article.stockActuel,
          unite: article.unite,
        },
      ])
    }
    setError('')
  }

  const handleModifierQuantite = (articleId, delta) => {
    setSelectedArticles(prev => prev.map(item => {
      if (item.articleId === articleId) {
        const nouvelleQte = item.quantite + delta
        if (nouvelleQte <= 0) return null
        if (nouvelleQte > item.maxStock) {
          setError(`Stock maximal disponible : ${item.maxStock}`)
          return item
        }
        return { ...item, quantite: nouvelleQte }
      }
      return item
    }).filter(Boolean))
    setError('')
  }

  const handleSupprimerArticle = (articleId) => {
    setSelectedArticles(prev => prev.filter(item => item.articleId !== articleId))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (selectedArticles.length === 0) {
      setError('Veuillez sélectionner au moins un article à commander.')
      return
    }

    if (contientEmprunt && !dateRestitutionPrevue) {
      setError('Vous avez sélectionné du matériel empruntable. Veuillez spécifier la date de restitution prévue.')
      return
    }

    onSubmit({
      articles: selectedArticles.map(({ articleId, nom, quantite, typeDotation }) => ({
        articleId,
        nom,
        quantite,
        typeDotation,
      })),
      motif,
      typeDemande: contientEmprunt ? 'emprunt' : 'consommable',
      dateRestitutionPrevue: contientEmprunt ? dateRestitutionPrevue : null,
    })

    // Reset
    setSelectedArticles([])
    setMotif('')
    setDateRestitutionPrevue('')
    setError('')
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 720,
        boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
        border: '1px solid #e7e5e4', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header modal */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: '1px solid #f5f5f4',
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1c1917', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingBag size={20} style={{ color: '#007FE1' }} />
              Demande de fournitures & matériel
            </h2>
            <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
              Sélectionnez les articles nécessaires à votre activité professionnelle.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10, border: 'none',
              background: '#f5f5f4', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: '#78716c',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Corps formulaire */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#FEF2F1', border: '1px solid #fecaca',
              borderRadius: 12, padding: '10px 14px', color: '#b91c1c', fontSize: 13,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Sélection des articles dans le catalogue */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Choisir des articles dans le catalogue
              </label>
              <span style={{ fontSize: 12, color: '#007FE1', fontWeight: 600 }}>
                {selectedArticles.length} article{selectedArticles.length > 1 ? 's' : ''} dans votre panier
              </span>
            </div>

            {/* Barre de recherche et filtres de catégorie */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                type="search"
                placeholder="Rechercher par référence, nom d'article..."
                value={searchArticle}
                onChange={(e) => setSearchArticle(e.target.value)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              />
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: 10, border: '1px solid #e7e5e4',
                  background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">Toutes les catégories</option>
                {CATEGORIES_ARTICLES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Grille de sélection d'articles */}
            <div style={{
              maxHeight: 180, overflowY: 'auto', border: '1px solid #e7e5e4',
              borderRadius: 12, background: '#fafaf9', padding: 8,
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              {articlesFiltres.map(art => {
                const epuise = art.stockActuel <= 0
                const dejaAjoute = selectedArticles.some(item => item.articleId === art.id)

                return (
                  <div
                    key={art.id}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 12px', borderRadius: 10, background: 'white',
                      border: '1px solid #f5f5f4', opacity: epuise ? 0.6 : 1,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1c1917', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {art.nom}
                      </p>
                      <p style={{ fontSize: 11, color: '#78716c', margin: '2px 0 0' }}>
                        Réf. {art.reference} · {art.typeDotation === 'emprunt' ? 'Matériel (Prêt)' : 'Consommable'} ·
                        <span style={{ fontWeight: 700, color: epuise ? '#dc2626' : (art.stockActuel <= art.stockMin ? '#d97706' : '#16a34a') }}>
                          {' '}{art.stockActuel} {art.unite}s en stock
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={epuise}
                      onClick={() => handleAjouterArticle(art)}
                      style={{
                        padding: '6px 12px', borderRadius: 8, border: 'none',
                        background: epuise ? '#f5f5f4' : (dejaAjoute ? '#E5F2FD' : '#007FE1'),
                        color: epuise ? '#a8a29e' : (dejaAjoute ? '#007FE1' : 'white'),
                        fontSize: 12, fontWeight: 700, cursor: epuise ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 12,
                      }}
                    >
                      <Plus size={14} />
                      {dejaAjoute ? 'Ajouter +' : 'Choisir'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. Récapitulatif du Panier */}
          {selectedArticles.length > 0 && (
            <div style={{
              background: '#F0F8FF', border: '1px solid rgba(0,127,225,0.2)',
              borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#007FE1', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Articles commandés ({selectedArticles.reduce((s, i) => s + i.quantite, 0)} au total)
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedArticles.map(item => (
                  <div
                    key={item.articleId}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'white', borderRadius: 10, padding: '8px 12px',
                      border: '1px solid #e7e5e4',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1c1917', margin: 0 }}>{item.nom}</p>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                        background: item.typeDotation === 'emprunt' ? '#fef9c3' : '#dcfce7',
                        color: item.typeDotation === 'emprunt' ? '#a16207' : '#15803d',
                      }}>
                        {item.typeDotation === 'emprunt' ? 'Emprunt temporaire' : 'Dotation définitive'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', background: '#fafaf9', border: '1px solid #e7e5e4', borderRadius: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleModifierQuantite(item.articleId, -1)}
                          style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Minus size={13} />
                        </button>
                        <span style={{ minWidth: 26, textAlign: 'center', fontSize: 13, fontWeight: 700, color: '#1c1917' }}>
                          {item.quantite}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleModifierQuantite(item.articleId, 1)}
                          style={{ width: 28, height: 28, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSupprimerArticle(item.articleId)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', padding: 4 }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Date de restitution (si matériel emprunté) */}
          {contientEmprunt && (
            <div style={{
              background: '#fffbeb', border: '1px solid #fef3c7',
              borderRadius: 12, padding: '12px 16px',
            }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#a16207', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Calendar size={14} />
                Date de restitution prévue du matériel emprunté <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="date"
                value={dateRestitutionPrevue}
                onChange={(e) => setDateRestitutionPrevue(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #fde68a', fontSize: 13,
                  outline: 'none', background: 'white',
                }}
              />
              <p style={{ fontSize: 11, color: '#a16207', margin: '6px 0 0' }}>
                Le matériel doit être restitué au gestionnaire de stock dans un état conforme à l'issue de cette date.
              </p>
            </div>
          )}

          {/* Motif / Commentaire */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
              Justification / Contexte du besoin
            </label>
            <textarea
              rows={3}
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : Préparation de la mission commerciale, renouvellement matériel défectueux..."
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px', borderRadius: 10,
                border: '1px solid #e7e5e4', fontSize: 13,
                outline: 'none', resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Boutons d'action */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid #f5f5f4' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px', borderRadius: 10, border: '1px solid #e7e5e4',
                background: 'white', color: '#57534e', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 20px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #007FE1, #0066C0)',
                color: 'white', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,127,225,0.25)',
              }}
            >
              <ShoppingBag size={15} />
              Soumettre la commande
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
