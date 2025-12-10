import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { tasks as api } from '../api'

export default function useTaskCounts(){
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [counts, setCounts] = useState({ total:0, active:0, completed:0, overdue:0 })

  const load = useCallback(async ()=>{
    if(!token) { setCounts({ total:0, active:0, completed:0, overdue:0 }); return }
    setLoading(true)
    try{
      const res = await api.list(token)
      const list = res.tasks || []
      const total = list.length
      const completed = list.filter(t=>t.completed).length
      const active = total - completed
      const now = new Date()
      const overdue = list.filter(t=>t.dueDate && !t.completed && new Date(t.dueDate) < now).length
      setCounts({ total, active, completed, overdue })
    }catch(err){
      console.error('Failed to load task counts', err)
      setCounts({ total:0, active:0, completed:0, overdue:0 })
    }finally{ setLoading(false) }
  }, [token])

  useEffect(()=>{ load() }, [load])

  // listen for external reload requests (e.g., after create/update/delete)
  useEffect(()=>{
    const handler = () => { load() }
    window.addEventListener('tasksUpdated', handler)
    return () => window.removeEventListener('tasksUpdated', handler)
  }, [load])

  return { loading, ...counts, refresh: load }
}
