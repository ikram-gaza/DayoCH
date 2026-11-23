import { useCallback, useEffect, useMemo, useState } from 'react'
import { Loader2, Maximize2, Minimize2, RotateCcw, Users } from 'lucide-react'
import OrganigrammeGroupe from '../../components/organigramme/OrganigrammeGroupe'
import GroupOrgChart from '../../components/organigramme/GroupOrgChart'
import PanneauNoeudOrganigramme from '../../components/organigramme/PanneauNoeudOrganigramme'
import { apiOrganigramme } from '../../services/apiOrganigramme'
import { filialesService } from '../../services/filialesService'
import { exporterTableau } from '../../utils/export'
import ExportButtons from '../../components/common/ExportButtons'
import { useAuth } from '../../context/AuthContext'

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
    sousTitre: noeud.sousTitre || noeud.fonction || '',
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

export default function OrganigrammePage() {
  const { user } = useAuth()
  const [vue, setVue] = useState('equipe')
  const [filiales, setFiliales] = useState([])
  const [filialeId, setFilialeId] = useState('')
  const [arbre, setArbre] = useState(null)
  const [chargementFiliales, setChargementFiliales] = useState(true)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState(null)
  const [exportEnCours, setExportEnCours] = useState(null)
  const [replies, setReplies] = useState(() => new Set())
  const [noeudSelectionne, setNoeudSelectionne] = useState(null)

  useEffect(() => {
    let actif = true
    const chargerFiliales = async () => {
      try {
        const liste = await filialesService.lister()
        if (!actif) return
        const actives = (liste || []).filter((f) => f.actif !== false)
        setFiliales(actives)
        const preferree = actives.find((f) => String(f.id) === String(user?.filialeId)) || actives[0]
        setFilialeId(preferree ? String(preferree.id) : '')
      } catch {
        if (actif) setFiliales([])
      } finally {
        if (actif) setChargementFiliales(false)
      }
    }
    chargerFiliales()
    return () => { actif = false }
  }, [user?.filialeId])

  const charger = useCallback(async () => {
    if (!filialeId) {
      setArbre(null)
      return
    }
    try {
      setChargement(true)
      setErreur(null)
      const donnees = await apiOrganigramme.arbre({ filialeId, inclureAgents: true, seulementActifs: true })
      setArbre(donnees)
      setReplies(new Set())
    } catch (echec) {
      setErreur(echec)
      setArbre(null)
    } finally {
      setChargement(false)
    }
  }, [filialeId])

  useEffect(() => {
    if (vue !== 'equipe') return
    if (!filialeId) return
    charger()
  }, [vue, filialeId, charger])

  const basculerBranche = useCallback((id) => {
    setReplies((actuelles) => {
      const suivantes = new Set(actuelles)
      if (!suivantes.delete(id)) suivantes.add(id)
      return suivantes
    })
  }, [])

  const idsBranches = useMemo(() => (arbre ? collecterBranches(arbre) : []), [arbre])
  const filialeCourante = useMemo(
    () => filiales.find((f) => String(f.id) === String(filialeId)),
    [filiales, filialeId],
  )

  const exporter = async (format) => {
    setExportEnCours(format)
    setErreur(null)
    try {
      try {
        await apiOrganigramme.exporter({ filialeId, inclureAgents: true, seulementActifs: true }, format)
      } catch {
        exporterTableau({
          nom: `organigramme-${(filialeCourante?.code || filialeId || 'filiale').toLowerCase()}`,
          titre: `Organigramme${filialeCourante ? ` - ${filialeCourante.nom}` : ''}`,
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

  const entete = (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1c1917', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <Users size={24} style={{ color: '#007FE1', flexShrink: 0 }} />
          Organigramme
        </h1>
        <p style={{ fontSize: 13, color: '#a8a29e', marginTop: 4 }}>
          {vue === 'groupe' ? 'Organisation du groupe' : 'Organisation par filiale'}
        </p>
      </div>
    </div>
  )

  const onglets = (
    <div style={{ display: 'flex', gap: 8 }}>
      {[
        { id: 'equipe', label: 'Par filiale' },
        { id: 'groupe', label: 'Organigramme du groupe' },
      ].map((onglet) => (
        <button
          key={onglet.id}
          type="button"
          onClick={() => setVue(onglet.id)}
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: vue === onglet.id ? '1px solid #007FE1' : '1px solid #e7e5e4',
            background: vue === onglet.id ? '#E5F2FD' : 'white',
            color: vue === onglet.id ? '#007FE1' : '#78716c',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {onglet.label}
        </button>
      ))}
    </div>
  )

  if (vue === 'groupe') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {entete}
        {onglets}
        <OrganigrammeGroupe />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {entete}
      {onglets}

      <div style={{
        background: 'white', borderRadius: 14, border: '1px solid #e7e5e4',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', padding: '12px 16px',
        display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12,
      }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 700, color: '#57534e' }}>
          <span>Filiale</span>
          <select
            value={filialeId}
            onChange={(e) => setFilialeId(e.target.value)}
            disabled={chargementFiliales || filiales.length === 0}
            style={{
              height: 34, padding: '0 10px', borderRadius: 9, border: '1px solid #e7e5e4',
              background: '#fafaf9', color: '#1c1917', fontSize: 12, minWidth: 220,
            }}
          >
            {filiales.length === 0 && <option value="">Aucune filiale</option>}
            {filiales.map((f) => (
              <option key={f.id} value={String(f.id)}>{f.nom}</option>
            ))}
          </select>
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

        <button type="button" onClick={charger} style={boutonSecondaire} disabled={chargement || exportEnCours || !filialeId}>
          {chargement ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
          Actualiser
        </button>
      </div>

      {erreur && (
        <div style={{ background: '#FEF2F1', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 12, padding: '10px 14px', fontSize: 13 }}>
          Impossible de charger l’organigramme de la filiale.
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', minHeight: 520 }}>
        <div style={{
          flex: 1, minWidth: 0, height: '70vh', minHeight: 520, background: 'white', borderRadius: 16,
          border: '1px solid #e7e5e4', overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          {chargement || chargementFiliales ? (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#78716c', fontSize: 13 }}>
              Chargement de l’organigramme…
            </div>
          ) : arbre ? (
            <GroupOrgChart arbre={arbre} replies={replies} onToggleBranche={basculerBranche} onSelectNode={setNoeudSelectionne} />
          ) : (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#78716c', fontSize: 13 }}>
              Aucun organigramme disponible.
            </div>
          )}
        </div>
        {noeudSelectionne && (
          <PanneauNoeudOrganigramme
            noeud={noeudSelectionne}
            onClose={() => setNoeudSelectionne(null)}
            onChanged={charger}
          />
        )}
      </div>
    </div>
  )
}
