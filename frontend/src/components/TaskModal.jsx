import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import LoadingSpinner from './LoadingSpinner'

Modal.setAppElement('#root')

const TaskModal = ({ isOpen, onRequestClose, onSave, initial = {}, saving = false }) => {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [dueDate, setDueDate] = useState(initial.dueDate ? new Date(initial.dueDate).toISOString().slice(0,10) : '')

  useEffect(()=>{
    setTitle(initial.title || '')
    setDescription(initial.description || '')
    setDueDate(initial.dueDate ? new Date(initial.dueDate).toISOString().slice(0,10) : '')
  }, [initial])

  const submit = (e) => {
    e.preventDefault()
    onSave({ title, description, dueDate: dueDate || null })
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Task" className="card" overlayClassName="modal-overlay">
      <h3 className="text-lg font-semibold mb-2">{initial._id ? 'Edit Task' : 'Create Task'}</h3>
      <form onSubmit={submit} className="space-y-3">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" required />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full p-2 border rounded" rows={4} />
        <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="p-2 border rounded" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onRequestClose} className="px-3 py-1 border rounded" disabled={saving}>Cancel</button>
          <button type="submit" className="px-4 py-2 btn-primary flex items-center gap-2" disabled={saving}>{saving ? <LoadingSpinner size={16}/> : 'Save'}</button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskModal
