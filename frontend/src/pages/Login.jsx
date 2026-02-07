import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try{
      await login(email, password)
      
      // Check if there's a pending invite to redirect to
      const pendingInvite = sessionStorage.getItem('pendingInvite')
      if(pendingInvite) {
        sessionStorage.removeItem('pendingInvite')
        navigate(`/invite/accept/${pendingInvite}`)
      } else {
        navigate('/')
      }
    }catch(err){
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="card">
        <h2 className="text-2xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Login</h2>
        <p className="text-sm text-gray-500 mb-6">Sign in to access your tasks</p>
        <form onSubmit={submit} className="space-y-4">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all" style={{ borderColor: 'rgba(15,23,42,0.1)' }} />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-sky-200 focus:border-sky-400 transition-all" style={{ borderColor: 'rgba(15,23,42,0.1)' }} />
          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
          <div className="text-right pt-2">
            <button type="submit" className="btn-primary">Login</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
