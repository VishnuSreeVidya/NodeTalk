import { supabase } from '../lib/supabase'

/**
 * Fetch all users except current
 * @param {string} currentUserId
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function fetchUsers(currentUserId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', currentUserId)
    .order('is_online', { ascending: false })
    .order('username')
  return { data, error }
}

/**
 * Fetch a single user profile
 * @param {string} userId
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

/**
 * Update user online status
 * @param {string} userId
 * @param {boolean} isOnline
 */
export async function updateOnlineStatus(userId, isOnline) {
  await supabase
    .from('profiles')
    .update({ is_online: isOnline, last_seen: new Date().toISOString() })
    .eq('id', userId)
}

/**
 * Update user profile
 * @param {string} userId
 * @param {Object} updates
 * @returns {Promise<{error: Error|null}>}
 */
export async function updateUserProfile(userId, updates) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
  return { error }
}

/**
 * Cleanup stale users (no heartbeat)
 */
export async function cleanupStaleUsers() {
  await supabase.rpc('cleanup_stale_users')
}
