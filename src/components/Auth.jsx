import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import ThemeSelector from './ThemeSelector'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const toast = useToast()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (isLogin) {
        await signIn(email, password)
      } else {
        if (!username.trim()) { setError('Username is required'); setBusy(false); return }
        await signUp(email, password, username)
        toast.success('Account created! Check your email to confirm sign-up.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 app-container">
      <div className="fixed top-5 right-5 z-50">
        <ThemeSelector />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 22, stiffness: 250 }}
        className="w-full max-w-sm"
      >
        <div
          className="p-8 flex flex-col items-center rounded-xl"
          style={{
            background: 'var(--surface-secondary)',
            border: '1px solid var(--border-secondary)',
            boxShadow: 'var(--shadow-modal)',
          }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.15 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white mb-5"
            style={{ background: 'var(--accent)' }}
          >
            N
          </motion.div>

          <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
            {isLogin ? 'Sign in to continue to NodeTalk' : 'Join NodeTalk to start messaging'}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-3">
            {!isLogin && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="surface-input"
                />
              </motion.div>
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="surface-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="surface-input"
              minLength={6}
              required
            />

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-center"
                style={{ color: 'var(--danger)' }}
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={busy}
              whileHover={{ scale: busy ? 1 : 1.01 }}
              whileTap={{ scale: busy ? 1 : 0.98 }}
              className="w-full py-2.5 rounded-[8px] text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'color-mix(in srgb, currentColor 25%, transparent)', borderTopColor: 'currentColor' }} />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </motion.button>
          </form>

          <p className="text-sm mt-6" style={{ color: 'var(--text-tertiary)' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="font-medium hover:underline"
              style={{ color: 'var(--accent)' }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
