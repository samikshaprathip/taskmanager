import React, { useEffect, useState } from 'react'
import TaskCard from '../components/TaskCard'
import { useAuth } from '../context/AuthContext'
import { tasks as api } from '../api'
import TaskModal from '../components/TaskModal'
import TasksChart from '../components/TasksChart'
import DailyActivityChart from '../components/DailyActivityChart'
import CalendarStrip from '../components/CalendarStrip'
import { toast } from 'react-toastify'
import SignInModal from '../components/SignInModal'
import { useSearch } from '../context/SearchContext'

const Dashboard = () => {
  const { token, user } = useAuth()
  const { query, filters, setFilters } = useSearch()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [newText, setNewText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [modalSaving, setModalSaving] = useState(false)
  const [createInlineOpen, setCreateInlineOpen] = useState(true)
  const [createTitle, setCreateTitle] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [signInOpen, setSignInOpen] = useState(false)

  // Listen for global requests to show sign-in (e.g., TaskCard actions when unauthenticated)
  React.useEffect(()=>{
    const handler = () => setSignInOpen(true)
    window.addEventListener('showSignIn', handler)
    return ()=> window.removeEventListener('showSignIn', handler)
  }, [])

  const load = async () => {
    if(!token) return
    setLoading(true)
    try{
      const res = await api.list(token)
      setTasks(res.tasks || [])
    }catch(err){
      console.error(err)
    }finally{ setLoading(false) }
  }

  useEffect(()=>{ load() }, [token])

  // derive filtered list from tasks based on search query and filters
  const filteredTasks = React.useMemo(()=>{
    const q = (query || '').trim().toLowerCase()
    return tasks.filter(t => {
      if(filters.status === 'active' && t.completed) return false
      if(filters.status === 'completed' && !t.completed) return false
      if(filters.priority && filters.priority !== 'any' && (t.priority || '').toLowerCase() !== filters.priority) return false
      if(!q) return true
      return (t.title || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
    })
  }, [tasks, query, filters])

  const handleCreate = async (payload) => {
    try{
      setModalSaving(true)
      if(!token){
        setSignInOpen(true)
        setModalSaving(false)
        return
      }
      const res = await api.create(token, payload)
      setTasks(prev => [res.task, ...prev])
      // notify others to refresh counts
      window.dispatchEvent(new Event('tasksUpdated'))
      setModalOpen(false)
      setModalSaving(false)
      toast.success('Task created')
    }catch(err){
      setModalSaving(false)
      toast.error(err.message || 'Failed to create task')
    }
  }

  const handleCreateInline = async (e) => {
    e?.preventDefault()
    if(!createTitle) return
    if(!token){ setSignInOpen(true); return }
    await handleCreate({ title: createTitle, description: createDesc, dueDate: null })
    setCreateTitle('')
    setCreateDesc('')
  }

  const handleEditSave = async (payload) => {
    // editing contains the task being edited
    if(!editing || !editing._id){
      // fallback to create
      return handleCreate(payload)
    }
    try{
      setModalSaving(true)
      if(!token){ setSignInOpen(true); setModalSaving(false); return }
      const res = await api.update(token, editing._id, payload)
      setTasks(prev => prev.map(t => t._id === res.task._id ? res.task : t))
      window.dispatchEvent(new Event('tasksUpdated'))
      setModalOpen(false)
      setModalSaving(false)
      toast.success('Task updated')
    }catch(err){
      setModalSaving(false)
      toast.error(err.message || 'Failed to update task')
    }
  }

  const handleDeleted = (id) => setTasks(prev => prev.filter(t => t._id !== id))
  const handleUpdated = (updated) => setTasks(prev => prev.map(t => t._id === updated._id ? updated : t))
  // ensure counts reflect updates when tasks are modified via TaskCard
  React.useEffect(()=>{
    const origHandleDeleted = handleDeleted
    const origHandleUpdated = handleUpdated
    // when tasks array changes, dispatch update to refresh counts
    window.dispatchEvent(new Event('tasksUpdated'))
  }, [tasks])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="layout">
        <div className="main-pane">
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div>
                  <h2 className="text-xl font-semibold">{tasks.filter(t=>t.completed).length} task completed out of {tasks.length || 0}</h2>
                <div className="text-sm text-gray-500 mt-2">14 October , Tuesday</div>
                <CalendarStrip />
              </div>
                  <div className="w-1/3">
                    {/* Display signed-in user info */}
                    {user ? (
                      <div className="flex items-center justify-end gap-3">
                        <img src={user.avatar || `https://i.pravatar.cc/40?u=${user.email}`} alt="avatar" className="w-10 h-10 rounded-full" />
                        <div className="text-right">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-right text-sm text-gray-500">Not signed in</div>
                    )}
                  <div className="progress-bar" style={{width: `${tasks.length ? Math.round((tasks.filter(t=>t.completed).length/tasks.length)*100) : 0}%`}}></div>
                  <div className="text-right text-sm muted mt-2">Show: This week</div>
                </div>
            </div>
          </div>

          <div className="card mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recent</h3>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600 mr-2">Status:</div>
                <div className="filter-group">
                  {(() => {
                    const total = tasks.length || 0
                    const completedCount = tasks.filter(t=>t.completed).length
                    const activeCount = total - completedCount
                    return (
                      <>
                        <button className={`filter-pill ${filters.status==='all' ? 'active' : ''}`} onClick={()=>setFilters({...filters, status:'all'})}>
                          All <span className="count">{total}</span>
                        </button>
                        <button className={`filter-pill ${filters.status==='active' ? 'active' : ''}`} onClick={()=>setFilters({...filters, status:'active'})}>
                          Active <span className="count">{activeCount}</span>
                        </button>
                        <button className={`filter-pill ${filters.status==='completed' ? 'active' : ''}`} onClick={()=>setFilters({...filters, status:'completed'})}>
                          Completed <span className="count">{completedCount}</span>
                        </button>
                      </>
                    )
                  })()}
                </div>
                <select value={filters.priority} onChange={(e)=>setFilters({...filters, priority: e.target.value})} className="filter-select">
                  <option value="any">All priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
              {loading ? <div>Loading...</div> : filteredTasks.slice(0,6).map(t => (
                <TaskCard key={t._id} task={t} onDeleted={handleDeleted} onUpdated={handleUpdated} onEdit={(task)=>{ setEditing(task); setModalOpen(true); }} />
              ))}
              {filteredTasks.length === 0 && <div className="text-sm text-gray-500">No tasks match your search or filters.</div>}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-3">All Tasks</h3>
            <div className="space-y-3">
              {filteredTasks.map(t => (
                <TaskCard key={t._id} task={t} onDeleted={handleDeleted} onUpdated={handleUpdated} onEdit={(task)=>{ setEditing(task); setModalOpen(true); }} />
              ))}
            </div>
          </div>
        </div>

        <aside style={{width:360}}>
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Create New Card</h3>
              <button className="px-3 py-1" onClick={()=>{ setCreateInlineOpen(p=>!p) }}>{createInlineOpen ? '-' : '+'}</button>
            </div>
            <div className="mt-3">
              {createInlineOpen ? (
                <form onSubmit={handleCreateInline} className="create-panel space-y-3">
                  <textarea value={createTitle} onChange={e=>setCreateTitle(e.target.value)} placeholder="What is the task?" className="w-full p-3 border rounded-md" rows={3} required />
                  <input value={createDesc} onChange={e=>setCreateDesc(e.target.value)} placeholder="Notes (optional)" className="w-full p-2 border rounded-md" />
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <button type="button" className="tag-chip">Prototype</button>
                      <button type="button" className="tag-chip">UI Design</button>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <img src="https://i.pravatar.cc/32" alt="assignee" className="w-8 h-8 rounded-full" />
                    </div>
                  </div>
                  <div>
                    <button type="submit" className="w-full btn-primary">Done</button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-gray-500">Click + to open the inline create form.</p>
              )}
            </div>
          </div>
          <div className="card mb-4">
            <DailyActivityChart tasks={tasks} days={14} />
          </div>

          <div className="card">
            <h4 className="font-semibold">Tasks</h4>
            <div className="mt-4">
              <TasksChart tasks={tasks} />
            </div>
          </div>
        </aside>
      </div>
      <TaskModal isOpen={modalOpen} onRequestClose={()=>setModalOpen(false)} onSave={handleEditSave} initial={editing || {}} saving={modalSaving} />
      <SignInModal isOpen={signInOpen} onRequestClose={()=>setSignInOpen(false)} />
    </div>
  )
}

export default Dashboard
