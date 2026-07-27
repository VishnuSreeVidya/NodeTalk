
import { formatFileSize, getFileType } from '../lib/utils'

const FILE_ICONS = {
  image: '🖼️',
  video: '🎬',
  audio: '🎵',
  document: '📄',
  archive: '📦',
  file: '📎',
}

export default function FileAttachment({ url, fileName, fileType, fileSize, isOwn }) {
  if (!url) return null
  const type = fileType || getFileType(fileName || url)
  const isImage = type === 'image'

  if (isImage) {
    return (
      <img
        src={url}
        alt={fileName || 'Shared image'}
        className="chat-image mb-1.5"
        loading="lazy"
        onClick={() => window.open(url, '_blank')}
      />
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName || true}
      className="flex items-center gap-3 p-3 rounded-xl transition-all hover:brightness-110 group/file"
      style={{
        background: isOwn ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)' }}>
        {FILE_ICONS[type] || FILE_ICONS.file}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-[var(--text-primary)]'}`}>
          {fileName || 'File'}
        </p>
        {fileSize != null && (
          <p className={`text-[10px] ${isOwn ? 'text-white/50' : 'text-gray-400'}`}>
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <svg className={`w-4 h-4 flex-shrink-0 opacity-50 group-hover/file:opacity-100 transition-opacity ${isOwn ? 'text-white' : 'text-[var(--text-secondary)]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </a>
  )
}
