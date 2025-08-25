import { useState } from 'react'
import { AudioControls } from './AudioControls'

export function UI() {
  const [isHelpVisible, setIsHelpVisible] = useState(true)

  return (
    <div className="ui-overlay">
      <div className="info-panel">
        <div className="header-section">
          <h3>Nosuch Petals</h3>
          <button 
            className="help-toggle"
            onClick={() => setIsHelpVisible(!isHelpVisible)}
            aria-label={isHelpVisible ? "Hide help" : "Show help"}
          >
            {isHelpVisible ? '−' : '+'}
          </button>
        </div>
        
        {isHelpVisible && (
          <div className="help-content">
            <p>Generative flower art with React Three Fiber</p>
            <p>• Drag to rotate the view</p>
            <p>• Scroll to zoom in/out</p>
            <p>• Auto rotation enabled by default</p>
            <p>• Press 'S' to save current frame</p>
            <p>• Use the controls panel to customize</p>
            <p>• Adjust Audio Reactivity to control intensity</p>
          </div>
        )}
        
        <AudioControls />
      </div>
    </div>
  )
}
