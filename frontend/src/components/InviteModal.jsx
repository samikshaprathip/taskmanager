import React, { useState } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import { collab as collabApi } from '../api'
import { toast } from 'react-toastify'

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
    <Modal isOpen={isOpen} onRequestClose={closeModal} overlayClassName="modal-overlay" className="card max-w-md" contentLabel="Invite">
      <h3 className="text-lg font-semibold mb-3">Invite to Project</h3>
      
      {!showLink ? (
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email address</label>
            <input 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="colleague@example.com" 
              className="w-full p-2 border rounded" 
              type="email"
              required 
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={closeModal} className="px-3 py-1 border rounded" disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send invite'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <p className="text-sm text-green-800 font-medium mb-2">✓ Invite sent successfully!</p>
            <p className="text-xs text-green-700">The invite link is also available below if needed.</p>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Shareable invite link</label>
            <div className="flex gap-2">
              <input 
                value={inviteLink} 
                readOnly 
                className="flex-1 p-2 border rounded bg-gray-50 text-sm" 
              />
              <button onClick={copyLink} className="px-3 py-2 btn-primary whitespace-nowrap">
                Copy Link
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Anyone with this link can join the project</p>
          </div>
          {invitePreview && (
            <div className="mt-3">
              <label className="block text-sm text-gray-600 mb-1">Email preview (dev)</label>
              <div className="flex gap-2">
                <a href={invitePreview} target="_blank" rel="noreferrer" className="px-3 py-2 bg-gray-800 text-white rounded">Open Email Preview</a>
                <button onClick={() => { navigator.clipboard.writeText(invitePreview); toast.success('Preview URL copied') }} className="px-3 py-2 border rounded">Copy Preview URL</button>
              </div>
              <p className="text-xs text-gray-500 mt-1">This is an Ethereal preview link (development only)</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={()=>setShowLink(false)} className="px-3 py-1 border rounded">Invite Another</button>
            <button onClick={closeModal} className="px-4 py-2 btn-primary">Done</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
