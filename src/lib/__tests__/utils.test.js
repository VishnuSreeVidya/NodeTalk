import { describe, it, expect } from 'vitest'
import {
  formatMessageTime,
  formatDateSeparator,
  shouldShowDateSeparator,
  truncate,
  getInitials,
  cn,
  formatFileSize,
  getFileType,
  escapeHtml,
  parseMarkdown,
} from '../utils'

describe('formatMessageTime', () => {
  it('formats a date to hh:mm a', () => {
    const result = formatMessageTime('2024-01-15T14:30:00')
    expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
  })
})

describe('formatDateSeparator', () => {
  it('returns "Today" for current date', () => {
    expect(formatDateSeparator(new Date().toISOString())).toBe('Today')
  })
})

describe('shouldShowDateSeparator', () => {
  it('returns true when previous is null', () => {
    expect(shouldShowDateSeparator('2024-01-15', null)).toBe(true)
  })

  it('returns false for same date', () => {
    const date = '2024-01-15T10:00:00'
    expect(shouldShowDateSeparator(date, date)).toBe(false)
  })

  it('returns true for different dates', () => {
    expect(shouldShowDateSeparator('2024-01-15T10:00:00', '2024-01-14T10:00:00')).toBe(true)
  })
})

describe('truncate', () => {
  it('returns original string if shorter than limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates long strings', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('handles null/undefined', () => {
    expect(truncate(null)).toBe(null)
    expect(truncate(undefined)).toBe(undefined)
  })
})

describe('getInitials', () => {
  it('returns first letters of words', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns single letter for single word', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('returns ? for empty input', () => {
    expect(getInitials('')).toBe('?')
    expect(getInitials(null)).toBe('?')
  })

  it('limits to 2 characters', () => {
    expect(getInitials('John Doe Smith')).toBe('JD')
  })
})

describe('cn', () => {
  it('joins truthy classes', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b')
  })
})

describe('formatFileSize', () => {
  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB')
  })
})

describe('getFileType', () => {
  it('detects images', () => {
    expect(getFileType('photo.jpg')).toBe('image')
    expect(getFileType('image.png')).toBe('image')
  })

  it('detects videos', () => {
    expect(getFileType('video.mp4')).toBe('video')
  })

  it('detects audio', () => {
    expect(getFileType('song.mp3')).toBe('audio')
  })

  it('detects documents', () => {
    expect(getFileType('report.pdf')).toBe('document')
  })

  it('returns file for unknown types', () => {
    expect(getFileType('unknown.xyz')).toBe('file')
  })
})

describe('escapeHtml', () => {
  it('escapes HTML entities', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).not.toContain('<script>')
  })

  it('does not escape quotes via textContent', () => {
    const result = escapeHtml('"hello"')
    expect(result).toBe('"hello"')
  })
})

describe('parseMarkdown', () => {
  it('converts bold text', () => {
    expect(parseMarkdown('**bold**')).toContain('<strong>bold</strong>')
  })

  it('converts italic text', () => {
    expect(parseMarkdown('*italic*')).toContain('<em>italic</em>')
  })

  it('converts inline code', () => {
    expect(parseMarkdown('`code`')).toContain('<code')
  })

  it('converts code blocks with fenced syntax', () => {
    const input = '```js\nconst x = 1\n```'
    const result = parseMarkdown(input)
    expect(result).toContain('<code')
  })

  it('handles null input', () => {
    expect(parseMarkdown(null)).toBe('')
  })
})
