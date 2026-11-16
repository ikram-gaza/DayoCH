import { initiales } from '../../utils/format'
import { useImageProtegee } from '../../hooks/useImageProtegee'

export default function PhotoAgent({
  agentId,
  prenom,
  nom,
  aPhoto,
  photoUrl,
  taille = 40,
  className = '',
}) {
  const { url } = useImageProtegee(!photoUrl && aPhoto ? `/organisation/agents/${agentId}/photo` : null)
  const source = photoUrl || url

  if (!source) {
    return (
      <div
        aria-hidden="true"
        className={className}
        style={{
          width: taille,
          height: taille,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          border: '1px solid #e7e5e4',
          background: '#E5F2FD',
          color: '#007FE1',
          fontSize: taille * 0.34,
          fontWeight: 700,
        }}
      >
        {initiales(prenom, nom)}
      </div>
    )
  }

  return (
    <img
      src={source}
      alt={`Photo de ${prenom} ${nom}`}
      className={className}
      style={{
        width: taille,
        height: taille,
        flexShrink: 0,
        borderRadius: '50%',
        border: '1px solid #e7e5e4',
        objectFit: 'cover',
      }}
    />
  )
}
