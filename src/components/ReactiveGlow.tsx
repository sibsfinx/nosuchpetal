import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3, BufferGeometry, Float32BufferAttribute, Color, Line, LineBasicMaterial } from 'three'
import { useAudio } from '../contexts/AudioContext'

export function ReactiveGlow() {
  const groupRef = useRef<Group>(null!)
  const { isEnabled, audioAnalyzer } = useAudio()
  
  // Create multiple dancing lines with different frequencies
  const lines = useMemo(() => {
    const lineCount = 12
    const result = []
    
    for (let i = 0; i < lineCount; i++) {
      const angle = (i / lineCount) * Math.PI * 2
      const radius = 3 + Math.random() * 2
      const points = []
      const segments = 50
      
      // Create a spiral line that extends outward
      for (let j = 0; j <= segments; j++) {
        const t = j / segments
        const spiralRadius = radius * (0.5 + t * 1.5)
        const spiralHeight = (t - 0.5) * 4
        const spiralAngle = angle + t * Math.PI * 4
        
        points.push(new Vector3(
          Math.cos(spiralAngle) * spiralRadius,
          spiralHeight,
          Math.sin(spiralAngle) * spiralRadius
        ))
      }
      
      const geometry = new BufferGeometry()
      const positions = new Float32Array(points.length * 3)
      
      for (let j = 0; j < points.length; j++) {
        positions[j * 3] = points[j].x
        positions[j * 3 + 1] = points[j].y
        positions[j * 3 + 2] = points[j].z
      }
      
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
      
      const material = new LineBasicMaterial({
        color: new Color().setHSL((i / lineCount + Math.random() * 0.2) % 1, 0.8, 0.6),
        transparent: true,
        opacity: 0.4
      })
      
      const line = new Line(geometry, material)
      
      result.push({
        line,
        geometry,
        material,
        originalPositions: positions.slice(),
        baseRadius: radius,
        baseAngle: angle,
        phaseOffset: Math.random() * Math.PI * 2,
        frequencyBand: Math.floor(Math.random() * 3), // 0=bass, 1=mid, 2=treble
        points
      })
    }
    
    return result
  }, [])
  
  // Add lines to the group on mount
  useMemo(() => {
    if (groupRef.current) {
      lines.forEach(({ line }) => {
        groupRef.current.add(line)
      })
    }
    
    return () => {
      if (groupRef.current) {
        lines.forEach(({ line }) => {
          groupRef.current.remove(line)
        })
      }
    }
  }, [lines])
  
  useFrame(({ clock }) => {
    if (!groupRef.current || !isEnabled || !audioAnalyzer) return
    
    const t = clock.getElapsedTime()
    const frequencies = audioAnalyzer.getFrequencyData()
    
    // Calculate frequency band averages
    const bassAvg = frequencies.slice(0, 85).reduce((a, b) => a + b, 0) / 85 / 255
    const midAvg = frequencies.slice(85, 170).reduce((a, b) => a + b, 0) / 85 / 255
    const trebleAvg = frequencies.slice(170, 255).reduce((a, b) => a + b, 0) / 85 / 255
    const bandAverages = [bassAvg, midAvg, trebleAvg]
    
    // Update each line based on audio
    lines.forEach((lineData) => {
      const audioIntensity = bandAverages[lineData.frequencyBand]
      const positions = lineData.geometry.attributes.position.array as Float32Array
      
      // Create dancing motion based on audio
      for (let i = 0; i < lineData.points.length; i++) {
        const originalPos = lineData.originalPositions
        const t_segment = i / lineData.points.length
        
        // Base wave motion
        const wavePhase = t * 2 + lineData.phaseOffset + t_segment * Math.PI * 2
        const audioWave = Math.sin(wavePhase) * audioIntensity * 2
        
        // Secondary wave for complexity
        const secondaryWave = Math.sin(wavePhase * 1.5 + Math.PI * 0.5) * audioIntensity * 1.5
        
        // Pulsing radius based on audio
        const radiusMultiplier = 1 + audioIntensity * 0.8
        
        // Calculate new position with audio-reactive motion
        const baseX = originalPos[i * 3]
        const baseY = originalPos[i * 3 + 1]
        const baseZ = originalPos[i * 3 + 2]
        
        positions[i * 3] = baseX * radiusMultiplier + audioWave * 0.5
        positions[i * 3 + 1] = baseY + secondaryWave * 0.3
        positions[i * 3 + 2] = baseZ * radiusMultiplier + audioWave * 0.3
      }
      
      lineData.geometry.attributes.position.needsUpdate = true
      
      // Update material opacity based on audio
      lineData.material.opacity = isEnabled && audioAnalyzer ? 0.4 + audioAnalyzer.getAverageFrequency() * 0.4 : 0.1
    })
    
    // Rotate the entire group
    groupRef.current.rotation.y = t * 0.3
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.1
  })
  
  return (
    <group ref={groupRef}>
      {/* Central glow orb */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial 
          color="#ff6699"
          transparent 
          opacity={isEnabled && audioAnalyzer ? 0.3 + audioAnalyzer.getAverageFrequency() * 0.5 : 0.1}
        />
      </mesh>
      
      {/* Outer ring particles */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const radius = 4
        return (
          <mesh key={i} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial 
              color="#66ccff"
              transparent 
              opacity={isEnabled && audioAnalyzer ? 0.2 + audioAnalyzer.getAverageFrequency() * 0.3 : 0.05}
            />
          </mesh>
        )
      })}
    </group>
  )
}
