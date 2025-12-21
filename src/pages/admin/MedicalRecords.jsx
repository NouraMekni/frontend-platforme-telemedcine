import React, { useMemo, useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'

export default function MedicalRecords() {
  // ✅ patientId doit venir de l’auth normalement
  const patientId = 1

  const API_BASE_URL = 'http://localhost:8083/api/dossier-medical'
  const API_LIST_URL = `${API_BASE_URL}/patient/${patientId}`

  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [typeFilter, setTypeFilter] = useState('Tous les types')
  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    patient: '',
    medecin: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'Consultation',
    notes: ''
  })

  // Calcule l'ID suivant pour le fallback local
  const nextId = useMemo(
    () => (records.length ? Math.max(...records.map(r => r.id)) + 1 : 1),
    [records]
  )

  /**
   * ✅ CORRECTION CRITIQUE : Cette fonction transforme les objets complexes
   * renvoyés par le backend en chaînes de caractères affichables par React.
   */
  const mapApiToRecord = (d) => {
    // Extraction sécurisée du nom du Patient
    let patientDisplayName = '—';
    if (d.patient && typeof d.patient === 'object') {
      patientDisplayName = `${d.patient.name || ''} ${d.patient.prenom || ''}`.trim();
    } else {
      patientDisplayName = d.patientName || d.patient || '—';
    }

    // Extraction sécurisée du nom du Médecin
    let medecinDisplayName = '—';
    if (d.medecin && typeof d.medecin === 'object') {
      medecinDisplayName = `Dr. ${d.medecin.name || d.medecin.prenom || 'Anonyme'}`;
    } else {
      medecinDisplayName = d.medecin || '—';
    }

    return {
      id: d.id,
      patient: patientDisplayName,
      medecin: medecinDisplayName,
      date: d.date ? d.date.toString().slice(0, 10) : '',
      type: d.type || 'Consultation',
      notes: d.notes || ''
    }
  }

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const res = await fetch(API_LIST_URL)
      
      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`)
      }

      const raw = await res.json()
      // Gestion de différents formats de réponse possibles
      const list = Array.isArray(raw) ? raw : (raw?.data || raw?.dossiers || [])
      setRecords(list.map(mapApiToRecord))
    } catch (e) {
      console.error("Erreur lors de la récupération :", e)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const filteredRecords = useMemo(() => {
    const s = search.trim().toLowerCase()
    return records.filter(r => {
      const matchType = typeFilter === 'Tous les types' ? true : r.type === typeFilter

      // On transforme tout en texte pour la recherche
      const searchStr = `${r.patient} ${r.medecin} ${r.type} ${r.date}`.toLowerCase()
      const matchSearch = !s ? true : searchStr.includes(s)

      return matchType && matchSearch
    })
  }, [records, typeFilter, search])

  const resetForm = () => {
    setForm({
      patient: '',
      medecin: '',
      date: new Date().toISOString().slice(0, 10),
      type: 'Consultation',
      notes: ''
    })
    setEditingId(null)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.medecin.trim()) return

    try {
      const payload = {
        patientId, // On envoie l'ID au backend
        medecin: form.medecin.trim(),
        date: form.date,
        type: form.type,
        notes: form.notes
      }

      const url = editingId ? `${API_BASE_URL}/${editingId}` : API_BASE_URL
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        alert(errorData?.message || 'Erreur lors de l’enregistrement')
        return
      }

      await fetchRecords()
      setIsOpen(false)
      resetForm()
    } catch (err) {
      console.error(err)
      alert('Erreur réseau : Le serveur ne répond pas.')
    }
  }

  const onView = (record) => {
    alert(
      `Dossier #${record.id}\n\nPatient: ${record.patient}\nMédecin: ${record.medecin}\nDate: ${record.date}\nType: ${record.type}\n\nNotes: ${record.notes || '—'}`
    )
  }

  const onEdit = (record) => {
    setEditingId(record.id)
    setForm({
      patient: record.patient,
      medecin: record.medecin,
      date: record.date || new Date().toISOString().slice(0, 10),
      type: record.type || 'Consultation',
      notes: record.notes || ''
    })
    setIsOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dossiers médicaux</h1>
        <p className="text-sm text-slate-500">Gestion des dossiers et ordonnances</p>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => { resetForm(); setIsOpen(true) }}
          className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
        >
          Nouveau dossier
        </button>

        <select
          className="border px-3 py-2 rounded bg-white"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option>Tous les types</option>
          <option>Consultation</option>
          <option>Suivi</option>
          <option>Diagnostic</option>
          <option>Ordonnance</option>
        </select>

        <input
          className="border px-3 py-2 rounded flex-1 max-w-md focus:outline-primary-500"
          placeholder="Rechercher par patient, médecin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="card bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
              <tr>
                <th className="py-4 px-4 border-b">#</th>
                <th className="py-4 px-4 border-b">Patient</th>
                <th className="py-4 px-4 border-b">Médecin</th>
                <th className="py-4 px-4 border-b">Date</th>
                <th className="py-4 px-4 border-b">Type</th>
                <th className="py-4 px-4 border-b">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="py-10 text-center text-slate-500" colSpan={6}>Chargement des dossiers...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td className="py-10 text-center text-slate-500" colSpan={6}>Aucun dossier trouvé</td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">{record.id}</td>
                    <td className="py-3 px-4 font-medium">{record.patient}</td>
                    <td className="py-3 px-4">{record.medecin}</td>
                    <td className="py-3 px-4">{record.date}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {record.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => onView(record)} className="text-primary-600 hover:text-primary-800 text-sm font-medium mr-4">Voir</button>
                      <button onClick={() => onEdit(record)} className="text-slate-600 hover:text-slate-900 text-sm font-medium">Modifier</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALE DE FORMULAIRE */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setIsOpen(false); resetForm() }} />
          <div className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Modifier le dossier' : 'Créer un nouveau dossier'}</h3>
              <button onClick={() => { setIsOpen(false); resetForm() }} className="text-slate-400 hover:text-slate-600 text-2xl">✕</button>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Médecin</label>
                <input
                  value={form.medecin}
                  onChange={e => setForm(f => ({ ...f, medecin: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Ex: Dr. Martin (Cardiologie)"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date de consultation</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Type de dossier</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                  >
                    <option>Consultation</option>
                    <option>Suivi</option>
                    <option>Diagnostic</option>
                    <option>Ordonnance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Notes & Observations</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                  rows="4"
                  placeholder="Détails de la visite, symptômes, recommandations..."
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setIsOpen(false); resetForm() }} 
                  className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 rounded-lg bg-primary-500 text-white font-bold hover:bg-primary-600 shadow-lg shadow-primary-500/30"
                >
                  {editingId ? 'Mettre à jour' : 'Enregistrer le dossier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}