import { useState, useCallback, useEffect } from 'react'

/**
 * Enhanced call features: noise suppression, PiP, network quality.
 */
export default function useCallEnhancements() {
  const [noiseSuppression, setNoiseSuppression] = useState(false)
  const [networkQuality, setNetworkQuality] = useState('good') // 'good' | 'fair' | 'poor'
  const [isPipActive, setIsPipActive] = useState(false)

  // Toggle noise suppression via AudioContext
  const toggleNoiseSuppression = useCallback((stream) => {
    if (!stream) return
    const audioTracks = stream.getAudioTracks()
    audioTracks.forEach((track) => {
      const settings = track.getSettings()
      // Apply noise suppression constraint if supported
      if ('noiseSuppression' in settings || typeof track.applyConstraints === 'function') {
        try {
          track.applyConstraints({
            advanced: [{ noiseSuppression: !noiseSuppression }],
          })
        } catch {
          // Not supported on this device
        }
      }
    })
    setNoiseSuppression((prev) => !prev)
  }, [noiseSuppression])

  // Monitor network quality
  useEffect(() => {
    if (!navigator.connection) return

    const connection = navigator.connection
    const updateQuality = () => {
      const downlink = connection.downlink || 10
      if (downlink >= 5) setNetworkQuality('good')
      else if (downlink >= 1) setNetworkQuality('fair')
      else setNetworkQuality('poor')
    }

    connection.addEventListener('change', updateQuality)
    updateQuality()

    return () => connection.removeEventListener('change', updateQuality)
  }, [])

  // Picture-in-Picture
  const togglePip = useCallback(async (videoElement) => {
    if (!videoElement) return

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPipActive(false)
      } else if (videoElement.srcObject) {
        await videoElement.requestPictureInPicture()
        setIsPipActive(true)
      }
    } catch {
      // PiP not supported or denied
      setIsPipActive(false)
    }
  }, [])

  // Camera switching
  const switchCamera = useCallback(async (stream) => {
    if (!stream) return
    const videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) return

    const currentFacing = videoTrack.getSettings().facingMode
    const newFacing = currentFacing === 'environment' ? 'user' : 'environment'

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: false,
      })
      const newTrack = newStream.getVideoTracks()[0]

      // Replace track
      stream.removeTrack(videoTrack)
      stream.addTrack(newTrack)
      videoTrack.stop()
    } catch {
      // Camera switch failed
    }
  }, [])

  return {
    noiseSuppression,
    toggleNoiseSuppression,
    networkQuality,
    isPipActive,
    togglePip,
    switchCamera,
  }
}
