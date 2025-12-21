import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Navbar from '../../components/Navbar'

const API_URL = "http://localhost:8083/api/auth/login"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('patient') // 'patient' or 'doctor'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

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
      login(userData)
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
      
         {/* --- LEFT SIDE: Telemedicine Branding --- */}
<div className="hidden lg:flex lg:w-1/2 relative bg-cyan-700 items-center justify-center overflow-hidden">
  {/* Modern Medical Gradient & Patterns */}
  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500"></div>
  
  {/* Abstract "Cell" or "Pulse" Decorations */}
  <div className="absolute w-[600px] h-[600px] border border-white/10 rounded-full -top-10 -left-10 animate-[spin_20s_linear_infinite]"></div>
  <div className="absolute w-[400px] h-[400px] border border-white/5 rounded-full top-20 left-20 animate-[spin_15s_linear_infinite_reverse]"></div>
  
  <div className="relative z-10 p-16 text-white max-w-xl">
    {/* Medical Icon / Badge */}
    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm font-medium mb-8 backdrop-blur-md">
      <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
      <span>Plateforme sécurisée HDS</span>
    </div>

    <h1 className="text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
      La santé à <br />
      <span className="text-cyan-300">portée de clic.</span>
    </h1>
    
    <p className="text-xl text-blue-50 leading-relaxed mb-10 opacity-90">
      Consultez vos médecins en vidéo, recevez vos ordonnances en ligne et gérez votre santé en toute confidentialité.
    </p>

    {/* Feature List for Trust */}
    <div className="grid grid-cols-1 gap-4 mb-10">
      {[
        { title: 'Prise de RDV 24h/7j', icon: '📅' },
        { title: 'Médecins conventionnés', icon: '🩺' },
        { title: 'Données protégées', icon: '🛡️' }
      ].map((item, idx) => (
        <div key={idx} className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
          <span className="text-2xl">{item.icon}</span>
          <span className="font-semibold text-blue-50">{item.title}</span>
        </div>
      ))}
    </div>

    <div className="flex items-center space-x-4 pt-6 border-t border-white/10">
      <div className="flex -space-x-3">
        {[1, 2, 3].map((i) => (
          <img 
            key={i} 
            src={`https://i.pravatar.cc/100?img=${i+10}`} 
            className="w-12 h-12 rounded-full border-4 border-blue-700 shadow-lg"
            alt="Doctor profile"
          />
        ))}
      </div>
      <p className="text-sm text-blue-100 italic">
        "Plus de <span className="font-bold text-white">500 médecins</span> disponibles pour vous accompagner."
      </p>
    </div>
  </div>
</div>

        {/* --- RIGHT: LOGIN FORM --- */}
        <main className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 bg-slate-50">
          <div className="w-full max-w-[400px]">
            {/* Header */}
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bonjour !</h2>
              <p className="text-slate-500 mt-2 font-medium">Veuillez vous identifier pour continuer.</p>
            </div>

            {/* Role Switcher */}
            <div className="flex p-1 bg-slate-200/50 rounded-2xl mb-8">
              <button 
                onClick={() => setRole('patient')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Patient
              </button>
              <button 
                onClick={() => setRole('doctor')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${role === 'doctor' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Praticien
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium flex items-center animate-shake">
                <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <InputField 
                label="Email" 
                type="email" 
                value={email} 
                onChange={setEmail} 
                placeholder="votre@email.com" 
                icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"
              />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-bold text-slate-700">Mot de passe</label>
                  <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">Oublié ?</a>
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
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:shadow-blue-500/40 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authentification...</span>
                  </div>
                ) : (
                  <span>Se connecter</span>
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-slate-500 font-medium">
              Nouveau sur la plateforme ?{' '}
              <a href="/register" className="text-blue-600 font-bold hover:underline underline-offset-4 decoration-2">
                Créer un compte
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

// Internal Helper Component for Input Fields
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
          className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  )
}