import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Modal from '../../ui/Modal'
import Avatar from '../../ui/Avatar'
import Button from '../../ui/Button'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext'

export default function CreateGroupModal({ open, onClose, onCreated, users }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMembers, setSelectedMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
      setSelectedMembers([])
      setSearch('')
    }
  }, [open])

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

      const members = [
        { group_id: group.id, user_id: user.id, role: 'admin' },
        ...selectedMembers.map((m) => ({ group_id: group.id, user_id: m.id, role: 'member' })),
      ]

      const { error: memberError } = await supabase
        .from('group_members')
        .insert(members)

      if (memberError) throw memberError

      onCreated?.(group)
      onClose()
    } catch (err) {
      console.error('Failed to create group:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Group" maxWidth="max-w-lg">
      <div className="space-y-4">
        {/* Group name */}
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">Group Name</label>
          <input
            type="text"
            placeholder="e.g. Design Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="glass-input w-full"
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">Description (optional)</label>
          <input
            type="text"
            placeholder="What's this group about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="glass-input w-full"
          />
        </div>

        {/* Selected members */}
        {selectedMembers.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">
              Members ({selectedMembers.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((m) => (
                <motion.button
                  key={m.id}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  onClick={() => toggleMember(m)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }}
                >
                  <Avatar username={m.username} size="xs" />
                  {m.username}
                  <span className="opacity-60">&times;</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Search & add members */}
        <div>
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5 block">Add Members</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-10 text-sm"
            />
          </div>
          <div className="mt-2 max-h-40 overflow-y-auto space-y-0.5">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-[var(--text-secondary)] text-xs py-4">No users found</p>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => toggleMember(u)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/40 transition-all text-left"
                >
                  <Avatar username={u.username} size="sm" isOnline={u.is_online} />
                  <span className="text-sm font-medium text-[var(--text-primary)]">{u.username}</span>
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
