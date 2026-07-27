import { supabase } from '../lib/supabase'

/**
 * Fetch notifications for a user
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function fetchNotifications(userId, limit = 20) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return { data, error }
}

/**
 * Mark all notifications as read
 * @param {string} userId
 */
export async function markAllNotificationsRead(userId) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false)
}

/**
 * Mark a single notification as read
 * @param {string} notificationId
 */
export async function markNotificationRead(notificationId) {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
}

/**
 * Create a notification
 * @param {Object} notification
 */
export async function createNotification({ userId, type, title, body }) {
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
  })
}
