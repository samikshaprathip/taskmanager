import React, { useState, useEffect, useMemo } from 'react'
import { Users, Plus, ExternalLink, Copy, RefreshCw, Mail, Crown, Edit, Eye, Calendar, Trash2, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { collab as collabApi, tasks as tasksApi } from '../api'
import { toast } from 'react-toastify'
import InviteModal from '../components/InviteModal'
import TaskModal from '../components/TaskModal'
import '../styles/collaboration.css'

export default function Collaboration(){
  const { token, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectDetail, setProjectDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const [tasks, setTasks] = useState([])
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [savingTask, setSavingTask] = useState(false)

  const loadProjects = async () => {
    if(!token) return
    setLoading(true)
    try{
      const res = await collabApi.listProjects(token)
      const list = res.projects || []
      setProjects(list)
    }catch(err){
      console.error(err)
      toast.error('Failed to load projects')
    }finally{ setLoading(false) }
  }

  const loadProjectDetail = async (id) => {
    if(!token || !id) return
    setDetailLoading(true)
    try{
      const res = await collabApi.getProject(token, id)
      // Backend returns {success, project, invites, shareLink}
      setProjectDetail(res.project)
      setShareLink(res.shareLink || '')
      
      const taskRes = await tasksApi.list(token, `?projectId=${id}`)
      setTasks(taskRes.tasks || [])
    }catch(err){
      console.error(err)
      toast.error('Failed to load project details')
      setProjectDetail(null)
      setShareLink('')
      setTasks([])
    }finally{
      setDetailLoading(false)
    }
  }

  const handleRefresh = async () => {
    const refreshToast = toast.loading('Refreshing...')
    try {
      await loadProjects()
      if(selectedProject?._id){
        await loadProjectDetail(selectedProject._id)
      }
      toast.success('Refreshed!', { id: refreshToast })
    } catch(err) {
      toast.error('Refresh failed', { id: refreshToast })
    }
  }

  useEffect(()=>{ 
    if(token) {
      loadProjects() 
    }
  }, [token])

  // Auto-select first project only on initial load
  useEffect(()=>{
    if(projects.length > 0 && !selectedProject && !detailLoading){
      setSelectedProject(projects[0])
    }
  }, [projects.length])

  useEffect(()=>{
    if(selectedProject && token){
      loadProjectDetail(selectedProject._id)
    } else {
      setProjectDetail(null)
      setShareLink('')
      setTasks([])
    }
  }, [selectedProject?._id, token])

  const handleCreateProject = async (e) => {
    e?.preventDefault()
    if(!newProjectName.trim()) return
    if(!token){ toast.info('Please sign in'); return }
    
    try{
      const res = await collabApi.createProject(token, { name: newProjectName })
      setProjects(prev => [res.project, ...prev])
      setNewProjectName('')
      setCreateOpen(false)
      toast.success('Project created!')
    }catch(err){
      toast.error(err.message || 'Failed to create project')
    }
  }

  const handleCopyLink = () => {
    if(!shareLink) return
    navigator.clipboard.writeText(shareLink)
    toast.success('Share link copied to clipboard!')
  }

  const handleResetLink = async () => {
    if(!selectedProject || !token) return
    try{
      const res = await collabApi.resetShareLink(token, selectedProject._id)
      setShareLink(res.shareLink)
      toast.success('Share link reset successfully!')
    }catch(err){
      toast.error(err.message || 'Failed to reset link')
    }
  }

  const handleDeleteProject = async () => {
    if(!selectedProject || !token) return
    if(!window.confirm(`Delete project "${selectedProject.name}"? This cannot be undone.`)) return
    try{
      await collabApi.deleteProject(token, selectedProject._id)
      const updatedProjects = projects.filter(p => p._id !== selectedProject._id)
      setProjects(updatedProjects)
      setSelectedProject(updatedProjects.length > 0 ? updatedProjects[0] : null)
      toast.success('Project deleted successfully!')
    }catch(err){
      toast.error(err.message || 'Failed to delete project')
    }
  }

  const roleIcon = (role) => {
    if(role === 'owner') return <Crown size={14} className="text-yellow-500" />
    if(role === 'editor') return <Edit size={14} className="text-blue-500" />
    return <Eye size={14} className="text-gray-500" />
  }

  const roleBadge = (role) => {
    const styleMap = {
      owner: 'bg-amber-50 text-amber-700 border-amber-200',
      editor: 'bg-blue-50 text-blue-700 border-blue-200',
      viewer: 'bg-gray-50 text-gray-600 border-gray-200'
    }
    const style = styleMap[role] || styleMap.viewer
    return (
      <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${style}`}>
        {roleIcon(role)}
        <span className="capitalize font-medium">{role || 'viewer'}</span>
      </span>
    )
  }

  const getUserRole = (project) => {
    if(!user || !project) return null
    if(project.owner?._id === user._id || project.owner === user._id) return 'owner'
    const member = project.members?.find(m => (m.user?._id || m.user) === user._id)
    return member?.role || null
  }

  const isOwner = useMemo(() => {
    return projectDetail && getUserRole(projectDetail) === 'owner'
  }, [projectDetail, user])

  const canEdit = useMemo(() => {
    const role = projectDetail && getUserRole(projectDetail)
    return role === 'owner' || role === 'editor'
  }, [projectDetail, user])

  const handleCreateTask = () => {
    setEditingTask(null)
    setTaskModalOpen(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const handleSaveTask = async (taskData) => {
    if(!token || !selectedProject) return
    setSavingTask(true)
    try {
      if(editingTask) {
        // Update existing task
        await tasksApi.update(token, editingTask._id, taskData)
        toast.success('Task updated!')
      } else {
        // Create new task with project association
        await tasksApi.create(token, { ...taskData, project: selectedProject._id })
        toast.success('Task created!')
      }
      setTaskModalOpen(false)
      setEditingTask(null)
      // Reload tasks
      await loadProjectDetail(selectedProject._id)
    } catch(err) {
      toast.error(err.message || 'Failed to save task')
    } finally {
      setSavingTask(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if(!token || !window.confirm('Delete this task?')) return
    try {
      await tasksApi.remove(token, taskId)
      toast.success('Task deleted!')
      // Reload tasks
      if(selectedProject) {
        await loadProjectDetail(selectedProject._id)
      }
    } catch(err) {
      toast.error(err.message || 'Failed to delete task')
    }
  }

  const handleToggleComplete = async (task) => {
    if(!token) return
    try {
      await tasksApi.update(token, task._id, { completed: !task.completed })
      // Reload tasks
      if(selectedProject) {
        await loadProjectDetail(selectedProject._id)
      }
    } catch(err) {
      toast.error(err.message || 'Failed to update task')
    }
  }

  return (
    <>
      <div className="collab-page">
        {/* Top bar */}
        <div className="collab-nav">
          <div className="collab-nav-inner">
            <div className="collab-brand">
              <h1 className="collab-nav-title">Team Workspace</h1>
            </div>
            <div className="collab-nav-actions">
              <button onClick={handleRefresh} className="collab-btn ghost flex items-center gap-2">
                <RefreshCw size={16} />
                Refresh
              </button>
              <button onClick={()=>setCreateOpen(!createOpen)} className="collab-btn primary flex items-center gap-2">
                <Plus size={16} />
                New Project
              </button>
            </div>
          </div>
        </div>

      <div className="collab-shell">
        {createOpen && (
          <div className="create-project-card">
            <div className="create-project-header">
              <h1>Create New Project</h1>
              <p>Start collaborating with your team</p>
            </div>
            <div className="create-project-content">
              <form onSubmit={handleCreateProject}>
                <div className="field-group">
                  <input 
                    value={newProjectName} 
                    onChange={e=>setNewProjectName(e.target.value)} 
                    placeholder="Enter project name..."
                    className="project-input"
                    required
                    autoFocus
                  />
                </div>
                <div className="create-project-actions">
                  <button type="button" onClick={()=>setCreateOpen(false)} className="btn btn-cancel">Cancel</button>
                  <button type="submit" className="btn btn-save">Create Project</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-5">
            {!selectedProject ? (
              <div className="collab-card text-center py-10">
                <Users size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700">Select a project</h3>
                <p className="text-sm text-gray-500 mt-2">Choose a project from the list to view details and collaborate</p>
              </div>
            ) : detailLoading ? (
              <div className="collab-card text-center py-10">
                <RefreshCw size={48} className="mx-auto mb-4 text-gray-300 animate-spin" />
                <p className="text-sm text-gray-500">Loading project details...</p>
              </div>
            ) : !projectDetail ? (
              <div className="collab-card text-center py-10">
                <Users size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold text-gray-700">Failed to load project</h3>
                <p className="text-sm text-gray-500 mt-2">Unable to load project details. Please try refreshing.</p>
                <button onClick={handleRefresh} className="mt-4 px-4 py-2 btn-primary">
                  Retry
                </button>
              </div>
            ) : (
              <div className="collab-v2">
                <div className="container">
                  <header className="page-header">
                    <h1><i className="fas fa-project-diagram" /> Your Projects</h1>
                    <div className="project-meta">
                      <div className="meta-item">
                        <i className="fas fa-user" />
                        <span>{(projectDetail.members?.length || 0) + 1} member{((projectDetail.members?.length || 0) + 1) !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-calendar-alt" />
                        <span>Project created on {projectDetail.createdAt ? new Date(projectDetail.createdAt).toLocaleDateString() : '—'}</span>
                      </div>
                    </div>
                  </header>

                  <main className="main-content">
                    <div className="project-info-card">
                      <div className="project-title-section">
                        <h2>{projectDetail.name}</h2>
                        <span className="team-badge">
                          <i className="fas fa-users" />
                          Team
                        </span>
                      </div>
                      <div className="creator-info">
                        <p><i className="fas fa-user-circle" /> Created by <strong>{projectDetail.owner?.name || 'Unknown'}</strong></p>
                      </div>
                      <div className="project-actions">
                        {isOwner && (
                          <div className="flex gap-3">
                            <button className="btn btn-team" onClick={()=>setInviteOpen(true)}>
                              <i className="fas fa-user-plus" /> Invite
                            </button>
                            <button className="btn btn-delete" onClick={handleDeleteProject}>
                              <i className="fas fa-trash-alt" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <section className="invite-section">
                      <h3 className="section-title">
                        <i className="fas fa-link" /> Invite Link
                      </h3>
                      <div className="invite-link-box">
                        <span className="invite-link">{shareLink || 'No invite link available'}</span>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {shareLink && (
                            <button className="btn btn-copy" onClick={handleCopyLink}>
                              <i className="fas fa-copy" /> Copy
                            </button>
                          )}
                          {isOwner && shareLink && (
                            <button title="Reset link" className="btn" onClick={handleResetLink} style={{ backgroundColor: '#ff9800' }}>
                              <i className="fas fa-rotate-right" /> Reset
                            </button>
                          )}
                        </div>
                      </div>
                      {shareLink && (
                        <p className="access-info">
                          <i className="fas fa-info-circle" /> Anyone with this link can join as editor
                        </p>
                      )}
                    </section>

                    <section className="tasks-section">
                      <h3 className="section-title">
                        <i className="fas fa-tasks" /> Project Tasks
                      </h3>
                      <div className="task-list">
                        {tasks.length === 0 ? (
                          <div className="task-item">
                            <div className="task-info">
                              <span className="task-name">No tasks yet</span>
                              <div className="task-due"><i className="fas fa-calendar-day" /> Create one to get started</div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {tasks.map(task => (
                              <div key={task._id} className="task-item">
                                <div className="task-info">
                                  <span className="task-name">{task.title}</span>
                                  <div className="task-due">
                                    <i className="fas fa-calendar-day" />
                                    {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : 'No due date'}
                                  </div>
                                </div>
                                <span className={`priority-badge ${
                                  task.priority === 'High' ? 'priority-high' :
                                  task.priority === 'Medium' ? 'priority-medium' :
                                  'priority-low'
                                }`}>
                                  {task.priority || 'Medium'} Priority
                                </span>
                                {canEdit && (
                                  <div style={{ display: 'flex', gap: 8, marginLeft: 12 }}>
                                    <button title="Toggle complete" onClick={() => handleToggleComplete(task)} className="btn" style={{ padding: 8 }}>
                                      {task.completed ? <CheckCircle size={16} /> : <i className="fas fa-circle" />}
                                    </button>
                                    <button title="Edit task" onClick={() => handleEditTask(task)} className="btn" style={{ padding: 8 }}>
                                      <Edit size={16} />
                                    </button>
                                    <button title="Delete task" onClick={() => handleDeleteTask(task._id)} className="btn" style={{ padding: 8 }}>
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                      {canEdit && (
                        <button className="btn btn-add-task" onClick={handleCreateTask}>
                          <i className="fas fa-plus-circle" /> Add Task
                        </button>
                      )}
                    </section>
                  </main>

                  <footer className="page-footer">
                    <p>Project Management Dashboard • All rights reserved</p>
                  </footer>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <InviteModal 
        isOpen={inviteOpen} 
        onRequestClose={()=>{
          setInviteOpen(false)
          handleRefresh()
        }} 
        projectId={selectedProject?._id}
      />
      
      <TaskModal
        isOpen={taskModalOpen}
        onRequestClose={() => {
          setTaskModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        initial={editingTask || {}}
        saving={savingTask}
      />
    </>
  )
}
