import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const QUICK_REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🔥']

export default function ReactionBar({ messageId, reactions, isOwn }) {
  const { user } = useAuth()
  const [showPicker, setShowPicker] = useState(false)

  const grouped = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, count: 0, userReacted: false }
    acc[r.emoji].count++
    if (r.user_id === user.id) acc[r.emoji].userReacted = true
    return acc
  }, {})

  const toggleReaction = async (emoji) => {
    setShowPicker(false)

    const existing = reactions.find(
      (r) => r.message_id === messageId && r.user_id === user.id && r.emoji === emoji
    )

    if (existing) {
      await supabase
        .from('reactions')
        .delete()
        .eq('id', existing.id)
    } else {
      await supabase
        .from('reactions')
        .insert({ message_id: messageId, user_id: user.id, emoji })
    }
  }

  const reactionEntries = Object.values(grouped)

  return (
    <div className="reaction-container">
      {reactionEntries.map(({ emoji, count, userReacted }) => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          className={`reaction-pill ${userReacted ? 'reacted' : ''}`}
        >
          <span>{emoji}</span>
          {count > 1 && <span className="reaction-count">{count}</span>}
        </button>
      ))}

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="reaction-pill reaction-add"
        >
          +
        </button>

        {showPicker && (
          <div
            className={`reaction-picker ${isOwn ? 'right-0' : 'left-0'}`}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => toggleReaction(emoji)}
                className="reaction-picker-btn"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
