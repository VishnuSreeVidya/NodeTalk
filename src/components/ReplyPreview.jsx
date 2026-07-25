export default function ReplyPreview({ replyMsg, onCancel }) {
  if (!replyMsg) return null

  const preview = replyMsg.message_text || '📷 Image'

  return (
    <div className="reply-preview">
      <div className="reply-preview-bar" />
      <div className="flex-1 min-w-0">
        <p className="reply-preview-name">Replying to message</p>
        <p className="reply-preview-text">{preview}</p>
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="reply-preview-close"
          title="Cancel reply"
        >
          &times;
        </button>
      )}
    </div>
  )
}
