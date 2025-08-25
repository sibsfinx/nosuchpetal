import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { PetalMaterial } from './PetalMaterial'
import { FLOWER_TYPES, FlowerType } from '../types/flowers'
import { useAudio } from '../contexts/AudioContext'

interface PetalProps {
  angle: number
  index: number
  radius?: number
  petalCount?: number
  flowerType?: FlowerType
  audioSmoothness?: number
}

export function Petal({ angle, index, radius = 2.5, petalCount = 20, flowerType = 'default', audioSmoothness = 0.5 }: PetalProps) {
  const meshRef = useRef<Mesh>(null!)
  const flowerConfig = FLOWER_TYPES[flowerType]
  const { isEnabled, audioAnalyzer } = useAudio()
  const lastAudioLevelRef = useRef(0)
  const highlightIntensityRef = useRef(0)
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    
    const t = clock.getElapsedTime()
    const offset = (index / petalCount) * Math.PI * 2
    
    // Audio reactivity with controllable smoothness
    let audioMultiplier = 1
    let audioScale = 1
    let audioRotation = 0
    let currentAudioLevel = 0
    
    if (isEnabled && audioAnalyzer) {
      const bassLevel = audioAnalyzer.getBassLevel()
      const midLevel = audioAnalyzer.getMidLevel()
      const trebleLevel = audioAnalyzer.getTrebleLevel()
      
      // Scale audio intensity based on reactivity control (0 = no effect, 10 = extreme effect)
      const intensityMultiplier = Math.min(audioSmoothness, 10) // Clamp to 0-10 range
      const baseIntensity = intensityMultiplier * 0.3 // Range from 0 to 3.0 for dramatic effects
      
      // Different petals react to different frequency ranges with controllable intensity
      const petalFrequency = (index % 3)
      switch (petalFrequency) {
        case 0: // Bass reactive petals
          currentAudioLevel = bassLevel
          audioMultiplier = 1 + bassLevel * baseIntensity * 1.2
          audioScale = 1 + bassLevel * baseIntensity * 0.3
          break
        case 1: // Mid reactive petals
          currentAudioLevel = midLevel
          audioMultiplier = 1 + midLevel * baseIntensity * 1.0
          audioScale = 1 + midLevel * baseIntensity * 0.25
          break
        case 2: // Treble reactive petals
          currentAudioLevel = trebleLevel
          audioMultiplier = 1 + trebleLevel * baseIntensity * 1.1
          audioScale = 1 + trebleLevel * baseIntensity * 0.3
          audioRotation = trebleLevel * baseIntensity * 0.3
          break
      }
    }
    
    // Calculate highlight intensity based on audio level change
    const audioLevelDelta = Math.abs(currentAudioLevel - lastAudioLevelRef.current)
    if (audioLevelDelta > 0.1) { // Threshold for "touch" detection
      highlightIntensityRef.current = Math.min(1.0, highlightIntensityRef.current + audioLevelDelta * 2)
    }
    
    // Fade out highlight over time
    highlightIntensityRef.current *= 0.95
    lastAudioLevelRef.current = currentAudioLevel
    
    // Organic movement with controllable audio enhancement
    const baseWaveIntensity = 0.08
    const baseBreathingIntensity = 0.15
    const basePositionWarpX = 0.08
    const basePositionWarpY = 0.06
    const basePositionWarpZ = 0.03
    
    const waveSpeed = 0.8 * audioMultiplier
    const waveIntensity = baseWaveIntensity + (baseWaveIntensity * (audioMultiplier - 1))
    const breathingSpeed = 1.2 * audioMultiplier
    const breathingIntensity = baseBreathingIntensity + (baseBreathingIntensity * (audioMultiplier - 1))
    
    // Individual petal animation
    meshRef.current.rotation.z = angle + Math.sin(t * waveSpeed + offset) * waveIntensity + audioRotation
    
    // Breathing effect with audio scaling
    const breathing = (1 + Math.sin(t * breathingSpeed + offset * 0.5) * breathingIntensity) * audioScale
    meshRef.current.scale.setScalar(breathing)
    
    // Subtle position warping with controllable audio enhancement
    const audioWarpX = basePositionWarpX + (basePositionWarpX * (audioMultiplier - 1))
    const audioWarpY = basePositionWarpY + (basePositionWarpY * (audioMultiplier - 1))
    const x = Math.sin(angle) * radius + Math.sin(t * 0.5 + offset) * audioWarpX
    const y = Math.cos(angle) * radius + Math.cos(t * 0.7 + offset) * audioWarpY
    const z = Math.sin(t * 0.3 + offset) * basePositionWarpZ
    
    meshRef.current.position.set(x, y, z)
  })

  // Generate geometry based on flower type
  const renderGeometry = () => {
    switch (flowerConfig.petalShape) {
      case 'wide': // Iris - wider petals
        return <cylinderGeometry args={[0, flowerConfig.petalWidth, flowerConfig.petalLength, 12, 4]} />
      case 'thin': // Dandelion - very thin petals
        return <cylinderGeometry args={[0, flowerConfig.petalWidth, flowerConfig.petalLength, 8, 2]} />
      case 'ellipse': // Daisy - elongated oval
        return <cylinderGeometry args={[0, flowerConfig.petalWidth, flowerConfig.petalLength, 16, 6]} />
      default: // Default cone shape
        return <cylinderGeometry args={[0, flowerConfig.petalWidth, flowerConfig.petalLength, 16, 4]} />
    }
  }

  return (
    <mesh
      ref={meshRef}
      rotation={[0, 0, angle]}
      castShadow
      receiveShadow
    >
      {renderGeometry()}
      <PetalMaterial index={index} flowerType={flowerType} highlightIntensity={highlightIntensityRef.current} />
    </mesh>
  )
}
