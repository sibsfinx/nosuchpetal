import { createContext, useContext, ReactNode } from 'react'
import { useAudioReactivity, AudioAnalyzer } from '../hooks/useAudioReactivity'

interface AudioContextType {
  isEnabled: boolean
  audioAnalyzer: AudioAnalyzer | null
  devices: Array<{ deviceId: string; label: string }>
  selectedDevice: string
  setSelectedDevice: (device: string) => void
  error: string
  toggleAudio: () => void
}

const AudioContext = createContext<AudioContextType | null>(null)

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioData = useAudioReactivity()
  
  return (
    <AudioContext.Provider value={audioData}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const context = useContext(AudioContext)
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider')
  }
  return context
}
