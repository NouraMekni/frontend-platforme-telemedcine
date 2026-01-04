import React, { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import UserTable from '../../components/UserTable'
import { 
  Users, 
  UserCheck, 
  Stethoscope, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  RefreshCw,
  LayoutGrid
} from 'lucide-react'

const API_URL = 'http://localhost:8083/api/users'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_URL)
      if (response.ok) {
        const data = await response.json()
        setUsers(Array.isArray(data) ? data : [])
      } else if (response.status === 204) {
        setUsers([])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id))
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const handleSave = async (userData) => {
    try {
      const method = editingUser ? 'PUT' : 'POST'
      const url = editingUser ? `${API_URL}/${editingUser.id}` : API_URL
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (response.ok) {
        await fetchUsers()
        setShowModal(false)
        setEditingUser(null)
      } else {
        alert(`Erreur lors de la ${editingUser ? 'mise à jour' : 'création'}`)
      }
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  const filteredUsers = useMemo(() => {
    const search = searchTerm.toLowerCase()
    return users.filter(user => (
      (user.name?.toLowerCase().includes(search)) ||
      (user.prenom?.toLowerCase().includes(search)) ||
      (user.email?.toLowerCase().includes(search)) ||
      (user.role?.toLowerCase().includes(search))
    ))
  }, [users, searchTerm])

  const stats = {
    total: users.length,
    patients: users.filter(u => u.role === 'PATIENT').length,
    medecins: users.filter(u => u.role === 'MEDECIN').length,
    admins: users.filter(u => u.role === 'ADMIN').length
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto pb-10">
        
        {/* TOP HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-2">
              <LayoutGrid size={14} /> Administration Système
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Annuaire Utilisateurs
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Supervision et contrôle des accès multi-rôles.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchUsers}
              className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
              title="Rafraîchir"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              <UserPlus size={20} /> Nouveau Compte
            </button>
          </div>
        </div>

        {/* ANALYTICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Membres" 
            value={stats.total} 
            icon={<Users size={24} />} 
            gradient="from-blue-600 to-blue-800"
          />
          <StatCard 
            title="Patients" 
            value={stats.patients} 
            icon={<UserCheck size={24} />} 
            gradient="from-emerald-500 to-teal-700"
          />
          <StatCard 
            title="Corps Médical" 
            value={stats.medecins} 
            icon={<Stethoscope size={24} />} 
            gradient="from-indigo-500 to-purple-700"
          />
          <StatCard 
            title="Staff Admin" 
            value={stats.admins} 
            icon={<ShieldCheck size={24} />} 
            gradient="from-orange-500 to-red-600"
          />
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input
              className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3.5 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none font-medium"
              placeholder="Filtrer par nom, adresse email ou statut..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* TABLE CONTAINER */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <UserTable
            users={filteredUsers}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showModal={showModal}
            setShowModal={setShowModal}
            editingUser={editingUser}
            onSave={handleSave}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}

/**
 * Enhanced Stat Card with Gradient and Iconography
 */
function StatCard({ title, value, icon, gradient }) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10 hover:-translate-y-1 transition-transform duration-300`}>
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="bg-white/20 w-fit p-2.5 rounded-xl backdrop-blur-md mb-4">
          {icon}
        </div>
        <div>
          <div className="text-4xl font-black mb-1 leading-none">{value}</div>
          <div className="text-blue-50/80 text-sm font-bold uppercase tracking-wider">{title}</div>
        </div>
      </div>
      
      {/* Abstract Background Shape */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
    </div>
  )
}