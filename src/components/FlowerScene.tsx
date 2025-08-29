import { Suspense, useRef, useMemo } from 'react'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useControls } from 'leva'
import { useFrame } from '@react-three/fiber'
import { Group, Vector3, BufferGeometry, Float32BufferAttribute, Color, Line, LineBasicMaterial } from 'three'
import { useAudio } from '../contexts/AudioContext'

export function FlowerScene() {
  const groupRef = useRef<Group>(null!)
  const { isEnabled, audioAnalyzer } = useAudio()
  
  const {
    streamCount,
    ringRadius,
    streamHeight,
    rotationSpeed,
    audioSmoothness,
    colorShift,
    // Post-processing
    bloomIntensity,
    bloomRadius,
    vignetteIntensity,
    chromaticAberrationOffset
  } = useControls({
    // Aurora Stream Settings
    streamCount: { value: 64, min: 24, max: 128, step: 8, label: 'Light Streams' },
    ringRadius: { value: 8, min: 4, max: 15, step: 0.5, label: 'Ring Radius' },
    streamHeight: { value: 12, min: 6, max: 20, step: 1, label: 'Stream Height' },
    rotationSpeed: { value: 0.2, min: 0, max: 1, step: 0.05, label: 'Rotation Speed' },
    audioSmoothness: { value: 3.5, min: 0, max: 10, step: 0.1, label: 'Audio Reactivity' },
    colorShift: { value: 0.5, min: 0, max: 2, step: 0.1, label: 'Color Cycling' },
    
    // Post-processing
    bloomIntensity: { value: 2.5, min: 0, max: 5, step: 0.1 },
    bloomRadius: { value: 0.8, min: 0, max: 2, step: 0.1 },
    vignetteIntensity: { value: 0.3, min: 0, max: 1, step: 0.1 },
    chromaticAberrationOffset: { value: 0.001, min: 0, max: 0.01, step: 0.001 }
  })

  // Create aurora streams
  const streams = useMemo(() => {
    const result = []
    
    for (let i = 0; i < streamCount; i++) {
      const angle = (i / streamCount) * Math.PI * 2
      const baseRadius = ringRadius + (Math.random() - 0.5) * 2
      const segments = 40
      const points = []
      
      // Create vertical stream with slight curve
      for (let j = 0; j <= segments; j++) {
        const t = j / segments
        const height = t * streamHeight
        const radiusVariation = Math.sin(t * Math.PI) * 0.5
        const currentRadius = baseRadius + radiusVariation
        
        // Add some organic movement to the stream
        const sway = Math.sin(t * Math.PI * 2 + i * 0.1) * 0.3
        
        points.push(new Vector3(
          Math.cos(angle) * currentRadius + sway,
          height - streamHeight * 0.5,
          Math.sin(angle) * currentRadius + sway * 0.5
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
      
      result.push({
        geometry,
        originalPositions: positions.slice(),
        angle,
        baseRadius,
        phaseOffset: Math.random() * Math.PI * 2,
        points,
        hue: (i / streamCount + Math.random() * 0.1) % 1
      })
    }
    
    return result
  }, [streamCount, ringRadius, streamHeight])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    
    if (groupRef.current) {
      groupRef.current.rotation.y = t * rotationSpeed
    }
    
    if (isEnabled && audioAnalyzer) {
      const frequencies = audioAnalyzer.getFrequencyData()
      
      // Calculate frequency band averages
      const bassAvg = frequencies.slice(0, 85).reduce((a, b) => a + b, 0) / 85 / 255
      const midAvg = frequencies.slice(85, 170).reduce((a, b) => a + b, 0) / 85 / 255
      const trebleAvg = frequencies.slice(170, 255).reduce((a, b) => a + b, 0) / 85 / 255
      
      // Update stream positions based on audio
      streams.forEach((stream, index) => {
        const positions = stream.geometry.attributes.position.array as Float32Array
        const audioIntensity = (bassAvg + midAvg + trebleAvg) / 3
        const bandIntensity = [bassAvg, midAvg, trebleAvg][index % 3]
        
        for (let i = 0; i < stream.points.length; i++) {
          const originalPos = stream.originalPositions
          const t_segment = i / stream.points.length
          
          // Audio-reactive height modulation
          const heightMultiplier = 1 + bandIntensity * audioSmoothness * 0.3
          const radiusMultiplier = 1 + audioIntensity * audioSmoothness * 0.1
          
          // Wave motion based on audio
          const wave = Math.sin(t * 2 + stream.phaseOffset + t_segment * Math.PI) * audioIntensity * 2
          
          positions[i * 3] = originalPos[i * 3] * radiusMultiplier + wave * 0.2
          positions[i * 3 + 1] = originalPos[i * 3 + 1] * heightMultiplier + wave * 0.1
          positions[i * 3 + 2] = originalPos[i * 3 + 2] * radiusMultiplier + wave * 0.15
        }
        
        stream.geometry.attributes.position.needsUpdate = true
      })
    }
  })

  return (
    <Suspense fallback={null}>
      {/* Environment and lighting */}
      <Environment preset="night" />
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 10, 0]} intensity={2} color="#ffffff" />
      
      {/* Aurora Streams */}
      <group ref={groupRef}>
        {streams.map((stream, index) => {
          const t = performance.now() * 0.001
          const hue = (stream.hue + t * colorShift * 0.1) % 1
          
          return (
            <primitive 
              key={index} 
              object={(() => {
                const line = new Line(stream.geometry, new LineBasicMaterial({
                  color: new Color().setHSL(hue, 0.8, 0.6),
                  transparent: true,
                  opacity: isEnabled && audioAnalyzer ? 0.6 + audioAnalyzer.getAverageFrequency() * 0.4 : 0.4
                }))
                return line
              })()} 
            />
          )
        })}
        
        {/* Central ring */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[ringRadius, 0.2, 16, 64]} />
          <meshBasicMaterial 
            color="#ffffff"
            transparent 
            opacity={isEnabled && audioAnalyzer ? 0.8 + audioAnalyzer.getAverageFrequency() * 0.2 : 0.6}
          />
        </mesh>
        
        {/* Ground reflection plane */}
        <mesh position={[0, -streamHeight * 0.5 - 1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ringRadius * 3, ringRadius * 3]} />
          <meshBasicMaterial 
            color="#000033"
            transparent 
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={6}
        maxDistance={30}
        maxPolarAngle={Math.PI / 1.3}
        zoomSpeed={0.8}
        rotateSpeed={0.8}
        enableDamping={true}
        dampingFactor={0.05}
      />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.1}
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
