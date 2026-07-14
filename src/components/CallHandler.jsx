import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export default function CallHandler({ selectedUser, onCallChange, callRequest }) {
  const { user, profile } = useAuth()
  const [state, setState] = useState('idle')
  const [callType, setCallType] = useState('video')
  const [incomingFrom, setIncomingFrom] = useState(null)
  const [remoteStream, setRemoteStream] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [calleeName, setCalleeName] = useState('')
  const [callerName, setCallerName] = useState('')

  const pcRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const channelRef = useRef(null)
  const durationIntervalRef = useRef(null)
  const incomingChannelRef = useRef(null)

  const cleanupStreams = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop())
      setLocalStream(null)
    }
    setRemoteStream(null)
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
  }, [localStream])

  const endCall = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'call-end',
        payload: { senderId: user.id },
      })
    }
    setState('idle')
    setIncomingFrom(null)
    setCallDuration(0)
    cleanupStreams()
    onCallChange?.(null)
  }, [user, cleanupStreams, channelRef, onCallChange])

  // Trigger outgoing call when callRequest changes
  const startCall = useCallback(async (type) => {
    if (!selectedUser) return
    setCallType(type)
    setCalleeName(selectedUser.username)
    setState('calling')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      })
      setLocalStream(stream)

      const pc = new RTCPeerConnection(CONFIG)
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0])
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { senderId: user.id, candidate: event.candidate },
          })
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const ch = supabase.channel(`calls-${selectedUser.id}`, {
        config: { broadcast: { self: false } },
      })
      channelRef.current = ch

      ch.on('broadcast', { event: 'call-answer' }, async (payload) => {
        if (payload.payload.senderId === selectedUser.id) {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.payload.answer))
          setState('connected')
          onCallChange?.({ type: 'connected', calleeName: selectedUser.username, callType: type })
        }
      })

      ch.on('broadcast', { event: 'ice-candidate' }, async (payload) => {
        if (payload.payload.senderId === selectedUser.id && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.payload.candidate))
        }
      })

      ch.on('broadcast', { event: 'call-end' }, () => {
        endCall()
      })

      await ch.subscribe()
      await ch.send({
        type: 'broadcast',
        event: 'call-offer',
        payload: {
          senderId: user.id,
          senderName: profile?.username,
          callType: type,
          offer: pc.localDescription,
        },
      })
    } catch {
      setState('idle')
      cleanupStreams()
      onCallChange?.(null)
    }
  }, [selectedUser, user, profile, cleanupStreams, endCall, onCallChange])

  useEffect(() => {
    if (callRequest?.type === 'calling' && selectedUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startCall(callRequest.callType)
    }
  }, [callRequest, selectedUser, startCall])

  // Listen for incoming calls
  useEffect(() => {
    if (!user) return

    const channel = supabase.channel(`calls-listener-${user.id}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'call-offer' }, async (payload) => {
      const { senderId, senderName, callType: cType, offer } = payload.payload
      if (senderId === user.id) return

      setIncomingFrom({ id: senderId, name: senderName })
      setCallType(cType)
      setCallerName(senderName)
      setState('ringing')

      // Store offer data for when user accepts
      window.__pendingOffer = { senderId, offer, cType }
    })

    channel.on('broadcast', { event: 'call-end' }, (payload) => {
      if (payload.payload.senderId !== user.id) {
        endCall()
      }
    })

    channel.on('broadcast', { event: 'call-decline' }, (payload) => {
      if (payload.payload.from === user.id) {
        setState('idle')
        cleanupStreams()
      }
    })

    channel.subscribe()
    incomingChannelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      window.__pendingOffer = null
    }
  }, [user, endCall, cleanupStreams])

  // Start timer when connected
  useEffect(() => {
    if (state === 'connected') {
      const start = Date.now()
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - start) / 1000))
      }, 1000)
    }
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
        durationIntervalRef.current = null
      }
    }
  }, [state])

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream
    }
  }, [localStream, remoteStream])

  const declineCall = useCallback(() => {
    if (incomingFrom) {
      const ch = supabase.channel(`calls-${incomingFrom.id}`, {
        config: { broadcast: { self: false } },
      })
      ch.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          ch.send({
            type: 'broadcast',
            event: 'call-decline',
            payload: { from: user.id },
          })
        }
      })
      setTimeout(() => supabase.removeChannel(ch), 2000)
    }
    setState('idle')
    setIncomingFrom(null)
    cleanupStreams()
    onCallChange?.(null)
  }, [incomingFrom, user, cleanupStreams, onCallChange])

  // Accept an incoming call
  const acceptCall = useCallback(async () => {
    const pending = window.__pendingOffer
    if (!pending) return
    setState('connecting')
    setIncomingFrom(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: pending.cType === 'video',
        audio: true,
      })
      setLocalStream(stream)

      const pc = new RTCPeerConnection(CONFIG)
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0])
      }

      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { senderId: user.id, candidate: event.candidate },
          })
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(pending.offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      const ch = supabase.channel(`calls-${pending.senderId}`, {
        config: { broadcast: { self: false } },
      })
      channelRef.current = ch

      ch.on('broadcast', { event: 'ice-candidate' }, async (payload) => {
        if (payload.payload.senderId === pending.senderId && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.payload.candidate))
        }
      })

      ch.on('broadcast', { event: 'call-end' }, () => {
        endCall()
      })

      await ch.subscribe()
      await ch.send({
        type: 'broadcast',
        event: 'call-answer',
        payload: { senderId: user.id, answer },
      })

      setState('connected')
      onCallChange?.({ type: 'connected', callerName: pending.senderName, callType: pending.cType })
      window.__pendingOffer = null
    } catch {
      setState('idle')
      cleanupStreams()
      onCallChange?.(null)
    }
  }, [user, cleanupStreams, endCall, onCallChange])

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => { t.enabled = muted; setMuted(!muted) })
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => { t.enabled = videoOff; setVideoOff(!videoOff) })
    }
  }

  const formatDuration = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const isAudioOnly = callType === 'audio'

  // Render incoming call notification
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

  // Render active call UI
  if (state === 'connected' || state === 'calling' || state === 'connecting') {
    return (
      <div className="call-overlay animate-fade-in">
        <div className="call-video-container">
          {/* Remote video */}
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

          {/* Local video (PIP) */}
          {localStream && !isAudioOnly && (
            <video ref={localVideoRef} muted autoPlay playsInline className="local-video" />
          )}

          {/* Controls overlay */}
          {state === 'connected' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
              <div className="glass-strong rounded-full px-6 py-3 flex items-center gap-6">
                <span className="text-white font-mono text-sm">{formatDuration(callDuration)}</span>
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                    muted ? 'bg-red-500/70 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {muted ? '🔇' : '🎤'}
                </button>
                {!isAudioOnly && (
                  <button
                    onClick={toggleVideo}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                      videoOff ? 'bg-red-500/70 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    {videoOff ? '🚫' : '📹'}
                  </button>
                )}
                <button
                  onClick={endCall}
                  className="w-12 h-12 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center text-xl transition-all hover:scale-105"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
