import React, { useState } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import LoadingSpinner from './LoadingSpinner'

Modal.setAppElement('#root')

const RegisterModal = ({ isOpen, onRequestClose }) => {
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
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} overlayClassName="modal-overlay" className="card" contentLabel="Register">
      <h3 className="text-lg font-semibold mb-3">Create account</h3>
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full p-2 border rounded" required />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" required />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (min 8 chars)" type="password" className="w-full p-2 border rounded" required />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onRequestClose} className="px-3 py-1 border rounded" disabled={loading}>Cancel</button>
          <button type="submit" className="px-4 py-2 btn-primary flex items-center gap-2" disabled={loading}>{loading ? <LoadingSpinner size={16}/> : 'Create account'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default RegisterModal
