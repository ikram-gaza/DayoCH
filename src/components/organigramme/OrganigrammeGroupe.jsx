import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarClock,
  Loader2,
  Maximize2,
  Minimize2,
  RotateCcw,
} from 'lucide-react'
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

function lignesArbre(noeud, profondeur = 0, lignes = []) {
  if (!noeud) return lignes
  lignes.push({
    niveau: noeud.niveau || '',
    code: noeud.code || '',
    libelle: `${'  '.repeat(profondeur)}${noeud.libelle || noeud.nom || ''}`,
    sousTitre: noeud.sousTitre || '',
    effectif: noeud.effectif ?? '',
  })
  ;(noeud.enfants || []).forEach((enfant) => lignesArbre(enfant, profondeur + 1, lignes))
  return lignes
}

function collecterBranches(noeud, ids = [], estRacine = true) {
  if (!noeud) return ids
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
  const [arbre, setArbre] = useState(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState(null)
  const [exportEnCours, setExportEnCours] = useState(null)
  const [replies, setReplies] = useState(() => new Set())

  const modifierFiltre = (cle, valeur) => {
    setChargement(true)
    setErreur(null)
    setFiltres((actuels) => ({ ...actuels, [cle]: valeur }))
  }

  const charger = useCallback(async () => {
    try {
      setChargement(true)
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
      try {
        await apiOrganigramme.exporter(filtres, format)
      } catch {
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
      }
    } catch (echec) {
      setErreur(echec)
    } finally {
      setExportEnCours(null)
    }
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

        <ExportButtons formats={['pdf', 'xlsx']} onExport={exporter} />

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

        <button type="button" onClick={charger} style={boutonSecondaire} disabled={chargement || exportEnCours}>
          {chargement ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          Actualiser
        </button>
      </div>

      {erreur && (
        <div style={{ background: '#FEF2F1', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>
          Impossible de charger l’organigramme depuis l’API.
        </div>
      )}

      <div style={{
        height: '70vh', minHeight: 520, background: 'white', borderRadius: 16,
        border: '1px solid #e7e5e4', overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>
        {chargement ? (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#78716c', fontSize: 13 }}>
            Chargement de l’organigramme…
          </div>
        ) : arbre ? (
          <GroupOrgChart arbre={arbre} replies={replies} onToggleBranche={basculerBranche} />
        ) : (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#78716c', fontSize: 13 }}>
            Aucun organigramme disponible.
          </div>
        )}
      </div>
    </div>
  )
}
