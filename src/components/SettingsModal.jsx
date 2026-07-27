import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Modal from '../ui/Modal'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useToast } from '../components/Toast'
import ThemeSelector from './ThemeSelector'

function SettingToggle({ label, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${enabled ? '' : 'bg-gray-300'}`}
        style={enabled ? { background: 'var(--accent)' } : undefined}
      >
        <motion.div
          layout
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
          style={{ left: enabled ? '22px' : '2px' }}
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
  }, [open, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (key) => {
    const newValue = !settings[key]
    setSettings((prev) => ({ ...prev, [key]: newValue }))
    const { error } = await supabase
      .from('user_settings')
      .upsert({ id: user.id, [key]: newValue }, { onConflict: 'id' })
    if (error) {
      toast.error('Failed to save setting')
      setSettings((prev) => ({ ...prev, [key]: !newValue }))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings" maxWidth="max-w-md">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-1 divide-y divide-white/10">
          <div className="pt-1 pb-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Appearance</p>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">Theme</span>
              <ThemeSelector />
            </div>
          </div>

          <div className="pt-3 pb-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Notifications</p>
            <SettingToggle label="Notification sounds" description="Play sounds for new messages" enabled={settings.notification_sound} onToggle={() => toggle('notification_sound')} />
            <SettingToggle label="Browser notifications" description="Show desktop notifications" enabled={settings.notification_browser} onToggle={() => toggle('notification_browser')} />
          </div>

          <div className="pt-3 pb-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Privacy</p>
            <SettingToggle label="Show online status" description="Let others see when you're online" enabled={settings.show_online_status} onToggle={() => toggle('show_online_status')} />
            <SettingToggle label="Read receipts" description="Show when you've read messages" enabled={settings.read_receipts} onToggle={() => toggle('read_receipts')} />
          </div>

          <div className="pt-3 pb-2">
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Chat</p>
            <SettingToggle label="Enter to send" description="Press Enter to send messages" enabled={settings.enter_to_send} onToggle={() => toggle('enter_to_send')} />
          </div>
        </div>
      )}
    </Modal>
  )
}
