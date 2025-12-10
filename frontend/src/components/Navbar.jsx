import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, Bell } from 'lucide-react'
import { useSearch } from '../context/SearchContext'
import useTaskCounts from '../hooks/useTaskCounts'
import SignInModal from './SignInModal'
import RegisterModal from './RegisterModal'
import ProfileModal from './ProfileModal'

const Navbar = () => {
    const [open, setOpen] = useState(false)

    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [profileOpen, setProfileOpen] = useState(false)
    const [signInOpen, setSignInOpen] = useState(false)
    const [registerOpen, setRegisterOpen] = useState(false)
    const { query: searchQuery, setQuery: setSearchQuery } = useSearch()
    const countsHook = useTaskCounts()
    const counts = countsHook || { total:0, active:0, completed:0, overdue:0 }

        return (
                        <header className="navbar">
                                <div className="app-container flex items-center justify-between">
                                    <div className="nav-left">
                                        <Link to="/" className="flex items-center gap-3 no-underline">
                                            <div className="app-logo">TD</div>
                                            <div className="app-title">Task Drive</div>
                                        </Link>
                                        <div className="search-input flex items-center gap-2">
                                            <Search size={16} className="text-gray-400" />
                                            <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} className="bg-transparent outline-none" placeholder="Search tasks" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button className="notif-button" aria-label="Notifications" onClick={()=>{ /* placeholder for notification center */ }}>
                                            <Bell size={18} className="text-gray-600" />
                                            {counts && counts.overdue > 0 ? <span className="notif-badge">{counts.overdue}</span> : null}
                                        </button>

                                        {user ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <button onClick={()=>setProfileOpen(p=>!p)} className="profile-btn">
                                                            <img src={user.avatar || `https://i.pravatar.cc/40?u=${user.email}`} alt="avatar" className="w-8 h-8 rounded-full" />
                                                            <div className="text-sm">
                                                                <div className="font-medium text-gray-800">{user.name}</div>
                                                            </div>
                                                        </button>

                                                        {profileOpen && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded p-2 z-50">
                                                                    <button onClick={()=>{ setProfileOpen(false); setProfileOpen(true) }} className="w-full text-left px-2 py-1">My profile</button>
                                                                    <button onClick={()=>{ logout(); navigate('/login') }} className="w-full text-left px-2 py-1">Logout</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <ProfileModal isOpen={profileOpen} onRequestClose={()=>setProfileOpen(false)} />
                                                </div>
                                        ) : (
                                                <div className="flex items-center gap-2">
                                                        <button onClick={()=>setRegisterOpen(true)} className="px-3 py-1 btn-ghost">Sign Up</button>
                                                        <button onClick={()=>setSignInOpen(true)} className="px-3 py-1 btn-primary">Sign In</button>
                                                        <SignInModal isOpen={signInOpen} onRequestClose={()=>setSignInOpen(false)} />
                                                        <RegisterModal isOpen={registerOpen} onRequestClose={()=>setRegisterOpen(false)} />
                                                </div>
                                        )}
                                    </div>
                                </div>
                        </header>
        )
}

export default Navbar
