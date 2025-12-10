import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Login from './pages/Login'
import Progress from './pages/Progress'
import Collaboration from './pages/Collaboration'
import AcceptInvite from './pages/AcceptInvite'

const App = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/collaboration" element={<Collaboration />} />
              <Route path="/invite/accept/:token" element={<AcceptInvite />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
