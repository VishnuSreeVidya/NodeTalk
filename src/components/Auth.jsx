import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import ThemeSelector from './ThemeSelector'
import heroImg from '../assets/hero.png'

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
      <div className="w-full max-w-lg glass-card flex flex-col items-center justify-center p-10">
        <img src={heroImg} alt="NodeTalk" className="w-24 h-24 mb-4 object-contain" />
        <form onSubmit={handleSubmit} className="flex flex-col w-full">
          <h1 className="text-3xl font-bold text-center mb-2" style={{ color: 'var(--accent)' }}>
            {isLogin ? 'Login' : 'Sign Up'}
          </h1>
          <p className="text-sm font-semibold text-center mb-6" style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? 'Please fill the details to login your account' : 'Create your account to get started'}
          </p>

          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="glass-input w-full mb-3"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="glass-input w-full mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="glass-input w-full mb-3"
            minLength={6}
            required
          />

          {error && (
            <p className="text-red-500 text-sm text-center mb-3">{error}</p>
          )}

          <div className="flex items-center justify-center gap-4 mt-1">
            <button
              type="submit"
              disabled={busy}
              className="glass-btn-primary w-28 disabled:opacity-50"
            >
              {busy ? '⏳' : isLogin ? 'Login' : 'Sign Up'}
            </button>

            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="glass-btn w-28"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
