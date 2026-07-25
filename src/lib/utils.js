import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns'

export function formatMessageTime(date) {
  return format(new Date(date), 'hh:mm a')
}

export function formatLastSeen(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isToday(d)) return `Last seen today at ${format(d, 'hh:mm a')}`
  if (isYesterday(d)) return `Last seen yesterday at ${format(d, 'hh:mm a')}`
  if (isThisWeek(d)) return `Last seen ${format(d, 'EEEE')} at ${format(d, 'hh:mm a')}`
  if (isThisYear(d)) return `Last seen ${format(d, 'MMM d')} at ${format(d, 'hh:mm a')}`
  return `Last seen ${format(d, 'MMM d, yyyy')}`
}

export function formatDateSeparator(date) {
  const d = new Date(date)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  if (isThisWeek(d)) return format(d, 'EEEE')
  if (isThisYear(d)) return format(d, 'MMMM d')
  return format(d, 'MMMM d, yyyy')
}

export function shouldShowDateSeparator(current, previous) {
  if (!previous) return true
  const curr = new Date(current)
  const prev = new Date(previous)
  return curr.toDateString() !== prev.toDateString()
}

export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

export function getInitials(name) {
  return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  return Promise.resolve()
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function getFileType(filename) {
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

export function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function parseMarkdown(text) {
  if (!text) return ''
  let html = escapeHtml(text)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="code-block"><code>$1</code></pre>')
  html = html.replace(/\n/g, '<br/>')
  return html
}
