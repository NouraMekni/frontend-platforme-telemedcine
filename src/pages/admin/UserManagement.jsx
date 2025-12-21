import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import UserTable from '../../components/UserTable'

const API_URL = 'http://localhost:8083/api/users'

export default function UserManagement(){
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
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setUsers(users.filter(u => u.id !== id))
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Erreur lors de la suppression')
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
      if (editingUser) {
        // Update existing user
        const response = await fetch(`${API_URL}/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        })
        if (response.ok) {
          await fetchUsers()
          setShowModal(false)
          setEditingUser(null)
        } else {
          const errorText = await response.text()
          alert(errorText || 'Erreur lors de la mise à jour')
        }
      } else {
        // Create new user
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        })
        if (response.ok) {
          await fetchUsers()
          setShowModal(false)
        } else {
          const errorText = await response.text()
          alert(errorText || 'Erreur lors de la création')
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase()
    return (
      (user.name && user.name.toLowerCase().includes(search)) ||
      (user.prenom && user.prenom.toLowerCase().includes(search)) ||
      (user.email && user.email.toLowerCase().includes(search)) ||
      (user.role && user.role.toLowerCase().includes(search))
    )
  })

  const stats = {
    total: users.length,
    patients: users.filter(u => u.role === 'PATIENT').length,
    medecins: users.filter(u => u.role === 'MEDECIN').length,
    admins: users.filter(u => u.role === 'ADMIN').length
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Gestion des utilisateurs</h1>
        <p className="text-sm text-slate-500">Gérer les comptes patients et médecins</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
          <div className="text-sm text-slate-500">Total utilisateurs</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.patients}</div>
          <div className="text-sm text-slate-500">Patients</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.medecins}</div>
          <div className="text-sm text-slate-500">Médecins</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.admins}</div>
          <div className="text-sm text-slate-500">Administrateurs</div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button 
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Ajouter utilisateur
        </button>
        <input 
          className="border px-3 py-2 rounded flex-1 max-w-md" 
          placeholder="Rechercher un utilisateur..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      
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
    </DashboardLayout>
  )
}