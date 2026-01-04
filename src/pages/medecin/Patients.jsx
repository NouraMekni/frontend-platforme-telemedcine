import React, { useState, useEffect, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { 
  FileText, 
  Download, 
  Search, 
  Calendar, 
  User, 
  Mail, 
  MapPin, 
  FileSearch,
  ChevronRight,
  FolderOpen
} from 'lucide-react'

const API_URL = "http://localhost:8083/api/medecins"
const RDV_API_URL = "http://localhost:8083/api/rendezvous"
const PATIENTS_API_URL = "http://localhost:8083/api/patients"
const API_DOCS_URL = 'http://localhost:8083/api/dossier-medical'

export default function Patients() {
  const { user: medecin } = useAuth()
  const [patients, setPatients] = useState([])
  const [allPatients, setAllPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  
  // Document states
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddRdvModal, setShowAddRdvModal] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '', prenom: '', email: '', password: '',
    dataNaissance: '', adresse: '', antecedentsMedicaux: ''
  })
  
  const [rdvFormData, setRdvFormData] = useState({
    patientEmail: '', date: '', time: '09:00', description: ''
  })

  useEffect(() => {
    if (medecin?.id) {
      fetchPatients()
      fetchAllPatients()
    }
  }, [medecin])

  // Fetch documents when a patient is selected
  useEffect(() => {
    if (selectedPatient?.id) {
      fetchPatientDocuments(selectedPatient.id)
    }
  }, [selectedPatient])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      try {
        const response = await axios.get(`${API_URL}/${medecin.id}/patients`)
        setPatients(response.data)
      } catch (apiError) {
        const response = await axios.get(PATIENTS_API_URL)
        setPatients(response.data)
      }
    } catch (error) {
      setError('Erreur lors du chargement des patients')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientDocuments = async (patientId) => {
    try {
      setLoadingDocs(true)
      const res = await axios.get(`${API_DOCS_URL}/patient/${patientId}`)
      setDocuments(res.data || [])
    } catch (err) {
      console.error("Error fetching docs:", err)
      setDocuments([])
    } finally {
      setLoadingDocs(false)
    }
  }

  const handleDownload = async (doc) => {
    try {
      const fileToRequest = doc.generatedFileName || doc.fileName;
      const encodedFilename = encodeURIComponent(fileToRequest);
      const res = await axios.get(`${API_DOCS_URL}/files/${encodedFilename}`, { 
        responseType: 'blob' 
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName || "document.pdf"); 
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Erreur lors du téléchargement du fichier.");
    }
  }

  const fetchAllPatients = async () => {
    try {
      const response = await axios.get(PATIENTS_API_URL)
      setAllPatients(response.data)
    } catch (error) {
      console.error('Error fetching all patients:', error)
    }
  }

  const handleRemovePatient = async (patientId) => {
    if (!window.confirm('Retirer ce patient ?')) return
    try {
      try { await axios.delete(`${API_URL}/${medecin.id}/patients/${patientId}`) } catch (e) {}
      setPatients(patients.filter(p => p.id !== patientId))
      if (selectedPatient?.id === patientId) setSelectedPatient(null)
      alert('Patient retiré!')
    } catch (error) {
      alert('Erreur lors du retrait')
    }
  }

  const handleAddRendezVous = async () => {
    if (!rdvFormData.patientEmail || !rdvFormData.date) return alert('Champs requis')
    try {
      const patient = allPatients.find(p => p.email === rdvFormData.patientEmail)
      if (!patient) return alert('Patient non trouvé')
      await axios.post(`${RDV_API_URL}/add/${patient.id}/${medecin.id}`, {
        date: rdvFormData.date, time: rdvFormData.time, description: rdvFormData.description
      })
      setShowAddRdvModal(false)
      alert('RDV créé avec succès!')
    } catch (error) {
      alert('Erreur creation RDV')
    }
  }

  const openEditModal = (patient) => {
    setFormData({
      name: patient.name || '', prenom: patient.prenom || '', email: patient.email || '',
      password: '', dataNaissance: patient.dataNaissance ? patient.dataNaissance.split('T')[0] : '',
      adresse: patient.adresse || '', antecedentsMedicaux: patient.antecedentsMedicaux || ''
    })
    setShowEditModal(true)
  }

  const handleUpdatePatient = async () => {
    try {
      const response = await axios.put(`${PATIENTS_API_URL}/${selectedPatient.id}`, formData)
      setPatients(patients.map(p => p.id === selectedPatient.id ? response.data : p))
      setSelectedPatient(response.data)
      setShowEditModal(false)
      alert('Succès!')
    } catch (e) { alert('Erreur modification') }
  }

  const filteredPatients = patients.filter(p => 
    `${p.name} ${p.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A'
    const age = new Date().getFullYear() - new Date(dateString).getFullYear()
    return age
  }

  const timeSlots = Array.from({ length: 22 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8
    const min = i % 2 === 0 ? '00' : '30'
    return `${hour.toString().padStart(2, '0')}:${min}`
  })

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestion des Patients</h1>
            <p className="text-slate-500 mt-1">Consultez les dossiers et planifiez les consultations.</p>
          </div>
          <button 
            onClick={() => setShowAddRdvModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
          >
            <Calendar size={20} /> Nouveau RDV
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-4 mb-8 flex items-center gap-4">
          <Search className="text-slate-400 ml-2" size={20} />
          <input 
            className="flex-1 focus:outline-none text-slate-700 font-medium" 
            placeholder="Rechercher un patient par nom ou email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* PATIENTS LIST */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Patients ({filteredPatients.length})</h3>
            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {loading ? <div className="p-10 text-center animate-pulse text-slate-400">Chargement...</div> : 
               filteredPatients.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => setSelectedPatient(p)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer group ${
                    selectedPatient?.id === p.id ? 'bg-blue-600 border-blue-600 shadow-xl shadow-blue-100' : 'bg-white border-slate-100 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${selectedPatient?.id === p.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>
                      {p.name[0]}{p.prenom[0]}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold ${selectedPatient?.id === p.id ? 'text-white' : 'text-slate-800'}`}>{p.name} {p.prenom}</p>
                      <p className={`text-xs ${selectedPatient?.id === p.id ? 'text-blue-100' : 'text-slate-500'}`}>{p.email}</p>
                    </div>
                    <ChevronRight size={18} className={selectedPatient?.id === p.id ? 'text-white' : 'text-slate-300'} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PATIENT DOSSIER & DOCUMENTS */}
          <div className="lg:col-span-7">
            {selectedPatient ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* INFO CARD */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                  <div className="flex justify-between items-start mb-8">
                    <h2 className="text-2xl font-black text-slate-800">Dossier Médical</h2>
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(selectedPatient)} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors"><FileText size={20}/></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                       <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><User size={18}/></div>
                       <div><p className="text-[10px] uppercase font-black text-slate-400">Âge</p><p className="font-bold text-slate-700">{calculateAge(selectedPatient.dataNaissance)} ans</p></div>
                    </div>
                    <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl">
                       <div className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><Mail size={18}/></div>
                       <div className="overflow-hidden"><p className="text-[10px] uppercase font-black text-slate-400">Contact</p><p className="font-bold text-slate-700 truncate text-sm">{selectedPatient.email}</p></div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Antécédents</p>
                    <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-red-700 text-sm font-medium">
                      {selectedPatient.antecedentsMedicaux || "Aucun antécédent signalé."}
                    </div>
                  </div>

                  {/* DOCUMENTS SECTION */}
                  <div className="pt-8 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-black text-slate-800 flex items-center gap-2">
                        <FolderOpen className="text-blue-600" size={20}/> Documents ({documents.length})
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {loadingDocs ? <div className="text-center py-6 animate-pulse text-slate-400">Chargement des fichiers...</div> : 
                       documents.length === 0 ? (
                         <div className="text-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                           <FileSearch size={32} className="mx-auto text-slate-300 mb-2" />
                           <p className="text-slate-400 text-sm">Aucun document dans le dossier.</p>
                         </div>
                       ) : (
                         documents.map(doc => (
                           <div key={doc.id} className="group bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-all">
                             <div className="flex items-center gap-3">
                               <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                 <FileText size={20} />
                               </div>
                               <div>
                                 <p className="font-bold text-slate-700 text-sm truncate max-w-[200px]">{doc.title}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{doc.fileName}</p>
                               </div>
                             </div>
                             <button 
                               onClick={() => handleDownload(doc)}
                               className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                             >
                               <Download size={20} />
                             </button>
                           </div>
                         ))
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <User size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-400">Aucun patient sélectionné</h3>
                <p className="text-slate-300 max-w-xs mt-2 text-sm">Sélectionnez un patient à gauche pour consulter son dossier complet et ses documents médicaux.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RDV MODAL (Simplified Layout) */}
      {showAddRdvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddRdvModal(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">Nouveau RDV</h2>
              <button onClick={() => setShowAddRdvModal(false)}><X/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Email Patient</label>
                <input 
                  type="email" list="patientEmailsList" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                  onChange={e => setRdvFormData({...rdvFormData, patientEmail: e.target.value})}
                />
                <datalist id="patientEmailsList">
                   {allPatients.map(p => <option key={p.id} value={p.email} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Date</label>
                  <input type="date" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setRdvFormData({...rdvFormData, date: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Heure</label>
                  <select className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setRdvFormData({...rdvFormData, time: e.target.value})}>
                    {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Motif</label>
                <textarea rows="3" className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none" onChange={e => setRdvFormData({...rdvFormData, description: e.target.value})}/>
              </div>
              <button onClick={handleAddRendezVous} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 mt-4">Confirmer le RDV</button>
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </DashboardLayout>
  )
}