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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
    >
      <div
        className="flex items-center gap-3 px-6 py-3 rounded-full"
        style={{
          background: 'var(--surface-elevated)',
          border: '1px solid var(--border-secondary)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        <span className="text-xs font-mono font-medium" style={{ color: 'var(--text-secondary)' }}>{formatDuration(callDuration)}</span>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggleMute}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: muted ? 'var(--danger)' : 'var(--surface-tertiary)',
            color: muted ? 'white' : 'var(--text-secondary)',
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {muted ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            )}
          </svg>
        </motion.button>
        {!isAudioOnly && (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleVideo}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: videoOff ? 'var(--danger)' : 'var(--surface-tertiary)',
                color: videoOff ? 'white' : 'var(--text-secondary)',
              }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {videoOff ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                )}
              </svg>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleScreenShare}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--surface-tertiary)', color: 'var(--text-secondary)' }}
              title="Screen share"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </motion.button>
          </>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onEndCall}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'var(--danger)', color: 'white' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
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
          transition={{ duration: 0.2 }}
          className="call-overlay"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="text-center max-w-sm w-full mx-4 p-8 rounded-2xl"
            style={{
              background: 'var(--surface-secondary)',
              border: '1px solid var(--border-secondary)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center text-4xl"
              style={{ background: 'var(--surface-tertiary)' }}
            >
              {isAudioOnly ? (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--accent)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </motion.div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{callerName}</h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
              {isAudioOnly ? 'Incoming voice call...' : 'Incoming video call...'}
            </p>
            <div className="flex items-center justify-center gap-5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={declineCall}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'var(--danger)', color: 'white' }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={acceptCall}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'var(--success)', color: 'white' }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
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
          transition={{ duration: 0.2 }}
          className="call-overlay"
        >
          <div className="call-video-container">
            {remoteStream ? (
              <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="w-28 h-28 rounded-full flex items-center justify-center text-5xl mb-4 font-semibold"
                  style={{
                    background: 'var(--surface-tertiary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-secondary)',
                  }}
                >
                  {calleeName?.charAt(0).toUpperCase() || callerName?.charAt(0).toUpperCase() || '?'}
                </motion.div>
                <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{calleeName || callerName || 'Connecting...'}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
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
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
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
