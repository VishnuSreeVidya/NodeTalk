import { forwardRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker from './EmojiPicker'
import FileUpload from './FileUpload'
import VoiceRecorder from './VoiceRecorder'
import ReplyPreview from './ReplyPreview'
import { formatFileSize } from '../lib/utils'

const MessageInput = forwardRef(function MessageInput(
  { text, setText, showEmoji, setShowEmoji, onEmojiSelect, onFileUpload, onImageUpload, onSubmit, selectedUser, onTyping, replyTo, editMessage, onCancelReply, onCancelEdit },
  inputRef
) {
  const [dragOver, setDragOver] = useState(false)
  const [pendingFiles, setPendingFiles] = useState([])

  const handleChange = useCallback((e) => {
    setText(e.target.value)
    if (selectedUser) onTyping?.()
  }, [setText, selectedUser, onTyping])

  const submitFiles = useCallback(async () => {
    for (const f of pendingFiles) {
      await onFileUpload?.(f.url, f.meta)
    }
    if (text.trim()) {
      onSubmit({ preventDefault: () => {} })
    }
    setPendingFiles([])
  }, [pendingFiles, text, onFileUpload, onSubmit])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (pendingFiles.length > 0) {
        submitFiles()
      } else {
        onSubmit(e)
      }
    }
    if (e.key === 'Escape') {
      if (editMessage) onCancelEdit?.()
      else if (replyTo) onCancelReply?.()
      else if (pendingFiles.length > 0) setPendingFiles([])
    }
  }, [pendingFiles, editMessage, replyTo, submitFiles, onSubmit, onCancelEdit, onCancelReply])

  const handleFileUploaded = useCallback((url, meta) => {
    setPendingFiles((prev) => [...prev, { url, meta }])
  }, [])

  const removePendingFile = useCallback((index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      const url = URL.createObjectURL(file)
      handleFileUploaded(url, { name: file.name, type: getFileType(file.name), mimeType: file.type, size: file.size })
    }
  }, [handleFileUploaded])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (pendingFiles.length > 0) submitFiles()
        else onSubmit(e)
      }}
      className="px-3 py-2.5 border-t"
      style={{
        background: 'var(--surface-secondary)',
        borderColor: 'var(--border-primary)',
      }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Reply / Edit preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <ReplyPreview replyMsg={replyTo} onCancel={onCancelReply} label="Replying to" />
          </motion.div>
        )}
        {editMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <ReplyPreview replyMsg={editMessage} onCancel={onCancelEdit} label="Editing" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending file previews */}
      <AnimatePresence>
        {pendingFiles.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-2 flex-wrap mb-2"
          >
            {pendingFiles.map((f, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px] text-sm max-w-[200px]"
                style={{
                  background: 'var(--surface-tertiary)',
                  border: '1px solid var(--border-primary)',
                }}
              >
                <span className="truncate flex-1" style={{ color: 'var(--text-primary)' }}>{f.meta.name}</span>
                {f.meta.size && <span className="text-2xs" style={{ color: 'var(--text-tertiary)' }}>{formatFileSize(f.meta.size)}</span>}
                <button type="button" onClick={() => removePendingFile(i)} className="transition-colors" style={{ color: 'var(--text-tertiary)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>&times;</button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag overlay */}
      <AnimatePresence>
        {dragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed"
            style={{
              borderColor: 'var(--accent)',
              background: 'var(--accent-soft)',
            }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Drop file here</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1.5">
        <div className="relative">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEmoji(!showEmoji)}
            className="surface-icon-btn"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </motion.button>
          <EmojiPicker
            open={showEmoji}
            onSelect={onEmojiSelect}
            onSelectMedia={(url) => {
              onImageUpload?.(url)
              setShowEmoji(false)
            }}
            onClose={() => setShowEmoji(false)}
          />
        </div>
        <FileUpload onUpload={handleFileUploaded} disabled={!selectedUser} />
        <VoiceRecorder
          onUpload={(url, meta) => {
            if (onFileUpload) onFileUpload(url, meta)
            else onImageUpload?.(url)
          }}
          disabled={!selectedUser}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder={editMessage ? 'Edit message...' : 'Type a message...'}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="surface-input flex-1"
          autoFocus
        />
        <motion.button
          type="submit"
          disabled={!text.trim() && pendingFiles.length === 0}
          whileTap={{ scale: 0.92 }}
          className="rounded-[8px] p-2 flex items-center justify-center disabled:opacity-30"
          style={{
            background: 'var(--accent)',
            color: 'white',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </motion.button>
      </div>
    </form>
  )
})

function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const videoTypes = ['mp4', 'webm', 'ogg', 'mov']
  const audioTypes = ['mp3', 'wav', 'ogg', 'aac', 'flac']
  const docTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf']
  const archiveTypes = ['zip', 'rar', '7z', 'tar', 'gz']
  if (imageTypes.includes(ext)) return 'image'
  if (videoTypes.includes(ext)) return 'video'
  if (audioTypes.includes(ext)) return 'audio'
  if (docTypes.includes(ext)) return 'document'
  if (archiveTypes.includes(ext)) return 'archive'
  return 'file'
}

export default MessageInput
