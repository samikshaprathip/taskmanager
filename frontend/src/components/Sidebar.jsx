import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, ClipboardList, BarChart2, Users, FileText } from 'lucide-react'
import Avatar from './Avatar'
import useTaskCounts from '../hooks/useTaskCounts'

const Sidebar = () => {
  const { user, loading } = useAuth()
  const counts = useTaskCounts()
  const total = counts.total || 0
  const completed = counts.completed || 0
  const pct = total ? Math.round((completed/total)*100) : 0
  
  const [isOpen, setIsOpen] = useState(false)
  
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev)
    }
    
    window.addEventListener('toggleMobileSidebar', handleToggle)
    return () => window.removeEventListener('toggleMobileSidebar', handleToggle)
  }, [])
  
  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={closeSidebar}
      />
      
      <aside className={`sidebar px-6 ${isOpen ? 'open' : ''}`}>
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <Avatar size={56} className="avatar-border" src={user?.avatar} name={user?.name} />
            <div>
              <div className="text-sm font-semibold text-white">{loading ? 'Signing in...' : (user ? user.name : 'Guest User')}</div>
              <div className="text-xs text-white mt-1">Progress: {pct}%</div>
              <div className="w-36 bg-white/20 rounded-full mt-2" style={{height:8}}>
                <div style={{width:`${pct}%`, height:8, borderRadius:999, background: 'linear-gradient(90deg,#00a3ff,#00d2ff)'}}></div>
              </div>
            </div>
          </div>

        

          <nav className="flex flex-col mt-2 gap-3">
            <Link to="/" className="sidebar-link px-3 py-2 rounded-md" onClick={closeSidebar}><Home size={16} /> <span className="ml-2">Dashboard</span></Link>
            <Link to="/tasks" className="sidebar-link px-3 py-2 rounded-md" onClick={closeSidebar}><ClipboardList size={16} /> <span className="ml-2">Tasks</span> <span className="ml-auto small-badge">{counts.personal || 0}</span></Link>
            <Link to="/progress" className="sidebar-link px-3 py-2 rounded-md" onClick={closeSidebar}><BarChart2 size={16} /> <span className="ml-2">Progress</span></Link>
            <Link to="/collaboration" className="sidebar-link px-3 py-2 rounded-md" onClick={closeSidebar}><Users size={16} /> <span className="ml-2">Collaboration</span></Link>
            <Link to="/notes" className="sidebar-link px-3 py-2 rounded-md" onClick={closeSidebar}><FileText size={16} /> <span className="ml-2">Notes</span></Link>
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
