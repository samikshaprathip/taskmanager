import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { collab as collabApi } from '../api'
import { toast } from 'react-toastify'
import { CheckCircle, XCircle, Loader, Plus, Edit, Trash2, Users } from 'lucide-react'
import TaskModal from '../components/TaskModal'
import { useAuth } from '../context/AuthContext'
import '../styles/accept-invite.css'

export default function AcceptInvite(){
  const { token } = useParams()
  const navigate = useNavigate()
  const { setGuestMode } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [savingTask, setSavingTask] = useState(false)

  const loadProjectAndTasks = async () => {
    setLoading(true)
    try{
      // Load project details using guest API (no auth required)
      const projectRes = await collabApi.getGuestProject(token)
      setProject(projectRes.project)
      
      // Load project tasks using guest API
      const taskRes = await collabApi.getGuestTasks(token)
      setTasks(taskRes.tasks || [])
      
      toast.success('Welcome to the project!')
    }catch(err){
      setError(err.message || 'Failed to load project')
      toast.error(err.message || 'Failed to load project')
    }finally{ 
      setLoading(false) 
    }
  }

  useEffect(()=>{
    if(token) {
      setGuestMode(true)
      loadProjectAndTasks()
    }
  }, [token])

  const handleSaveTask = async (taskData) => {
    if(!project) return
    setSavingTask(true)
    try {
      if(editingTask) {
        await collabApi.updateGuestTask(token, editingTask._id, taskData)
        toast.success('Task updated!')
      } else {
        await collabApi.createGuestTask(token, taskData)
        toast.success('Task created!')
      }
      setTaskModalOpen(false)
      setEditingTask(null)
      const taskRes = await collabApi.getGuestTasks(token)
      setTasks(taskRes.tasks || [])
    } catch(err) {
      toast.error(err.message || 'Failed to save task')
    } finally {
      setSavingTask(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if(!window.confirm('Delete this task?')) return
    try {
      await collabApi.deleteGuestTask(token, taskId)
      toast.success('Task deleted!')
      const taskRes = await collabApi.getGuestTasks(token)
      setTasks(taskRes.tasks || [])
    } catch(err) {
      toast.error(err.message || 'Failed to delete task')
    }
  }

  const handleToggleComplete = async (task) => {
    try {
      await collabApi.updateGuestTask(token, task._id, { completed: !task.completed })
      const taskRes = await collabApi.getGuestTasks(token)
      setTasks(taskRes.tasks || [])
    } catch(err) {
      toast.error(err.message || 'Failed to update task')
    }
  }

  if(loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full text-center">
          <Loader className="mx-auto mb-4 text-blue-600 animate-spin" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accepting invite...</h2>
          <p className="text-gray-600">Please wait while we add you to the project.</p>
        </div>
      </div>
    )
  }

  if(error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-md w-full text-center">
          <XCircle className="mx-auto mb-4 text-red-600" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to accept invite</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  if(!project) {
    return null
  }

  return (
    <div className="accept-invite-page">
      {/* Gradient Header */}
      <div className="invite-page-header">
        <div className="header-content">
          <h1>{project.name}</h1>
          <p>Collaborate and manage tasks for this project</p>
          <div className="guest-badge">Guest Access - No sign-in required</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="invite-page-container">
        <div className="invite-content-grid">
          {/* Project Info Card */}
          <div className="project-info-section">
            <div className="info-card">
              <h3 className="card-title">Project Details</h3>
              
              <div className="detail-block">
                <p className="detail-label">Created by</p>
                <p className="detail-value">{project.owner?.name || 'Unknown'}</p>
              </div>

              <div className="detail-block">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={18} className="text-blue-600" />
                  <p className="detail-label">Team Members ({project.members?.length || 0})</p>
                </div>
                <div className="members-list">
                  {project.members?.map(member => (
                    <div key={member._id} className="member-item">
                      <div>
                        <p className="member-name">{member.user?.name || 'User'}</p>
                        <p className="member-email">{member.user?.email || ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="tasks-section">
            <div className="tasks-card">
              <div className="tasks-header">
                <h3 className="card-title">Project Tasks ({tasks.length})</h3>
                <button 
                  onClick={() => {setEditingTask(null); setTaskModalOpen(true)}}
                  className="btn btn-add-task"
                >
                  <Plus size={18} />
                  Add Task
                </button>
              </div>

              {tasks.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle size={64} className="empty-icon" />
                  <p className="empty-text">No tasks in this project yet.</p>
                </div>
              ) : (
                <div className="tasks-list">
                  {tasks.map(task => (
                    <div key={task._id} className="task-item">
                      <div className="task-left">
                        <input 
                          type="checkbox" 
                          checked={task.completed || false}
                          onChange={() => handleToggleComplete(task)}
                          className="task-checkbox"
                        />
                        <div className="task-content">
                          <h4 className={`task-title ${task.completed ? 'completed' : ''}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="task-description">{task.description}</p>
                          )}
                          {task.dueDate && (
                            <p className="task-due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="task-actions">
                        <button 
                          onClick={() => {setEditingTask(task); setTaskModalOpen(true)}}
                          className="task-action-btn edit"
                          title="Edit task"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task._id)}
                          className="task-action-btn delete"
                          title="Delete task"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskModal 
        isOpen={taskModalOpen}
        onRequestClose={() => {setTaskModalOpen(false); setEditingTask(null)}}
        onSave={handleSaveTask}
        initial={editingTask || {}}
        saving={savingTask}
      />
    </div>
  )
}
