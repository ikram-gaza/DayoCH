import { Spinner } from './ui'

export default function PageLoader({ label = 'Chargement…', fullscreen = false, compact = false }) {
  const size = compact ? 56 : 80
  const logoSize = compact ? 38 : 54

  const content = (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: compact ? 12 : 20, padding: compact ? '28px 16px' : '56px 24px',
      animation: 'pageLoaderFadeIn 0.45s ease-out',
    }}>
      <style>{`
        @keyframes pageLoaderFadeIn { from { opacity: 0; transform: translateY(6px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pageLoaderPulse { 0%, 100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.08); opacity: 0.2; } }
        @keyframes pageLoaderFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
      `}</style>

      <div style={{ position: 'relative', width: size, height: size, display: 'grid', placeItems: 'center' }}>
        <div style={{
          position: 'absolute', inset: compact ? -10 : -14, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,127,225,0.22) 0%, rgba(0,127,225,0) 70%)',
          animation: 'pageLoaderPulse 2.2s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: compact ? 18 : 24,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(229,242,253,0.85))',
          border: '1px solid rgba(0,127,225,0.14)',
          boxShadow: '0 10px 30px rgba(0,80,154,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
          backdropFilter: 'blur(6px)',
        }} />
        <div style={{
          width: logoSize, height: logoSize, borderRadius: compact ? 14 : 18,
          background: 'linear-gradient(145deg, #0A8AF0 0%, #007FE1 45%, #00509A 100%)',
          display: 'grid', placeItems: 'center', color: 'white',
          boxShadow: '0 10px 28px rgba(0,127,225,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
          animation: 'pageLoaderFloat 2.8s ease-in-out infinite',
          position: 'relative', zIndex: 1,
        }}>
          <span style={{
            fontWeight: 800, fontSize: compact ? 22 : 28, fontStyle: 'italic',
            fontFamily: 'Lora, Georgia, serif', lineHeight: 1, letterSpacing: '-0.02em',
            textShadow: '0 1px 2px rgba(0,0,0,0.12)',
          }}>D</span>
        </div>
        <span style={{ position: 'absolute', inset: compact ? -5 : -7, color: '#007FE1', opacity: 0.95, zIndex: 2 }}>
          <Spinner className="h-full w-full" />
        </span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          margin: 0, fontSize: compact ? 13 : 14, fontWeight: 700, color: '#1c1917',
          letterSpacing: '-0.01em',
        }}>{label}</p>
        <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ width: 18, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,127,225,0.45))' }} />
          <p style={{
            margin: 0, fontSize: 11, fontWeight: 700, color: '#007FE1',
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>Dayo PulseInfra</p>
          <span style={{ width: 18, height: 1, background: 'linear-gradient(90deg, rgba(0,127,225,0.45), transparent)' }} />
        </div>
      </div>
    </div>
  )

  if (!fullscreen) return content

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg, #fbfdff 0%, #f5faff 45%, #fafaf9 100%)',
    }}>
      <div style={{
        position: 'absolute', width: 480, height: 480, top: -180, right: -120, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,127,225,0.12) 0%, rgba(0,127,225,0) 68%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 420, height: 420, bottom: -180, left: -120, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,80,154,0.08) 0%, rgba(0,80,154,0) 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.4,
        backgroundImage: 'radial-gradient(#007FE1 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, black 30%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 60% 55% at 50% 50%, black 30%, transparent 75%)',
      }} />
      <div style={{
        position: 'relative',
        padding: compact ? 8 : 12,
        borderRadius: 28,
        background: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(231,229,228,0.7)',
        boxShadow: '0 20px 60px rgba(28,25,23,0.06), 0 2px 8px rgba(28,25,23,0.03)',
        backdropFilter: 'blur(10px)',
      }}>
        {content}
      </div>
    </div>
  )
}
