import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Modal from '../ui/Modal'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { useToast } from '../components/Toast'
import { IMAGE_BUCKET } from '../lib/constants'
import { STATUS_OPTIONS } from '../lib/constants'

export default function ProfileModal({ open, onClose }) {
  const { profile, updateProfile } = useAuth()
  const toast = useToast()
  const [username, setUsername] = useState(profile?.username || '')
  const [statusMessage, setStatusMessage] = useState(profile?.status_message || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef(null)

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `avatars/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(path, file)

    if (error) {
      toast.error('Upload failed: ' + error.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(data.path)

    setAvatarUrl(publicUrl)
    setUploading(false)
  }

  const handleSave = async () => {
    if (!username.trim()) {
      toast.error('Username is required.')
      return
    }
    setSaving(true)
    const { error } = await updateProfile({
      username: username.trim(),
      status_message: statusMessage.trim() || null,
      avatar_url: avatarUrl || null,
    })
    setSaving(false)
    if (error) {
      toast.error('Failed to update profile: ' + error.message)
    } else {
      toast.success('Profile updated!')
      onClose()
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" maxWidth="max-w-md">
      <div className="space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <Avatar username={profile?.username} size="xl" isOnline={true} src={avatarUrl} />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              {uploading ? (
                <span className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'white', borderTopColor: 'transparent' }} />
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </motion.button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Click avatar to change</p>
        </div>

        {/* Username */}
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="surface-input"
            maxLength={30}
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>Status</label>
          <input
            type="text"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            className="surface-input"
            placeholder="What's on your mind?"
            maxLength={100}
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {STATUS_OPTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusMessage(s)}
                className="text-xs px-2.5 py-1 rounded-full border transition-colors hover:brightness-110"
                style={{
                  borderColor: statusMessage === s ? 'var(--accent)' : 'var(--border-primary)',
                  background: statusMessage === s ? 'var(--accent-soft)' : 'var(--surface-tertiary)',
                  color: statusMessage === s ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Wallpaper Selector */}
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>Chat Wallpaper</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'default', name: 'Default Dark', bg: 'var(--surface-tertiary)' },
              { id: 'doodle', name: 'Doodle', bg: 'radial-gradient(rgba(255,255,255,0.2) 1.5px, transparent 0)', bgSize: '16px 16px' },
              { id: 'midnight', name: 'Midnight', bg: 'radial-gradient(circle at center, #1e1e38 0%, #0a0a14 100%)' },
              { id: 'sunset', name: 'Sunset', bg: 'linear-gradient(135deg, #2d142c 0%, #100720 100%)' },
              { id: 'emerald', name: 'Emerald', bg: 'linear-gradient(135deg, #062c19 0%, #02120a 100%)' },
              { id: 'cyberpunk', name: 'Cyberpunk', bg: 'linear-gradient(135deg, #18002e 0%, #00122e 100%)' },
            ].map((wp) => (
              <button
                key={wp.id}
                type="button"
                onClick={() => {
                  let styleObj = { background: wp.bg }
                  if (wp.bgSize) styleObj.backgroundSize = wp.bgSize
                  if (wp.id === 'doodle') {
                    styleObj.backgroundImage = wp.bg
                    styleObj.backgroundSize = wp.bgSize
                  }
                  if (wp.id === 'default') styleObj = { background: 'var(--surface-primary)' }
                  localStorage.setItem('nodetalk_chat_wallpaper', JSON.stringify({ id: wp.id, name: wp.name, style: styleObj }))
                  window.dispatchEvent(new Event('wallpaper-changed'))
                  toast.success(`Wallpaper set to ${wp.name}`)
                }}
                className="h-12 rounded-xl border flex items-center justify-center p-1 text-[11px] font-semibold transition-all hover:scale-105"
                style={{
                  background: wp.bg,
                  borderColor: 'var(--border-secondary)',
                  color: 'white',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                {wp.name}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={!username.trim()} loading={saving} className="w-full">
          Save Profile
        </Button>
      </div>
    </Modal>
  )
}
