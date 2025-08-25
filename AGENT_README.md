Here’s a setup to recreate a “generative flower” like in @nosuchfuture’s art:

🌸 React Three Fiber Starter: “Warped Petal Flower”
📦 Packages
npm install three @react-three/fiber @react-three/drei

🧠 Concept

Radial symmetry using petal instances

Warping via vertex displacement (GLSL or JS)

Glossy material (MeshPhysicalMaterial or custom shader)

Post-processing for glow/bloom

🧪 Example: Petal Generator with R3F
// FlowerScene.tsx
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshPhysicalMaterial, Vector3 } from 'three'
import { useRef } from 'react'

function Petal({ angle }: { angle: number }) {
  const ref = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    ref.current.rotation.z = Math.sin(t + angle) * 0.2
  })

  return (
    <mesh
      ref={ref}
      position={[
        Math.sin(angle) * 2,
        Math.cos(angle) * 2,
        0,
      ]}
      rotation={[0, 0, angle]}
    >
      <cylinderGeometry args={[0, 0.4, 1.5, 32, 1]} />
      <meshPhysicalMaterial
        color="#ff3366"
        roughness={0}
        transmission={1}
        thickness={0.5}
        clearcoat={1}
        reflectivity={1}
      />
    </mesh>
  )
}

export default function FlowerScene() {
  const petals = Array.from({ length: 20 }, (_, i) => (i * Math.PI * 2) / 20)

  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.2} />
      {petals.map((a, i) => (
        <Petal key={i} angle={a} />
      ))}
    </Canvas>
  )
}

✨ Next-Level: Custom Shaders + Postprocessing

Use @react-three/postprocessing:

npm install @react-three/postprocessing


Add Bloom, Vignette, and ChromaticAberration.

Use a custom shader via <shaderMaterial /> or glslify.

Let me know if you want:

A full repo template

Custom GLSL shader for petal warping

Tips for parametric sliders (e.g. leva or drei controls)

Ready to generate the full R3F project?