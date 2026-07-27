import { supabase } from '../lib/supabase'

/**
 * Fetch DM messages between two users
 * @param {string} userId - Current user ID
 * @param {string} otherUserId - Other user ID
 * @param {number} limit - Max messages to fetch
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function fetchDMMessages(userId, otherUserId, limit = 50) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true })
    .limit(limit)

  return { data, error }
}

/**
 * Fetch group messages
 * @param {string} groupId - Group ID
 * @param {number} limit - Max messages to fetch
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function fetchGroupMessages(groupId, limit = 50) {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(limit)

  return { data, error }
}

/**
 * Send a DM message
 * @param {Object} payload - Message payload
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function sendDMMessage(payload) {
  const { data, error } = await supabase.from('messages').insert(payload)
  return { data, error }
}

/**
 * Send a group message
 * @param {Object} payload - Group message payload
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function sendGroupMessage(payload) {
  const { data, error } = await supabase.from('group_messages').insert(payload)
  return { data, error }
}

/**
 * Edit a DM message
 * @param {string} messageId - Message ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function editDMMessage(messageId, updates) {
  const { data, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId)
  return { data, error }
}

/**
 * Edit a group message
 * @param {string} messageId - Message ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function editGroupMessage(messageId, updates) {
  const { data, error } = await supabase
    .from('group_messages')
    .update(updates)
    .eq('id', messageId)
  return { data, error }
}

/**
 * Delete a DM message (soft delete for self, hard delete for all)
 * @param {string} messageId - Message ID
 * @param {boolean} deleteForAll - Delete for everyone
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function deleteDMMessage(messageId, deleteForAll = false) {
  if (deleteForAll) {
    const { data, error } = await supabase
      .from('messages')
      .update({ deleted_for_all: true, message_text: '🗑️ This message was deleted' })
      .eq('id', messageId)
    return { data, error }
  }
  return { data: null, error: null }
}

/**
 * Delete a group message
 */
export async function deleteGroupMessage(messageId, deleteForAll = false) {
  if (deleteForAll) {
    const { data, error } = await supabase
      .from('group_messages')
      .update({ deleted_for_all: true, message_text: '🗑️ This message was deleted' })
      .eq('id', messageId)
    return { data, error }
  }
  return { data: null, error: null }
}

/**
 * Mark messages as read
 * @param {string[]} messageIds - Array of message IDs
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function markMessagesRead(messageIds) {
  if (messageIds.length === 0) return { data: null, error: null }
  const { data, error } = await supabase
    .from('messages')
    .update({ message_status: 'read', read_at: new Date().toISOString() })
    .in('id', messageIds)
    .eq('message_status', 'delivered')
  return { data, error }
}

/**
 * Mark messages as delivered
 */
export async function markMessagesDelivered(messageIds) {
  if (messageIds.length === 0) return { data: null, error: null }
  const { data, error } = await supabase
    .from('messages')
    .update({ message_status: 'delivered' })
    .in('id', messageIds)
    .eq('message_status', 'sent')
  return { data, error }
}

/**
 * Pin/unpin a message
 */
export async function togglePinMessage(messageId, isPinned, userId) {
  await supabase
    .from('messages')
    .update({ is_pinned: isPinned })
    .eq('id', messageId)

  if (isPinned) {
    await supabase
      .from('pinned_messages')
      .insert({ message_id: messageId, pinned_by: userId })
  } else {
    await supabase
      .from('pinned_messages')
      .delete()
      .eq('message_id', messageId)
  }
}

/**
 * Pin/unpin a group message
 */
export async function togglePinGroupMessage(messageId, isPinned) {
  const { data, error } = await supabase
    .from('group_messages')
    .update({ is_pinned: isPinned })
    .eq('id', messageId)
  return { data, error }
}

/**
 * Fetch reactions for messages
 */
export async function fetchReactions(messageIds) {
  if (messageIds.length === 0) return { data: [], error: null }
  const { data, error } = await supabase
    .from('reactions')
    .select('*')
    .in('message_id', messageIds)
  return { data: data || [], error }
}

/**
 * Toggle a reaction on a message
 */
export async function toggleReaction(messageId, userId, emoji, existingReaction) {
  if (existingReaction) {
    return supabase
      .from('reactions')
      .delete()
      .eq('id', existingReaction.id)
  }
  return supabase
    .from('reactions')
    .insert({ message_id: messageId, user_id: userId, emoji })
}

/**
 * Fetch unread message count for a user
 */
export async function fetchUnreadCount(userId, otherUserId) {
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', otherUserId)
    .eq('receiver_id', userId)
    .neq('message_status', 'read')
  return count || 0
}
