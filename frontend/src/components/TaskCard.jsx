import React from 'react'
import { useAuth } from '../context/AuthContext'
import { tasks as api } from '../api'
import { User, Calendar, Edit3, Trash2, Tag, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import LoadingSpinner from './LoadingSpinner'
import TagsModal from './TagsModal'

const TaskCard = ({ task, onDeleted, onUpdated, onEdit }) => {
  const { token } = useAuth()

  const [loading, setLoading] = React.useState(false)
  const [tagsOpen, setTagsOpen] = React.useState(false)

  const handleDelete = async () => {
    if(!confirm('Delete this task?')) return
    setLoading(true)
    try{
      if(!token){
        window.dispatchEvent(new CustomEvent('showSignIn'))
        return
      }
      await api.remove(token, task._id)
      onDeleted?.(task._id)
    }catch(err){
      console.error(err)
      toast.error(err.message || String(err) || 'Delete failed')
    }finally{ setLoading(false) }
  }

  const toggleComplete = async () => {
    setLoading(true)
    try{
      if(!token){
        window.dispatchEvent(new CustomEvent('showSignIn'))
        return
      }
      const updated = await api.update(token, task._id, { completed: !task.completed })
      onUpdated?.(updated.task)
    }catch(err){
      console.error(err)
      toast.error(err.message || String(err) || 'Update failed')
    }finally{ setLoading(false) }
  }

  return (
    <div className="task-card cursor-pointer" role="button" onClick={()=>onEdit?.(task)}>
      <div className="task-left">
        <label className="task-checkbox" onClick={(e)=>e.stopPropagation()} title={task.completed ? 'Mark as active' : 'Mark as completed'}>
          <input type="checkbox" checked={!!task.completed} onChange={(e)=>{ e.stopPropagation(); toggleComplete() }} aria-label="Toggle completed" />
        </label>

        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center text-white shadow-sm"><User size={18} /></div>
          <div>
            <h3 className="task-title mb-1">{task.title}</h3>
            <div className="flex items-center gap-3 task-meta">
              <span className="flex items-center gap-1"><Calendar size={12}/> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
              <span style={{background: task.completed ? '#e6ffed' : '#eef2ff', color: task.completed ? '#059669' : '#3730a3'}} className="px-2 py-1 rounded-full text-xs">{task.completed ? 'Completed' : 'Active'}</span>
            </div>
            {task.description ? <p className="text-xs text-gray-400 mt-2 line-clamp-2">{task.description}</p> : null}
          </div>
        </div>
      </div>

      <div className="card-actions" onClick={(e)=>e.stopPropagation()}>
        <button onClick={(e)=>{ e.stopPropagation(); onEdit?.(task) }} title="Edit" aria-label="Edit task"><Edit3 size={16} /></button>
        <button onClick={(e)=>{ e.stopPropagation(); handleDelete() }} title="Delete" aria-label="Delete task"><Trash2 size={16} /></button>
        <button onClick={(e)=>{ e.stopPropagation(); setTagsOpen(true) }} title="Tags" aria-label="Tags"><Tag size={16} /></button>
      </div>
      <TagsModal isOpen={tagsOpen} onRequestClose={()=>setTagsOpen(false)} task={task} onUpdated={(t)=>onUpdated?.(t)} />
    </div>
  )
}

export default TaskCard
