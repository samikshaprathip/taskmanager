import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

Modal.setAppElement('#root')

const ProfileModal = ({ isOpen, onRequestClose }) => {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(()=>{
    if(user){ setName(user.name || ''); setEmail(user.email || ''); setAvatarPreview(user.avatar || null) }
  }, [user, isOpen])

  const onFile = (e) => {
    const f = e.target.files[0]
    if(!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = ()=> setAvatarPreview(reader.result)
    reader.readAsDataURL(f)
  }

  const save = async (e) => {
    e?.preventDefault()
    setSaving(true)
    try{
      // send avatar as data URL (backend stores a string URL or datauri)
      await updateProfile({ name, email, avatar: avatarPreview })
      onRequestClose()
    }catch(err){
      alert(err.message || 'Failed to save')
    }finally{ setSaving(false) }
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Profile" className="card" overlayClassName="modal-overlay">
      <h3 className="text-lg font-semibold mb-3">My Profile</h3>
      <form onSubmit={save} className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No</div>}
          </div>
          <div>
            <label className="text-sm text-gray-600">Change avatar</label>
            <input type="file" accept="image/*" onChange={onFile} />
          </div>
        </div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full p-2 border rounded" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onRequestClose} className="px-3 py-1 border rounded" disabled={saving}>Cancel</button>
          <button type="submit" className="px-4 py-2 btn-primary flex items-center gap-2" disabled={saving}>{saving ? <LoadingSpinner size={16}/> : 'Save'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default ProfileModal
