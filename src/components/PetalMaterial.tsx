import { useRef, useMemo } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { ShaderMaterial, Color } from 'three'
import { FLOWER_TYPES, FlowerType } from '../types/flowers'

// Vertex shader for petal warping
const vertexShader = `
  uniform float time;
  uniform float warpIntensity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    vec3 pos = position;
    
    // Warping effect based on UV coordinates
    float warp = sin(pos.y * 3.0 + time * 2.0) * warpIntensity * uv.y;
    pos.x += warp * 0.3;
    pos.z += warp * 0.1;
    
    // Additional organic movement
    pos += normal * sin(pos.y * 5.0 + time) * 0.02 * uv.y;
    
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// Fragment shader for glossy material
const fragmentShader = `
  uniform float time;
  uniform vec3 color;
  uniform float opacity;
  uniform float metalness;
  uniform float roughness;
  uniform float transmission;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec2 uv = vUv;
    
    // Gradient from center to edge
    float gradient = 1.0 - distance(uv, vec2(0.5)) * 2.0;
    gradient = smoothstep(0.0, 1.0, gradient);
    
    // Animated color variations
    vec3 baseColor = color;
    baseColor += sin(time + vPosition.y * 3.0) * 0.1;
    
    // Edge glow effect
    float edge = 1.0 - abs(uv.y - 0.5) * 2.0;
    edge = pow(edge, 3.0);
    
    vec3 finalColor = baseColor * gradient + edge * 0.3;
    float alpha = opacity * gradient;
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`

class PetalShaderMaterial extends ShaderMaterial {
  constructor() {
    super({
      vertexShader,
      fragmentShader,
      uniforms: {
        time: { value: 0 },
        color: { value: new Color('#ff3366') },
        opacity: { value: 0.9 },
        warpIntensity: { value: 0.1 },
        metalness: { value: 0.8 },
        roughness: { value: 0.1 },
        transmission: { value: 0.8 }
      },
      transparent: true,
      depthWrite: false
    })
  }
}

extend({ PetalShaderMaterial })

// TypeScript declaration for the custom material
declare global {
  namespace JSX {
    interface IntrinsicElements {
      petalShaderMaterial: any
    }
  }
}

interface PetalMaterialProps {
  index: number
  flowerType?: FlowerType
}

export function PetalMaterial({ index, flowerType = 'default' }: PetalMaterialProps) {
  const materialRef = useRef<PetalShaderMaterial>(null!)
  const flowerConfig = FLOWER_TYPES[flowerType]
  
  const colorVariations = useMemo(() => {
    // Use flower-specific colors instead of rainbow distribution
    const colorIndex = index % flowerConfig.colors.length
    const baseColor = flowerConfig.colors[colorIndex]
    const color = new Color(baseColor)
    
    // Add slight variation for organic look
    const variation = (index * 0.1) % 0.2 - 0.1
    color.offsetHSL(0, 0, variation)
    
    return color
  }, [index, flowerConfig.colors])
  
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime()
      materialRef.current.uniforms.color.value = colorVariations
    }
  })

  return (
    <petalShaderMaterial
      ref={materialRef}
      transparent
      depthWrite={false}
    />
  )
}
