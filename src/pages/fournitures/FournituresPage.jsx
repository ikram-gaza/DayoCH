import { useState, useMemo } from 'react'
import {
  Package, ShoppingBag, Clock, CheckCircle2,
  Plus, Search
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  fournituresService,
  CATEGORIES_ARTICLES,
  STATUTS_DEMANDE_FOURNITURES,
} from '../../services/fournituresService'
import NouvelleDemandeModal from '../../components/fournitures/NouvelleDemandeModal'

export default function FournituresPage() {
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('catalogue') // 'catalogue' | 'mes_demandes'
  const [showDemandeModal, setShowDemandeModal] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const [articles, setArticles] = useState(() => fournituresService.getArticles())
  const [demandes, setDemandes] = useState(() => fournituresService.getDemandes())

  // Filtres catalogue
  const [catFiltre, setCatFiltre] = useState('all')
  const [rechercheArticle, setRechercheArticle] = useState('')

  // Filtres mes demandes
  const [statutFiltre, setStatutFiltre] = useState('all')

  const recharger = () => {
    setArticles([...fournituresService.getArticles()])
    setDemandes([...fournituresService.getDemandes()])
  }

  const afficherToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Mes demandes
  const mesDemandes = useMemo(() => {
    return fournituresService.getMesDemandes(user)
  }, [user, demandes])

  // KPIs
  const kpis = useMemo(() => {
    const enCours = mesDemandes.filter(d => d.statut === 'en_attente' || d.statut === 'en_preparation' || d.statut === 'approuve').length
    const empruntsActifs = mesDemandes
      .filter(d => d.typeDemande === 'emprunt' && d.statut === 'livre')
      .reduce((sum, d) => sum + d.articles.reduce((s, a) => s + a.quantite, 0), 0)
    const totalCommandes = mesDemandes.length

    return { enCours, empruntsActifs, totalCommandes }
  }, [mesDemandes])

  // Articles filtrés pour le catalogue
  const articlesFiltres = useMemo(() => {
    return articles.filter(a => {
      const matchCat = catFiltre === 'all' || a.categorie === catFiltre
      const matchRech = rechercheArticle === '' ||
        a.nom.toLowerCase().includes(rechercheArticle.toLowerCase()) ||
        a.reference.toLowerCase().includes(rechercheArticle.toLowerCase()) ||
        a.description?.toLowerCase().includes(rechercheArticle.toLowerCase())
      return matchCat && matchRech
    })
  }, [articles, catFiltre, rechercheArticle])

  // Mes demandes filtrées
  const mesDemandesFiltrees = useMemo(() => {
    return mesDemandes.filter(d => {
      return statutFiltre === 'all' || d.statut === statutFiltre
    })
  }, [mesDemandes, statutFiltre])

  const handleCreerDemande = (demandeData) => {
    fournituresService.creerDemande(user, demandeData)
    recharger()
    afficherToast('Votre commande de fournitures a été transmise au gestionnaire de stock.')
    setActiveTab('mes_demandes')
  }

  const handleAnnulerDemande = (demandeId) => {
    if (window.confirm('Voulez-vous annuler cette demande de fournitures ?')) {
      fournituresService.annulerDemande(demandeId)
      recharger()
      afficherToast('Demande annulée.')
    }
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
            <Package size={24} style={{ color: '#007FE1' }} />
            Fournitures & Matériel
          </h1>
          <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
            Consultez le catalogue disponible, commandez vos équipements et suivez vos livraisons.
          </p>
        </div>

        <button
          onClick={() => setShowDemandeModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #007FE1, #0066C0)',
            color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,127,225,0.25)',
          }}
        >
          <Plus size={16} />
          Nouvelle commande
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#a16207', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Commandes en cours
            </span>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a16207' }}>
              <Clock size={16} />
            </span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#1c1917', margin: '10px 0 0' }}>{kpis.enCours}</p>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '4px 0 0' }}>En attente ou en préparation</p>
        </div>

        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Équipements empruntés
            </span>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: '#FEF2F1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
              <Package size={16} />
            </span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#1c1917', margin: '10px 0 0' }}>{kpis.empruntsActifs}</p>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '4px 0 0' }}>Matériel sous votre responsabilité</p>
        </div>

        <div style={{
          background: 'white', borderRadius: 16, padding: '18px 20px',
          border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Historique de commandes
            </span>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 800, color: '#1c1917', margin: '10px 0 0' }}>{kpis.totalCommandes}</p>
          <p style={{ fontSize: 11, color: '#a8a29e', margin: '4px 0 0' }}>Total des demandes enregistrées</p>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e7e5e4' }}>
        <button
          onClick={() => setActiveTab('catalogue')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10, border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'catalogue' ? '#007FE1' : 'transparent',
            color: activeTab === 'catalogue' ? 'white' : '#57534e',
            transition: 'all 0.15s',
          }}
        >
          <ShoppingBag size={15} />
          Catalogue du matériel ({articles.length})
        </button>

        <button
          onClick={() => setActiveTab('mes_demandes')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 10, border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            background: activeTab === 'mes_demandes' ? '#007FE1' : 'transparent',
            color: activeTab === 'mes_demandes' ? 'white' : '#57534e',
            transition: 'all 0.15s',
          }}
        >
          <Clock size={15} />
          Mes commandes ({mesDemandes.length})
        </button>
      </div>

      {/* ── 1. CATALOGUE ── */}
      {activeTab === 'catalogue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Barre recherche & filtre */}
          <div style={{
            background: 'white', borderRadius: 14, padding: '14px 18px',
            border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 260, maxWidth: 400 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
              <input
                type="search"
                placeholder="Rechercher par référence, désignation..."
                value={rechercheArticle}
                onChange={(e) => setRechercheArticle(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '8px 12px 8px 34px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <button
                onClick={() => setCatFiltre('all')}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: '1px solid', cursor: 'pointer',
                  background: catFiltre === 'all' ? '#007FE1' : 'white',
                  borderColor: catFiltre === 'all' ? '#007FE1' : '#e7e5e4',
                  color: catFiltre === 'all' ? 'white' : '#57534e',
                }}
              >
                Tous
              </button>
              {CATEGORIES_ARTICLES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCatFiltre(c.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                    border: '1px solid', cursor: 'pointer',
                    background: catFiltre === c.id ? c.color : 'white',
                    borderColor: catFiltre === c.id ? c.color : '#e7e5e4',
                    color: catFiltre === c.id ? 'white' : '#57534e',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grille des articles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
            {articlesFiltres.map(art => {
              const cat = getCat(art.categorie)
              const estRupture = art.stockActuel === 0
              const estFaible = art.stockActuel > 0 && art.stockActuel <= art.stockMin

              return (
                <div
                  key={art.id}
                  style={{
                    background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
                    padding: 20, display: 'flex', flexDirection: 'column',
                    justifyContent: 'space-between', gap: 14,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)' }}
                >
                  <div>
                    {/* Header carte */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                        background: cat.bg, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {cat.label}
                      </span>
                      <span style={{ fontSize: 11, color: '#a8a29e', fontWeight: 600 }}>
                        {art.reference}
                      </span>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0, lineHeight: 1.3 }}>
                      {art.nom}
                    </h3>

                    <p style={{ fontSize: 12, color: '#78716c', margin: '8px 0 0', lineHeight: 1.4 }}>
                      {art.description}
                    </p>
                  </div>

                  <div>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      paddingTop: 12, borderTop: '1px solid #f5f5f4', fontSize: 12,
                    }}>
                      <span style={{ color: '#78716c' }}>
                        {art.typeDotation === 'emprunt' ? '📦 Matériel prêté' : '✏️ Consommable'}
                      </span>
                      <span style={{
                        fontWeight: 700,
                        color: estRupture ? '#dc2626' : (estFaible ? '#d97706' : '#16a34a'),
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: estRupture ? '#dc2626' : (estFaible ? '#d97706' : '#16a34a'),
                        }} />
                        {estRupture ? 'Rupture' : `${art.stockActuel} en stock`}
                      </span>
                    </div>

                    <button
                      disabled={estRupture}
                      onClick={() => setShowDemandeModal(true)}
                      style={{
                        width: '100%', marginTop: 12, padding: '8px 12px',
                        borderRadius: 10, border: 'none',
                        background: estRupture ? '#f5f5f4' : '#007FE1',
                        color: estRupture ? '#a8a29e' : 'white',
                        fontSize: 12, fontWeight: 700, cursor: estRupture ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        transition: 'background 0.15s',
                      }}
                    >
                      <Plus size={14} />
                      {estRupture ? 'Indisponible' : 'Commander cet article'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 2. MES COMMANDES ── */}
      {activeTab === 'mes_demandes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{
            background: 'white', borderRadius: 14, padding: '14px 18px',
            border: '1px solid #e7e5e4', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1c1917', margin: 0 }}>
              Suivi de vos demandes de fournitures & matériel
            </p>
            <select
              value={statutFiltre}
              onChange={(e) => setStatutFiltre(e.target.value)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: '1px solid #e7e5e4',
                background: '#fafaf9', fontSize: 12, fontWeight: 600, color: '#1c1917', outline: 'none',
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="en_attente">En attente</option>
              <option value="approuve">Approuvé</option>
              <option value="en_preparation">En préparation</option>
              <option value="livre">Livré / Remis</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>

          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
            overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            {mesDemandesFiltrees.length === 0 ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <Package size={36} style={{ color: '#d6d3d1', margin: '0 auto 12px' }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>
                  Aucune commande trouvée
                </p>
                <p style={{ fontSize: 13, color: '#a8a29e', margin: '4px 0 16px' }}>
                  Vous n'avez pas de commande de matériel enregistrée.
                </p>
                <button
                  onClick={() => setShowDemandeModal(true)}
                  style={{
                    padding: '8px 16px', borderRadius: 10, border: 'none',
                    background: '#007FE1', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Passer une commande
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4', color: '#78716c', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 20px' }}>Réf. Commande</th>
                    <th style={{ padding: '14px 20px' }}>Articles commandés</th>
                    <th style={{ padding: '14px 20px' }}>Type</th>
                    <th style={{ padding: '14px 20px' }}>Motif</th>
                    <th style={{ padding: '14px 20px' }}>Statut</th>
                    <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mesDemandesFiltrees.map(dem => {
                    const statut = STATUTS_DEMANDE_FOURNITURES[dem.statut] || STATUTS_DEMANDE_FOURNITURES.en_attente
                    return (
                      <tr key={dem.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontWeight: 700, color: '#1c1917', margin: 0 }}>{dem.reference}</p>
                          <p style={{ fontSize: 11, color: '#a8a29e', margin: '2px 0 0' }}>
                            {new Date(dem.dateCreation).toLocaleDateString('fr-FR')}
                          </p>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#292524' }}>
                            {dem.articles.map((art, idx) => (
                              <li key={idx}>
                                <strong>{art.quantite}×</strong> {art.nom}
                              </li>
                            ))}
                          </ul>
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                            background: dem.typeDemande === 'emprunt' ? '#fef9c3' : '#dcfce7',
                            color: dem.typeDemande === 'emprunt' ? '#a16207' : '#15803d',
                          }}>
                            {dem.typeDemande === 'emprunt' ? 'Emprunt matériel' : 'Dotation'}
                          </span>
                          {dem.dateRestitutionPrevue && (
                            <p style={{ fontSize: 10, color: '#a16207', margin: '3px 0 0' }}>
                              Retour avant le {new Date(dem.dateRestitutionPrevue).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </td>

                        <td style={{ padding: '14px 20px', maxWidth: 220 }}>
                          <p style={{ fontSize: 12, color: '#57534e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {dem.motif || 'Aucun motif'}
                          </p>
                          {dem.commentaireRefus && (
                            <p style={{ fontSize: 11, color: '#dc2626', margin: '2px 0 0', fontWeight: 600 }}>
                              Motif refus : {dem.commentaireRefus}
                            </p>
                          )}
                        </td>

                        <td style={{ padding: '14px 20px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '4px 10px', borderRadius: 999,
                            background: statut.bg, color: statut.color,
                            fontSize: 12, fontWeight: 700,
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statut.dot }} />
                            {statut.label}
                          </span>
                        </td>

                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          {dem.statut === 'en_attente' && (
                            <button
                              onClick={() => handleAnnulerDemande(dem.id)}
                              style={{
                                padding: '5px 10px', borderRadius: 8, border: '1px solid #fee2e2',
                                background: '#FEF2F1', color: '#dc2626', fontSize: 12, fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Annuler
                            </button>
                          )}
                          {dem.statut === 'livre' && (
                            <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                              Reçu le {dem.dateLivraison ? new Date(dem.dateLivraison).toLocaleDateString('fr-FR') : 'Confirmé'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal Commande */}
      <NouvelleDemandeModal
        isOpen={showDemandeModal}
        articles={articles}
        onClose={() => setShowDemandeModal(false)}
        onSubmit={handleCreerDemande}
      />
    </div>
  )
}
