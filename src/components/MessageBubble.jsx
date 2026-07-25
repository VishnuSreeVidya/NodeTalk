import { useState, memo } from 'react'
import { motion } from 'framer-motion'
import ReactionBar from './ReactionBar'
import { parseMarkdown, formatMessageTime } from '../lib/utils'

function MessageBubble({ msg, isOwn, reactions, allMessages, onReply, onEdit, onContextMenu, decryptedText }) {
  const [hovering, setHovering] = useState(false)
  const displayText = decryptedText || msg.message_text
  const hasImage = !!msg.image_url
  const hasText = !!displayText && displayText !== '📷 Image' && !msg.deleted_for_all
  const replyMsg = msg.reply_to ? allMessages.find((m) => m.id === msg.reply_to) : null
  const time = formatMessageTime(msg.created_at)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onContextMenu={(e) => onContextMenu?.(e, msg)}
    >
      <div className="max-w-[70%] min-w-[60px]">
        {/* Reply preview */}
        {replyMsg && !replyMsg.deleted_for_all && (
          <motion.div
            initial={{ opacity: 0, x: isOwn ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`reply-bubble ${isOwn ? 'ml-auto' : 'mr-auto'} mb-1`}
          >
            <div className="reply-bar" />
            <div className="min-w-0">
              <p className="reply-label">
                {replyMsg.sender_id === isOwn ? 'You' : 'Them'}
              </p>
              <p className="reply-text">{replyMsg.message_text || '📷 Image'}</p>
            </div>
          </motion.div>
        )}

        {/* Message bubble */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl ${
            isOwn ? 'rounded-br-md' : 'rounded-bl-md'
          } shadow-sm transition-shadow hover:shadow-md`}
          style={{
            background: isOwn ? 'var(--bubble-own)' : 'var(--bubble-other)',
            border: isOwn ? '1px solid rgba(109,97,255,0.3)' : '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {hasImage && (
            <img
              src={msg.image_url}
              alt="Shared image"
              className="chat-image mb-1.5"
              loading="lazy"
              onClick={() => window.open(msg.image_url, '_blank')}
            />
          )}
          {hasText && (
            <div
              className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
                isOwn ? 'text-white' : 'text-[var(--bubble-other-text)]'
              }`}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(displayText) }}
            />
          )}
          {msg.is_edited && hasText && (
            <span className={`text-[9px] italic ${isOwn ? 'text-white/40' : 'text-gray-400'}`}>(edited)</span>
          )}
          {msg.is_pinned && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] font-medium text-amber-500">📌 Pinned</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1">
              {msg.encrypted && (
                <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: isOwn ? 'white' : 'var(--text-secondary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              {msg.message_status && isOwn && (
                <span className="text-[9px] opacity-50" style={{ color: isOwn ? 'white' : 'var(--text-secondary)' }}>
                  {msg.message_status === 'read' ? '✓✓' : msg.message_status === 'delivered' ? '✓✓' : '✓'}
                </span>
              )}
            </div>
            <p className={`text-[10px] ${isOwn ? 'text-white/60' : 'text-gray-400'}`}>
              {time}
            </p>
          </div>

          {/* Action buttons on hover */}
          {hovering && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? '-left-10' : '-right-10'} flex items-center gap-1`}
            >
              <button
                onClick={() => onReply(msg)}
                className="msg-action-btn"
                title="Reply"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              {isOwn && (
                <button
                  onClick={() => onEdit(msg)}
                  className="msg-action-btn"
                  title="Edit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Reactions */}
        <ReactionBar
          messageId={msg.id}
          reactions={reactions}
          isOwn={isOwn}
        />
      </div>
    </motion.div>
  )
}

export default memo(MessageBubble)
