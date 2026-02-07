import React, { useEffect, useState } from 'react'
import TaskCard from '../components/TaskCard'
import { useAuth } from '../context/AuthContext'
import { tasks as api } from '../api'

const Tasks = () => {
  const { token } = useAuth()
  const [tasks, setTasks] = useState([])

  const filterPersonal = (list = []) => list.filter(t => !t.project)

  const load = async () => {
    if(!token) return
    const res = await api.list(token)
    setTasks(filterPersonal(res.tasks || []))
  }

  useEffect(()=>{ load() }, [token])

  const handleDeleted = (id) => setTasks(prev => prev.filter(t => t._id !== id))
  const handleUpdated = (updated) => setTasks(prev => prev.map(t => t._id === updated._id ? updated : t))

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Tasks</h2>
      <p className="text-gray-500 text-sm mb-6">Manage and track your personal tasks</p>
      <div className="space-y-3">
        {tasks.map(t => <TaskCard key={t._id} task={t} onDeleted={handleDeleted} onUpdated={handleUpdated} />)}
      </div>
    </div>
  )
}

export default Tasks
