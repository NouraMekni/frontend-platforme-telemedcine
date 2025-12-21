import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const medicaments = [
  { name: 'Paracétamol', dosage: '500mg', type: 'Antalgique' },
  { name: 'Ibuprofène', dosage: '200mg', type: 'Anti-inflammatoire' },
  { name: 'Amoxicilline', dosage: '1g', type: 'Antibiotique' },
  { name: 'Metformine', dosage: '850mg', type: 'Antidiabétique' },
  { name: 'Atorvastatine', dosage: '20mg', type: 'Hypolipémiant' },
]

const samplePrescriptions = [
  { 
    id: 1, 
    patient: 'Amina Ben Salah', 
    date: '2024-10-24', 
    medicaments: ['Paracétamol 500mg', 'Ibuprofène 200mg'],
    status: 'Active'
  },
  { 
    id: 2, 
    patient: 'Mohamed Kharrat', 
    date: '2024-10-20', 
    medicaments: ['Metformine 850mg'],
    status: 'Terminée'
  },
]

export default function Prescriptions(){
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedMeds, setSelectedMeds] = useState([])
  const [searchMed, setSearchMed] = useState('')

  const filteredMeds = medicaments.filter(med => 
    med.name.toLowerCase().includes(searchMed.toLowerCase())
  )

  const addMedication = (med) => {
    if (!selectedMeds.find(m => m.name === med.name)) {
      setSelectedMeds([...selectedMeds, { ...med, posologie: '', duree: '' }])
    }
  }

  const removeMedication = (medName) => {
    setSelectedMeds(selectedMeds.filter(m => m.name !== medName))
  }

  const updateMedication = (medName, field, value) => {
    setSelectedMeds(selectedMeds.map(m => 
      m.name === medName ? { ...m, [field]: value } : m
    ))
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Prescriptions</h1>
        <p className="text-sm text-slate-500">Gestion des ordonnances et prescriptions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Nouvelle prescription</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-2">Patient</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={selectedPatient}
                  onChange={e => setSelectedPatient(e.target.value)}
                >
                  <option value="">Sélectionner un patient</option>
                  <option value="Amina Ben Salah">Amina Ben Salah</option>
                  <option value="Mohamed Kharrat">Mohamed Kharrat</option>
                  <option value="Nour Kammoun">Nour Kammoun</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-2">Rechercher un médicament</label>
                <input 
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nom du médicament..."
                  value={searchMed}
                  onChange={e => setSearchMed(e.target.value)}
                />
              </div>

              <div className="max-h-40 overflow-y-auto">
                {filteredMeds.map(med => (
                  <div key={med.name} className="border rounded p-2 mb-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{med.name}</div>
                      <div className="text-xs text-slate-500">{med.dosage} • {med.type}</div>
                    </div>
                    <button 
                      className="text-primary-600 text-sm"
                      onClick={() => addMedication(med)}
                    >
                      Ajouter
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Prescriptions récentes</h3>
            <div className="space-y-2">
              {samplePrescriptions.map(prescription => (
                <div key={prescription.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{prescription.patient}</div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      prescription.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {prescription.status}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mb-1">{prescription.date}</div>
                  <div className="text-sm">
                    {prescription.medicaments.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Ordonnance en cours</h3>
          
          {selectedMeds.length > 0 ? (
            <div className="space-y-4">
              {selectedMeds.map(med => (
                <div key={med.name} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{med.name} {med.dosage}</div>
                    <button 
                      className="text-red-600 text-sm"
                      onClick={() => removeMedication(med.name)}
                    >
                      Retirer
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-slate-500">Posologie</label>
                      <input 
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="ex: 2x par jour"
                        value={med.posologie}
                        onChange={e => updateMedication(med.name, 'posologie', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Durée</label>
                      <input 
                        className="w-full border rounded px-2 py-1 text-sm"
                        placeholder="ex: 7 jours"
                        value={med.duree}
                        onChange={e => updateMedication(med.name, 'duree', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t">
                <button 
                  className="bg-primary-500 text-white px-4 py-2 rounded w-full"
                  disabled={!selectedPatient}
                >
                  Générer l'ordonnance
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              Ajoutez des médicaments pour créer une ordonnance
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}