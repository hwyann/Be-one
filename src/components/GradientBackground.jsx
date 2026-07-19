import { useEffect, useState } from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const handler = e => setReduced(e.matches)
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [])
  return reduced
}

export default function GradientBackground() {
  const prefersReduced = usePrefersReducedMotion()

  return (
    <ShaderGradientCanvas
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: '#257A7D',
        filter: 'blur(8px)',
      }}
      pointerEvents="none"
      pixelDensity={2}
      lazyLoad={false}
    >
      <ShaderGradient
        control="props"
        type="sphere"
        animate={prefersReduced ? 'off' : 'on'}
        uTime={8}
        uSpeed={0.05}
        uStrength={1.5}
        uDensity={1.3}
        uFrequency={0}
        uAmplitude={0}
        color1="#E85D48"
        color2="#5EBFAB"
        color3="#E5B547"
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={50}
        rotationY={0}
        rotationZ={-60}
        cAzimuthAngle={180}
        cPolarAngle={110}
        cDistance={2.8}
        cameraZoom={9.1}
        lightType="3d"
        brightness={1.2}
        envPreset="city"
        grain="on"
        grainBlending={0.35}
        reflection={0.1}
        zoomOut={false}
        toggleAxis={false}
      />
    </ShaderGradientCanvas>
  )
}
