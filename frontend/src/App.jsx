import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Login from './pages/Login'
import Progress from './pages/Progress'
import Collaboration from './pages/Collaboration'
import Notes from './pages/Notes'
import AcceptInvite from './pages/AcceptInvite'
import { useAuth } from './context/AuthContext'

const WelcomeScreen = () => (
  <div className="unauth-wrapper">
    <div className="unauth-card welcome-card">
      <div className="welcome-icon">👋</div>
      <h2>Welcome to Task Drive</h2>
      <p>Please sign in or create an account to access your tasks and collaborate with your team.</p>
    </div>
  </div>
)

const Unauthorized = () => (
  <div className="unauth-wrapper">
    <div className="unauth-card">
      <div className="unauth-badge">Restricted</div>
      <h2>Access restricted</h2>
      <p>You don't have permission to access this page.</p>
    </div>
  </div>
)

const Protected = ({ children, requireAuth = true }) => {
  const { token, isGuest } = useAuth()
  if (!token) {
    return isGuest ? <Unauthorized /> : <WelcomeScreen />
  }
  return children
}

const App = () => {
  const { isGuest } = useAuth()
  
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="flex">
        {!isGuest && <Sidebar />}

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
            <Route path="/progress" element={<Protected><Progress /></Protected>} />
            <Route path="/collaboration" element={<Protected><Collaboration /></Protected>} />
            <Route path="/notes" element={<Protected><Notes /></Protected>} />
            <Route path="/invite/accept/:token" element={<AcceptInvite />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
