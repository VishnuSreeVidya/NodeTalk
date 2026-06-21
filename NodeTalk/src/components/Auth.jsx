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
    <div className="min-h-screen w-full flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)'
      }}
    >
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-xl flex items-center justify-center rounded-2xl shadow-sm border border-white/60 p-10">
        <form onSubmit={handleSubmit} className="flex flex-col w-full">
          <h1 className="text-3xl font-bold text-center text-[#0EA5E9] mb-2">
            {isLogin ? 'Login' : 'Sign Up'}
          </h1>
          <p className="text-sm font-semibold text-center mb-6 text-[#5e5e5e]">
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
