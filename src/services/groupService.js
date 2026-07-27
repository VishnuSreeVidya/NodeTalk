import { supabase } from '../lib/supabase'

/**
 * Fetch groups the current user belongs to
 * @param {string} userId
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function fetchUserGroups(userId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('groups:group_id(*, group_members(count))')
    .eq('user_id', userId)

  if (error) return { data: null, error }
  const groupList = data.map((gm) => gm.groups).filter(Boolean)
  return { data: groupList, error: null }
}

/**
 * Fetch group members
 * @param {string} groupId
 * @returns {Promise<{data: Array|null, error: Error|null}>}
 */
export async function fetchGroupMembers(groupId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('*, profiles:user_id(id, username, avatar_url, is_online)')
    .eq('group_id', groupId)
  return { data, error }
}

/**
 * Create a new group
 * @param {string} name - Group name
 * @param {string} createdBy - Creator user ID
 * @param {string[]} memberIds - Array of user IDs
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function createGroup(name, createdBy, memberIds) {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({ name, created_by: createdBy })
    .select()
    .single()

  if (groupError) return { data: null, error: groupError }

  const allMembers = [createdBy, ...memberIds.filter((id) => id !== createdBy)]
  const { error: memberError } = await supabase
    .from('group_members')
    .insert(allMembers.map((id) => ({ group_id: group.id, user_id: id })))

  if (memberError) return { data: null, error: memberError }
  return { data: group, error: null }
}
