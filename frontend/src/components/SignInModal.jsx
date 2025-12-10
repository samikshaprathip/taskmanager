import React, { useState } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingSpinner from './LoadingSpinner'
import RegisterModal from './RegisterModal'

Modal.setAppElement('#root')

const SignInModal = ({ isOpen, onRequestClose }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try{
      await login(email, password)
      toast.success('Signed in')
      onRequestClose()
      navigate('/')
    }catch(err){
      toast.error(err.message || 'Sign in failed')
    }finally{ setLoading(false) }
  }

  const [registerOpen, setRegisterOpen] = useState(false)

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} overlayClassName="modal-overlay" className="card" contentLabel="Sign In">
      <h3 className="text-lg font-semibold mb-3">Sign In</h3>
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" required />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded" required />
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Don't have an account? <button type="button" onClick={()=>setRegisterOpen(true)} className="text-indigo-600 underline">Register</button></div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onRequestClose} className="px-3 py-1 border rounded" disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 btn-primary flex items-center gap-2" disabled={loading}>{loading ? <LoadingSpinner size={16}/> : 'Sign In'}</button>
          </div>
        </div>
      </form>
      <RegisterModal isOpen={registerOpen} onRequestClose={()=>setRegisterOpen(false)} />
    </Modal>
  )
}

export default SignInModal
