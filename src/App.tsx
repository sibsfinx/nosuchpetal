import { Canvas } from '@react-three/fiber'
import { FlowerScene } from './components/FlowerScene'
import { UI } from './components/UI'
import './styles/global.css'

export default function App() {
  // Responsive camera positioning
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const cameraPosition: [number, number, number] = isMobile ? [0, 0, 12] : [0, 0, 8]
  const cameraFov = isMobile ? 65 : 45

  return (
    <>
      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true // Enable screenshot functionality
        }}
        dpr={[1, 2]}
        shadows
      >
        <FlowerScene />
      </Canvas>
      <UI />
    </>
  )
}
