import { useState, useRef } from 'react'
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
            <Avatar username={profile?.username} size="lg" isOnline={true} src={avatarUrl} />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {uploading ? (
                <span className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', borderTopColor: 'transparent' }} />
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)]">Click avatar to change</p>
        </div>

        {/* Username */}
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="glass-input w-full"
            maxLength={30}
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">Status</label>
          <input
            type="text"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
            className="glass-input w-full"
            placeholder="What's on your mind?"
            maxLength={100}
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {STATUS_OPTIONS.slice(0, 4).map((s) => (
              <button
                key={s}
                onClick={() => setStatusMessage(s)}
                className="text-[10px] px-2 py-1 rounded-full glass transition-all hover:bg-white/30"
                style={{ color: 'var(--accent)' }}
              >
                {s}
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
