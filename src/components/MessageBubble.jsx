import { format } from 'date-fns'

export default function MessageBubble({ msg, isOwn }) {
  const time = format(new Date(msg.created_at), 'hh:mm a')
  const hasImage = !!msg.image_url
  const hasText = !!msg.message_text && msg.message_text !== '📷 Image'

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
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
            {msg.message_text}
          </p>
        )}
        <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60 text-right' : 'text-gray-400'}`}>
          {time}
        </p>
      </div>
    </div>
  )
}
