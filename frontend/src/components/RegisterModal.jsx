import React, { useState } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import LoadingSpinner from './LoadingSpinner'
import { UserPlus } from 'lucide-react'
import '../styles/register-modal.css'

Modal.setAppElement('#root')

const RegisterModal = ({ isOpen, onRequestClose, onOpenSignIn }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()

  const submit = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try{
      await register({ name, email, password })
      toast.success('Registered and signed in')
      onRequestClose()
    }catch(err){
      toast.error(err.message || 'Registration failed')
    }finally{ setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} overlayClassName="modal-overlay" className="register-modal-card" contentLabel="Create account">
      <div className="register-modal-header">
        <h1>Create account</h1>
        <p>Get started with Task Drive</p>
      </div>
      <div className="register-modal-content">
        <form onSubmit={submit}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="register-input" required />
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" className="register-input" required />
          <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 8 characters)" type="password" className="register-input" required minLength={8} />
          <div className="register-modal-actions">
            <button type="button" onClick={onRequestClose} className="btn btn-cancel" disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-register" disabled={loading}>
              {loading ? <LoadingSpinner size={16}/> : <UserPlus size={18} />}
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
        {onOpenSignIn && (
          <div className="register-signin-section">
            <span>Already have an account?</span>
            <button type="button" className="signin-link" onClick={()=>{ onRequestClose(); onOpenSignIn(); }}>Sign in</button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default RegisterModal
