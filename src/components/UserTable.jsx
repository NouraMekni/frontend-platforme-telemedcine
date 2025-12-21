import React, { useState } from 'react'

export default function UserTable({ users = [], loading, onEdit, onDelete, showModal, setShowModal, editingUser, onSave }){
  const [formData, setFormData] = useState({
    name: '',
    prenom: '',
    email: '',
    password: '',
    role: 'PATIENT'
  })

  React.useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name || '',
        prenom: editingUser.prenom || '',
        email: editingUser.email || '',
        password: '',
        role: editingUser.role || 'PATIENT'
      })
    } else {
      setFormData({
        name: '',
        prenom: '',
        email: '',
        password: '',
        role: 'PATIENT'
      })
    }
  }, [editingUser, showModal])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name || !formData.prenom || !formData.email) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (!editingUser && !formData.password) {
      alert('Le mot de passe est requis pour créer un nouvel utilisateur')
      return
    }
    onSave(formData)
  }

  const getRoleLabel = (role) => {
    const labels = {
      'PATIENT': 'Patient',
      'MEDECIN': 'Médecin',
      'ADMIN': 'Admin'
    }
    return labels[role] || role
  }

  const getRoleColor = (role) => {
    const colors = {
      'PATIENT': 'bg-green-100 text-green-800',
      'MEDECIN': 'bg-blue-100 text-blue-800',
      'ADMIN': 'bg-orange-100 text-orange-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <>
      <div className="card">
        <h3 className="font-semibold mb-4">Utilisateurs</h3>
        {loading ? (
          <div className="text-center py-8">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-slate-500">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-slate-500 text-sm border-b">
                <tr>
                  <th className="py-3">#</th>
                  <th className="py-3">Nom</th>
                  <th className="py-3">Prénom</th>
                  <th className="py-3">Rôle</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b hover:bg-slate-50">
                    <td className="py-3">{u.id}</td>
                    <td className="py-3">{u.name || '-'}</td>
                    <td className="py-3">{u.prenom || '-'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs ${getRoleColor(u.role)}`}>
                        {getRoleLabel(u.role)}
                      </span>
                    </td>
                    <td className="py-3">{u.email || '-'}</td>
                    <td className="py-3">
                      <button 
                        onClick={() => onEdit(u)}
                        className="text-blue-600 hover:text-blue-800 text-sm mr-3"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => onDelete(u.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingUser ? 'Modifier utilisateur' : 'Ajouter utilisateur'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom *</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom *</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formData.prenom}
                    onChange={e => setFormData({...formData, prenom: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    className="w-full border rounded px-3 py-2"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rôle *</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    required
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="MEDECIN">Médecin</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mot de passe {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    className="w-full border rounded px-3 py-2"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    required={!editingUser}
                    placeholder={editingUser ? "Laisser vide pour ne pas changer" : ""}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex-1"
                >
                  {editingUser ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingUser(null)
                  }}
                  className="border px-4 py-2 rounded flex-1"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
