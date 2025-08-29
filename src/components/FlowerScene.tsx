import { Suspense, useRef, useEffect } from 'react'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Petal } from './Petal'
import { ReactiveGlow } from './ReactiveGlow'
import { useControls, folder } from 'leva'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { FLOWER_TYPES, FlowerType } from '../types/flowers'

export function FlowerScene() {
  const groupRef = useRef<Group>(null!)
  
  // Handle Leva visibility toggle and width adjustment
  useEffect(() => {
    const handleToggleLeva = (event: CustomEvent) => {
      const levaRoot = document.querySelector('.leva-c_canvas')?.parentElement
      if (levaRoot) {
        if (event.detail.hidden) {
          levaRoot.classList.add('leva-hidden')
        } else {
          levaRoot.classList.remove('leva-hidden')
        }
      }
    }

    // Force Leva panel width to be 30% wider
    const adjustLevaWidth = () => {
      const levaElements = [
        document.querySelector('[data-leva-root]'),
        document.querySelector('.leva-c_canvas'),
        document.querySelector('.leva-c_panel'),
        ...Array.from(document.querySelectorAll('[class*="leva"]'))
      ].filter(Boolean)

      levaElements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.width = '416px'
          element.style.maxWidth = '416px'
          element.style.minWidth = '416px'
        }
      })
    }

    // Adjust width on mount and periodically
    const interval = setInterval(adjustLevaWidth, 100)
    adjustLevaWidth()

    window.addEventListener('toggleLeva', handleToggleLeva as EventListener)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('toggleLeva', handleToggleLeva as EventListener)
    }
  }, [])
  
  const {
    flowerType,
    petalCount,
    radius,
    autoRotate,
    rotationSpeed,
    audioSmoothness,
    reactiveGlow,
    bloomIntensity,
    bloomRadius,
    vignetteIntensity,
    chromaticAberrationOffset
  } = useControls('🌸 Nosuch Petals', {
    '🌺 Flower Shape & Style': folder({
      flowerType: {
        value: 'default' as FlowerType,
        options: {
          'Nosuch Petals (Default)': 'default',
          'Violet Iris': 'iris',
          'Dandelion': 'dandelion',
          'Daisy': 'daisy'
        },
        label: 'Flower Type'
      },
      petalCount: { 
        value: 24, 
        min: 8, 
        max: 48, 
        step: 1, 
        label: 'Number of Petals' 
      },
      radius: { 
        value: 2.5, 
        min: 1, 
        max: 5, 
        step: 0.1, 
        label: 'Flower Size (Radius)' 
      }
    }),
    '🔄 Animation & Movement': folder({
      autoRotate: { 
        value: true, 
        label: 'Enable Auto Rotation' 
      },
      rotationSpeed: { 
        value: 0.5, 
        min: 0, 
        max: 2, 
        step: 0.1, 
        label: 'Rotation Speed' 
      }
    }),
    '🎵 Audio Reactivity': folder({
      audioSmoothness: { 
        value: 2.5, 
        min: 0, 
        max: 10, 
        step: 0.1, 
        label: 'Audio Response Intensity' 
      },
      reactiveGlow: { 
        value: false, 
        label: 'Music Reactive Glow Effect' 
      }
    }),
    '✨ Visual Effects': folder({
      bloomIntensity: { 
        value: 1.2, 
        min: 0, 
        max: 3, 
        step: 0.1, 
        label: 'Bloom Glow Intensity' 
      },
      bloomRadius: { 
        value: 0.4, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Bloom Glow Radius' 
      },
      vignetteIntensity: { 
        value: 0.5, 
        min: 0, 
        max: 1, 
        step: 0.1, 
        label: 'Edge Vignette Effect' 
      },
      chromaticAberrationOffset: { 
        value: 0.002, 
        min: 0, 
        max: 0.01, 
        step: 0.001, 
        label: 'Color Separation Effect' 
      }
    })
  })

  // Get flower configuration and update control values accordingly
  const flowerConfig = FLOWER_TYPES[flowerType as FlowerType]
  
  useFrame(({ clock }) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed * 0.1
    }
  })

  // Use flower-specific defaults but allow override
  const actualPetalCount = petalCount || flowerConfig.petalCount
  const actualRadius = radius || flowerConfig.radius

  const petals = Array.from({ length: actualPetalCount }, (_, i) => ({
    angle: (i * Math.PI * 2) / actualPetalCount,
    index: i
  }))

  return (
    <Suspense fallback={null}>
      {/* Environment and lighting */}
      <Environment preset="night" />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#ff3366" />
      <pointLight position={[-5, -5, 3]} intensity={0.8} color="#3366ff" />
      <spotLight
        position={[0, 0, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Flower petals */}
      <group ref={groupRef}>
        {petals.map((petal) => (
          <Petal
            key={petal.index}
            angle={petal.angle}
            index={petal.index}
            radius={actualRadius}
            petalCount={actualPetalCount}
            flowerType={flowerType as FlowerType}
            audioSmoothness={audioSmoothness}
          />
        ))}
      </group>

      {/* Reactive Glow around center */}
      {reactiveGlow && <ReactiveGlow />}

      {/* Center sphere */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial
          color={flowerConfig.centerColor}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transmission={0.3}
          thickness={0.5}
        />
      </mesh>

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={20}
        maxPolarAngle={Math.PI / 1.5}
        zoomSpeed={0.8}
        rotateSpeed={0.8}
        enableDamping={true}
        dampingFactor={0.05}
      />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          radius={bloomRadius}
          blendFunction={BlendFunction.ADD}
        />
        <Vignette
          eskil={false}
          offset={0.1}
          darkness={vignetteIntensity}
          blendFunction={BlendFunction.NORMAL}
        />
        <ChromaticAberration
          offset={[chromaticAberrationOffset, chromaticAberrationOffset] as any}
          radialModulation={false}
          modulationOffset={0}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Suspense>
  )
}
