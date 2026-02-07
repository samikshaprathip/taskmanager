import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, LogOut, User, Menu, X } from 'lucide-react'
import Avatar from './Avatar'
import { useSearch } from '../context/SearchContext'
import useTaskCounts from '../hooks/useTaskCounts'
import SignInModal from './SignInModal'
import RegisterModal from './RegisterModal'
import ProfileModal from './ProfileModal'

const Navbar = () => {
    const [open, setOpen] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const location = useLocation()

    const { user, logout, isGuest, isPreview } = useAuth()
    const navigate = useNavigate()
    const [profileOpen, setProfileOpen] = useState(false)
    const [signInOpen, setSignInOpen] = useState(false)
    const [registerOpen, setRegisterOpen] = useState(false)
    const { query: searchQuery, setQuery: setSearchQuery } = useSearch()
    const countsHook = useTaskCounts()
    const counts = countsHook || { total:0, active:0, completed:0, overdue:0 }
    
    const isDashboard = location.pathname === '/'
    
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen)
        // Dispatch custom event for sidebar toggle
        window.dispatchEvent(new CustomEvent('toggleMobileSidebar'))
    }

        return (
                        <header className="navbar">
                                <div className="app-container flex items-center justify-between">
                                    <div className="nav-left">
                                        {!isGuest && (
                                            <button 
                                                onClick={toggleMobileMenu} 
                                                className="mobile-menu-btn md:hidden"
                                                aria-label="Toggle menu"
                                            >
                                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                            </button>
                                        )}
                                        <Link to="/" className="flex items-center gap-3 no-underline">
                                            <div className="app-logo">TD</div>
                                            <div className="app-title">Task Drive</div>
                                        </Link>
                                        {isDashboard && (
                                            <div className="search-input flex items-center gap-2">
                                                <Search size={16} className="text-gray-400" />
                                                <input value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} className="bg-transparent outline-none" placeholder="Search tasks" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">

                                        {user ? (
                                            <div className="flex items-center gap-8">
                                                <button onClick={()=>setProfileOpen(true)} className="profile-btn">
                                                    <div className="profile-btn-icon">
                                                        <User size={18} />
                                                    </div>
                                                    <div className="text-sm">
                                                        <div className="font-medium text-gray-800">{user.name}</div>
                                                    </div>
                                                </button>
                                                {isPreview && (
                                                    <span className="preview-badge">Preview</span>
                                                )}
                                                <button
                                                    onClick={logout}
                                                    className="logout-btn"
                                                >
                                                    <LogOut size={18} />
                                                    <span>{isPreview ? 'Exit Preview' : 'Logout'}</span>
                                                </button>
                                                <ProfileModal isOpen={profileOpen} onRequestClose={()=>setProfileOpen(false)} />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                {!isGuest && (
                                                    <>
                                                        <button onClick={()=>setSignInOpen(true)} className="signin-btn">Sign In</button>
                                                        <button onClick={()=>setRegisterOpen(true)} className="register-btn">Sign Up</button>
                                                        <SignInModal isOpen={signInOpen} onRequestClose={()=>setSignInOpen(false)} onOpenRegister={()=>{setSignInOpen(false);setRegisterOpen(true)}} />
                                                        <RegisterModal isOpen={registerOpen} onRequestClose={()=>setRegisterOpen(false)} onOpenSignIn={()=>{ setRegisterOpen(false); setSignInOpen(true); }} />
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                        </header>
        )
}

export default Navbar
