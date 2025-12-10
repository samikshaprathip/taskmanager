import React, { useEffect, useState } from 'react'
import InviteModal from '../components/InviteModal'
import { useAuth } from '../context/AuthContext'
import { collab as collabApi, collabCreate, tasks as tasksApi } from '../api'
import { toast } from 'react-toastify'
import { Users, Plus, Mail, ChevronDown, ChevronRight, ListTodo } from 'lucide-react'

export default function Collaboration(){
  const { token, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [expandedProjects, setExpandedProjects] = useState({})
  const [projectTasks, setProjectTasks] = useState({})
  const [newTaskTitle, setNewTaskTitle] = useState({})

  useEffect(()=>{
    async function load(){
      if(!token) return
      setLoading(true)
      try{
        const res = await collabApi.listProjects(token)
        setProjects(res.projects || [])
      }catch(err){ 
        console.error(err)
        toast.error('Failed to load projects') 
      }finally{
        setLoading(false)
      }
    }
    load()
  }, [token])

  const loadProjectTasks = async (projectId) => {
    try{
      const res = await tasksApi.list(token, `?projectId=${projectId}`)
      setProjectTasks(prev => ({ ...prev, [projectId]: res.tasks || [] }))
    }catch(err){
      console.error(err)
      toast.error('Failed to load tasks')
    }
  }

  const toggleProject = (projectId) => {
    const isExpanding = !expandedProjects[projectId]
    setExpandedProjects(prev => ({ ...prev, [projectId]: isExpanding }))
    if(isExpanding && !projectTasks[projectId]){
      loadProjectTasks(projectId)
    }
  }

  const createTaskInProject = async (projectId) => {
    const title = newTaskTitle[projectId]?.trim()
    if(!title) return toast.info('Enter a task title')
    try{
      const res = await tasksApi.create(token, { title, project: projectId })
      setProjectTasks(prev => ({ 
        ...prev, 
        [projectId]: [res.task, ...(prev[projectId] || [])] 
      }))
      setNewTaskTitle(prev => ({ ...prev, [projectId]: '' }))
      toast.success('Task created')
    }catch(err){
      console.error(err)
      toast.error('Failed to create task')
    }
  }

  const toggleTaskComplete = async (projectId, taskId, completed) => {
    try{
      await tasksApi.update(token, taskId, { completed: !completed })
      setProjectTasks(prev => ({
        ...prev,
        [projectId]: prev[projectId].map(t => 
          t._id === taskId ? { ...t, completed: !completed } : t
        )
      }))
    }catch(err){
      console.error(err)
      toast.error('Failed to update task')
    }
  }

  const [newName, setNewName] = useState('')
  const create = async ()=>{
    if(!token) return toast.info('Sign in first')
    if(!newName.trim()) return toast.info('Enter a project name')
    try{
      const res = await collabCreate.createProject(token, { name: newName })
      setProjects(p=>[...(p||[]), res.project])
      setNewName('')
      toast.success('Project created successfully!')
    }catch(err){ 
      console.error(err)
      toast.error('Failed to create project') 
    }
  }

  const handleInvite = (projectId)=>{
    setSelectedProject(projectId)
    setOpen(true)
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Collaboration</h1>
          <p className="text-gray-600">Invite team members and work together on projects</p>
        </div>

        {/* Create New Project Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <input 
                value={newName} 
                onChange={e=>setNewName(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && create()}
                placeholder="Enter new project name..." 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <button 
              onClick={create} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Plus size={20} />
              Create Project
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-500 mb-2">No projects yet</p>
                <p className="text-sm text-gray-400">Create your first project to start collaborating</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map(p => {
                  const isOwner = p.owner?._id === user?.id || p.owner?._id === user?._id
                  const isExpanded = expandedProjects[p._id]
                  const tasks = projectTasks[p._id] || []
                  
                  return (
                    <div 
                      key={p._id} 
                      className="border border-gray-200 rounded-lg hover:border-blue-300 transition-all"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 flex items-center gap-3">
                            <button 
                              onClick={() => toggleProject(p._id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900">{p.name}</h3>
                                {isOwner && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                    Owner
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Users size={16} />
                                  <span>{p.members?.length || 0} member{(p.members?.length || 0) !== 1 ? 's' : ''}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ListTodo size={16} />
                                  <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {isOwner && (
                              <button 
                                onClick={() => handleInvite(p._id)} 
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                              >
                                <Mail size={18} />
                                Invite
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Tasks Section */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="mb-3">
                            <div className="flex gap-2">
                              <input
                                value={newTaskTitle[p._id] || ''}
                                onChange={e => setNewTaskTitle(prev => ({ ...prev, [p._id]: e.target.value }))}
                                onKeyPress={e => e.key === 'Enter' && createTaskInProject(p._id)}
                                placeholder="Add a new task..."
                                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => createTaskInProject(p._id)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Add Task
                              </button>
                            </div>
                          </div>

                          {tasks.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">No tasks yet. Add one above!</p>
                          ) : (
                            <div className="space-y-2">
                              {tasks.map(task => (
                                <div 
                                  key={task._id}
                                  className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3"
                                >
                                  <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTaskComplete(p._id, task._id, task.completed)}
                                    className="w-4 h-4 text-blue-600 rounded"
                                  />
                                  <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                    {task.title}
                                  </span>
                                  {task.priority && (
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                      task.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                      'bg-green-100 text-green-700'
                                    }`}>
                                      {task.priority}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <InviteModal 
          isOpen={open} 
          onRequestClose={()=>{ setOpen(false); setSelectedProject(null) }} 
          projectId={selectedProject} 
        />
      </div>
    </div>
  )
}

