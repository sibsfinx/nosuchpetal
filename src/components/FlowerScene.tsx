import { Suspense } from 'react'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Petal } from './Petal'
import { useControls } from 'leva'

export function FlowerScene() {
  const {
    petalCount,
    radius,
    bloomIntensity,
    bloomRadius,
    vignetteIntensity,
    chromaticAberrationOffset
  } = useControls({
    petalCount: { value: 24, min: 8, max: 48, step: 1 },
    radius: { value: 2.5, min: 1, max: 5, step: 0.1 },
    bloomIntensity: { value: 1.2, min: 0, max: 3, step: 0.1 },
    bloomRadius: { value: 0.4, min: 0, max: 1, step: 0.1 },
    vignetteIntensity: { value: 0.5, min: 0, max: 1, step: 0.1 },
    chromaticAberrationOffset: { value: 0.002, min: 0, max: 0.01, step: 0.001 }
  })

  const petals = Array.from({ length: petalCount }, (_, i) => ({
    angle: (i * Math.PI * 2) / petalCount,
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
      <group>
        {petals.map((petal) => (
          <Petal
            key={petal.index}
            angle={petal.angle}
            index={petal.index}
            radius={radius}
            petalCount={petalCount}
          />
        ))}
      </group>

      {/* Center sphere */}
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffdd00"
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
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI / 1.5}
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
          offset={[chromaticAberrationOffset, chromaticAberrationOffset]}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Suspense>
  )
}
