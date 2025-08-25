import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'
import { PetalMaterial } from './PetalMaterial'
import { FLOWER_TYPES, FlowerType } from '../types/flowers'

interface PetalProps {
  angle: number
  index: number
  radius?: number
  petalCount?: number
  flowerType?: FlowerType
}

export function Petal({ angle, index, radius = 2.5, petalCount = 20, flowerType = 'default' }: PetalProps) {
  const meshRef = useRef<Mesh>(null!)
  const flowerConfig = FLOWER_TYPES[flowerType]
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    
    const t = clock.getElapsedTime()
    const offset = (index / petalCount) * Math.PI * 2
    
    // Organic movement
    const waveSpeed = 0.8
    const waveIntensity = 0.15
    const breathingSpeed = 1.2
    const breathingIntensity = 0.3
    
    // Individual petal animation
    meshRef.current.rotation.z = angle + Math.sin(t * waveSpeed + offset) * waveIntensity
    
    // Breathing effect
    const breathing = 1 + Math.sin(t * breathingSpeed + offset * 0.5) * breathingIntensity
    meshRef.current.scale.setScalar(breathing)
    
    // Subtle position warping
    const x = Math.sin(angle) * radius + Math.sin(t * 0.5 + offset) * 0.2
    const y = Math.cos(angle) * radius + Math.cos(t * 0.7 + offset) * 0.15
    const z = Math.sin(t * 0.3 + offset) * 0.1
    
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
      <PetalMaterial index={index} flowerType={flowerType} />
    </mesh>
  )
}
