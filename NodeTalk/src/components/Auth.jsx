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
        background: "url('https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?q=80&w=1912&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover no-repeat"
      }}
    >
      <div className="w-full max-w-lg bg-[#f4fbfdb7] flex items-center justify-center rounded-2xl shadow-lg p-10">
        <form onSubmit={handleSubmit} className="flex flex-col w-full">
          <h1 className="text-3xl font-bold text-center text-[#6D61FF] mb-2">
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
              className="p-3 mb-4 rounded-full border outline-none pl-5 border-gray-300"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 mb-4 rounded-full border outline-none pl-5 border-gray-300"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 mb-4 rounded-full border outline-none pl-5 border-gray-300"
            minLength={6}
            required
          />

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <div className="flex items-center justify-center gap-5 mt-2">
            <button
              type="submit"
              disabled={busy}
              className="bg-[#6D61FF] text-white p-2.5 w-32 rounded-full font-semibold disabled:opacity-50"
            >
              {busy ? '⏳' : isLogin ? 'Login' : 'Sign Up'}
            </button>

            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="bg-[#ffffffa7] border-2 font-bold border-[#6D61FF] text-[#6D61FF] flex items-center justify-center p-2.5 w-32 rounded-full"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
