import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AdminHeader(){
  const { user } = useAuth()
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold">Bienvenue, {user?.name || 'Administrateur'}</h1>
        <p className="text-sm text-slate-500">Rôle : {user?.role}</p>
      </div>
      <div className="flex gap-3 items-center">
        <div className="text-sm p-2 bg-slate-50 rounded">Paramètres</div>
      </div>
    </header>
  )
}
