import { useState, useEffect } from 'react'
import { AudioControls } from './AudioControls'

export function UI() {
  const [isHelpVisible, setIsHelpVisible] = useState(true)
  const [isMinimized, setIsMinimized] = useState(false)

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
    
    // Hide help content when minimizing
    if (!isMinimized) {
      setIsHelpVisible(false)
    }
    
    // Hide/show Leva controls by dispatching a custom event
    const event = new CustomEvent('toggleLeva', { detail: { hidden: !isMinimized } })
    window.dispatchEvent(event)
  }

  // Keyboard shortcut: 'M' key to minimize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Don't trigger if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
        handleMinimize()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMinimized])

  return (
    <div className="ui-overlay">
      <div className={`info-panel ${isMinimized ? 'minimized' : ''}`}>
        <div className="header-section">
          <h3>Nosuch Petals</h3>
          <div className="header-buttons">
            {!isMinimized && (
              <button 
                className="help-toggle"
                onClick={() => setIsHelpVisible(!isHelpVisible)}
                aria-label={isHelpVisible ? "Hide help" : "Show help"}
              >
                {isHelpVisible ? '−' : '+'}
              </button>
            )}
            <button 
              className="minimize-toggle"
              onClick={handleMinimize}
              aria-label={isMinimized ? "Expand menus" : "Minimize all menus"}
              title={`${isMinimized ? 'Expand' : 'Minimize'} all menus (M)`}
            >
              {isMinimized ? '📋' : '📦'}
            </button>
          </div>
        </div>
        
        {!isMinimized && isHelpVisible && (
          <div className="help-content">
            <p>Generative flower art with React Three Fiber</p>
            <p>• Drag to rotate the view</p>
            <p>• Scroll to zoom in/out</p>
            <p>• Auto rotation enabled by default</p>
            <p>• Press 'S' to save current frame</p>
            <p>• Press 'M' to minimize/expand all menus</p>
            <p>• Use the controls panel to customize</p>
            <p>• Adjust Audio Reactivity to control intensity</p>
          </div>
        )}
        
        {!isMinimized && <AudioControls />}
      </div>
    </div>
  )
}
