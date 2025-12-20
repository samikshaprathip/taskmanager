import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import LoadingSpinner from './LoadingSpinner'
import '../styles/task-modal.css'

Modal.setAppElement('#root')

const TaskModal = ({ isOpen, onRequestClose, onSave, initial = {}, saving = false }) => {
  const [title, setTitle] = useState(initial.title || '')
  const [description, setDescription] = useState(initial.description || '')
  const [dueDate, setDueDate] = useState(initial.dueDate ? new Date(initial.dueDate).toISOString().slice(0,10) : '')
  const [priority, setPriority] = useState(initial.priority || 'Medium')

  useEffect(()=>{
    setTitle(initial.title || '')
    setDescription(initial.description || '')
    setDueDate(initial.dueDate ? new Date(initial.dueDate).toISOString().slice(0,10) : '')
    setPriority(initial.priority || 'Medium')
  }, [initial])

  const submit = (e) => {
    e.preventDefault()
    onSave({ title, description, dueDate: dueDate || null, priority })
  }

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Task" className="task-modal-card" overlayClassName="modal-overlay">
      <div className="task-modal-header">
        <h1>{initial._id ? 'Edit Task' : 'Create Task'}</h1>
        <p>{initial._id ? 'Update task details' : 'Add a new task to your list'}</p>
      </div>
      <div className="task-modal-content">
        <form onSubmit={submit}>
          <div className="field-group">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="task-input" required />
          </div>
          <div className="field-group">
            <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="task-input task-textarea" rows={4} />
          </div>
          <div className="task-row">
            <div className="field-group">
              <input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="task-input" />
            </div>
            <div className="field-group">
              <select value={priority} onChange={e=>setPriority(e.target.value)} className="task-input">
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>
          <div className="task-modal-actions">
            <button type="button" onClick={onRequestClose} className="btn btn-cancel" disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-save" disabled={saving}>{saving ? <LoadingSpinner size={16}/> : 'Save'}</button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default TaskModal
