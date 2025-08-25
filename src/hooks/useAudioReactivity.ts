import { useEffect, useState, useRef } from 'react'

export interface AudioDevice {
  deviceId: string
  label: string
}

export interface AudioAnalyzer {
  analyser: AnalyserNode
  dataArray: Uint8Array
  getFrequencyData: () => Uint8Array
  getAverageFrequency: () => number
  getBassLevel: () => number
  getMidLevel: () => number
  getTrebleLevel: () => number
}

export function useAudioReactivity() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [devices, setDevices] = useState<AudioDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [audioAnalyzer, setAudioAnalyzer] = useState<AudioAnalyzer | null>(null)
  const [error, setError] = useState<string>('')
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  // Smoothing values for audio levels
  const smoothedLevelsRef = useRef({ bass: 0, mid: 0, treble: 0 })

  // Get available audio devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices()
        const audioInputs = deviceList
          .filter(device => device.kind === 'audioinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`
          }))
        
        setDevices(audioInputs)
        if (audioInputs.length > 0 && !selectedDevice) {
          setSelectedDevice(audioInputs[0].deviceId)
        }
      } catch (err) {
        console.error('Error getting audio devices:', err)
        setError('Failed to get audio devices')
      }
    }

    getDevices()
  }, [selectedDevice])

  const startAudio = async () => {
    try {
      setError('')
      
      // Request microphone permission and get stream
      const constraints = {
        audio: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream
      
      // Create audio context and analyzer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext
      
      const source = audioContext.createMediaStreamSource(stream)
      sourceRef.current = source
      
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.9
      
      source.connect(analyser)
      
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      const analyzer: AudioAnalyzer = {
        analyser,
        dataArray,
        getFrequencyData: () => {
          analyser.getByteFrequencyData(dataArray)
          return dataArray
        },
        getAverageFrequency: () => {
          analyser.getByteFrequencyData(dataArray)
          const sum = dataArray.reduce((a, b) => a + b, 0)
          return sum / dataArray.length / 255 // Normalize to 0-1
        },
        getBassLevel: () => {
          analyser.getByteFrequencyData(dataArray)
          const bassEnd = Math.floor(dataArray.length * 0.1) // First 10% for bass
          const bassSum = dataArray.slice(0, bassEnd).reduce((a, b) => a + b, 0)
          const rawLevel = bassSum / bassEnd / 255
          // Apply smoothing
          const smoothingFactor = 0.7
          smoothedLevelsRef.current.bass = smoothedLevelsRef.current.bass * smoothingFactor + rawLevel * (1 - smoothingFactor)
          return smoothedLevelsRef.current.bass
        },
        getMidLevel: () => {
          analyser.getByteFrequencyData(dataArray)
          const midStart = Math.floor(dataArray.length * 0.1)
          const midEnd = Math.floor(dataArray.length * 0.6)
          const midData = dataArray.slice(midStart, midEnd)
          const midSum = midData.reduce((a, b) => a + b, 0)
          const rawLevel = midSum / midData.length / 255
          // Apply smoothing
          const smoothingFactor = 0.7
          smoothedLevelsRef.current.mid = smoothedLevelsRef.current.mid * smoothingFactor + rawLevel * (1 - smoothingFactor)
          return smoothedLevelsRef.current.mid
        },
        getTrebleLevel: () => {
          analyser.getByteFrequencyData(dataArray)
          const trebleStart = Math.floor(dataArray.length * 0.6)
          const trebleData = dataArray.slice(trebleStart)
          const trebleSum = trebleData.reduce((a, b) => a + b, 0)
          const rawLevel = trebleSum / trebleData.length / 255
          // Apply smoothing
          const smoothingFactor = 0.7
          smoothedLevelsRef.current.treble = smoothedLevelsRef.current.treble * smoothingFactor + rawLevel * (1 - smoothingFactor)
          return smoothedLevelsRef.current.treble
        }
      }
      
      setAudioAnalyzer(analyzer)
      setIsEnabled(true)
      
    } catch (err) {
      console.error('Error starting audio:', err)
      setError('Failed to access microphone. Please check permissions.')
    }
  }

  const stopAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    
    // Reset smoothed levels
    smoothedLevelsRef.current = { bass: 0, mid: 0, treble: 0 }
    
    setAudioAnalyzer(null)
    setIsEnabled(false)
  }

  const toggleAudio = () => {
    if (isEnabled) {
      stopAudio()
    } else {
      startAudio()
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  return {
    isEnabled,
    devices,
    selectedDevice,
    setSelectedDevice,
    audioAnalyzer,
    error,
    toggleAudio,
    startAudio,
    stopAudio
  }
}
