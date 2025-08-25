import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { useAudio } from '../contexts/AudioContext'

export function ReactiveGlow() {
  const groupRef = useRef<Group>(null!)
  const { isEnabled, audioAnalyzer } = useAudio()
  
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    
    const t = clock.getElapsedTime()
    
    // Simple rotation for now
    groupRef.current.rotation.y = t * 0.1
  })
  
  return (
    <group ref={groupRef}>
      {/* Placeholder for reactive glow - will be developed later */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial 
          color="#ff3366" 
          transparent 
          opacity={isEnabled && audioAnalyzer ? 0.3 + audioAnalyzer.getAverageFrequency() * 0.2 : 0.1}
        />
      </mesh>
    </group>
  )
}
