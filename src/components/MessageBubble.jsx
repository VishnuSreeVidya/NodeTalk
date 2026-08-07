import { useState, memo } from 'react'
import { motion } from 'framer-motion'
import ReactionBar from './ReactionBar'
import FileAttachment from '../ui/FileAttachment'
import { parseMarkdown, formatMessageTime } from '../lib/utils'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function MessageBubble({ msg, isOwn, reactions, allMessages, onReply, onEdit, onContextMenu, decryptedText }) {
  const { user } = useAuth()
  const [hovering, setHovering] = useState(false)
  const displayText = decryptedText || msg.message_text
  const hasImage = !!msg.image_url
  const hasFile = !!msg.file_url
  const hasText = !!displayText && displayText !== '📷 Image' && !msg.deleted_for_all
  const replyMsg = msg.reply_to ? allMessages.find((m) => m.id === msg.reply_to) : null
  const time = formatMessageTime(msg.created_at)

  const handleQuickReact = async (emoji) => {
    if (!user || !msg.id) return
    const existing = reactions?.find(
      (r) => r.message_id === msg.id && r.user_id === user.id && r.emoji === emoji
    )
    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id)
    } else {
      await supabase.from('reactions').insert({ message_id: msg.id, user_id: user.id, emoji })
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onContextMenu={(e) => onContextMenu?.(e, msg)}
    >
      <div className="max-w-[70%] min-w-[60px]">
        {/* Reply preview */}
        {replyMsg && (
          <motion.div
            initial={{ opacity: 0, x: isOwn ? 8 : -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`reply-bubble ${isOwn ? 'ml-auto' : 'mr-auto'} mb-1`}
          >
            <div className="reply-bar" />
            <div className="min-w-0">
              <p className="reply-label">
                {replyMsg.sender_id === msg.sender_id ? 'You' : 'Reply'}
              </p>
              <p className="reply-text italic">
                {replyMsg.deleted_for_all ? '🚫 This message was deleted' : (replyMsg.message_text || '📷 Image')}
              </p>
            </div>
          </motion.div>
        )}

        {/* Message bubble */}
        <div
          className={`relative px-3.5 py-2.5 ${
            isOwn ? 'rounded-t-lg rounded-bl-lg rounded-br-[4px]' : 'rounded-t-lg rounded-br-lg rounded-bl-[4px]'
          }`}
          style={{
            background: isOwn ? 'var(--bubble-own)' : 'var(--bubble-other)',
            border: isOwn ? 'none' : '1px solid var(--border-primary)',
            boxShadow: 'var(--shadow-bubble)',
          }}
        >
          {/* Quick Emoji Reaction bar on hover */}
          {hovering && !msg.deleted_for_all && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.12 }}
              className={`absolute -top-7 ${isOwn ? 'right-0' : 'left-0'} z-20 flex items-center gap-1 px-2 py-0.5 rounded-full shadow-lg border text-xs`}
              style={{
                background: 'var(--surface-elevated)',
                borderColor: 'var(--border-secondary)',
                boxShadow: 'var(--shadow-popover)',
              }}
            >
              {['❤️', '😂', '👍', '🔥', '😮', '😢'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleQuickReact(emoji)}
                  className="hover:scale-125 transition-transform p-0.5"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
          {msg.deleted_for_all ? (
            <div className="flex items-center gap-1.5 py-0.5 text-xs italic opacity-60">
              <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              <span>This message was deleted</span>
            </div>
          ) : (
            <>
              {hasImage && (
                <img
                  src={msg.image_url}
                  alt="Shared image"
                  className="chat-image mb-1.5"
                  loading="lazy"
                  onClick={() => window.open(msg.image_url, '_blank')}
                />
              )}
              {hasFile && (
                <div className="mb-1.5">
                  <FileAttachment
                    url={msg.file_url}
                    fileName={msg.file_name}
                    fileType={msg.file_type}
                    fileSize={msg.file_size}
                    isOwn={isOwn}
                  />
                </div>
              )}
              {hasText && (
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                  style={{ color: isOwn ? 'var(--bubble-own-text)' : 'var(--bubble-other-text)' }}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(displayText) }}
                />
              )}
              {msg.is_edited && hasText && (
                <span className="text-[9px] italic opacity-40">(edited)</span>
              )}
            </>
          )}

          {msg.is_pinned && !msg.deleted_for_all && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] font-medium" style={{ color: isOwn ? 'rgba(255,255,255,0.6)' : 'var(--warning)' }}>
                📌 Pinned
              </span>
            </div>
          )}
          <div className="flex items-center justify-between gap-2 mt-1">
            <div className="flex items-center gap-1">
              {msg.encrypted && !msg.deleted_for_all && (
                <svg className="w-3 h-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: isOwn ? 'var(--bubble-own-text)' : 'var(--text-tertiary)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
              {isOwn && (
                <span className="inline-flex items-center">
                  {(!msg.message_status || msg.message_status === 'sent') && (
                    <svg className="w-3.5 h-3" viewBox="0 0 16 12" fill="none">
                      <path d="M1 6l3.5 3.5L11 3" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {msg.message_status === 'delivered' && (
                    <svg className="w-4 h-3" viewBox="0 0 20 12" fill="none">
                      <path d="M1 6l3.5 3.5L11 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 6l3.5 3.5L15 3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {msg.message_status === 'read' && (
                    <svg className="w-4 h-3" viewBox="0 0 20 12" fill="none">
                      <path d="M1 6l3.5 3.5L11 3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 6l3.5 3.5L15 3" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
              )}
            </div>
            <p className="text-[10px] opacity-50">
              {time}
            </p>
          </div>

          {/* Action buttons on hover */}
          {hovering && !msg.deleted_for_all && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.12 }}
              className={`absolute top-1/2 -translate-y-1/2 ${isOwn ? '-left-14' : '-right-14'} flex items-center gap-0.5`}
            >
              <button
                onClick={() => onReply(msg)}
                className="msg-action-btn"
                title="Reply"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              {isOwn && (
                <button
                  onClick={() => onEdit(msg)}
                  className="msg-action-btn"
                  title="Edit"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button
                onClick={(e) => onContextMenu?.(e, msg)}
                className="msg-action-btn"
                title="More options"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
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
