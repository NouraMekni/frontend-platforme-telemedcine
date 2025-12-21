import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

// ⚠️ Mets le bon port de Spring Boot ici
const API_BASE_URL = 'http://localhost:8083/api/paiement'

function formatDT(value) {
  const n = Number(value)
  if (Number.isNaN(n)) return '0,00 DT'
  return `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)} DT`
}

function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10)
  return d.toISOString().slice(0, 10)
}

function normalizeStatus(status) {
  if (!status) return 'En attente'
  const s = String(status).toLowerCase()
  if (s.includes('pay')) return 'Payé'
  if (s.includes('ann')) return 'Annulé'
  if (s.includes('att') || s.includes('pend')) return 'En attente'
  return status
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const [statusFilter, setStatusFilter] = useState('Tous les statuts')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const res = await axios.get(API_BASE_URL)
        console.log('GET /api/paiement =>', res.status, res.data)
        setPayments(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        console.error('Erreur GET paiements:', e)
        console.log('status:', e?.response?.status)
        console.log('data:', e?.response?.data)
        setPayments([])
        alert("Impossible de charger les paiements (vérifie CORS/URL/port).")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  // Mapping backend -> UI (compatible DTO: patientNomComplet)
  const uiPayments = useMemo(() => {
    return payments.map((p) => ({
      id: p?.id,
      patient: p?.patientNomComplet || (p?.patientId ? `Patient #${p.patientId}` : '—'),
      montant: formatDT(p?.montant),
      date: formatDate(p?.datePaiement),
      statut: normalizeStatus(p?.status),
      _raw: p,
    }))
  }, [payments])

  // Filtre + recherche
  const filteredPayments = useMemo(() => {
    const q = query.trim().toLowerCase()
    return uiPayments.filter((p) => {
      const matchStatus =
        statusFilter === 'Tous les statuts' ? true : p.statut === statusFilter

      const matchQuery = !q
        ? true
        : [String(p.id), p.patient, p.montant, p.date, p.statut]
            .some((x) => String(x).toLowerCase().includes(q))

      return matchStatus && matchQuery
    })
  }, [uiPayments, statusFilter, query])

  // Stats (cartes)
  const stats = useMemo(() => {
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    let revenusMois = 0
    let enAttente = 0

    payments.forEach((p) => {
      const amount = Number(p?.montant ?? 0) || 0
      const st = normalizeStatus(p?.status)
      const d = new Date(p?.datePaiement)

      const isThisMonth =
        !Number.isNaN(d.getTime()) && d.getMonth() === month && d.getFullYear() === year

      if (isThisMonth && st === 'Payé') revenusMois += amount
      if (st === 'En attente') enAttente += amount
    })

    return {
      revenusMois: formatDT(revenusMois),
      enAttente: formatDT(enAttente),
      transactions: payments.length,
    }
  }, [payments])

  // Ajouter paiement (sans changer UI => prompt)
  const handleNewInvoice = async () => {
    try {
      const patientIdStr = window.prompt('Patient ID ?', '1')
      if (!patientIdStr) return
      const patientId = Number(patientIdStr)
      if (Number.isNaN(patientId)) return alert('Patient ID invalide')

      const montantStr = window.prompt('Montant (ex: 65) ?', '65')
      if (!montantStr) return
      const montant = Number(montantStr.replace(',', '.'))
      if (Number.isNaN(montant)) return alert('Montant invalide')

      // Tu stockes dans DB: PAYE (comme ta capture)
      const status =
        window.prompt('Statut (PAYE / EN_ATTENTE / ANNULE) ?', 'PAYE') || 'PAYE'

      const datePaiement =
        window.prompt('Date paiement (YYYY-MM-DD) ?', new Date().toISOString().slice(0, 10)) ||
        new Date().toISOString().slice(0, 10)

      const payload = { montant, status, datePaiement }

      const res = await axios.post(`${API_BASE_URL}/add/${patientId}`, payload)

      setPayments((prev) => [res.data, ...prev])
      alert('Paiement ajouté ✅')
    } catch (e) {
      console.error('Erreur add paiement:', e)
      alert("Erreur lors de l'ajout ❌")
    }
  }

  const handleView = (payment) => {
    const raw = payment._raw || {}
    alert(
      `Paiement #${payment.id}\nPatient: ${payment.patient}\nMontant: ${payment.montant}\nDate: ${payment.date}\nStatut: ${payment.statut}\nFactureURL: ${raw.factureURL || ''}`
    )
  }

  const handleEdit = async (payment) => {
    try {
      const id = payment._raw?.id ?? payment.id

      const newMontantStr = window.prompt('Nouveau montant ?', String(payment._raw?.montant ?? ''))
      if (newMontantStr === null) return

      const newStatus = window.prompt(
        'Nouveau statut (PAYE / EN_ATTENTE / ANNULE) ?',
        String(payment._raw?.status ?? 'PAYE')
      )
      if (newStatus === null) return

      const newDate = window.prompt('Nouvelle date (YYYY-MM-DD) ?', String(payment.date ?? ''))
      if (newDate === null) return

      const payload = {}
      if (newMontantStr !== '') {
        const v = Number(String(newMontantStr).replace(',', '.'))
        if (!Number.isNaN(v)) payload.montant = v
      }
      if (newStatus) payload.status = newStatus
      if (newDate) payload.datePaiement = newDate

      await axios.patch(`${API_BASE_URL}/${id}`, payload)

      // Recharger pour être sûr
      const res = await axios.get(API_BASE_URL)
      setPayments(Array.isArray(res.data) ? res.data : [])

      alert('Paiement modifié ✅')
    } catch (e) {
      console.error('Erreur update paiement:', e)
      alert('Erreur modification ❌')
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Paiements & Factures</h1>
        <p className="text-sm text-slate-500">Gestion des transactions financières</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.revenusMois}</div>
          <div className="text-sm text-slate-500">Revenus ce mois</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.enAttente}</div>
          <div className="text-sm text-slate-500">En attente</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.transactions}</div>
          <div className="text-sm text-slate-500">Transactions</div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className="bg-primary-500 text-white px-4 py-2 rounded"
          onClick={handleNewInvoice}
        >
          Nouvelle facture
        </button>

        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>Tous les statuts</option>
          <option>Payé</option>
          <option>En attente</option>
          <option>Annulé</option>
        </select>

        <input
          className="border px-3 py-2 rounded flex-1 max-w-md"
          placeholder="Rechercher une transaction..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-slate-500 text-sm border-b">
              <tr>
                <th className="py-3">#</th>
                <th className="py-3">Patient</th>
                <th className="py-3">Montant</th>
                <th className="py-3">Date</th>
                <th className="py-3">Statut</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr className="border-b">
                  <td className="py-4 text-slate-500" colSpan={6}>
                    Chargement...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr className="border-b">
                  <td className="py-4 text-slate-500" colSpan={6}>
                    Aucun paiement trouvé.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-slate-50">
                    <td className="py-3">{payment.id}</td>
                    <td className="py-3">{payment.patient}</td>
                    <td className="py-3 font-medium">{payment.montant}</td>
                    <td className="py-3">{payment.date}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          payment.statut === 'Payé'
                            ? 'bg-green-100 text-green-800'
                            : payment.statut === 'Annulé'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {payment.statut}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        className="text-primary-600 text-sm mr-3"
                        onClick={() => handleView(payment)}
                      >
                        Voir
                      </button>
                      <button
                        className="text-slate-600 text-sm"
                        onClick={() => handleEdit(payment)}
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}