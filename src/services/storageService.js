import { supabase } from '../lib/supabase'

/**
 * Generate a short-lived Signed URL for a private storage asset
 * @param {string} bucket - Bucket name ('chat-files' or 'chat-images')
 * @param {string} path - Storage object path or public URL string
 * @param {number} expiresIn - Expiry in seconds (default 3600 = 1 hour)
 * @returns {Promise<string>} Signed URL or original path on fallback
 */
export async function getSignedMediaUrl(bucket, path, expiresIn = 3600) {
  if (!path) return ''
  // If it's already a full http(s) URL not hosted on private path, return directly
  if (path.startsWith('http') && !path.includes('/storage/v1/object/')) {
    return path
  }

  // Extract relative storage path if full URL was provided
  let objectPath = path
  if (path.includes(`/storage/v1/object/public/${bucket}/`)) {
    objectPath = path.split(`/storage/v1/object/public/${bucket}/`)[1]
  } else if (path.includes(`/storage/v1/object/authenticated/${bucket}/`)) {
    objectPath = path.split(`/storage/v1/object/authenticated/${bucket}/`)[1]
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(objectPath, expiresIn)

    if (error || !data?.signedUrl) {
      return path
    }
    return data.signedUrl
  } catch {
    return path
  }
}
