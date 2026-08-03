import { motion, AnimatePresence } from 'framer-motion'

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm p-6 rounded-2xl shadow-2xl space-y-4"
          style={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border-secondary)',
            color: 'var(--text-primary)',
          }}
        >
          <div className="flex items-center gap-3 text-red-500">
            <div className="p-2.5 rounded-full bg-red-500/10">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Delete message?</h3>
          </div>

          <p className="text-sm opacity-80 leading-relaxed">
            Delete this message for everyone in this conversation? This action cannot be undone.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors"
            >
              Delete for everyone
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
