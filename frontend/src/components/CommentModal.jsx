import React, { useState } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import { tasks as api } from '../api'
import { toast } from 'react-toastify'
import LoadingSpinner from './LoadingSpinner'

Modal.setAppElement('#root')

export default function CommentModal({ isOpen, onRequestClose, task, onUpdated }){
  const { token, user } = useAuth()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e?.preventDefault()
    if(!text) return
    setLoading(true)
    try{
      if(!token) return toast.info('Please sign in')
      const res = await api.update(token, task._id, { commentText: text })
      onUpdated?.(res.task)
      window.dispatchEvent(new Event('tasksUpdated'))
      setText('')
      onRequestClose()
      toast.success('Comment added')
    }catch(err){
      console.error(err)
      toast.error(err.message || 'Failed to add comment')
    }finally{ setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} overlayClassName="modal-overlay" className="card" contentLabel="Comments">
      <h3 className="text-lg font-semibold mb-3">Comments</h3>
      <div className="space-y-3">
        <div className="max-h-64 overflow-auto">
          {(task.comments || []).map((c,i)=> (
            <div key={i} className="p-2 border-b">
              <div className="text-sm font-medium">{c.author?.name || 'You'}</div>
              <div className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</div>
              <div className="mt-1">{c.text}</div>
            </div>
          ))}
          {(!task.comments || task.comments.length===0) && <div className="text-sm text-gray-500">No comments yet.</div>}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Write a comment..." />
          <button type="submit" className="btn-primary px-3" disabled={loading}>{loading ? <LoadingSpinner size={14}/> : 'Add'}</button>
        </form>
      </div>
    </Modal>
  )
}
