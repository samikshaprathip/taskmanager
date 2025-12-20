import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import Avatar from './Avatar'
import '../styles/profile.css'

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
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Profile" className="profile-card" overlayClassName="modal-overlay">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account details</p>
      </div>
      <div className="profile-content">
        <form onSubmit={save}>
          <div className="profile-avatar-row">
            <div className="avatar-frame">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" />
              ) : (
                <Avatar size={64} name={name} />
              )}
            </div>
            <div className="upload-block">
              <label>Avatar</label>
              <input type="file" accept="image/*" onChange={onFile} className="file-input" />
              <span className="hint">PNG/JPG up to 2MB</span>
            </div>
          </div>
          <div className="field-group">
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="profile-input" />
          </div>
          <div className="field-group">
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="profile-input" />
          </div>
          <div className="profile-actions">
            <button type="button" onClick={onRequestClose} className="btn btn-cancel" disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-save" disabled={saving}>
              {saving ? <LoadingSpinner size={16}/> : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default ProfileModal
