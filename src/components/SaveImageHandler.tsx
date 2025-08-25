import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

export function SaveImageHandler() {
  const { gl, scene, camera } = useThree()
  
  useEffect(() => {
    const saveImage = () => {
      // Render the current frame
      gl.render(scene, camera)
      
      // Create a canvas element to download the image
      const canvas = gl.domElement
      const link = document.createElement('a')
      link.download = `nosuch-petals-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }

    const handleKeyPress = (event: KeyboardEvent) => {
      // Press 'S' to save image
      if (event.key === 's' || event.key === 'S') {
        event.preventDefault()
        saveImage()
      }
    }

    // Add save button to the UI
    const createSaveButton = () => {
      const existingButton = document.getElementById('save-image-btn')
      if (existingButton) return

      const button = document.createElement('button')
      button.id = 'save-image-btn'
      button.className = 'save-button'
      button.innerHTML = '📸 Save Image'
      button.onclick = saveImage
      
      const infoPanel = document.querySelector('.info-panel')
      if (infoPanel) {
        infoPanel.appendChild(button)
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    createSaveButton()

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      const button = document.getElementById('save-image-btn')
      if (button) {
        button.remove()
      }
    }
  }, [gl, scene, camera])

  return null
}
