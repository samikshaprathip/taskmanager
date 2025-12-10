import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth as apiAuth } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }){
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if(token){
      setLoading(true)
      apiAuth.me(token).then(res => {
        setUser(res.user)
      }).catch(()=>{
        setToken(null)
        localStorage.removeItem('token')
      }).finally(()=> setLoading(false))
    }
  }, [token])

  const login = async (email, password) => {
    const res = await apiAuth.login({ email, password })
    localStorage.setItem('token', res.token)
    setToken(res.token)
    setUser(res.user)
    return res
  }

  // demoLogin removed — app requires real authentication

  const register = async (payload) => {
    const res = await apiAuth.register(payload)
    localStorage.setItem('token', res.token)
    setToken(res.token)
    setUser(res.user)
    return res
  }

  const updateProfile = async (payload) => {
    if(!token) throw new Error('Not authenticated')
    const res = await apiAuth.updateProfile(token, payload)
    setUser(res.user)
    return res
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
