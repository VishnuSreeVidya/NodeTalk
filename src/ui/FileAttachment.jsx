import { formatFileSize, getFileType } from '../lib/utils'

const FILE_ICONS = {
  image: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  video: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  audio: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  archive: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  file: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
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
      className="flex items-center gap-3 p-2.5 rounded-lg transition-all hover:brightness-110 group/file"
      style={{
        background: isOwn ? 'rgba(255,255,255,0.08)' : 'var(--surface-tertiary)',
        border: '1px solid var(--border-primary)',
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
      >
        {FILE_ICONS[type] || FILE_ICONS.file}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: isOwn ? 'var(--bubble-own-text)' : 'var(--text-primary)' }}
        >
          {fileName || 'File'}
        </p>
        {fileSize != null && (
          <p className="text-[11px] opacity-50">
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <svg
        className="w-4 h-4 flex-shrink-0 opacity-40 group-hover/file:opacity-70 transition-opacity"
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
        style={{ color: isOwn ? 'var(--bubble-own-text)' : 'var(--text-secondary)' }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </a>
  )
}
