import React, { useState } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import { collab as collabApi } from '../api'
import { toast } from 'react-toastify'
import '../styles/invite-modal.css'

Modal.setAppElement('#root')

export default function InviteModal({ isOpen, onRequestClose, projectId }){
  const { token } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [invitePreview, setInvitePreview] = useState('')
  const [showLink, setShowLink] = useState(false)

  const submit = async (e)=>{
    e?.preventDefault()
    if(!token) return toast.info('Please sign in')
    if(!projectId) return toast.error('No project selected')
    setLoading(true)
    try{
      const res = await collabApi.invite(token, { projectId, email, role: 'editor' })
      const link = `${window.location.origin}/invite/accept/${res.invite.token}`
      setInviteLink(link)
      if(res?.invite?.preview) setInvitePreview(res.invite.preview)
      setShowLink(true)
      toast.success('Invite sent! Link generated.')
      setEmail('')
    }catch(err){
      toast.error(err.message || 'Invite failed')
    }finally{ setLoading(false) }
  }

  const copyLink = ()=>{
    if(!inviteLink) return
    navigator.clipboard.writeText(inviteLink)
    toast.success('Invite link copied to clipboard!')
  }

  const closeModal = ()=>{
    setEmail('')
    setInviteLink('')
    setShowLink(false)
    onRequestClose()
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal} overlayClassName="modal-overlay" className="invite-modal-card" contentLabel="Invite">
      <div className="invite-modal-header">
        <h1>Invite to Project</h1>
        <p>Add team members to collaborate</p>
      </div>
      <div className="invite-modal-content">
        {!showLink ? (
          <form onSubmit={submit}>
            <div className="field-group">
              <label className="field-label">Email address</label>
              <input 
                value={email} 
                onChange={e=>setEmail(e.target.value)} 
                placeholder="colleague@example.com" 
                className="invite-input" 
                type="email"
                required 
              />
            </div>
            <div className="invite-modal-actions">
              <button type="button" onClick={closeModal} className="btn btn-cancel" disabled={loading}>Cancel</button>
              <button type="submit" className="btn btn-save" disabled={loading}>
                {loading ? 'Sending...' : 'Send invite'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div className="success-alert">
              <div className="success-icon">✓</div>
              <div>
                <p className="success-title">Invite sent successfully!</p>
                <p className="success-text">The invite link is available below if needed.</p>
              </div>
            </div>
            
            <div className="field-group" style={{marginTop: '20px'}}>
              <label className="field-label">Shareable invite link</label>
              <div className="link-copy-row">
                <input 
                  value={inviteLink} 
                  readOnly 
                  className="invite-input link-input" 
                />
                <button onClick={copyLink} className="btn-copy">Copy</button>
              </div>
              <p className="field-hint">Anyone with this link can join the project</p>
            </div>
            {invitePreview && (
              <div style={{marginTop: '16px'}}>
                <label className="field-label">Email preview</label>
                <div className="preview-actions">
                  <a href={invitePreview} target="_blank" rel="noreferrer" className="btn btn-secondary">Open Preview</a>
                  <button onClick={() => { navigator.clipboard.writeText(invitePreview); toast.success('Preview URL copied') }} className="btn btn-secondary">Copy URL</button>
                </div>
              </div>
            )}

            <div className="invite-modal-actions" style={{marginTop: '20px'}}>
              <button onClick={()=>setShowLink(false)} className="btn btn-cancel">Invite Another</button>
              <button onClick={closeModal} className="btn btn-save">Done</button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
