import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'

const API_BASE_URL = 'http://localhost:8083/api/reports' // adapte si ton port est différent

export default function Reports(){
  const [summary, setSummary] = useState({
    totalConsultations: 0,
    satisfactionRate: 0,
    avgDurationMinutes: 0,
    activeDoctors: 0,
  })

  const [monthlyData, setMonthlyData] = useState([])
  const [specialtyData, setSpecialtyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const moneyTND = useMemo(() => {
    return new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' })
  }, [])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)

        const [sumRes, monthlyRes, specRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/summary`),
          axios.get(`${API_BASE_URL}/monthly`, { params: { months: 5 } }),
          axios.get(`${API_BASE_URL}/specialties`),
        ])

        setSummary(sumRes.data || {})
        setMonthlyData(Array.isArray(monthlyRes.data) ? monthlyRes.data : [])
        setSpecialtyData(Array.isArray(specRes.data) ? specRes.data : [])
      } catch (e) {
        console.error('Reports load error:', e)
        // En cas d’erreur, on laisse juste 0 (page reste stable)
        setSummary({
          totalConsultations: 0,
          satisfactionRate: 0,
          avgDurationMinutes: 0,
          activeDoctors: 0,
        })
        setMonthlyData([])
        setSpecialtyData([{ name: 'Autres', value: 100, color: '#FF8042' }])
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const handleExportMonthly = async () => {
    try {
      setActionLoading(true)
      const res = await axios.get(`${API_BASE_URL}/export/monthly.csv`, {
        params: { months: 5 },
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'rapport_mensuel.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export error:', e)
      alert("Erreur lors de l'export.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleGenerateInvoices = async () => {
    try {
      setActionLoading(true)
      const res = await axios.post(`${API_BASE_URL}/generate-invoices`)
      alert(res.data?.message || 'Factures générées.')
    } catch (e) {
      console.error('Generate invoices error:', e)
      alert("Erreur génération factures.")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSatisfactionReport = async () => {
    try {
      setActionLoading(true)
      const res = await axios.get(`${API_BASE_URL}/satisfaction`)
      const rate = res.data?.satisfactionRate ?? 0
      alert(`Satisfaction: ${rate}%\n${res.data?.definition || ''}`)
    } catch (e) {
      console.error('Satisfaction error:', e)
      alert("Erreur rapport satisfaction.")
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Rapports & Statistiques</h1>
        <p className="text-sm text-slate-500">Analyse des performances de la plateforme</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">
            {loading ? '...' : summary.totalConsultations}
          </div>
          <div className="text-sm text-slate-500">Total consultations</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {loading ? '...' : `${summary.satisfactionRate}%`}
          </div>
          <div className="text-sm text-slate-500">Taux satisfaction</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {loading ? '...' : `${summary.avgDurationMinutes || 0}min`}
          </div>
          <div className="text-sm text-slate-500">Durée moyenne</div>
        </div>

        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">
            {loading ? '...' : summary.activeDoctors}
          </div>
          <div className="text-sm text-slate-500">Médecins actifs</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Évolution mensuelle</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === 'revenus') return moneyTND.format(Number(value || 0))
                    return value
                  }}
                />
                <Bar dataKey="consultations" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Répartition par spécialité</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={specialtyData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value}%)`}
                >
                  {specialtyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#FF8042'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Actions rapides</h3>
        <div className="flex gap-3">
          <button
            className="bg-primary-500 text-white px-4 py-2 rounded"
            onClick={handleExportMonthly}
            disabled={actionLoading}
          >
            Exporter rapport mensuel
          </button>

        

          <button
            className="border px-4 py-2 rounded"
            onClick={handleSatisfactionReport}
            disabled={actionLoading}
          >
            Rapport satisfaction
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}