import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { tasks as tasksApi } from '../api'
import TasksChart from '../components/TasksChart'
import DailyActivityChart from '../components/DailyActivityChart'
import '../styles/progress.css'

export default function Progress(){
  const { token, user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    let mounted = true
    if(!token) return
    setLoading(true)
    tasksApi.list(token).then(res => {
      if(!mounted) return
      setTasks(res.tasks || [])
    }).catch(err => console.error(err)).finally(()=> mounted && setLoading(false))
    return ()=> mounted = false
  }, [token])

  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const active = total - completed
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed).length

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header with Title and User Info */}
      <div className="progress-header">
        <h1 className="text-4xl font-bold text-gray-900">Progress</h1>
        {user && (
          <div className="user-profile-header">
            <div>Signed in as</div>
            <div className="font-semibold">{user.name}</div>
            <div>{user.email}</div>
          </div>
        )}
      </div>

      {/* Responsive Grid Container */}
      <div className="progress-container">
        {/* Summary Card */}
        <div className="stat-card">
          <h3>Tasks Overview</h3>
          <div className="overview-list">
            <div className="overview-item">
              <span className="label">Total tasks</span>
              <span className="value">{total}</span>
            </div>
            <div className="overview-item">
              <span className="label">Completed</span>
              <span className="value">{completed}</span>
            </div>
            <div className="overview-item">
              <span className="label">Active</span>
              <span className="value">{active}</span>
            </div>
            <div className="overview-item">
              <span className="label">Overdue</span>
              <span className="value">{overdue}</span>
            </div>
          </div>
        </div>

        {/* Tasks Chart Card */}
        <div className="stat-card">
          <h3>Tasks</h3>
          <div className="chart-wrapper" style={{minHeight: '280px'}}>
            <TasksChart tasks={tasks} />
          </div>
        </div>

        {/* Daily Activity Card */}
        <div className="stat-card">
          <h3>Daily Activity (Last 14 days)</h3>
          <div className="chart-wrapper" style={{minHeight: '280px'}}>
            <DailyActivityChart tasks={tasks} days={14} />
          </div>
        </div>
      </div>
    </div>
  )
}
