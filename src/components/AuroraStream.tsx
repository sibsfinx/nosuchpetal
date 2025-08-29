import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, LineBasicMaterial, BufferGeometry, Float32BufferAttribute, Color } from 'three'
import { useAudio } from '../contexts/AudioContext'

interface AuroraStreamProps {
  points: Float32Array
  originalPositions: Float32Array
  hue: number
  phaseOffset: number
  colorShift: number
  audioSmoothness: number
  index: number
}

export function AuroraStream({ 
  points, 
  originalPositions, 
  hue, 
  phaseOffset, 
  colorShift, 
  audioSmoothness,
  index 
}: AuroraStreamProps) {
  const lineRef = useRef<Line>(null!)
  const { isEnabled, audioAnalyzer } = useAudio()
  
  useEffect(() => {
    if (lineRef.current) {
      const geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute(points, 3))
      lineRef.current.geometry = geometry
      
      const material = new LineBasicMaterial({
        color: new Color().setHSL(hue, 0.8, 0.6),
        transparent: true,
        opacity: 0.4
      })
      lineRef.current.material = material
    }
  }, [points, hue])
  
  useFrame(({ clock }) => {
    if (!lineRef.current) return
    
    const t = clock.getElapsedTime()
    const material = lineRef.current.material as LineBasicMaterial
    
    // Update color
    const currentHue = (hue + t * colorShift * 0.1) % 1
    material.color.setHSL(currentHue, 0.8, 0.6)
    
    // Update opacity based on audio
    if (isEnabled && audioAnalyzer) {
      const frequencies = audioAnalyzer.getFrequencyData()
      const bassAvg = frequencies.slice(0, 85).reduce((a, b) => a + b, 0) / 85 / 255
      const midAvg = frequencies.slice(85, 170).reduce((a, b) => a + b, 0) / 85 / 255
      const trebleAvg = frequencies.slice(170, 255).reduce((a, b) => a + b, 0) / 85 / 255
      
      const audioIntensity = (bassAvg + midAvg + trebleAvg) / 3
      const bandIntensity = [bassAvg, midAvg, trebleAvg][index % 3]
      
      material.opacity = 0.4 + audioIntensity * 0.6
      
      // Update geometry positions
      const geometry = lineRef.current.geometry as BufferGeometry
      const positions = geometry.attributes.position.array as Float32Array
      const pointCount = positions.length / 3
      
      for (let i = 0; i < pointCount; i++) {
        const t_segment = i / pointCount
        
        // Audio-reactive height modulation
        const heightMultiplier = 1 + bandIntensity * audioSmoothness * 0.3
        const radiusMultiplier = 1 + audioIntensity * audioSmoothness * 0.1
        
        // Wave motion based on audio
        const wave = Math.sin(t * 2 + phaseOffset + t_segment * Math.PI) * audioIntensity * 2
        
        positions[i * 3] = originalPositions[i * 3] * radiusMultiplier + wave * 0.2
        positions[i * 3 + 1] = originalPositions[i * 3 + 1] * heightMultiplier + wave * 0.1
        positions[i * 3 + 2] = originalPositions[i * 3 + 2] * radiusMultiplier + wave * 0.15
      }
      
      geometry.attributes.position.needsUpdate = true
    }
  })
  
  return <line ref={lineRef} />
}
