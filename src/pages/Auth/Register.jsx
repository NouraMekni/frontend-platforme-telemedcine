import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../contexts/AuthContext'

const API_URL = 'http://localhost:8083/api/users'

export default function Register() {
  const [name, setName] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('PATIENT')
  
  const [dateNaissance, setDateNaissance] = useState('')
  const [adresse, setAdresse] = useState('')
  const [antecedentsMedicaux, setAntecedentsMedicaux] = useState('')
  const [specialte, setSpecialte] = useState('')
  const [disponibilite, setDisponibilite] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsLoading(true)
    try {
      const userData = {
        name, prenom, email, password, role,
        ...(role === 'PATIENT' && { dateNaissance, adresse, antecedentsMedicaux }),
        ...(role === 'MEDECIN' && { specialte, disponibilite })
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Erreur lors de l'inscription")
      }

      const savedUser = await response.json()
      login({
        name: savedUser.name || name,
        role: savedUser.role?.toLowerCase() || role.toLowerCase(),
        id: savedUser.id
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-blue-100">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* --- LEFT SIDE: Branding (Same as Login for brand consistency) --- */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-cyan-700 items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500"></div>
          <div className="absolute w-[600px] h-[600px] border border-white/10 rounded-full -top-10 -left-10 animate-[spin_20s_linear_infinite]"></div>
          
          <div className="relative z-10 p-16 text-white max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm font-medium mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Rejoignez l'avenir du soin</span>
            </div>

            <h1 className="text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Créez votre <br />
              <span className="text-cyan-300">espace santé.</span>
            </h1>
            
            <p className="text-xl text-blue-50 leading-relaxed mb-10 opacity-90">
              Une inscription rapide pour un accès illimité à nos experts de santé.
            </p>

            <div className="grid grid-cols-1 gap-4">
              <FeatureItem icon="🛡️" text="Confidentialité totale des données" />
              <FeatureItem icon="⚡" text="Installation en moins de 2 minutes" />
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: Register Form (Scrollable) --- */}
        <main className="w-full lg:w-1/2 flex flex-col items-center bg-slate-50 overflow-y-auto pt-12 pb-20">
          <div className="w-full max-w-[500px] px-8">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Inscription</h2>
              <p className="text-slate-500 mt-2 font-medium">Choisissez votre profil pour commencer.</p>
            </div>

            {/* Role Switcher */}
            <div className="flex p-1 bg-slate-200/50 rounded-2xl mb-10">
              <button 
                onClick={() => setRole('PATIENT')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'PATIENT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Patient
              </button>
              <button 
                onClick={() => setRole('MEDECIN')}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${role === 'MEDECIN' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Médecin / Praticien
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Prénom" value={prenom} onChange={setPrenom} placeholder="Jean" />
                <InputField label="Nom" value={name} onChange={setName} placeholder="Dupont" />
              </div>

              <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="jean@exemple.fr" icon="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />

              {/* Dynamic Fields based on Role */}
              {role === 'PATIENT' ? (
                <div className="space-y-5 animate-fadeIn">
                  <InputField label="Date de naissance" type="date" value={dateNaissance} onChange={setDateNaissance} />
                  <InputField label="Adresse" value={adresse} onChange={setAdresse} placeholder="123 Rue de la Santé, Paris" icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Antécédents médicaux (Optionnel)</label>
                    <textarea 
                      value={antecedentsMedicaux} 
                      onChange={e => setAntecedentsMedicaux(e.target.value)}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none min-h-[100px]"
                      placeholder="Allergies, traitements en cours..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-fadeIn">
                  <InputField label="Spécialité" value={specialte} onChange={setSpecialte} placeholder="Cardiologue, Généraliste..." icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  <InputField label="Disponibilité" value={disponibilite} onChange={setDisponibilite} placeholder="Lundi au Vendredi, 9h-18h" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <InputField label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                <InputField label="Confirmation" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/25 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Créer mon compte sécurisé</span>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-slate-500 font-medium">
              Déjà inscrit ?{' '}
              <a href="/login" className="text-blue-600 font-bold hover:underline underline-offset-4 decoration-2">
                Se connecter
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}

// Reusable Components
function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center space-x-3 bg-white/5 p-3 rounded-2xl border border-white/10">
      <span className="text-2xl">{icon}</span>
      <span className="font-semibold text-blue-50">{text}</span>
    </div>
  )
}

function InputField({ label, type = 'text', value, onChange, placeholder, icon }) {
  return (
    <div className="space-y-2 flex-1">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
            </svg>
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`block w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none placeholder:text-slate-300`}
          placeholder={placeholder}
          required
        />
      </div>
    </div>
  )
}