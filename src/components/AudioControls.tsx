import { useAudio } from '../contexts/AudioContext'

export function AudioControls() {
  const {
    isEnabled,
    devices,
    selectedDevice,
    setSelectedDevice,
    error,
    toggleAudio
  } = useAudio()

  return (
    <div className="audio-controls">
      <h4>🎵 Audio Reactivity</h4>
      
      {error && (
        <div className="audio-error">
          {error}
        </div>
      )}
      
      <div className="audio-device-select">
        <label htmlFor="mic-select">Microphone:</label>
        <select 
          id="mic-select"
          value={selectedDevice} 
          onChange={(e) => setSelectedDevice(e.target.value)}
          disabled={isEnabled}
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      
      <button 
        className={`audio-toggle ${isEnabled ? 'active' : ''}`}
        onClick={toggleAudio}
      >
        {isEnabled ? '🔊 Stop Audio' : '🎤 Start Audio'}
      </button>
      
      {isEnabled && (
        <div className="audio-info">
          <p>🎶 Audio reactive mode enabled!</p>
          <p>The flower will gently dance to your music</p>
        </div>
      )}
    </div>
  )
}
