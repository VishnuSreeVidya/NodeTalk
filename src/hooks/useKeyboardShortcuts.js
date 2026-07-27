import { useEffect, useCallback } from 'react'

/**
 * Global keyboard shortcuts for NodeTalk.
 *
 * Shortcuts:
 * - Ctrl+K: Focus search
 * - Ctrl+N: New chat (opens sidebar)
 * - Escape: Close modals/dialogs
 * - Ctrl+/ : Show keyboard shortcuts help
 *
 * @param {Object} handlers
 * @param {Function} handlers.onSearch - Called on Ctrl+K
 * @param {Function} handlers.onNewChat - Called on Ctrl+N
 * @param {Function} handlers.onEscape - Called on Escape
 * @param {boolean} enabled - Whether shortcuts are active
 */
export function useKeyboardShortcuts({ onSearch, onNewChat, onEscape, enabled = true } = {}) {
  const handleKeyDown = useCallback((e) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in inputs
    const tag = e.target.tagName
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.contentEditable === 'true'

    // Ctrl/Cmd + K = Search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      onSearch?.()
      return
    }

    // Ctrl/Cmd + N = New chat
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      onNewChat?.()
      return
    }

    // Escape = Close
    if (e.key === 'Escape' && !isInput) {
      onEscape?.()
      return
    }
  }, [enabled, onSearch, onNewChat, onEscape])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Available keyboard shortcuts metadata for displaying in help menus.
 */
export const SHORTCUT_LIST = [
  { keys: ['Ctrl', 'K'], label: 'Search conversations', category: 'Navigation' },
  { keys: ['Ctrl', 'N'], label: 'New chat', category: 'Navigation' },
  { keys: ['Esc'], label: 'Close dialog / Cancel', category: 'General' },
]
