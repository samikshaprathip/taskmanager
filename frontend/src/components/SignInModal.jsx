import React, { useState } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoadingSpinner from './LoadingSpinner'
import RegisterModal from './RegisterModal'
import '../styles/signin.css'

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
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} overlayClassName="modal-overlay" className="signin-card" contentLabel="Sign In">
      <div className="signin-header">
        <h1>Sign In</h1>
        <p>Access your account to continue</p>
      </div>

      <div className="signin-content">
        <div className="user-info">
          <div className="user-email">
            <div className="user-icon">
              <i className="fas fa-user" />
            </div>
            <div className="email-details">
              <h3>Signed in as</h3>
              <p>{email || 'Enter your email'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={submit}>
          <div style={{ display: 'grid', gap: 12 }}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="signin-input" required />
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="signin-input" required />
          </div>

          <div className="signin-actions">
            <button type="button" className="btn btn-cancel" onClick={onRequestClose} disabled={loading}>
              <i className="fas fa-times" /> Cancel
            </button>
            <button type="submit" className="btn btn-signin" disabled={loading}>
              {loading ? <LoadingSpinner size={16}/> : <i className="fas fa-sign-in-alt" />}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="register-section">
          <span>Don't have an account?</span>
          <button type="button" className="register-link" onClick={()=>setRegisterOpen(true)}>Register</button>
        </div>

        <div className="form-footer">
          <p>Task Manager</p>
          <div className="security-note">
            <i className="fas fa-shield-alt" />
            <span>Your information is secured</span>
          </div>
        </div>
      </div>

      <RegisterModal isOpen={registerOpen} onRequestClose={()=>setRegisterOpen(false)} onOpenSignIn={()=>setRegisterOpen(false)} />
    </Modal>
  )
}

export default SignInModal
