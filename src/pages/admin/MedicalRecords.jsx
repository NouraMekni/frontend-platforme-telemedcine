import React, { useEffect, useState, useMemo } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'
import { 
  FileText, 
  Search, 
  Download, 
  Trash2, 
  User, 
  Mail, 
  X, 
  FolderOpen,
  ChevronRight,
  FileSearch,
  Users,
  Database
} from 'lucide-react'

const API_PATIENTS_URL = 'http://localhost:8083/api/patients'
const API_DOCS_URL = 'http://localhost:8083/api/dossier-medical'

export default function AdminMedicalDocuments() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loadingDocs, setLoadingDocs] = useState(false)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await axios.get(API_PATIENTS_URL)
      setPatients(res.data || [])
    } catch (err) {
      console.error("Error fetching patients:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocuments = async (patient) => {
    try {
      setLoadingDocs(true)
      setSelectedPatient(patient)
      const res = await axios.get(`${API_DOCS_URL}/patient/${patient.id}`)
      setDocuments(res.data || [])
    } catch (err) {
      console.error("Error fetching documents:", err)
      setDocuments([])
    } finally {
      setLoadingDocs(false)
    }
  }

  /* ===================== CORRECTED DOWNLOAD LOGIC ===================== */
  const handleDownload = async (doc) => {
    try {
      // 1. IMPORTANT: We must request the file using the GENERATED name
      // because that is what exists on the server's disk (e.g. doc_1_123.pdf)
      const fileToRequest = doc.generatedFileName || doc.fileName;
      
      if (!fileToRequest) {
        alert("Nom de fichier manquant.");
        return;
      }

      const encodedFilename = encodeURIComponent(fileToRequest);

      const res = await axios.get(`${API_DOCS_URL}/files/${encodedFilename}`, { 
        responseType: 'blob' 
      });

      // 2. Create blob and download link
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      
      // 3. We use the original human name for the user's local save
      link.setAttribute('download', doc.fileName || "document.pdf"); 
      
      document.body.appendChild(link);
      link.click();
      
      // 4. Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error details:", err);
      alert("Erreur: Le serveur ne trouve pas le fichier physique. Vérifiez le dossier 'uploads/medical' sur le serveur.");
    }
  }

  const handleDelete = async (docId) => {
    if (!confirm('Supprimer définitivement ce document médical ?')) return
    try {
      await axios.delete(`${API_DOCS_URL}/${docId}`)
      setDocuments(prev => prev.filter(d => d.id !== docId))
    } catch (err) {
      console.error("Delete error:", err);
      alert("Erreur de suppression");
    }
  }

  useEffect(() => { fetchPatients() }, [])

  const filteredPatients = useMemo(() => {
    return patients.filter(p => 
      `${p.prenom || ''} ${p.name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [patients, searchTerm])

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#F8FAFC] pb-12">
        {/* HERO SECTION */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-8 py-12 rounded-b-[3rem] shadow-2xl mb-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-white">
              <div className="flex items-center gap-2 bg-blue-400/20 w-fit px-3 py-1 rounded-full text-blue-100 text-xs font-bold uppercase tracking-wider mb-4">
                <Database size={14} /> Cloud Médical
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">Archives Patients</h1>
              <p className="text-blue-100/80 mt-2 text-lg">Gérez les dossiers médicaux en toute sécurité.</p>
            </div>
            
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Rechercher par nom ou email..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl text-white placeholder:text-blue-200 focus:bg-white focus:text-slate-900 focus:ring-4 focus:ring-blue-500/30 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-bold text-slate-800">
                <Users className="text-blue-600" size={20} /> Liste des Patients
              </h2>
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {filteredPatients.length} enregistrements
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-slate-400 text-xs font-bold uppercase tracking-widest border-b border-slate-50">
                    <th className="px-8 py-5">Identité</th>
                    <th className="px-8 py-5">Coordonnées</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={3} className="h-24 px-8">
                          <div className="bg-slate-100 h-12 rounded-xl"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-10 text-center text-slate-400">Aucun patient trouvé.</td>
                    </tr>
                  ) : filteredPatients.map((p, index) => (
                    <tr key={p.id || index} className="group hover:bg-blue-50/50 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-black shadow-inner">
                            {(p.prenom?.[0] || '')}{(p.name?.[0] || '')}
                          </div>
                          <div>
                            <p className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{p.prenom} {p.name}</p>
                            <p className="text-xs text-slate-400 font-medium">ID: #PAT-{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-500 font-medium">
                          <Mail size={16} className="text-blue-400" /> {p.email}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => fetchDocuments(p)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center gap-2 ml-auto"
                        >
                          Dossier <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FILE EXPLORER MODAL */}
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in" onClick={() => setSelectedPatient(null)} />
            
            <div className="relative bg-white w-full max-w-4xl h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-blue-600 p-8 text-white flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-3">
                    <FileSearch size={28} /> {selectedPatient.prenom} {selectedPatient.name}
                  </h3>
                  <p className="text-blue-100 mt-1 opacity-80">Consultation des pièces médicales</p>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {loadingDocs ? (
                  <div className="h-full flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400 font-bold animate-pulse">Chargement...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <FolderOpen size={48} className="text-slate-200 mb-4" />
                    <h4 className="text-slate-800 font-bold text-xl">Dossier vide</h4>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {documents.map((doc, idx) => (
                      <div key={doc.id || idx} className="group relative bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-200 p-5 rounded-3xl transition-all hover:shadow-xl">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 bg-white group-hover:bg-blue-600 rounded-2xl text-blue-600 group-hover:text-white transition-colors">
                            <FileText size={24} />
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleDownload(doc)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors" title="Télécharger">
                              <Download size={20} />
                            </button>
                            <button onClick={() => handleDelete(doc.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Supprimer">
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                        <h5 className="font-black text-slate-800 truncate pr-4">{doc.title || "Sans titre"}</h5>
                        <p className="text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter truncate">
                          {doc.fileName}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center px-10">
                <p className="text-xs text-slate-400 font-bold italic">Accès sécurisé</p>
                <button onClick={() => setSelectedPatient(null)} className="px-8 py-3 bg-slate-800 text-white rounded-2xl text-sm font-black transition-all shadow-lg">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
        `}
      </style>
    </DashboardLayout>
  )
}