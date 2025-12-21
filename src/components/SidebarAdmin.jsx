import React from 'react'
import { Link } from 'react-router-dom'

export default function SidebarAdmin(){
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden md:block">
      <div className="text-xl font-semibold text-primary-600 mb-6">Admin</div>
      <nav className="flex flex-col gap-2 text-sm">
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/admin/dashboard">Tableau de bord</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/admin/users">Utilisateurs</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/admin/medical-records">Dossiers médicaux</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/admin/payments">Paiements</Link>
        <Link className="px-3 py-2 rounded hover:bg-slate-50" to="/admin/reports">Rapports</Link>
      </nav>
    </aside>
  )
}
