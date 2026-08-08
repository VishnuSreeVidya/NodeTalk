import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../supabaseClient'
import { useToast } from './Toast'
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, IMAGE_BUCKET } from '../lib/constants'
import { getFileType, formatFileSize, compressImage } from '../lib/utils'

export default function FileUpload({ onUpload, disabled, children }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const toast = useToast()

  const handleFile = async (e) => {
    const rawFile = e.target.files?.[0]
    if (!rawFile) return

    if (!ALLOWED_FILE_TYPES.includes(rawFile.type) && !rawFile.type.startsWith('image/')) {
      toast.error('File type not supported.')
      return
    }
    if (rawFile.size > MAX_FILE_SIZE) {
      toast.error(`File must be under ${formatFileSize(MAX_FILE_SIZE)}.`)
      return
    }

    setUploading(true)
    const file = await compressImage(rawFile)
    const ext = file.name.split('.').pop()
    const path = `files/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file)

    if (error) {
      toast.error('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(data.path)

    onUpload(publicUrl, {
      name: file.name,
      type: getFileType(file.name),
      mimeType: file.type,
      size: file.size,
    })

    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_FILE_TYPES.join(',')}
        onChange={handleFile}
        className="hidden"
      />
      {children ? (
        <div onClick={() => !disabled && !uploading && inputRef.current?.click()} className={disabled || uploading ? 'opacity-30 pointer-events-none' : 'cursor-pointer'}>
          {children}
        </div>
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="surface-icon-btn disabled:opacity-30"
          title="Attach file"
        >
          {uploading ? (
            <span className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin block" style={{ borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)', borderTopColor: 'transparent' }} />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          )}
        </motion.button>
      )}
    </>
  )
}
