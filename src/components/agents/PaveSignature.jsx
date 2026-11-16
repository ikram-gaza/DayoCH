import { useCallback, useEffect, useRef, useState } from 'react'
import { Eraser, Save, Upload } from 'lucide-react'
import { useEnvoyerSignature, useSignatureTracee } from '../../hooks/useAgents'
import { normaliserErreur } from '../../services/apiClient'
import { Spinner } from '../ui/ui'

const LARGEUR = 480
const HAUTEUR = 180
const TAILLE_MAX = 1024 * 1024
const TYPES_ACCEPTES = ['image/png', 'image/jpeg', 'image/webp']

export default function PaveSignature({ agentId, surEnregistrement }) {
  const canvasRef = useRef(null)
  const champFichier = useRef(null)
  const traceEnCours = useRef(false)
  const [vide, setVide] = useState(true)
  const [erreur, setErreur] = useState(null)
  const mutation = useSignatureTracee(agentId)
  const envoiFichier = useEnvoyerSignature(agentId)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const densite = window.devicePixelRatio || 1
    canvas.width = LARGEUR * densite
    canvas.height = HAUTEUR * densite
    const contexte = canvas.getContext('2d')
    if (!contexte) return

    contexte.scale(densite, densite)
    contexte.lineWidth = 2.5
    contexte.lineCap = 'round'
    contexte.lineJoin = 'round'
    contexte.strokeStyle = '#1f2933'
  }, [])

  const position = (evenement) => {
    const rectangle = evenement.currentTarget.getBoundingClientRect()
    return {
      x: ((evenement.clientX - rectangle.left) / rectangle.width) * LARGEUR,
      y: ((evenement.clientY - rectangle.top) / rectangle.height) * HAUTEUR,
    }
  }

  const commencer = (evenement) => {
    const contexte = canvasRef.current?.getContext('2d')
    if (!contexte) return
    evenement.currentTarget.setPointerCapture(evenement.pointerId)
    const { x, y } = position(evenement)
    contexte.beginPath()
    contexte.moveTo(x, y)
    traceEnCours.current = true
    setVide(false)
  }

  const tracer = (evenement) => {
    if (!traceEnCours.current) return
    const contexte = canvasRef.current?.getContext('2d')
    if (!contexte) return
    const { x, y } = position(evenement)
    contexte.lineTo(x, y)
    contexte.stroke()
  }

  const effacer = useCallback(() => {
    const canvas = canvasRef.current
    const contexte = canvas?.getContext('2d')
    if (!canvas || !contexte) return
    contexte.clearRect(0, 0, canvas.width, canvas.height)
    setVide(true)
  }, [])

  const enregistrerTrace = async () => {
    const canvas = canvasRef.current
    if (!canvas || vide) return
    setErreur(null)
    try {
      await mutation.mutateAsync(canvas.toDataURL('image/png'))
      surEnregistrement?.()
    } catch (echec) {
      setErreur(normaliserErreur(echec).message)
    }
  }

  const chargerImage = async (evenement) => {
    const fichier = evenement.target.files?.[0]
    if (!fichier) return
    setErreur(null)

    if (!TYPES_ACCEPTES.includes(fichier.type)) {
      setErreur('Formats acceptés : PNG, JPEG ou WebP.')
      return
    }
    if (fichier.size > TAILLE_MAX) {
      setErreur('Image trop lourde (1 Mio maximum).')
      return
    }

    try {
      await envoiFichier.mutateAsync(fichier)
      surEnregistrement?.()
    } catch (echec) {
      setErreur(normaliserErreur(echec).message)
    } finally {
      if (champFichier.current) champFichier.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 12, color: '#78716c' }}>
        Tracez la signature ci-dessous ou chargez une image déjà numérisée.
      </p>
      <canvas
        ref={canvasRef}
        style={{ width: LARGEUR, height: HAUTEUR, maxWidth: '100%', touchAction: 'none' }}
        className="cursor-crosshair rounded-2xl border-2 border-dashed border-stone-300 bg-white"
        onPointerDown={commencer}
        onPointerMove={tracer}
        onPointerUp={() => { traceEnCours.current = false }}
        onPointerLeave={() => { traceEnCours.current = false }}
        role="img"
        aria-label="Zone de signature"
      />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <Bouton onClick={effacer} disabled={vide} icone={<Eraser size={14} />}>Effacer</Bouton>
        <Bouton onClick={enregistrerTrace} disabled={vide || mutation.isPending} chargement={mutation.isPending} icone={<Save size={14} />}>
          Enregistrer
        </Bouton>
        <input
          ref={champFichier}
          type="file"
          accept={TYPES_ACCEPTES.join(',')}
          onChange={chargerImage}
          hidden
        />
        <Bouton
          secondaire
          chargement={envoiFichier.isPending}
          onClick={() => champFichier.current?.click()}
          icone={<Upload size={14} />}
        >
          Charger une image
        </Bouton>
      </div>
      {erreur && <p style={{ margin: 0, fontSize: 12, color: '#b91c1c' }}>{erreur}</p>}
    </div>
  )
}

function Bouton({ children, onClick, disabled, chargement, icone, secondaire }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || chargement}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 34,
        padding: '0 12px',
        borderRadius: 9,
        border: secondaire ? '1px solid #e7e5e4' : '1px solid #007FE1',
        background: secondaire ? 'white' : '#007FE1',
        color: secondaire ? '#57534e' : 'white',
        fontSize: 12,
        fontWeight: 700,
        cursor: disabled || chargement ? 'not-allowed' : 'pointer',
        opacity: disabled || chargement ? 0.6 : 1,
      }}
    >
      {chargement ? <Spinner className="h-3.5 w-3.5" /> : icone}
      {children}
    </button>
  )
}
