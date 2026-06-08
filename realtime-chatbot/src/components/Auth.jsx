import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { signIn, signUp } = useAuth()
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
        alert('Account created! Check your email to confirm sign-up (or if confirmations are disabled, you are all set).')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 app-container">
      <div className="glass w-full max-w-md p-8 rounded-3xl animate-bounce-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl glass-strong flex items-center justify-center text-3xl">
            💬
          </div>
          <h1 className="text-3xl font-bold text-white">Glass Chat</h1>
          <p className="text-white/50 mt-1">Real‑time messenger</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input w-full"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input w-full"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input w-full"
            minLength={6}
            required
          />

          {error && (
            <p className="text-red-400 text-sm text-center animate-fade-in">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="glass-btn-primary w-full disabled:opacity-50"
          >
            {busy ? '⏳ Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-white/40 mt-6 text-sm">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
