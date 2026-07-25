import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useToast } from './Toast'
import { IMAGE_BUCKET } from '../lib/constants'

export default function VoiceRecorder({ onUpload, disabled }) {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [sending, setSending] = useState(false)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const toast = useToast()

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size < 100) return

        setSending(true)
        const path = `voice/${Date.now()}-${Math.random().toString(36).slice(2)}.webm`

        const { data, error } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(path, blob)

        if (error) {
          toast.error('Failed to upload voice message')
          setSending(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from(IMAGE_BUCKET)
          .getPublicUrl(data.path)

        onUpload?.(publicUrl, {
          name: `voice-${formatDuration(duration)}.webm`,
          type: 'audio',
          mimeType: 'audio/webm',
          size: blob.size,
        })
        setSending(false)
        setDuration(0)
      }

      mediaRecorder.start()
      setRecording(true)
      setDuration(0)
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
    } catch {
      toast.error('Microphone access denied')
    }
  }, [duration, onUpload, toast])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      clearInterval(timerRef.current)
    }
  }, [recording])

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      mediaRecorderRef.current.stop()
      setRecording(false)
      clearInterval(timerRef.current)
      setDuration(0)
    }
  }, [recording])

  if (sending) {
    return (
      <div className="flex items-center gap-2 glass !px-3 !py-1.5 !rounded-xl">
        <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', borderTopColor: 'transparent' }} />
        <span className="text-xs text-[var(--text-secondary)]">Sending...</span>
      </div>
    )
  }

  if (recording) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2"
      >
        <button
          onClick={cancelRecording}
          className="glass !p-2 !rounded-xl transition-all hover:bg-red-500/10"
          style={{ color: '#ef4444' }}
          title="Cancel"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="glass !px-3 !py-1.5 !rounded-full flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-2.5 h-2.5 rounded-full bg-red-500"
          />
          <span className="text-sm font-mono font-medium text-[var(--text-primary)]">{formatDuration(duration)}</span>
        </div>
        <button
          onClick={stopRecording}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
          style={{ background: 'var(--accent)' }}
          title="Send"
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </motion.div>
    )
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={startRecording}
      disabled={disabled}
      className="glass !p-2.5 !rounded-xl disabled:opacity-30 transition-all"
      style={{ color: 'var(--accent)' }}
      title="Record voice message"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </motion.button>
  )
}
