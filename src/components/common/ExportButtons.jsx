import { useState } from 'react'
import { Download } from 'lucide-react'
import { Spinner } from '../ui/ui'
import { normaliserErreur } from '../../services/apiClient'

const LIBELLES = { xlsx: 'Excel', pdf: 'PDF', csv: 'CSV' }

export default function ExportButtons({ onExport, formats = ['xlsx', 'pdf', 'csv'], compact = false }) {
  const [enCours, setEnCours] = useState(null)
  const [erreur, setErreur] = useState(null)

  const exporter = async (format) => {
    setEnCours(format)
    setErreur(null)

    try {
      await onExport(format)
    } catch (echec) {
      setErreur(normaliserErreur(echec).message)
    } finally {
      setEnCours(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: compact ? 'flex-start' : 'flex-end' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {formats.map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => exporter(format)}
            disabled={enCours !== null}
            style={{
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
              cursor: enCours !== null ? 'not-allowed' : 'pointer',
              opacity: enCours !== null && enCours !== format ? 0.55 : 1,
            }}
          >
            {enCours === format ? <Spinner className="h-3.5 w-3.5" /> : <Download size={14} />}
            {LIBELLES[format]}
          </button>
        ))}
      </div>
      {erreur && <p style={{ margin: 0, fontSize: 11, color: '#b91c1c' }}>{erreur}</p>}
    </div>
  )
}
