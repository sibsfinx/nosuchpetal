import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { Petal } from './Petal'
import { FlowerType, FLOWER_TYPES } from '../types/flowers'

interface CarouselFlowerProps {
  flowerType: FlowerType
  flowerIndex: number
  totalFlowers: number
  orbitRadius: number
  carouselSpeed: number
  verticalOscillation: number
  autoRotate: boolean
  rotationSpeed: number
  petalCount: number
  radius: number
  audioSmoothness: number
}

export function CarouselFlower({
  flowerType,
  flowerIndex,
  totalFlowers,
  orbitRadius,
  carouselSpeed,
  verticalOscillation,
  autoRotate,
  rotationSpeed,
  petalCount,
  radius,
  audioSmoothness
}: CarouselFlowerProps) {
  const groupRef = useRef<Group>(null!)
  const flowerConfig = FLOWER_TYPES[flowerType]
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    
    const t = clock.getElapsedTime()
    
    // Carousel orbital motion
    const baseAngle = (flowerIndex / totalFlowers) * Math.PI * 2
    const orbitAngle = baseAngle + t * carouselSpeed
    
    // Position on circular orbit (XZ plane)
    const x = Math.cos(orbitAngle) * orbitRadius
    const z = Math.sin(orbitAngle) * orbitRadius
    
    // Vertical oscillation with phase offset for each flower
    const phaseOffset = (flowerIndex / totalFlowers) * Math.PI * 2
    const y = Math.sin(t * 1.5 + phaseOffset) * verticalOscillation
    
    groupRef.current.position.set(x, y, z)
    
    // Individual flower rotation while maintaining upright orientation
    if (autoRotate) {
      groupRef.current.rotation.y = t * rotationSpeed * 0.1
    }
  })
  
  // Generate petals for this flower
  const actualPetalCount = petalCount || flowerConfig.petalCount
  const actualRadius = radius || flowerConfig.radius
  
  const petals = Array.from({ length: actualPetalCount }, (_, i) => ({
    angle: (i * Math.PI * 2) / actualPetalCount,
    index: i
  }))
  
  return (
    <group ref={groupRef}>
      {/* Flower petals */}
      {petals.map((petal) => (
        <Petal
          key={`${flowerIndex}-${petal.index}`}
          angle={petal.angle}
          index={petal.index}
          radius={actualRadius}
          petalCount={actualPetalCount}
          flowerType={flowerType}
          audioSmoothness={audioSmoothness}
        />
      ))}
      
      {/* Center sphere for each flower */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
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
    </group>
  )
}
