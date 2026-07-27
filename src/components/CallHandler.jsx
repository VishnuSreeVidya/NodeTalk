import { useEffect, useRef, useState, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useWebRTC from '../hooks/useWebRTC'

function formatDuration(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

const CallControls = memo(function CallControls({ muted, videoOff, isAudioOnly, callDuration, onToggleMute, onToggleVideo, onEndCall, onToggleScreenShare }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
    >
      <div className="glass-strong rounded-full px-8 py-4 flex items-center gap-5 shadow-2xl">
        <span className="text-white font-mono text-sm font-medium">{formatDuration(callDuration)}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
            muted ? 'bg-red-500/70 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          {muted ? '🔇' : '🎤'}
        </motion.button>
        {!isAudioOnly && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                videoOff ? 'bg-red-500/70 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {videoOff ? '🚫' : '📹'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleScreenShare}
              className="w-12 h-12 rounded-full bg-white/10 text-white/80 hover:bg-white/20 flex items-center justify-center text-xl transition-all"
              title="Screen share"
            >
              🖥️
            </motion.button>
          </>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onEndCall}
          className="w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-xl transition-all hover:scale-105 shadow-lg"
        >
          ✕
        </motion.button>
      </div>
    </motion.div>
  )
})

export default function CallHandler({ selectedUser, onCallChange, callRequest }) {
  const {
    state, callType, remoteStream, localStream,
    muted, videoOff, callDuration, callerName, calleeName,
    startCall, endCall, declineCall, acceptCall,
    toggleMute, toggleVideo,
  } = useWebRTC(selectedUser, onCallChange)

  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [localStream, remoteStream])

  useEffect(() => {
    if (callRequest?.type === 'calling' && selectedUser) {
      startCall(callRequest.callType)
    }
  }, [callRequest, selectedUser, startCall])

  const handleToggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true })
        const screenTrack = screenStream.getVideoTracks()[0]
        screenTrack.onended = () => setIsScreenSharing(false)
        setIsScreenSharing(true)
      } else {
        setIsScreenSharing(false)
      }
    } catch {
      // User cancelled screen share
    }
  }, [isScreenSharing])

  const isAudioOnly = callType === 'audio'

  return (
    <AnimatePresence>
      {state === 'ringing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="call-overlay"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 20 }}
            className="glass-strong rounded-3xl p-10 text-center max-w-sm w-full mx-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center text-5xl"
            >
              {isAudioOnly ? '📞' : '📹'}
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-1">{callerName}</h2>
            <p className="text-white/50 mb-8">{isAudioOnly ? 'Incoming voice call...' : 'Incoming video call...'}</p>
            <div className="flex items-center justify-center gap-6">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={declineCall}
                className="w-16 h-16 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-2xl transition-all shadow-lg"
              >
                ✕
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={acceptCall}
                className="w-16 h-16 rounded-full bg-green-500/80 hover:bg-green-500 text-white flex items-center justify-center text-2xl transition-all shadow-lg"
              >
                ✓
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {(state === 'connected' || state === 'calling' || state === 'connecting') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="call-overlay"
        >
          <div className="call-video-container">
            {remoteStream ? (
              <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
            ) : (
              <div className="flex flex-col items-center justify-center text-white">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-32 h-32 rounded-full glass-strong flex items-center justify-center text-6xl mb-4 shadow-xl"
                >
                  {calleeName?.charAt(0).toUpperCase() || callerName?.charAt(0).toUpperCase() || '?'}
                </motion.div>
                <p className="text-xl font-semibold">{calleeName || callerName || 'Connecting...'}</p>
                <p className="text-white/50 text-sm mt-2">
                  {state === 'calling' ? 'Calling...' : state === 'connecting' ? 'Connecting...' : ''}
                </p>
              </div>
            )}

            {localStream && !isAudioOnly && (
              <motion.video
                ref={localVideoRef}
                muted
                autoPlay
                playsInline
                className="local-video"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              />
            )}

            {state === 'connected' && (
              <CallControls
                muted={muted}
                videoOff={videoOff}
                isAudioOnly={isAudioOnly}
                callDuration={callDuration}
                onToggleMute={toggleMute}
                onToggleVideo={toggleVideo}
                onEndCall={endCall}
                onToggleScreenShare={handleToggleScreenShare}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
