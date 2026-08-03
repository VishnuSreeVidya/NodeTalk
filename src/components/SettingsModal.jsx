import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Modal from '../ui/Modal'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useToast } from '../components/Toast'
import ThemeSelector from './ThemeSelector'
import { backupPrivateKeyWithPassphrase, restorePrivateKeyWithPassphrase } from '../utils/crypto'
import { requestNotificationPermission } from '../utils/webPush'

function SettingToggle({ label, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className="relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0"
        style={{ background: enabled ? 'var(--accent)' : 'var(--surface-tertiary)' }}
      >
        <motion.div
          layout
          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
          style={{ left: enabled ? '17px' : '2px' }}
        />
      </button>
    </div>
  )
}

export default function SettingsModal({ open, onClose }) {
  const { user } = useAuth()
  const toast = useToast()
  const [settings, setSettings] = useState({
    notification_sound: true,
    notification_browser: true,
    show_online_status: true,
    read_receipts: true,
    enter_to_send: true,
  })
  const [loading, setLoading] = useState(true)
  const [passphrase, setPassphrase] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (!open || !user) return
    let cancelled = false
    async function load() {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', user.id)
        .single()
      if (!cancelled && data) {
        setSettings({
          notification_sound: data.notification_sound ?? true,
          notification_browser: data.notification_browser ?? true,
          show_online_status: data.show_online_status ?? true,
          read_receipts: data.read_receipts ?? true,
          enter_to_send: data.enter_to_send ?? true,
        })
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [open, user?.id])

  const toggle = async (key) => {
    const newValue = !settings[key]
    if (key === 'notification_browser' && newValue) {
      await requestNotificationPermission()
    }
    setSettings((prev) => ({ ...prev, [key]: newValue }))
    const { error } = await supabase
      .from('user_settings')
      .upsert({ id: user.id, [key]: newValue }, { onConflict: 'id' })
    if (error) {
      toast.error('Failed to save setting')
      setSettings((prev) => ({ ...prev, [key]: !newValue }))
    }
  }

  const handleBackupKeys = async () => {
    if (!passphrase || passphrase.length < 6) {
      toast.error('Passphrase must be at least 6 characters')
      return
    }
    setActionLoading(true)
    try {
      await backupPrivateKeyWithPassphrase(passphrase, user.id)
      toast.success('Encryption keys backed up securely!')
      setPassphrase('')
    } catch (err) {
      toast.error(err.message || 'Backup failed')
    }
    setActionLoading(false)
  }

  const handleRestoreKeys = async () => {
    if (!passphrase) {
      toast.error('Enter your backup passphrase')
      return
    }
    setActionLoading(true)
    try {
      await restorePrivateKeyWithPassphrase(passphrase, user.id)
      toast.success('Encryption keys restored successfully!')
      setPassphrase('')
    } catch (err) {
      toast.error(err.message || 'Restore failed')
    }
    setActionLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings" maxWidth="max-w-md">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-1">
          <div className="pb-2">
            <p className="text-2xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Appearance</p>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Theme</span>
              <ThemeSelector />
            </div>
          </div>

          <div className="border-t pt-3 pb-2" style={{ borderColor: 'var(--border-primary)' }}>
            <p className="text-2xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Notifications</p>
            <SettingToggle label="Notification sounds" description="Play sounds for new messages" enabled={settings.notification_sound} onToggle={() => toggle('notification_sound')} />
            <SettingToggle label="Browser notifications" description="Show desktop notifications" enabled={settings.notification_browser} onToggle={() => toggle('notification_browser')} />
          </div>

          <div className="border-t pt-3 pb-2" style={{ borderColor: 'var(--border-primary)' }}>
            <p className="text-2xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Privacy & Security</p>
            <SettingToggle label="Show online status" description="Let others see when you're online" enabled={settings.show_online_status} onToggle={() => toggle('show_online_status')} />
            <SettingToggle label="Read receipts" description="Show when you've read messages" enabled={settings.read_receipts} onToggle={() => toggle('read_receipts')} />

            {/* E2EE Key Backup */}
            <div className="mt-3 p-3 rounded-lg border text-xs space-y-2" style={{ background: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>🔐 E2EE Key Backup & Recovery</p>
              <p style={{ color: 'var(--text-tertiary)' }}>Set a passphrase to back up your encryption keys to your account, so you can restore identity keys on a new device.</p>
              <input
                type="password"
                placeholder="Passphrase (min 6 characters)"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="surface-input w-full text-xs"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleBackupKeys}
                  disabled={actionLoading}
                  className="surface-btn flex-1 py-1.5 text-xs rounded-md"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  Backup Keys
                </button>
                <button
                  onClick={handleRestoreKeys}
                  disabled={actionLoading}
                  className="surface-btn flex-1 py-1.5 text-xs rounded-md border"
                  style={{ borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }}
                >
                  Restore Keys
                </button>
              </div>
            </div>
          </div>

          <div className="border-t pt-3 pb-2" style={{ borderColor: 'var(--border-primary)' }}>
            <p className="text-2xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Chat</p>
            <SettingToggle label="Enter to send" description="Press Enter to send messages" enabled={settings.enter_to_send} onToggle={() => toggle('enter_to_send')} />
          </div>
        </div>
      )}
    </Modal>
  )
}
