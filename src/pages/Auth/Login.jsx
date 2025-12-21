import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Navbar from '../../components/Navbar'

const API_URL = "http://localhost:8083/api/auth/login"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  // Changed default to match your backend/route naming: 'patient', 'medecin', or 'admin'
  const [role, setRole] = useState('patient') 
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Erreur de connexion')
      }

      const userData = await res.json()
      
      // Save session in AuthContext
      await login(userData)

      // REDIRECTION LOGIC - Matching your AppRoutes.js paths exactly
      const userRole = userData.role || role

      if (userRole === 'admin') {
        navigate('/admin/reports')
      } else if (userRole === 'medecin' || userRole === 'doctor') {
        navigate('/medecin/dashboard')
      } else {
        navigate('/patient/dashboard')
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* --- LEFT SIDE: Branding --- */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-cyan-700 items-center justify-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500"></div>
          <div className="relative z-10 p-16 text-white max-w-xl">
            <h1 className="text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Gestion <br />
              <span className="text-cyan-300">Administrative.</span>
            </h1>
            <p className="text-xl text-blue-50 opacity-90">
              Accédez au panneau de contrôle pour gérer les utilisateurs, les praticiens et les paramètres système.
            </p>
          </div>
        </div>

        {/* --- RIGHT: LOGIN FORM --- */}
        <main className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-slate-50">
          <div className="w-full max-w-[400px]">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bonjour !</h2>
              <p className="text-slate-500 mt-2 font-medium">Veuillez vous identifier pour continuer.</p>
            </div>

            {/* Role Switcher - Aligned with your Route logic */}
            <div className="flex p-1 bg-slate-200/50 rounded-2xl mb-8">
              {[
                { id: 'patient', label: 'Patient' },
                { id: 'medecin', label: 'Praticien' },
                { id: 'admin', label: 'Admin' }
              ].map((r) => (
                <button 
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${
                    role === r.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center">
                <span className="mr-3">⚠️</span> 
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={setEmail} 
                placeholder="admin@mail.com" 
                icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
              />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700">Mot de passe</label>
                </div>
                <InputField 
                  type="password" 
                  value={password} 
                  onChange={setPassword} 
                  placeholder="••••••••" 
                  icon="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl hover:bg-blue-700 transition-all disabled:opacity-70 flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Connexion...</span>
                  </div>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

function InputField({ label, type, value, onChange, placeholder, icon }) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
          </svg>
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  )
}