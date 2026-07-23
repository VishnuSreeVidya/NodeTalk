import { useEffect, useRef } from 'react'
import useWebRTC from '../hooks/useWebRTC'

function formatDuration(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

function CallControls({ muted, videoOff, isAudioOnly, callDuration, onToggleMute, onToggleVideo, onEndCall }) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
      <div className="glass-strong rounded-full px-6 py-3 flex items-center gap-6">
        <span className="text-white font-mono text-sm">{formatDuration(callDuration)}</span>
        <button
          onClick={onToggleMute}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
            muted ? 'bg-red-500/70 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
          }`}
        >
          {muted ? '🔇' : '🎤'}
        </button>
        {!isAudioOnly && (
          <button
            onClick={onToggleVideo}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
              videoOff ? 'bg-red-500/70 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {videoOff ? '🚫' : '📹'}
          </button>
        )}
        <button
          onClick={onEndCall}
          className="w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-xl transition-all hover:scale-105"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function CallHandler({ selectedUser, onCallChange, callRequest }) {
  const {
    state, callType, remoteStream, localStream,
    muted, videoOff, callDuration, callerName, calleeName,
    startCall, endCall, declineCall, acceptCall,
    toggleMute, toggleVideo,
  } = useWebRTC(selectedUser, onCallChange)

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

  const isAudioOnly = callType === 'audio'

  if (state === 'ringing') {
    return (
      <div className="call-overlay animate-fade-in">
        <div className="glass-strong rounded-3xl p-10 text-center max-w-sm w-full mx-4 animate-bounce-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full glass-strong flex items-center justify-center text-5xl">
            {isAudioOnly ? '📞' : '📹'}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{callerName}</h2>
          <p className="text-white/50 mb-8">{isAudioOnly ? 'Incoming voice call...' : 'Incoming video call...'}</p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={declineCall}
              className="w-16 h-16 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-2xl transition-all hover:scale-105"
            >
              ✕
            </button>
            <button
              onClick={acceptCall}
              className="w-16 h-16 rounded-full bg-green-500/80 hover:bg-green-500 text-white flex items-center justify-center text-2xl transition-all hover:scale-105"
            >
              ✓
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'connected' || state === 'calling' || state === 'connecting') {
    return (
      <div className="call-overlay animate-fade-in">
        <div className="call-video-container">
          {remoteStream ? (
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <div className="w-32 h-32 rounded-full glass-strong flex items-center justify-center text-6xl mb-4">
                {calleeName?.charAt(0).toUpperCase() || callerName?.charAt(0).toUpperCase() || '?'}
              </div>
              <p className="text-xl font-semibold">{calleeName || callerName || 'Connecting...'}</p>
              <p className="text-white/50 text-sm mt-2">
                {state === 'calling' ? 'Calling...' : state === 'connecting' ? 'Connecting...' : ''}
              </p>
            </div>
          )}

          {localStream && !isAudioOnly && (
            <video ref={localVideoRef} muted autoPlay playsInline className="local-video" />
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
            />
          )}
        </div>
      </div>
    )
  }

  return null
}
