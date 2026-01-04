import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { 
  Search, 
  Download, 
  Filter, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  FileText,
  TrendingUp
} from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'

const API_BASE_URL = 'http://localhost:8083/api/paiement'

const formatDT = (n) =>
  `${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(n || 0)} DT`

export default function AdminPayments() {
  const [paiements, setPaiements] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('TOUS')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const res = await axios.get(API_BASE_URL)
      setPaiements(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.error(e)
      setPaiements([])
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    let totalPaye = 0
    let totalAttente = 0
    paiements.forEach(p => {
      if (p.status === 'PAYE') totalPaye += p.montant || 0
      if (p.status === 'EN_ATTENTE') totalAttente += p.montant || 0
    })
    return { total: paiements.length, totalPaye, totalAttente }
  }, [paiements])

  const filtered = useMemo(() => {
    return paiements.filter(p => {
      const matchStatus = statusFilter === 'TOUS' ? true : p.status === statusFilter
      const q = search.toLowerCase()
      const text = `${p.id} ${p.patient?.name} ${p.patient?.prenom} ${p.status}`.toLowerCase()
      return matchStatus && text.includes(q)
    })
  }, [paiements, search, statusFilter])

  const downloadReceipt = (paiement) => {
    const content = `
REÇU DE PAIEMENT - TÉLÉMÉDECINE
==============================
Patient : ${paiement.patient?.name} ${paiement.patient?.prenom}
Email   : ${paiement.patient?.email}
Montant : ${paiement.montant} DT
Date    : ${paiement.datePaiement}
Statut  : ${paiement.status}
Réf     : PAIEMENT-${paiement.id}
© ${new Date().getFullYear()}
`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recu-paiement-${paiement.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Paiements & Factures</h1>
            <p className="text-slate-500 mt-1">Gérez et suivez les transactions financières de la plateforme.</p>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={18} /> Exporter Rapport
          </button>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard 
            title="Total paiements" 
            value={stats.total} 
            icon={<CreditCard className="text-blue-600" size={24} />}
            trend="Volume global"
            bgColor="bg-blue-50"
          />
          <StatCard 
            title="Total payé" 
            value={formatDT(stats.totalPaye)} 
            icon={<CheckCircle2 className="text-emerald-600" size={24} />}
            trend="Revenus encaissés"
            bgColor="bg-emerald-50"
          />
          <StatCard 
            title="En attente" 
            value={formatDT(stats.totalAttente)} 
            icon={<Clock className="text-amber-600" size={24} />}
            trend="À relancer"
            bgColor="bg-amber-50"
          />
        </div>

        {/* FILTERS AREA */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
              placeholder="Rechercher un patient ou une référence..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={18} className="text-slate-400 hidden md:block" />
            <select
              className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-48 cursor-pointer"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="PAYE">Payé</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Réf ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4 h-16 bg-slate-50/20"></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                      Aucune transaction trouvée pour cette recherche.
                    </td>
                  </tr>
                ) : (
                  filtered.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-slate-400">#PAI-{p.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">{p.patient?.name} {p.patient?.prenom}</span>
                          <span className="text-xs text-slate-400">{p.patient?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">
                        {formatDT(p.montant)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {p.datePaiement}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                          onClick={() => downloadReceipt(p)}
                        >
                          <FileText size={14} /> Facture
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

/* SUB-COMPONENTS */

function StatCard({ title, value, icon, trend, bgColor }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          <div className="mt-2 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <TrendingUp size={12} /> {trend}
          </div>
        </div>
        <div className={`p-3 rounded-xl ${bgColor}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const configs = {
    PAYE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    EN_ATTENTE: 'bg-amber-100 text-amber-700 border-amber-200',
    ANNULE: 'bg-rose-100 text-rose-700 border-rose-200',
    DEFAULT: 'bg-slate-100 text-slate-700 border-slate-200'
  }

  const config = configs[status] || configs.DEFAULT

  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${config}`}>
      {status}
    </span>
  )
}