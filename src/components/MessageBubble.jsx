import { useState } from 'react'
import { format } from 'date-fns'
import ReactionBar from './ReactionBar'

export default function MessageBubble({ msg, isOwn, reactions, allMessages, onReply, decryptedText }) {
  const time = format(new Date(msg.created_at), 'hh:mm a')
  const hasImage = !!msg.image_url
  const displayText = decryptedText || msg.message_text
  const hasText = !!displayText && displayText !== '📷 Image'
  const replyMsg = msg.reply_to ? allMessages.find((m) => m.id === msg.reply_to) : null
  const [hovering, setHovering] = useState(false)

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="max-w-[75%] group">
        {/* Reply preview */}
        {replyMsg && (
          <div className={`reply-bubble ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
            <div className="reply-bar" />
            <div className="min-w-0">
              <p className="reply-label">
                {replyMsg.sender_id === isOwn ? 'You' : 'Them'}
              </p>
              <p className="reply-text">{replyMsg.message_text || '📷 Image'}</p>
            </div>
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl ${
            isOwn ? 'rounded-br-md' : 'rounded-bl-md'
          } shadow-sm`}
          style={{
            background: isOwn ? 'var(--bubble-own)' : 'var(--bubble-other)',
            border: isOwn ? '1px solid rgba(109,97,255,0.3)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {hasImage && (
            <img
              src={msg.image_url}
              alt="Shared image"
              className="chat-image mb-1"
              loading="lazy"
              onClick={() => window.open(msg.image_url, '_blank')}
            />
          )}
          {hasText && (
            <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isOwn ? 'text-white' : 'text-[var(--bubble-other-text)]'}`}>
              {displayText}
            </p>
          )}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1">
              {msg.encrypted && (
                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: isOwn ? 'white' : 'var(--text-secondary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            <p className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
              {time}
            </p>
          </div>

          {/* Action buttons on hover */}
          {hovering && (
            <div className={`absolute top-0 ${isOwn ? '-left-8' : '-right-8'} flex items-center gap-0.5`}>
              <button
                onClick={() => onReply(msg)}
                className="msg-action-btn"
                title="Reply"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Reactions */}
        <ReactionBar
          messageId={msg.id}
          reactions={reactions}
          isOwn={isOwn}
        />
      </div>
    </div>
  )
}
