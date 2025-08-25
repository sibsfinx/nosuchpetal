import { Canvas } from '@react-three/fiber'
import { FlowerScene } from './components/FlowerScene'
import { UI } from './components/UI'
import './styles/global.css'

export default function App() {
  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
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
