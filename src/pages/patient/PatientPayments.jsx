import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../contexts/AuthContext'

const API_URL_PAIEMENT = "http://localhost:8083/api/paiement"
const API_URL_RDV = "http://localhost:8083/api/rendezvous"

export default function PatientPayments(){
  const { user: patient } = useAuth()
  const [activeTab, setActiveTab] = useState('pending')
  const [paiements, setPaiements] = useState([])
  const [rdvsEnAttente, setRdvsEnAttente] = useState([])
  const [loading, setLoading] = useState(true)
  const [montants, setMontants] = useState({})
  const [message, setMessage] = useState('')

  // Charger les paiements et rendez-vous
  useEffect(() => {
    if (!patient?.id) return
    
    fetchPaiements()
    fetchRdvsEnAttente()
  }, [patient])

  const fetchPaiements = async () => {
    try {
      const res = await fetch(`${API_URL_PAIEMENT}`)
      if (res.ok) {
        const data = await res.json()
        // Filtrer les paiements du patient connecté
        const paiementsPatient = Array.isArray(data) 
          ? data.filter(p => p.patient?.id === patient.id)
          : []
        setPaiements(paiementsPatient)
      } else {
        console.warn('Erreur lors du chargement des paiements:', res.status)
        setPaiements([])
      }
    } catch (error) {
      console.error('Erreur chargement paiements:', error)
      setPaiements([])
    }
  }

  const fetchRdvsEnAttente = async () => {
    try {
      const res = await fetch(`${API_URL_RDV}/patient/${patient.id}`)
      if (res.ok) {
        const data = await res.json()
        // Rendez-vous avec statut PENDING
        const rdvsSansPaiement = Array.isArray(data) 
          ? data.filter(rdv => rdv.status === 'PENDING')
          : []
        
        setRdvsEnAttente(rdvsSansPaiement)
        
        // Initialiser les montants pour chaque RDV
        const initialMontants = {}
        rdvsSansPaiement.forEach(rdv => {
          initialMontants[rdv.id] = ''
        })
        setMontants(initialMontants)
      }
    } catch (error) {
      console.error('Erreur chargement RDVs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Gérer le changement de montant pour un RDV spécifique
  const handleMontantChange = (rdvId, value) => {
    setMontants(prev => ({
      ...prev,
      [rdvId]: value
    }))
  }

  // Créer un nouveau paiement
  const handlePayment = async (rdv) => {
    const montant = montants[rdv.id]
    
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) {
      alert('Veuillez saisir un montant valide')
      return
    }

    const paiementData = {
      montant: parseFloat(montant),
      datePaiement: new Date().toISOString().split('T')[0],
      status: 'PAYE',
      factureURL: `/factures/facture-${Date.now()}.pdf`
    }

    try {
      const res = await fetch(`${API_URL_PAIEMENT}/add/${patient.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paiementData)
      })

      if (res.ok) {
        const nouveauPaiement = await res.json()
        
        // Mettre à jour le statut du rendez-vous
        await fetch(`${API_URL_RDV}/${rdv.id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'APPROVED' })
        })

        setMessage('✅ Paiement effectué avec succès ! Votre rendez-vous est confirmé.')
        
        // Réinitialiser le montant pour ce RDV
        setMontants(prev => ({
          ...prev,
          [rdv.id]: ''
        }))
        
        // Recharger les données
        fetchPaiements()
        fetchRdvsEnAttente()

        // Effacer le message après 5 secondes
        setTimeout(() => setMessage(''), 5000)
      } else {
        setMessage('❌ Erreur lors du paiement')
      }
    } catch (error) {
      console.error('Erreur paiement:', error)
      setMessage('❌ Erreur lors du paiement')
    }
  }

  // Télécharger le reçu
  const handleDownloadReceipt = (paiement) => {
    const receiptContent = `
      REÇU DE PAIEMENT - TÉLÉMÉDECINE
      ================================
      
      Informations Patient:
      --------------------
      Nom: ${patient.name} ${patient.prenom}
      Email: ${patient.email}
      
      Détails du Paiement:
      --------------------
      Montant: ${paiement.montant} DT
      Date: ${paiement.datePaiement}
      Statut: ${paiement.status}
      Référence: PAIEMENT-${paiement.id}
      
      Informations Médicales:
      -----------------------
      Ce paiement concerne une consultation de télémedecine.
      
      Merci pour votre confiance !
      
      © Plateforme Télémedecine ${new Date().getFullYear()}
    `
    
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recu-paiement-${paiement.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Calculer le total des paiements
  const totalPaiements = paiements.reduce((total, p) => total + (p.montant || 0), 0)

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <p>Chargement des paiements...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mes Paiements</h1>
        <p className="text-sm text-slate-500">Gestion de vos paiements de consultations</p>
      </div>

      {/* Message de confirmation */}
      {message && (
        <div className={`p-4 rounded mb-4 ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="flex gap-2 mb-6">
  <button
    className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white px-5 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-6"
    onClick={() => setActiveTab('pending')}
  >
    💳 À payer ({rdvsEnAttente.length})
  </button>
  <button
    className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white px-5 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-6"
    onClick={() => setActiveTab('history')}
  >
    📊 Historique ({paiements.length})
  </button>
</div>


      {activeTab === 'pending' && (
        <div className="card">
          <h3 className="font-semibold mb-4 text-orange-600">⚠️ Paiements en attente</h3>
          <div className="bg-orange-50 p-3 rounded mb-4">
            <p className="text-sm text-orange-800">
              <strong>Important :</strong> Le paiement est obligatoire pour confirmer votre rendez-vous.
              Veuillez saisir le montant convenu avec le médecin et procéder au paiement.
            </p>
          </div>
          
          {rdvsEnAttente.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-lg mb-2">🎉</p>
              <p>Aucun paiement en attente</p>
              <p className="text-sm mt-2">Tous vos rendez-vous sont confirmés ou payés</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rdvsEnAttente.map(rdv => (
                <div key={rdv.id} className="border border-orange-200 rounded p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600">👨‍⚕️</span>
                        </div>
                        <div>
                          <div className="font-medium">Dr. {rdv.medecin?.name} {rdv.medecin?.prenom}</div>
                          <div className="text-sm text-slate-500">{rdv.medecin?.specialte}</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-slate-600 space-y-1">
                        <div>📅 <strong>Date:</strong> {rdv.date} {rdv.time || ''}</div>
                        <div>📝 <strong>Motif:</strong> {rdv.description}</div>
                        <div>🔄 <strong>Statut:</strong> <span className="text-orange-600">En attente de paiement</span></div>
                      </div>
                    </div>

                    <div className="lg:text-right">
                      <div className="mb-3">
                        <label className="block text-sm text-slate-500 mb-1">
                          Montant (DT)
                        </label>
                        <input
                          type="number"
                          placeholder="Ex: 80"
                          className="w-32 border rounded px-3 py-2 text-center"
                          value={montants[rdv.id] || ''}
                          onChange={(e) => handleMontantChange(rdv.id, e.target.value)}
                          min="1"
                          step="0.5"
                        />
                      </div>
                      
                      <button 
                        className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        onClick={() => handlePayment(rdv)}
                        disabled={!montants[rdv.id] || isNaN(montants[rdv.id]) || parseFloat(montants[rdv.id]) <= 0}
                      >
                        💳 Payer maintenant
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <h3 className="font-semibold mb-4">Historique des paiements</h3>
          
          {paiements.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-lg mb-2">📊</p>
              <p>Aucun paiement effectué</p>
              <p className="text-sm mt-2">Vos paiements apparaitront ici après confirmation de rendez-vous</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-slate-500 text-sm border-b">
                    <tr>
                      <th className="py-3">Date paiement</th>
                      <th className="py-3">Montant</th>
                      <th className="py-3">Statut</th>
                      <th className="py-3">Référence</th>
                      <th className="py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paiements.map(paiement => (
                      <tr key={paiement.id} className="border-b hover:bg-slate-50">
                        <td className="py-3">{paiement.datePaiement}</td>
                        <td className="py-3 font-medium text-green-600">{paiement.montant} DT</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            paiement.status === 'PAYE' 
                              ? 'bg-green-100 text-green-800' 
                              : paiement.status === 'EN_ATTENTE'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {paiement.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-slate-500">PAIEMENT-{paiement.id}</td>
                        <td className="py-3">
                          <button 
                            className="text-primary-600 text-sm hover:underline flex items-center gap-1"
                            onClick={() => handleDownloadReceipt(paiement)}
                          >
                            📄 Reçu
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    Total payé : <strong className="text-lg text-green-600">{totalPaiements} DT</strong>
                  </div>
                  <button 
                    className="text-primary-600 text-sm border border-primary-300 rounded px-4 py-2 hover:bg-primary-50 transition-colors"
                    onClick={() => {
                      const allReceipts = paiements.map(p => `PAIEMENT-${p.id}: ${p.montant} DT (${p.datePaiement})`).join('\n')
                      const blob = new Blob([`RÉCAPITULATIF DES PAIEMENTS\n\n${allReceipts}\n\nTOTAL: ${totalPaiements} DT`], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `recapitulatif-paiements-${new Date().toISOString().split('T')[0]}.txt`
                      a.click()
                    }}
                  >
                    📊 Télécharger récapitulatif
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}