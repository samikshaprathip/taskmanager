import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { tasks as tasksApi } from '../api'
import TasksChart from '../components/TasksChart'
import DailyActivityChart from '../components/DailyActivityChart'

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2">
    <div className="text-sm text-gray-600">{label}</div>
    <div className="font-semibold">{value}</div>
  </div>
)

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
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Progress</h2>
            <div className="text-sm text-gray-500 mt-1">Overview of your task completion and daily activity</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Signed in as</div>
            <div className="font-medium">{user?.name || 'Guest'}</div>
            <div className="text-xs text-gray-400">{user?.email}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="col-span-1">
            <div className="bg-gray-50 p-4 rounded-md">
              <SummaryRow label="Total tasks" value={total} />
              <SummaryRow label="Completed" value={completed} />
              <SummaryRow label="Active" value={active} />
              <SummaryRow label="Overdue" value={overdue} />
            </div>
          </div>

          <div className="col-span-2">
            <div className="flex gap-4">
              <div className="w-1/2 bg-white p-4 rounded-md shadow-sm">
                <TasksChart tasks={tasks} />
              </div>
              <div className="w-1/2 bg-white p-4 rounded-md shadow-sm">
                <h4 className="font-semibold mb-2">Last 14 days</h4>
                <div style={{height:220}}>
                  <DailyActivityChart tasks={tasks} days={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
