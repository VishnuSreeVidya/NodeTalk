import { useState } from 'react'
import { motion } from 'framer-motion'
import Modal from '../../ui/Modal'
import Avatar from '../../ui/Avatar'
import Button from '../../ui/Button'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../components/Toast'

export default function CreateGroupModal({ open, onClose, onCreated, users }) {
  const { user } = useAuth()
  const toast = useToast()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setName('')
    setDescription('')
    setSelectedMembers([])
    setSearch('')
    onClose()
  }

  const filteredUsers = users?.filter((u) =>
    u.id !== user.id &&
    u.username?.toLowerCase().includes(search.toLowerCase()) &&
    !selectedMembers.find((m) => m.id === u.id)
  ) || []

  const toggleMember = (u) => {
    setSelectedMembers((prev) =>
      prev.find((m) => m.id === u.id)
        ? prev.filter((m) => m.id !== u.id)
        : [...prev, u]
    )
  }

  const handleCreate = async () => {
    if (!name.trim() || selectedMembers.length === 0) return
    setLoading(true)

    try {
      // 1. Insert group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (groupError) throw groupError

      // 2. Insert admin row first (creator)
      const { error: adminError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: user.id, role: 'admin' })

      if (adminError) throw adminError

      // 3. Insert other group members
      if (selectedMembers.length > 0) {
        const otherMembers = selectedMembers.map((m) => ({
          group_id: group.id,
          user_id: m.id,
          role: 'member',
        }))
        const { error: memberError } = await supabase
          .from('group_members')
          .insert(otherMembers)

        if (memberError) throw memberError
      }

      toast.success(`Group "${group.name}" created!`)
      onCreated?.(group)
      handleClose()
    } catch (err) {
      console.error('Failed to create group:', err.message)
      toast.error(err.message || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Create Group" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Group name */}
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>Group Name</label>
          <input
            type="text"
            placeholder="e.g. Design Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="surface-input"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>Description (optional)</label>
          <input
            type="text"
            placeholder="What's this group about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="surface-input"
          />
        </div>

        {/* Selected members */}
        {selectedMembers.length > 0 && (
          <div>
            <label className="text-2xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>
              Members ({selectedMembers.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {selectedMembers.map((m) => (
                <motion.button
                  key={m.id}
                  layout
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={() => toggleMember(m)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-[6px] text-xs font-medium"
                  style={{
                    background: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                  }}
                >
                  <Avatar username={m.username} size="xs" />
                  {m.username}
                  <span className="opacity-50">&times;</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Search & add members */}
        <div>
          <label className="text-2xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--text-tertiary)' }}>Add Members</label>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="surface-input w-full pl-8"
            />
          </div>
          <div className="mt-2 max-h-40 overflow-y-auto space-y-0.5">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-xs py-4" style={{ color: 'var(--text-tertiary)' }}>No users found</p>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleMember(u)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-lg transition-all text-left"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Avatar username={u.username} size="sm" isOnline={u.is_online} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{u.username}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Create button */}
        <Button
          onClick={handleCreate}
          disabled={!name.trim() || selectedMembers.length === 0}
          loading={loading}
          className="w-full"
        >
          Create Group ({selectedMembers.length + 1} members)
        </Button>
      </div>
    </Modal>
  )
}
