/**
 * Service de gestion des Fournitures, du Matériel et des Stocks - Groupe Dayo
 */

export const CATEGORIES_ARTICLES = [
  { id: 'informatique', label: 'Matériel informatique', code: 'INF', color: '#007FE1', bg: '#E5F2FD' },
  { id: 'papeterie',    label: 'Papeterie & Bureau',   code: 'PAP', color: '#16a34a', bg: '#dcfce7' },
  { id: 'mobilier',      label: 'Mobilier & Équipements', code: 'MOB', color: '#a16207', bg: '#fef9c3' },
  { id: 'consommables', label: 'Consommables & Hygiène', code: 'CSO', color: '#7c3aed', bg: '#f3e8ff' },
]

export const STATUTS_DEMANDE_FOURNITURES = {
  en_attente: { label: 'En attente', color: '#a16207', bg: '#fef9c3', dot: '#eab308' },
  approuve:   { label: 'Approuvé',   color: '#007FE1', bg: '#E5F2FD', dot: '#007FE1' },
  en_preparation: { label: 'En préparation', color: '#7c3aed', bg: '#f3e8ff', dot: '#8b5cf6' },
  livre:      { label: 'Livré / Remis', color: '#15803d', bg: '#dcfce7', dot: '#22c55e' },
  refuse:     { label: 'Refusé',     color: '#b91c1c', bg: '#FEF2F1', dot: '#ef4444' },
  annule:     { label: 'Annulé',     color: '#57534e', bg: '#f5f5f4', dot: '#a8a29e' },
}

const STORAGE_KEY_ARTICLES = 'dayoch_articles_stock_v2'
const STORAGE_KEY_DEMANDES_FOURNITURES = 'dayoch_demandes_fournitures_v2'
const STORAGE_KEY_MOUVEMENTS = 'dayoch_mouvements_stock_v2'

const INITIAL_ARTICLES = []

const INITIAL_DEMANDES = []

const INITIAL_MOUVEMENTS = []

export const fournituresService = {
  // ── ARTICLES & INVENTAIRE ──
  getArticles: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_ARTICLES)
      if (data) return JSON.parse(data)
    } catch {
      // Ignorer
    }
    localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(INITIAL_ARTICLES))
    return INITIAL_ARTICLES
  },

  saveArticles: (articles) => {
    try {
      localStorage.setItem(STORAGE_KEY_ARTICLES, JSON.stringify(articles))
    } catch {
      // Ignorer
    }
  },

  ajouterArticle: (nouvelArticle) => {
    const articles = fournituresService.getArticles()
    const article = {
      ...nouvelArticle,
      id: Date.now(),
      reference: nouvelArticle.reference || `DAY-${nouvelArticle.categorie.slice(0, 3).toUpperCase()}-${String(articles.length + 1).padStart(3, '0')}`,
      stockActuel: Number(nouvelArticle.stockActuel) || 0,
      stockMin: Number(nouvelArticle.stockMin) || 2,
    }
    const updated = [article, ...articles]
    fournituresService.saveArticles(updated)

    // Enregistrer mouvement initial si stock > 0
    if (article.stockActuel > 0) {
      fournituresService.enregistrerMouvement({
        articleId: article.id,
        articleNom: article.nom,
        articleRef: article.reference,
        typeMouvement: 'entree_reassort',
        quantite: article.stockActuel,
        stockAvant: 0,
        stockApres: article.stockActuel,
        filiale: article.filiale,
        auteur: 'Gestionnaire Stock',
        beneficiaire: 'Stock initial',
        referenceDoc: 'INITIALISATION',
      })
    }
    return article
  },

  modifierArticle: (id, updates) => {
    const articles = fournituresService.getArticles()
    const updated = articles.map(a => a.id === id ? { ...a, ...updates } : a)
    fournituresService.saveArticles(updated)
    return updated
  },

  reapprovisionnerArticle: (id, quantiteAjoutee, user, motif = 'Réapprovisionnement fournisseur') => {
    const qte = Number(quantiteAjoutee)
    if (isNaN(qte) || qte <= 0) return

    const articles = fournituresService.getArticles()
    let articleModifie = null

    const updated = articles.map(a => {
      if (a.id === id) {
        const stockAvant = a.stockActuel
        const stockApres = stockAvant + qte
        articleModifie = { ...a, stockActuel: stockApres }

        // Enregistrer dans la traçabilité
        fournituresService.enregistrerMouvement({
          articleId: a.id,
          articleNom: a.nom,
          articleRef: a.reference,
          typeMouvement: 'entree_reassort',
          quantite: qte,
          stockAvant,
          stockApres,
          filiale: a.filiale,
          auteur: `${user?.prenom || ''} ${user?.nom || 'Gestionnaire'}`.trim(),
          beneficiaire: 'Entrée Stock',
          referenceDoc: motif,
        })

        return articleModifie
      }
      return a
    })

    fournituresService.saveArticles(updated)
    return updated
  },

  // ── DEMANDES DE FOURNITURES ──
  getDemandes: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_DEMANDES_FOURNITURES)
      if (data) return JSON.parse(data)
    } catch {
      // Ignorer
    }
    localStorage.setItem(STORAGE_KEY_DEMANDES_FOURNITURES, JSON.stringify(INITIAL_DEMANDES))
    return INITIAL_DEMANDES
  },

  saveDemandes: (demandes) => {
    try {
      localStorage.setItem(STORAGE_KEY_DEMANDES_FOURNITURES, JSON.stringify(demandes))
    } catch {
      // Ignorer
    }
  },

  getMesDemandes: (user) => {
    const all = fournituresService.getDemandes()
    if (!user) return []
    return all.filter(d =>
      d.demandeurId === user.id ||
      d.demandeurMatricule === user.matricule ||
      (d.demandeurNom && d.demandeurNom.toLowerCase().includes(user.nom?.toLowerCase() || ''))
    )
  },

  creerDemande: (user, data) => {
    const all = fournituresService.getDemandes()
    const nouvelleDemande = {
      id: Date.now(),
      reference: `CMD-${new Date().getFullYear()}-${String(all.length + 1).padStart(3, '0')}`,
      demandeurId: user?.id || 99,
      demandeurNom: `${user?.prenom || ''} ${user?.nom || 'Collaborateur'}`.trim(),
      demandeurPoste: user?.poste || 'Collaborateur',
      demandeurMatricule: user?.matricule || 'DAY-999',
      filiale: user?.filiale || 'Dayo Bénin',
      articles: data.articles || [],
      motif: data.motif || '',
      typeDemande: data.typeDemande || 'consommable',
      dateRestitutionPrevue: data.dateRestitutionPrevue || null,
      statut: 'en_attente',
      dateCreation: new Date().toISOString(),
      traitePar: null,
      commentaireRefus: null,
    }

    const updated = [nouvelleDemande, ...all]
    fournituresService.saveDemandes(updated)
    return nouvelleDemande
  },

  changerStatutDemande: (demandeId, nouveauStatut, user, commentaire = null) => {
    const demandes = fournituresService.getDemandes()
    const articles = fournituresService.getArticles()

    const updatedDemandes = demandes.map(d => {
      if (d.id === demandeId) {
        const modifiee = {
          ...d,
          statut: nouveauStatut,
          traitePar: `${user?.prenom || ''} ${user?.nom || 'Gestionnaire'}`.trim(),
          dateMiseAJour: new Date().toISOString(),
        }
        if (nouveauStatut === 'livre') {
          modifiee.dateLivraison = new Date().toISOString()
        }
        if (nouveauStatut === 'refuse') {
          modifiee.commentaireRefus = commentaire
        }
        return modifiee
      }
      return d
    })

    // Si livré, déduire le stock des articles correspondants et enregistrer la sortie
    if (nouveauStatut === 'livre') {
      const demandeConcernee = demandes.find(d => d.id === demandeId)
      if (demandeConcernee && demandeConcernee.articles) {
        let updatedArticles = [...articles]

        demandeConcernee.articles.forEach(artCmd => {
          updatedArticles = updatedArticles.map(a => {
            if (a.id === artCmd.articleId) {
              const stockAvant = a.stockActuel
              const stockApres = Math.max(0, stockAvant - artCmd.quantite)

              fournituresService.enregistrerMouvement({
                articleId: a.id,
                articleNom: a.nom,
                articleRef: a.reference,
                typeMouvement: 'sortie_demande',
                quantite: artCmd.quantite,
                stockAvant,
                stockApres,
                filiale: a.filiale,
                auteur: `${user?.prenom || ''} ${user?.nom || 'Gestionnaire'}`.trim(),
                beneficiaire: demandeConcernee.demandeurNom,
                referenceDoc: demandeConcernee.reference,
              })

              return { ...a, stockActuel: stockApres }
            }
            return a
          })
        })

        fournituresService.saveArticles(updatedArticles)
      }
    }

    fournituresService.saveDemandes(updatedDemandes)
    return updatedDemandes
  },

  annulerDemande: (demandeId) => {
    const all = fournituresService.getDemandes()
    const updated = all.map(d => d.id === demandeId ? { ...d, statut: 'annule' } : d)
    fournituresService.saveDemandes(updated)
    return updated
  },

  // ── TRAÇABILITÉ / MOUVEMENTS ──
  getMouvements: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY_MOUVEMENTS)
      if (data) return JSON.parse(data)
    } catch {
      // Ignorer
    }
    localStorage.setItem(STORAGE_KEY_MOUVEMENTS, JSON.stringify(INITIAL_MOUVEMENTS))
    return INITIAL_MOUVEMENTS
  },

  enregistrerMouvement: (mouvementData) => {
    const all = fournituresService.getMouvements()
    const mouvement = {
      id: Date.now() + Math.floor(Math.random() * 100),
      date: new Date().toISOString(),
      ...mouvementData,
    }
    const updated = [mouvement, ...all]
    try {
      localStorage.setItem(STORAGE_KEY_MOUVEMENTS, JSON.stringify(updated))
    } catch {
      // Ignorer
    }
    return mouvement
  },

  // ── STATISTIQUES & ALERTES ──
  getStats: (user) => {
    const articles = fournituresService.getArticles()
    const demandes = fournituresService.getDemandes()

    const articlesFiliale = user?.filiale
      ? articles.filter(a => a.filiale === user.filiale || user.role === 'super_admin' || user.role === 'gestionnaire_stock')
      : articles

    const totalArticles = articlesFiliale.length
    const ruptures = articlesFiliale.filter(a => a.stockActuel === 0).length
    const stockFaible = articlesFiliale.filter(a => a.stockActuel > 0 && a.stockActuel <= a.stockMin).length
    const valeurTotale = articlesFiliale.reduce((sum, a) => sum + (a.stockActuel * (a.prixUnitaire || 0)), 0)

    const demandesEnAttente = demandes.filter(d => d.statut === 'en_attente').length
    const demandesLivrees = demandes.filter(d => d.statut === 'livre').length

    // Équipements empruntés en cours
    const equipementsEmpruntes = demandes
      .filter(d => d.typeDemande === 'emprunt' && (d.statut === 'livre' || d.statut === 'approuve'))
      .reduce((sum, d) => sum + d.articles.reduce((subSum, a) => subSum + a.quantite, 0), 0)

    return {
      totalArticles,
      ruptures,
      stockFaible,
      valeurTotale,
      demandesEnAttente,
      demandesLivrees,
      equipementsEmpruntes,
    }
  },

  getAlertesStock: () => {
    const articles = fournituresService.getArticles()
    return articles.filter(a => a.stockActuel <= a.stockMin)
  },
}
