import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const ICE_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export default function useWebRTC(selectedUser, onCallChange) {
  const { user, profile } = useAuth()
  const [state, setState] = useState('idle')
  const [callType, setCallType] = useState('video')
  const [remoteStream, setRemoteStream] = useState(null)
  const [localStream, setLocalStream] = useState(null)
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callerName, setCallerName] = useState('')
  const [calleeName, setCalleeName] = useState('')
  const [pendingOffer, setPendingOffer] = useState(null)

  const pcRef = useRef(null)
  const channelRef = useRef(null)
  const durationIntervalRef = useRef(null)

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
    setCallDuration(0)
    cleanupStreams()
    onCallChange?.(null)
  }, [user, cleanupStreams, onCallChange])

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

      const pc = new RTCPeerConnection(ICE_CONFIG)
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      pc.ontrack = (event) => setRemoteStream(event.streams[0])

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

      ch.on('broadcast', { event: 'call-end' }, () => endCall())

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

  const declineCall = useCallback(() => {
    if (pendingOffer) {
      const ch = supabase.channel(`calls-${pendingOffer.senderId}`, {
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
    setPendingOffer(null)
    cleanupStreams()
    onCallChange?.(null)
  }, [pendingOffer, user, cleanupStreams, onCallChange])

  const acceptCall = useCallback(async () => {
    if (!pendingOffer) return
    setState('connecting')
    setPendingOffer(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: pendingOffer.cType === 'video',
        audio: true,
      })
      setLocalStream(stream)

      const pc = new RTCPeerConnection(ICE_CONFIG)
      pcRef.current = pc

      stream.getTracks().forEach((track) => pc.addTrack(track, stream))

      pc.ontrack = (event) => setRemoteStream(event.streams[0])

      pc.onicecandidate = (event) => {
        if (event.candidate && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: { senderId: user.id, candidate: event.candidate },
          })
        }
      }

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOffer.offer))
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      const ch = supabase.channel(`calls-${pendingOffer.senderId}`, {
        config: { broadcast: { self: false } },
      })
      channelRef.current = ch

      ch.on('broadcast', { event: 'ice-candidate' }, async (payload) => {
        if (payload.payload.senderId === pendingOffer.senderId && pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(payload.payload.candidate))
        }
      })

      ch.on('broadcast', { event: 'call-end' }, () => endCall())

      await ch.subscribe()
      await ch.send({
        type: 'broadcast',
        event: 'call-answer',
        payload: { senderId: user.id, answer },
      })

      setState('connected')
      onCallChange?.({ type: 'connected', callerName: pendingOffer.senderName, callType: pendingOffer.cType })
    } catch {
      setState('idle')
      cleanupStreams()
      onCallChange?.(null)
    }
  }, [pendingOffer, user, cleanupStreams, endCall, onCallChange])

  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => { t.enabled = muted })
      setMuted(!muted)
    }
  }, [localStream, muted])

  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => { t.enabled = videoOff })
      setVideoOff(!videoOff)
    }
  }, [localStream, videoOff])

  // Listen for incoming calls
  useEffect(() => {
    if (!user) return

    const channel = supabase.channel(`calls-listener-${user.id}`, {
      config: { broadcast: { self: false } },
    })

    channel.on('broadcast', { event: 'call-offer' }, (payload) => {
      const { senderId, senderName, callType: cType, offer } = payload.payload
      if (senderId === user.id) return
      setPendingOffer({ senderId, offer, cType, senderName })
      setCallType(cType)
      setCallerName(senderName)
      setState('ringing')
    })

    channel.on('broadcast', { event: 'call-end' }, (payload) => {
      if (payload.payload.senderId !== user.id) endCall()
    })

    channel.on('broadcast', { event: 'call-decline' }, (payload) => {
      if (payload.payload.from === user.id) {
        setState('idle')
        cleanupStreams()
      }
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
      setPendingOffer(null)
    }
  }, [user, endCall, cleanupStreams])

  // Duration timer
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

  return {
    state,
    callType,
    remoteStream,
    localStream,
    muted,
    videoOff,
    callDuration,
    callerName,
    calleeName,
    startCall,
    endCall,
    declineCall,
    acceptCall,
    toggleMute,
    toggleVideo,
  }
}
