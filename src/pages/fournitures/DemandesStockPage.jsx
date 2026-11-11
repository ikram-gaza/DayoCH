import { useState, useMemo } from 'react'
import {
  MessageSquare, Truck, Clock, CheckCircle2,
  Search, AlertCircle
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import {
  fournituresService,
  STATUTS_DEMANDE_FOURNITURES,
} from '../../services/fournituresService'

export default function DemandesStockPage() {
  const { user } = useAuth()

  const [demandes, setDemandes] = useState(() => fournituresService.getDemandes())
  const [recherche, setRecherche] = useState('')
  const [statutFiltre, setStatutFiltre] = useState('all')
  const [toastMessage, setToastMessage] = useState(null)
  const [motifRefusDemande, setMotifRefusDemande] = useState(null) // demandeId en cours de refus
  const [texteRefus, setTexteRefus] = useState('')

  const recharger = () => {
    setDemandes([...fournituresService.getDemandes()])
  }

  const afficherToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const demandesFiltrees = useMemo(() => {
    return demandes.filter(d => {
      const matchStatut = statutFiltre === 'all' || d.statut === statutFiltre
      const matchRech = recherche === '' ||
        d.demandeurNom.toLowerCase().includes(recherche.toLowerCase()) ||
        d.reference.toLowerCase().includes(recherche.toLowerCase()) ||
        d.filiale.toLowerCase().includes(recherche.toLowerCase())
      return matchStatut && matchRech
    })
  }, [demandes, statutFiltre, recherche])

  const handleChangerStatut = (demandeId, nouveauStatut, commentaire = null) => {
    fournituresService.changerStatutDemande(demandeId, nouveauStatut, user, commentaire)
    recharger()

    if (nouveauStatut === 'livre') {
      afficherToast('Demande marquée comme livrée. Les stocks ont été automatiquement mis à jour.')
    } else if (nouveauStatut === 'approuve') {
      afficherToast('Demande approuvée.')
    } else if (nouveauStatut === 'en_preparation') {
      afficherToast('Demande passée en préparation.')
    } else if (nouveauStatut === 'refuse') {
      afficherToast('Demande refusée.')
    }
  }

  const handleConfirmerRefus = (e) => {
    e.preventDefault()
    if (!texteRefus.trim()) return
    handleChangerStatut(motifRefusDemande, 'refuse', texteRefus)
    setMotifRefusDemande(null)
    setTexteRefus('')
  }

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
          <MessageSquare size={24} style={{ color: '#007FE1' }} />
          Traitement des Demandes de Fournitures
        </h1>
        <p style={{ fontSize: 13, color: '#78716c', margin: '4px 0 0' }}>
          Validez les demandes, préparez le matériel et déstockez lors de la remise au collaborateur.
        </p>
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
            placeholder="Rechercher par demandeur, référence..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '8px 12px 8px 34px', borderRadius: 10,
              border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
            }}
          />
        </div>

        <select
          value={statutFiltre}
          onChange={(e) => setStatutFiltre(e.target.value)}
          style={{
            padding: '7px 12px', borderRadius: 8, border: '1px solid #e7e5e4',
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

      {/* Liste des demandes */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {demandesFiltrees.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <CheckCircle2 size={36} style={{ color: '#16a34a', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#1c1917', margin: 0 }}>Aucune demande à afficher</p>
            <p style={{ fontSize: 13, color: '#a8a29e', margin: '4px 0 0' }}>Toutes les commandes ont été traitées ou ne correspondent pas aux filtres.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#fafaf9', borderBottom: '1px solid #f5f5f4', color: '#78716c', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '14px 20px' }}>Commande & Demandeur</th>
                <th style={{ padding: '14px 20px' }}>Articles & Quantités</th>
                <th style={{ padding: '14px 20px' }}>Type & Motif</th>
                <th style={{ padding: '14px 20px' }}>Statut</th>
                <th style={{ padding: '14px 20px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandesFiltrees.map(dem => {
                const statut = STATUTS_DEMANDE_FOURNITURES[dem.statut] || STATUTS_DEMANDE_FOURNITURES.en_attente
                return (
                  <tr key={dem.id} style={{ borderBottom: '1px solid #f5f5f4' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <p style={{ fontWeight: 700, color: '#1c1917', margin: 0 }}>{dem.demandeurNom}</p>
                      <p style={{ fontSize: 11, color: '#78716c', margin: '2px 0 0' }}>
                        {dem.demandeurPoste} · <span style={{ color: '#007FE1', fontWeight: 600 }}>{dem.filiale}</span>
                      </p>
                      <p style={{ fontSize: 10, color: '#a8a29e', margin: '2px 0 0' }}>
                        Réf. {dem.reference} · {new Date(dem.dateCreation).toLocaleDateString('fr-FR')}
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

                    <td style={{ padding: '14px 20px', maxWidth: 220 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                        background: dem.typeDemande === 'emprunt' ? '#fef9c3' : '#dcfce7',
                        color: dem.typeDemande === 'emprunt' ? '#a16207' : '#15803d',
                        display: 'inline-block', marginBottom: 4,
                      }}>
                        {dem.typeDemande === 'emprunt' ? 'Emprunt matériel' : 'Dotation'}
                      </span>
                      {dem.dateRestitutionPrevue && (
                        <p style={{ fontSize: 10, color: '#a16207', margin: '0 0 4px', fontWeight: 600 }}>
                          Retour : {new Date(dem.dateRestitutionPrevue).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                      <p style={{ fontSize: 12, color: '#57534e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dem.motif || 'Aucun motif précisé'}
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
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                        {dem.statut === 'en_attente' && (
                          <>
                            <button
                              onClick={() => setMotifRefusDemande(dem.id)}
                              style={{
                                padding: '5px 10px', borderRadius: 8, border: '1px solid #fee2e2',
                                background: '#FEF2F1', color: '#dc2626', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Refuser
                            </button>
                            <button
                              onClick={() => handleChangerStatut(dem.id, 'approuve')}
                              style={{
                                padding: '5px 12px', borderRadius: 8, border: 'none',
                                background: '#007FE1', color: 'white', fontSize: 11, fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Approuver
                            </button>
                          </>
                        )}

                        {dem.statut === 'approuve' && (
                          <button
                            onClick={() => handleChangerStatut(dem.id, 'en_preparation')}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '5px 12px', borderRadius: 8, border: 'none',
                              background: '#7c3aed', color: 'white', fontSize: 11, fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <Clock size={12} />
                            En préparation
                          </button>
                        )}

                        {dem.statut === 'en_preparation' && (
                          <button
                            onClick={() => handleChangerStatut(dem.id, 'livre')}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4,
                              padding: '6px 14px', borderRadius: 8, border: 'none',
                              background: '#16a34a', color: 'white', fontSize: 12, fontWeight: 700,
                              cursor: 'pointer', boxShadow: '0 2px 6px rgba(22,163,74,0.25)',
                            }}
                          >
                            <Truck size={14} />
                            Livrer & Déstocker
                          </button>
                        )}

                        {dem.statut === 'livre' && (
                          <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
                            Livré {dem.traitePar ? `par ${dem.traitePar}` : ''}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modale Refus */}
      {motifRefusDemande && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(28,25,23,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          <div style={{
            background: 'white', borderRadius: 16, width: '100%', maxWidth: 440,
            padding: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#dc2626', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} />
              Refuser la demande
            </h3>
            <p style={{ fontSize: 13, color: '#78716c', margin: '8px 0 14px' }}>
              Veuillez préciser la raison du refus (ex : rupture fournisseur, motif non recevable...)
            </p>
            <form onSubmit={handleConfirmerRefus} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <textarea
                rows={3}
                value={texteRefus}
                onChange={(e) => setTexteRefus(e.target.value)}
                placeholder="Motif du refus..."
                required
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 12px', borderRadius: 10,
                  border: '1px solid #e7e5e4', fontSize: 13, outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setMotifRefusDemande(null)}
                  style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #e7e5e4', background: 'white', color: '#57534e', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirmer le refus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
