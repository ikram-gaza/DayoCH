import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarClock,
  Download,
  Info,
  Loader2,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
} from 'lucide-react'
import { USE_MOCK_DATA } from '../../config/donnees'
import { MOCK_ORGANIGRAMME_GROUPE } from '../../config/organigrammeDemo'
import { apiOrganigramme } from '../../services/apiOrganigramme'
import { exporterTableau } from '../../utils/export'
import ExportButtons from '../common/ExportButtons'
import GroupOrgChart from './GroupOrgChart'

const boutonSecondaire = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 34,
  padding: '0 12px',
  borderRadius: 9,
  border: '1px solid #e7e5e4',
  background: 'white',
  color: '#57534e',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
}

const boutonPrincipal = {
  ...boutonSecondaire,
  borderColor: '#007FE1',
  color: '#007FE1',
}

function lignesArbre(noeud, profondeur = 0, lignes = []) {
  if (!noeud) return lignes
  lignes.push({
    niveau: noeud.niveau,
    code: noeud.code || '',
    libelle: `${'  '.repeat(profondeur)}${noeud.libelle}`,
    sousTitre: noeud.sousTitre || '',
    effectif: noeud.effectif ?? '',
  })
  ;(noeud.enfants || []).forEach((enfant) => lignesArbre(enfant, profondeur + 1, lignes))
  return lignes
}

function collecterBranches(noeud, ids = [], estRacine = true) {
  if (!estRacine && (noeud.niveau === 'DEPARTEMENT' || noeud.niveau === 'FILIALE')) {
    ids.push(noeud.id)
  }
  ;(noeud.enfants || []).forEach((enfant) => collecterBranches(enfant, ids, false))
  return ids
}

export default function OrganigrammeGroupe() {
  const [filtres, setFiltres] = useState({
    dateReference: '',
    inclureAgents: true,
    seulementActifs: true,
  })
  const [arbre, setArbre] = useState(() => (USE_MOCK_DATA ? MOCK_ORGANIGRAMME_GROUPE : null))
  const [chargement, setChargement] = useState(() => !USE_MOCK_DATA)
  const [erreur, setErreur] = useState(null)
  const [exportEnCours, setExportEnCours] = useState(null)
  const [replies, setReplies] = useState(() => new Set())

  const modifierFiltre = (cle, valeur) => {
    setChargement(true)
    setErreur(null)
    setFiltres((actuels) => ({ ...actuels, [cle]: valeur }))
  }

  const charger = useCallback(async () => {
    if (USE_MOCK_DATA) return

    try {
      const donnees = await apiOrganigramme.arbre(filtres)
      setArbre(donnees)
      setReplies(new Set())
      setErreur(null)
    } catch (echec) {
      setErreur(echec)
      setArbre(null)
    } finally {
      setChargement(false)
    }
  }, [filtres])

  useEffect(() => {
    if (USE_MOCK_DATA) return undefined

    const minuteur = window.setTimeout(charger, 0)
    return () => window.clearTimeout(minuteur)
  }, [charger])

  const basculerBranche = useCallback((id) => {
    setReplies((actuelles) => {
      const suivantes = new Set(actuelles)
      if (!suivantes.delete(id)) suivantes.add(id)
      return suivantes
    })
  }, [])

  const idsBranches = useMemo(
    () => (arbre ? collecterBranches(arbre) : []),
    [arbre],
  )

  const exporter = async (format) => {
    setExportEnCours(format)
    setErreur(null)

    try {
      if (USE_MOCK_DATA) {
        exporterTableau({
          nom: 'organigramme-groupe',
          titre: 'Organigramme du groupe Dayo',
          colonnes: [
            { cle: 'niveau', libelle: 'Niveau' },
            { cle: 'code', libelle: 'Code' },
            { cle: 'libelle', libelle: 'Entité' },
            { cle: 'sousTitre', libelle: 'Responsable' },
            { cle: 'effectif', libelle: 'Effectif' },
          ],
          lignes: lignesArbre(arbre),
          format,
        })
        return
      }
      await apiOrganigramme.exporter(filtres, format)
    } catch (echec) {
      setErreur(echec)
    } finally {
      setExportEnCours(null)
    }
  }

  if (USE_MOCK_DATA) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#E5F2FD', border: '1px solid rgba(0,127,225,0.18)',
          borderRadius: 14, padding: '12px 16px', color: '#005EA8',
          fontSize: 12, lineHeight: 1.5,
        }}>
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>
            Aperçu avec des données de démonstration. Activez le backend
            {' '}(<code style={{ background: 'white', padding: '1px 5px', borderRadius: 4 }}>VITE_USE_MOCK_DATA=false</code>)
            {' '}pour afficher l’organigramme réel du groupe.
          </span>
        </div>

        <div style={{
          background: 'white', borderRadius: 14, border: '1px solid #e7e5e4',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '12px 16px',
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1c1917' }}>
              Groupe Dayo
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#78716c' }}>
              {arbre?.effectif || 0} collaborateurs · {arbre?.enfants?.length || 0} filiales
            </p>
          </div>

          <div style={{ flex: 1 }} />

          <ExportButtons
            formats={['pdf', 'xlsx']}
            onExport={exporter}
            compact
          />

          {replies.size > 0 ? (
            <button type="button" onClick={() => setReplies(new Set())} style={boutonSecondaire}>
              <Maximize2 size={14} />
              Tout déplier
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setReplies(new Set(idsBranches))}
              disabled={idsBranches.length === 0}
              style={{ ...boutonSecondaire, opacity: idsBranches.length ? 1 : 0.5 }}
            >
              <Minimize2 size={14} />
              Replier les branches
            </button>
          )}
        </div>

        <div style={{
          height: '70vh', minHeight: 520, background: 'white', borderRadius: 16,
          border: '1px solid #e7e5e4', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <GroupOrgChart arbre={arbre} replies={replies} onToggleBranche={basculerBranche} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        background: 'white', borderRadius: 14, border: '1px solid #e7e5e4',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '12px 16px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12,
      }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 700, color: '#57534e' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <CalendarClock size={14} style={{ color: '#007FE1' }} />
            Organigramme à la date du
          </span>
          <input
            type="date"
            value={filtres.dateReference}
            onChange={(e) => modifierFiltre('dateReference', e.target.value)}
            style={{
              height: 34, padding: '0 10px', borderRadius: 9, border: '1px solid #e7e5e4',
              background: '#fafaf9', color: '#1c1917', fontSize: 12,
            }}
          />
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 7, paddingBottom: 8, fontSize: 12, color: '#57534e' }}>
          <input
            type="checkbox"
            checked={filtres.inclureAgents}
            onChange={(e) => modifierFiltre('inclureAgents', e.target.checked)}
          />
          Descendre jusqu’aux agents
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: 7, paddingBottom: 8, fontSize: 12, color: '#57534e' }}>
          <input
            type="checkbox"
            checked={filtres.seulementActifs}
            onChange={(e) => modifierFiltre('seulementActifs', e.target.checked)}
          />
          Masquer les entités désactivées
        </label>

        <div style={{ flex: 1 }} />

        {replies.size > 0 ? (
          <button type="button" onClick={() => setReplies(new Set())} style={boutonSecondaire}>
            <Maximize2 size={14} />
            Tout déplier
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setReplies(new Set(idsBranches))}
            disabled={idsBranches.length === 0}
            style={{ ...boutonSecondaire, opacity: idsBranches.length ? 1 : 0.5 }}
          >
            <Minimize2 size={14} />
            Replier les branches
          </button>
        )}

        {filtres.dateReference && (
          <button
            type="button"
            onClick={() => modifierFiltre('dateReference', '')}
            style={boutonSecondaire}
          >
            <RotateCcw size={14} />
            Revenir à aujourd’hui
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setChargement(true)
            setErreur(null)
            charger()
          }}
          disabled={chargement}
          style={{ ...boutonSecondaire, opacity: chargement ? 0.6 : 1 }}
        >
          <RefreshCw size={14} />
          Actualiser
        </button>

        <button
          type="button"
          onClick={() => exporter('pdf')}
          disabled={!arbre || Boolean(exportEnCours)}
          style={{ ...boutonPrincipal, opacity: !arbre || exportEnCours ? 0.6 : 1 }}
        >
          {exportEnCours === 'pdf' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          PDF
        </button>

        <button
          type="button"
          onClick={() => exporter('xlsx')}
          disabled={!arbre || Boolean(exportEnCours)}
          style={{ ...boutonPrincipal, opacity: !arbre || exportEnCours ? 0.6 : 1 }}
        >
          {exportEnCours === 'xlsx' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Excel
        </button>
      </div>

      {chargement && (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #e7e5e4',
          padding: '42px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 10, color: '#78716c', fontSize: 13,
        }}>
          <Loader2 size={18} className="animate-spin" />
          Chargement de l’organigramme du groupe…
        </div>
      )}

      {!chargement && erreur && (
        <div style={{
          background: '#FEF2F1', borderRadius: 16, border: '1px solid #fecaca',
          padding: '22px 24px',
        }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#b91c1c' }}>
            Impossible de charger l’organigramme du groupe
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#b91c1c' }}>
            {erreur.message || 'Erreur réseau.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setChargement(true)
              setErreur(null)
              charger()
            }}
            style={{ ...boutonSecondaire, marginTop: 12 }}
          >
            <RefreshCw size={14} />
            Réessayer
          </button>
        </div>
      )}

      {!chargement && !erreur && arbre && (
        <div style={{
          height: '70vh', minHeight: 520, background: 'white', borderRadius: 16,
          border: '1px solid #e7e5e4', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <GroupOrgChart arbre={arbre} replies={replies} onToggleBranche={basculerBranche} />
        </div>
      )}
    </div>
  )
}
