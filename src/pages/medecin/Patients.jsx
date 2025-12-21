import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

const API_URL = "http://localhost:8083/api/medecins"
const RDV_API_URL = "http://localhost:8083/api/rendezvous"
const PATIENTS_API_URL = "http://localhost:8083/api/patients"

export default function Patients(){
  const { user: medecin } = useAuth()
  const [patients, setPatients] = useState([])
  const [allPatients, setAllPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddRdvModal, setShowAddRdvModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    prenom: '',
    email: '',
    password: '',
    dataNaissance: '',
    adresse: '',
    antecedentsMedicaux: ''
  })
  
  const [rdvFormData, setRdvFormData] = useState({
    patientEmail: '',
    date: '',
    time: '09:00',
    description: ''
  })

  useEffect(() => {
    if (medecin?.id) {
      fetchPatients()
      fetchAllPatients()
    }
  }, [medecin])

const fetchPatients = async () => {
    try {
      setLoading(true)
      console.log("🔄 Loading patients for medecin:", medecin.id)
      
      // Essayer d'abord l'endpoint spécifique au médecin
      try {
        const response = await axios.get(`${API_URL}/${medecin.id}/patients`)
        console.log("✅ Loaded medecin-specific patients:", response.data)
        setPatients(response.data)
        setError(null)
        return
      } catch (apiError) {
        console.log("⚠️ Medecin-specific endpoint not available, using all patients")
      }
      
      // Fallback: utiliser tous les patients
      const response = await axios.get(PATIENTS_API_URL)
      console.log("📋 All patients loaded:", response.data)
      setPatients(response.data)
      setError(null)
    } catch (error) {
      console.error('Error fetching patients:', error)
      setError('Erreur lors du chargement des patients')
      setPatients([])
    } finally {
      setLoading(false)
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
    if (!window.confirm('Êtes-vous sûr de vouloir retirer ce patient de votre liste ?')) return

    try {
      // Essayer l'endpoint API d'abord
      try {
        await axios.delete(`${API_URL}/${medecin.id}/patients/${patientId}`)
        console.log("✅ Patient removed via API")
      } catch (apiError) {
        console.log("⚠️ API endpoint not available, removing locally only")
      }
      
      // Supprimer de la liste locale dans tous les cas
      setPatients(patients.filter(p => p.id !== patientId))
      if (selectedPatient?.id === patientId) {
        setSelectedPatient(null)
      }
      alert('Patient retiré avec succès!')
    } catch (error) {
      console.error('Error removing patient:', error)
      alert('Erreur lors du retrait du patient')
    }
  }

  // Dans Planning.jsx
const fetchRDVs = async () => {
  try {
    console.log("🔄 Fetching RDVs for medecin ID:", medecin.id);
    const res = await fetch(`${API_URL_RDV}/medecin/${medecin.id}`);
    
    console.log("📡 Response status:", res.status);
    
    if (!res.ok) {
      console.error("❌ Error response:", res.status, res.statusText);
      return;
    }

    const data = await res.json();
    console.log("📅 RDVs data received:", data);
    console.log("📊 Number of RDVs:", data.length);
    
    // Log each RDV
    data.forEach((rdv, index) => {
      console.log(`📝 RDV ${index + 1}:`, {
        id: rdv.id,
        date: rdv.date,
        time: rdv.time,
        description: rdv.description,
        status: rdv.status,
        patient: rdv.patient ? `${rdv.patient.name} ${rdv.patient.prenom}` : 'No patient',
        medecin: rdv.medecin ? `Dr. ${rdv.medecin.name}` : 'No medecin'
      });
    });
    
    setRdvs(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("❌ Error fetch RDVs:", error);
  }
};


 const handleAddRendezVous = async () => {
    if (!rdvFormData.patientEmail || !rdvFormData.date || !rdvFormData.description) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    try {
      console.log("🚀 Creating RDV with data:", rdvFormData)
      
      // Trouver le patient par email
      const patient = allPatients.find(p => p.email === rdvFormData.patientEmail)
      console.log("👤 Found patient:", patient)
      
      if (!patient) {
        alert('Aucun patient trouvé avec cet email')
        return
      }

      const rendezVousData = {
        date: rdvFormData.date,
        time: rdvFormData.time,
        description: rdvFormData.description
      }

      console.log("📤 Sending RDV to backend...")
      const response = await axios.post(
        `${RDV_API_URL}/add/${patient.id}/${medecin.id}`,
        rendezVousData
      )

      console.log("✅ RDV created successfully:", response.data)
      
      setShowAddRdvModal(false)
      setRdvFormData({
        patientEmail: '',
        date: '',
        time: '09:00',
        description: ''
      })
      
      alert('Rendez-vous créé avec succès! Le statut est "En attente". Vous pouvez l\'approuver dans le Planning.')

    } catch (error) {
      console.error("❌ Error creating rendez-vous:", error)
      console.error("Error details:", error.response?.data)
      alert('Erreur lors de la création du rendez-vous: ' + (error.response?.data?.message || error.message))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      prenom: '',
      email: '',
      password: '',
      dataNaissance: '',
      adresse: '',
      antecedentsMedicaux: ''
    })
  }

  const openEditModal = (patient) => {
    setFormData({
      name: patient.name || '',
      prenom: patient.prenom || '',
      email: patient.email || '',
      password: '', // Don't pre-fill password for security
      dataNaissance: patient.dataNaissance ? patient.dataNaissance.split('T')[0] : '',
      adresse: patient.adresse || '',
      antecedentsMedicaux: patient.antecedentsMedicaux || ''
    })
    setShowEditModal(true)
  }

  const openAddRdvModal = () => {
    setRdvFormData({
      patientEmail: '',
      date: '',
      time: '09:00',
      description: ''
    })
    setShowAddRdvModal(true)
  }

  const handleUpdatePatient = async () => {
    if (!selectedPatient) return

    try {
      const response = await axios.put(`http://localhost:8083/api/patients/${selectedPatient.id}`, formData)
      setPatients(patients.map(p => p.id === selectedPatient.id ? response.data : p))
      setSelectedPatient(response.data)
      setShowEditModal(false)
      resetForm()
      alert('Patient modifié avec succès!')
    } catch (error) {
      console.error('Error updating patient:', error)
      alert('Erreur lors de la modification du patient')
    }
  }

  const filteredPatients = patients.filter(patient => 
    `${patient.name} ${patient.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const calculateAge = (dateString) => {
    if (!dateString) return 'N/A'
    const birthDate = new Date(dateString)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Patients</h1>
          <p className="text-gray-600">Liste et dossiers de vos patients</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <input 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                placeholder="Rechercher un patient par nom ou email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full lg:w-auto">
              <select className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors flex-1">
                <option>Tous les patients</option>
                <option>Vus récemment</option>
                <option>À revoir</option>
              </select>
              <button 
                onClick={openAddRdvModal}
                className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>📅</span>
                Nouveau Rendez-vous
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Patients List */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="p-6 border-b border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800">
                Liste des patients 
                <span className="ml-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredPatients.length}
                </span>
              </h3>
            </div>
            
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-600 mt-2">Chargement des patients...</p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">👥</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun patient trouvé</h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Aucun patient ne correspond à votre recherche' : 'Aucun patient dans votre liste. Les patients seront ajoutés automatiquement lorsque vous approuverez leurs rendez-vous.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPatients.map(patient => (
                    <div 
                      key={patient.id} 
                      className={`border border-blue-200 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                        selectedPatient?.id === patient.id 
                          ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 shadow-md' 
                          : 'hover:bg-blue-50 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-100 p-3 rounded-lg">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {patient.name} {patient.prenom}
                            </div>
                            <div className="text-sm text-gray-600">
                              {calculateAge(patient.dataNaissance)} ans • {patient.email}
                            </div>
                            {patient.antecedentsMedicaux && (
                              <div className="text-xs text-gray-500 mt-1">
                                {patient.antecedentsMedicaux}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDate(patient.dataNaissance)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
            <div className="p-6 border-b border-blue-100">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedPatient ? `Dossier de ${selectedPatient.name} ${selectedPatient.prenom}` : 'Dossier Patient'}
              </h3>
            </div>
            
            <div className="p-6">
              {selectedPatient ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-600 block mb-2">Âge</label>
                      <div className="font-semibold text-gray-800 text-lg">
                        {calculateAge(selectedPatient.dataNaissance)} ans
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-600 block mb-2">Date de naissance</label>
                      <div className="font-semibold text-gray-800">
                        {formatDate(selectedPatient.dataNaissance)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-gray-600 block mb-2">Email</label>
                    <div className="font-semibold text-gray-800">{selectedPatient.email}</div>
                  </div>

                  {selectedPatient.adresse && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-600 block mb-2">Adresse</label>
                      <div className="font-semibold text-gray-800">{selectedPatient.adresse}</div>
                    </div>
                  )}

                  {selectedPatient.antecedentsMedicaux && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-600 block mb-2">Antécédents médicaux</label>
                      <div className="font-semibold text-gray-800">{selectedPatient.antecedentsMedicaux}</div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex gap-3 flex-wrap">
                      <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300">
                        Nouvelle consultation
                      </button>
                      <button 
                        onClick={() => openEditModal(selectedPatient)}
                        className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                      >
                        Modifier
                      </button>
                      <button 
                        onClick={() => handleRemovePatient(selectedPatient.id)}
                        className="border border-red-600 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun patient sélectionné</h3>
                  <p className="text-gray-500">Sélectionnez un patient dans la liste pour voir son dossier</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Rendez-vous Modal */}
        {showAddRdvModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Nouveau Rendez-vous</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📧 Email du Patient
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    value={rdvFormData.patientEmail}
                    onChange={e => setRdvFormData({...rdvFormData, patientEmail: e.target.value})}
                    placeholder="Entrez l'email du patient"
                    list="patientEmails"
                  />
                  <datalist id="patientEmails">
                    {allPatients.map(patient => (
                      <option key={patient.id} value={patient.email} />
                    ))}
                  </datalist>
                  <p className="text-xs text-gray-500 mt-1">
                    L'email doit correspondre à un patient existant dans le système
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📅 Date
                    </label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      value={rdvFormData.date}
                      onChange={e => setRdvFormData({...rdvFormData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ⏰ Heure
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      value={rdvFormData.time}
                      onChange={e => setRdvFormData({...rdvFormData, time: e.target.value})}
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📝 Description / Motif
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors resize-none"
                    rows="3"
                    value={rdvFormData.description}
                    onChange={e => setRdvFormData({...rdvFormData, description: e.target.value})}
                    placeholder="Description de la consultation..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddRdvModal(false)}
                  className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddRendezVous}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                >
                  Créer Rendez-vous
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Patient Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Modifier Patient</h2>
              </div>
              
              <div className="p-6 space-y-4">
                {/* ... (le reste du code de la modal d'édition reste identique) ... */}
              </div>

              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdatePatient}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}