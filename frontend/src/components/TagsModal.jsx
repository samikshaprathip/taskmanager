import React, { useState } from 'react'
import Modal from 'react-modal'
import { useAuth } from '../context/AuthContext'
import { tasks as api } from '../api'
import { toast } from 'react-toastify'
import LoadingSpinner from './LoadingSpinner'

Modal.setAppElement('#root')

export default function TagsModal({ isOpen, onRequestClose, task, onUpdated }){
  const { token } = useAuth()
  const [tag, setTag] = useState('')
  const [loading, setLoading] = useState(false)

  const addTag = async (e) => {
    e?.preventDefault()
    if(!tag) return
    setLoading(true)
    try{
      if(!token) return toast.info('Please sign in')
      const res = await api.update(token, task._id, { addTag: tag })
      onUpdated?.(res.task)
      window.dispatchEvent(new Event('tasksUpdated'))
      setTag('')
      toast.success('Tag added')
    }catch(err){
      console.error(err)
      toast.error(err.message || 'Failed to add tag')
    }finally{ setLoading(false) }
  }

  const removeTag = async (t) => {
    if(!confirm(`Remove tag '${t}'?`)) return
    setLoading(true)
    try{
      const res = await api.update(token, task._id, { removeTag: t })
      onUpdated?.(res.task)
      window.dispatchEvent(new Event('tasksUpdated'))
      toast.success('Tag removed')
    }catch(err){
      console.error(err)
      toast.error(err.message || 'Failed to remove tag')
    }finally{ setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} overlayClassName="modal-overlay" className="card" contentLabel="Tags">
      <h3 className="text-lg font-semibold mb-3">Tags</h3>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {(task.tags || []).map((t,i)=> (
            <div key={i} className="px-3 py-1 rounded-full border flex items-center gap-2">
              <span className="text-sm">{t}</span>
              <button onClick={()=>removeTag(t)} className="text-xs text-red-500">x</button>
            </div>
          ))}
+         {(!task.tags || task.tags.length===0) && <div className="text-sm text-gray-500">No tags yet.</div>}
        </div>
        <form onSubmit={addTag} className="flex gap-2">
          <input value={tag} onChange={e=>setTag(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Add tag (e.g. UI, Backend)" />
          <button type="submit" className="btn-primary px-3" disabled={loading}>{loading ? <LoadingSpinner size={14}/> : 'Add'}</button>
        </form>
      </div>
    </Modal>
  )
}
