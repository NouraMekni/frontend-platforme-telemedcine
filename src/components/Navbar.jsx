import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Helper to highlight active links
  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo & Main Nav */}
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-800">
              Tele<span className="text-blue-600">Med</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" active={isActive('/')}>Accueil</NavLink>
            <NavLink to="/features" active={isActive('/features')}>Spécialités</NavLink>
            <NavLink to="/pricing" active={isActive('/pricing')}>Tarifs</NavLink>
          </div>
        </div>

        {/* Action Buttons / User Menu */}
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <button 
                className="hidden sm:block px-5 py-2.5 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                onClick={() => navigate('/login')}
              >
                Connexion
              </button>
              <button 
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-500/30 transition-all active:scale-95"
                onClick={() => navigate('/register')}
              >
                Inscription
              </button>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-1">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 border-2 border-white shadow-md flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <button 
                className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors group"
                onClick={logout}
                title="Déconnexion"
              >
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

// Internal NavLink helper for cleaner code
function NavLink({ to, children, active }) {
  return (
    <Link 
      to={to} 
      className={`text-sm font-bold transition-all relative py-2 ${
        active ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full animate-in fade-in zoom-in duration-300"></span>
      )}
    </Link>
  )
}