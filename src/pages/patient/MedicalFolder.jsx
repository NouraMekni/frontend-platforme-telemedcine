import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

const API_BASE_URL = 'http://localhost:8083/api/dossier-medical'
const API_PATIENTS_URL = 'http://localhost:8083/api/patients'

export default function MedicalFolder(){
  const { user: patient } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    file: null
  })
  const [message, setMessage] = useState('')
  const [patientInfo, setPatientInfo] = useState(null)
  const [loadingPatient, setLoadingPatient] = useState(false)

  // Fetch patient information
  const fetchPatientInfo = async () => {
    if (!patient?.id) return
    
    setLoadingPatient(true)
    try {
      const response = await axios.get(`${API_PATIENTS_URL}/${patient.id}`)
      setPatientInfo(response.data)
    } catch (error) {
      console.error('Error fetching patient information:', error)
      setMessage('❌ Erreur lors du chargement des informations personnelles')
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setLoadingPatient(false)
    }
  }

  // Fetch documents from backend
  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/patient/${patient.id}`)
      setDocuments(response.data)
    } catch (error) {
      console.error('Error fetching documents:', error)
      setMessage('❌ Erreur lors du chargement des documents')
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Upload document
  const handleUpload = async (e) => {
    e.preventDefault()
    if (!newDocument.file || !newDocument.title) {
      setMessage('❌ Veuillez remplir le titre et sélectionner un fichier')
      setTimeout(() => setMessage(''), 5000)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('patientId', patient.id)
      formData.append('title', newDocument.title)
      formData.append('description', newDocument.description)
      formData.append('file', newDocument.file)

      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Refresh documents list
      await fetchDocuments()
      setShowUploadModal(false)
      setNewDocument({ title: '', description: '', file: null })
      setMessage('✅ Document uploadé avec succès!')
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      console.error('Error uploading document:', error)
      setMessage('❌ Erreur lors de l\'upload du document')
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setUploading(false)
    }
  }

  // Delete document
  const handleDelete = async (documentId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document?')) return

    try {
      await axios.delete(`${API_BASE_URL}/${documentId}`)
      setDocuments(documents.filter(doc => doc.id !== documentId))
      setMessage('✅ Document supprimé avec succès!')
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      console.error('Error deleting document:', error)
      setMessage('❌ Erreur lors de la suppression du document')
      setTimeout(() => setMessage(''), 5000)
    }
  }

  // Download document
  const handleDownload = async (document) => {
    try {
      console.log('Starting download for document:', document);
      
      // Extract filename from fileUrl or use fileName
      const filename = document.fileUrl 
        ? document.fileUrl.substring(document.fileUrl.lastIndexOf('/') + 1)
        : document.fileName;

      console.log('Downloading file:', filename);
      console.log('Full URL:', `${API_BASE_URL}/files/${filename}`);

      const response = await axios.get(`${API_BASE_URL}/files/${filename}`, {
        responseType: 'blob',
        timeout: 30000
      });
      
      // Check if response contains data
      if (!response.data || response.data.size === 0) {
        throw new Error('No file data received or empty file');
      }

      // Create blob URL
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Create and trigger download
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName || filename;
      link.style.display = 'none';
      
      window.document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      setMessage('✅ Téléchargement réussi!')
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('Error downloading document:', error);
      
      if (error.response) {
        if (error.response.status === 404) {
          setMessage('❌ Fichier non trouvé sur le serveur');
        } else if (error.response.status === 500) {
          setMessage('❌ Erreur interne du serveur');
        } else {
          setMessage(`❌ Erreur serveur: ${error.response.status}`);
        }
      } else if (error.request) {
        setMessage('❌ Impossible de se connecter au serveur');
      } else {
        setMessage('❌ Erreur lors du téléchargement du document');
      }
      setTimeout(() => setMessage(''), 5000);
    }
  };

  // Calculate total storage used
  const totalStorageUsed = documents.reduce((total, doc) => total + (doc.fileSize || 0), 0)

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  // Calculate age from birth date
  const calculateAge = (dateString) => {
    if (!dateString) return 'Non spécifié';
    try {
      const birthDate = new Date(dateString);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return `${age} ans`;
    } catch (error) {
      return 'Non spécifié';
    }
  }

  // Load data when component mounts or tab changes
  useEffect(() => {
    if (activeTab === 'documents') {
      fetchDocuments()
    } else if (activeTab === 'info') {
      fetchPatientInfo()
    }
  }, [activeTab, patient])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mon Dossier Médical</h1>
        <p className="text-sm text-slate-500">Accès à votre historique et informations médicales</p>
      </div>

      {/* Message de confirmation */}
      {message && (
        <div className={`p-4 rounded mb-4 ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <button 
          className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform ${
            activeTab === 'info' 
              ? 'bg-gradient-to-r from-blue-400 to-blue-700 text-white shadow-xl -translate-y-0.5' 
              : 'border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:-translate-y-0.5'
          }`}
          onClick={() => setActiveTab('info')}
        >
          Informations personnelles
        </button>
        <button 
          className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform ${
            activeTab === 'history' 
              ? 'bg-gradient-to-r from-blue-400 to-blue-700 text-white shadow-xl -translate-y-0.5' 
              : 'border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:-translate-y-0.5'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Historique médical
        </button>
        <button 
          className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 transform ${
            activeTab === 'documents' 
              ? 'bg-gradient-to-r from-blue-400 to-blue-700 text-white shadow-xl -translate-y-0.5' 
              : 'border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:-translate-y-0.5'
          }`}
          onClick={() => setActiveTab('documents')}
        >
          Documents ({documents.length})
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="card bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-6 text-primary-600 flex items-center gap-2">
            <span>👤</span>
            Informations Personnelles
          </h3>
          
          {loadingPatient ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-600">Chargement des informations...</p>
            </div>
          ) : patientInfo ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Informations de base */}
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <span>📋</span>
                    Informations de Base
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nom complet:</span>
                      <span className="font-medium">
                        {patientInfo.prenom} {patientInfo.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium text-blue-600">{patientInfo.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Âge:</span>
                      <span className="font-medium">{calculateAge(patientInfo.dataNaissance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Date de naissance:</span>
                      <span className="font-medium">{formatDate(patientInfo.dataNaissance)}</span>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                {patientInfo.adresse && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <span>🏠</span>
                      Contact
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-600 mt-1">📍</span>
                        <div>
                          <span className="text-sm text-gray-600 block">Adresse:</span>
                          <span className="font-medium">{patientInfo.adresse}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Antécédents Médicaux */}
              <div className="space-y-6">
                {patientInfo.antecedentsMedicaux ? (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <span>🩺</span>
                      Antécédents Médicaux
                    </h4>
                    <div className="bg-white rounded p-3 border border-orange-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {patientInfo.antecedentsMedicaux}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">📝</div>
                    <p className="text-gray-600 mb-2">Aucun antécédent médical renseigné</p>
                    <p className="text-sm text-gray-500">
                      Contactez votre médecin pour mettre à jour vos antécédents
                    </p>
                  </div>
                )}

                {/* Informations du compte */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <span>🔐</span>
                    Informations du Compte
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Patient:</span>
                      <span className="font-mono bg-purple-100 px-2 py-1 rounded">
                        {patientInfo.id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rôle:</span>
                      <span className="font-medium capitalize">
                        {patientInfo.role?.toLowerCase() || 'Patient'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Statut:</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Actif
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <div className="text-6xl mb-4">❌</div>
              <p className="text-lg mb-2">Impossible de charger les informations</p>
              <p className="text-sm">Veuillez réessayer plus tard</p>
              <button 
                onClick={fetchPatientInfo}
                className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto mt-4"
              >
                🔄 Réessayer
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-4 text-primary-600">📊 Historique Médical</h3>
          <div className="text-center py-12 text-slate-500">
            <div className="text-6xl mb-4">🩺</div>
            <p className="text-lg mb-2">Section en développement</p>
            <p className="text-sm">Votre historique médical sera disponible prochainement</p>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Header with Stats */}
          <div className="card bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-primary-650">📁 Mes documents médicaux</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {documents.length} document(s) • {(totalStorageUsed / 1024 / 1024).toFixed(2)} MB utilisés
                </p>
              </div>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>+</span>
                <span>Ajouter un document</span>
              </button>
            </div>
          </div>

          {/* Documents List */}
          {loading ? (
            <div className="card bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-600">Chargement des documents...</p>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="card bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center py-8 text-slate-500">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-lg mb-2">Aucun document uploadé</p>
                <p className="text-sm mb-4">Commencez par ajouter votre premier document médical</p>
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                >
                  <span>+</span>
                  <span>Ajouter votre premier document</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="card bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 text-lg">
                        {doc.fileName?.includes('.pdf') ? '📄' : 
                         doc.fileName?.includes('.jpg') || doc.fileName?.includes('.png') ? '🖼️' : 
                         doc.fileName?.includes('.doc') ? '📝' : '📎'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
                        title="Télécharger"
                      >
                        📥
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{doc.title}</h4>
                    <p className="text-sm text-slate-500 mb-2">
                      📅 {new Date(doc.uploadDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {doc.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{doc.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 pt-3 border-t border-gray-100">
                    <span className="font-medium truncate max-w-[120px]">
                      {doc.fileName}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-primary-600">📤 Ajouter un document médical</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUpload}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Titre *</label>
                  <input
                    type="text"
                    required
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Ex: Ordonnance du 15/10/2024"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                  <textarea
                    value={newDocument.description}
                    onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    rows="3"
                    placeholder="Description du document..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Fichier *</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setNewDocument({...newDocument, file: e.target.files[0]})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    📎 Formats acceptés: PDF, JPG, PNG, DOC (Max: 10MB)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={uploading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Upload...</span>
                    </>
                  ) : (
                    <>
                      <span>📤</span>
                      <span>Uploader</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}