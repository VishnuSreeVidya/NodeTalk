/**
 * Register Service Worker for Web Push notifications
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      return registration
    } catch (err) {
      console.warn('Service worker registration failed:', err)
      return null
    }
  }
  return null
}

/**
 * Request notification permissions from the browser
 * @returns {Promise<boolean>}
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return false
}

/**
 * Show an in-app or browser notification if permission is granted
 */
export function showBrowserNotification(title, body, link = '/') {
  if (('Notification' in window) && Notification.permission === 'granted' && document.hidden) {
    try {
      const n = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
      })
      n.onclick = () => {
        window.focus()
        if (link) window.location.hash = link
      }
    } catch {
      // Ignore fallback failures
    }
  }
}
