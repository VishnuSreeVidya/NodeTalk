export const APP_NAME = 'NodeTalk'

export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const IMAGE_BUCKET = 'chat-images'

export const TYPING_TIMEOUT = 2500
export const HEARTBEAT_INTERVAL = 30000
export const ONLINE_STALE_SECONDS = 60

export const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥', '👏', '🎉']

export const MESSAGE_PAGE_SIZE = 50

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  'video/mp4', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/ogg',
  'application/pdf',
  'application/zip', 'application/x-rar-compressed',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

export const STATUS_OPTIONS = [
  'Hey there! I am using NodeTalk.',
  'Available',
  'Busy',
  'Do not disturb',
  'Be right back',
  'In a meeting',
  'On a call',
]

export const KEYBOARD_SHORTCUTS = {
  SEARCH: { key: 'k', ctrl: true, label: 'Search conversations' },
  NEW_CHAT: { key: 'n', ctrl: true, label: 'New chat' },
  ESCAPE: { key: 'Escape', label: 'Close/Cancel' },
}

export const API_TIMEOUT = 10000
export const RETRY_ATTEMPTS = 3
export const RETRY_DELAY = 1000

export const FILE_CATEGORIES = {
  image: { label: 'Images', icon: '🖼️', accept: 'image/*' },
  video: { label: 'Videos', icon: '🎬', accept: 'video/*' },
  audio: { label: 'Audio', icon: '🎵', accept: 'audio/*' },
  document: { label: 'Documents', icon: '📄', accept: '.pdf,.doc,.docx,.txt' },
  archive: { label: 'Archives', icon: '📦', accept: '.zip,.rar,.7z' },
}

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  VOICE: 'voice',
  SYSTEM: 'system',
}

export const CALL_STATES = {
  IDLE: 'idle',
  CALLING: 'calling',
  RINGING: 'ringing',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
}
