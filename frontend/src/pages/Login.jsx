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
    <div className="max-w-md mx-auto py-12">
      <h2 className="text-2xl font-semibold mb-4">Login</h2>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" />
        {error && <div className="text-red-600">{error}</div>}
        <div className="text-right">
          <button className="px-4 py-2 btn-primary">Login</button>
        </div>
      </form>
    </div>
  )
}

export default Login
