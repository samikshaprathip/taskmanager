import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Home, ClipboardList, BarChart2, Users, MessageSquare, Settings } from 'lucide-react'
import useTaskCounts from '../hooks/useTaskCounts'
import MobileAppModal from './MobileAppModal'

const Sidebar = () => {
  const { user, loading } = useAuth()
  const counts = useTaskCounts()
  const total = counts.total || 0
  const completed = counts.completed || 0
  const pct = total ? Math.round((completed/total)*100) : 0
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <aside className="sidebar px-6">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full avatar-border overflow-hidden"><img src={user?.avatar || `https://i.pravatar.cc/64?u=${user?.email || 'guest'}`} alt="avatar" className="w-full h-full object-cover" /></div>
          <div>
            <div className="text-sm font-semibold text-white">{loading ? 'Signing in...' : (user ? user.name : 'Guest User')}</div>
            <div className="text-xs text-white mt-1">Progress: {pct}%</div>
            <div className="w-36 bg-white/20 rounded-full mt-2" style={{height:8}}>
              <div style={{width:`${pct}%`, height:8, borderRadius:999, background: 'linear-gradient(90deg,#00a3ff,#00d2ff)'}}></div>
            </div>
          </div>
        </div>

      

        <nav className="flex flex-col mt-2 gap-3">
          <Link to="/" className="sidebar-link px-3 py-2 rounded-md"><Home size={16} /> <span className="ml-2">Dashboard</span></Link>
          <Link to="/tasks" className="sidebar-link px-3 py-2 rounded-md"><ClipboardList size={16} /> <span className="ml-2">Tasks</span> <span className="ml-auto small-badge">{counts.total || 0}</span></Link>
          <Link to="/progress" className="sidebar-link px-3 py-2 rounded-md"><BarChart2 size={16} /> <span className="ml-2">Progress</span></Link>
          <Link to="/collaboration" className="sidebar-link px-3 py-2 rounded-md"><Users size={16} /> <span className="ml-2">Collaboration</span></Link>
          <Link to="/chat" className="sidebar-link px-3 py-2 rounded-md"><MessageSquare size={16} /> <span className="ml-2">Chat</span> <span className="ml-auto small-badge">6</span></Link>
        </nav>

        <div className="mt-2">
          <button onClick={()=>setMobileOpen(true)} className="w-full btn-primary">Get Mobile App</button>
          <MobileAppModal isOpen={mobileOpen} onRequestClose={()=>setMobileOpen(false)} />
        </div>

        <div className="text-sm text-white mt-2 flex items-center gap-2"><Settings size={14} /> Settings</div>
      </div>
    </aside>
  )
}

export default Sidebar
