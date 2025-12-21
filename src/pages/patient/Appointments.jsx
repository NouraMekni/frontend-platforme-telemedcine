import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const specialites = ['Médecine générale', 'Pédiatrie', 'Gynécologie', 'Dermatologie', 'Nutrition', 'Allergologie', 'Dentiste', 'ORL', 'Ophtalmologie', 'Psychiatrie']

const medecins = [
  { id:1, name: 'Dr. Ahmed Trabelsi', specialite: 'Médecine générale', disponibilite: 'Aujourd\'hui 14h-18h' },
  { id:2, name: 'Dr. Fatma Zouari', specialite: 'Dermatologie', disponibilite: 'Demain 9h-12h' },
  { id:3, name: 'Dr. Sami Jebali', specialite: 'Pédiatrie', disponibilite: 'Vendredi 8h-16h' },
  { id:4, name: 'Dr. Leila Hamdi', specialite: 'Gynécologie', disponibilite: 'Aujourd\'hui 10h-17h' },
  { id:5, name: 'Dr. Karim Oueslati', specialite: 'Nutrition', disponibilite: 'Lundi 9h-17h' },
  { id:6, name: 'Dr. Nesrine Ghanmi', specialite: 'Allergologie', disponibilite: 'Mardi 14h-18h' },
  { id:7, name: 'Dr. Hichem Ghorbel', specialite: 'Dentiste', disponibilite: 'Mercredi 8h-12h' },
  { id:8, name: 'Dr. Rania Belhadj', specialite: 'ORL', disponibilite: 'Jeudi 10h-16h' },
  { id:9, name: 'Dr. Tarek Chahed', specialite: 'Ophtalmologie', disponibilite: 'Vendredi 9h-15h' },
  { id:10, name: 'Dr. Mariem Dridi', specialite: 'Psychiatrie', disponibilite: 'Samedi 14h-17h' },
  { id:11, name: 'Dr. Youssef Ben Amor', specialite: 'Médecine générale', disponibilite: 'Lundi 8h-14h' },
  { id:12, name: 'Dr. Asma Khelifi', specialite: 'Dermatologie', disponibilite: 'Mardi 13h-18h' },
  { id:13, name: 'Dr. Nabil Sassi', specialite: 'Pédiatrie', disponibilite: 'Mercredi 9h-17h' },
  { id:14, name: 'Dr. Rim Cherif', specialite: 'Gynécologie', disponibilite: 'Jeudi 8h-15h' },
  { id:15, name: 'Dr. Walid Gharbi', specialite: 'Nutrition', disponibilite: 'Vendredi 10h-16h' },
  { id:16, name: 'Dr. Ines Mkaddem', specialite: 'Allergologie', disponibilite: 'Samedi 9h-13h' },
  { id:17, name: 'Dr. Mehdi Jouini', specialite: 'Dentiste', disponibilite: 'Lundi 14h-19h' },
  { id:18, name: 'Dr. Salma Ferjani', specialite: 'ORL', disponibilite: 'Mardi 8h-14h' },
  { id:19, name: 'Dr. Bassem Abidi', specialite: 'Ophtalmologie', disponibilite: 'Mercredi 13h-18h' },
  { id:20, name: 'Dr. Monia Daoud', specialite: 'Psychiatrie', disponibilite: 'Jeudi 9h-16h' },
]

const myAppointments = [
  { id: 1, medecin: 'Dr. Ahmed Trabelsi', specialite: 'Médecine générale', date: '2024-10-28', time: '14:30', status: 'Confirmé', paiement: 'Payé' },
  { id: 2, medecin: 'Dr. Fatma Zouari', specialite: 'Dermatologie', date: '2024-11-05', time: '10:00', status: 'En attente', paiement: 'À payer' },
]

export default function Appointments(){
  const [specialite, setSpecialite] = useState('')
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [selectedTime, setSelectedTime] = useState('')

  const availableDoctors = specialite ? medecins.filter(m => m.specialite === specialite) : []

  const timeSlots = ['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00', '15:30']

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mes Rendez-vous</h1>
        <p className="text-sm text-slate-500">Gestion de vos consultations médicales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Prendre un nouveau rendez-vous</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-2">Choisir une spécialité</label>
                <select 
                  className="w-full border rounded px-3 py-2" 
                  value={specialite} 
                  onChange={e => {
                    setSpecialite(e.target.value)
                    setSelectedDoc(null)
                    setSelectedTime('')
                  }}
                >
                  <option value="">Sélectionner une spécialité</option>
                  {specialites.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {specialite && (
                <div>
                  <label className="block text-sm text-slate-500 mb-2">Médecins disponibles</label>
                  <div className="space-y-2">
                    {availableDoctors.map(doctor => (
                      <div 
                        key={doctor.id} 
                        className={`border rounded p-3 cursor-pointer transition-colors ${
                          selectedDoc?.id === doctor.id ? 'bg-primary-50 border-primary-200' : 'hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedDoc(doctor)}
                      >
                        <div className="font-medium">{doctor.name}</div>
                        <div className="text-sm text-slate-500">{doctor.specialite}</div>
                        <div className="text-xs text-green-600">{doctor.disponibilite}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDoc && (
                <div>
                  <label className="block text-sm text-slate-500 mb-2">Créneaux disponibles</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map(time => (
                      <button
                        key={time}
                        className={`border rounded py-2 text-sm transition-colors ${
                          selectedTime === time ? 'bg-primary-500 text-white' : 'hover:bg-slate-50'
                        }`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDoc && selectedTime && (
                <div className="bg-primary-50 p-3 rounded">
                  <div className="font-medium mb-2">Récapitulatif</div>
                  <div className="text-sm space-y-1">
                    <div>Médecin: {selectedDoc.name}</div>
                    <div>Spécialité: {selectedDoc.specialite}</div>
                    <div>Heure: {selectedTime}</div>
                    <div className="text-orange-600 font-medium">Coût: 215 DT</div>
                  </div>
                  <div className="bg-orange-50 p-2 rounded mt-2 mb-3">
                    <p className="text-xs text-orange-800">
                      ⚠️ Le paiement est obligatoire avant la consultation
                    </p>
                  </div>
                  <button className="bg-primary-500 text-white px-4 py-2 rounded w-full">
                    Procéder au paiement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Mes rendez-vous programmés</h3>
          
          {myAppointments.length > 0 ? (
            <div className="space-y-3">
              {myAppointments.map(apt => (
                <div key={apt.id} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{apt.medecin}</div>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        apt.status === 'Confirmé' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {apt.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        apt.paiement === 'Payé' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {apt.paiement}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 mb-2">{apt.specialite}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <div>{apt.date} à {apt.time}</div>
                    </div>
                    <div className="flex gap-2">
                      {apt.paiement === 'À payer' && (
                        <button className="bg-red-500 text-white text-xs px-2 py-1 rounded">Payer</button>
                      )}
                      <button className="text-primary-600 text-sm">Modifier</button>
                      <button className="text-red-600 text-sm">Annuler</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              Aucun rendez-vous programmé
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-2">Actions rapides</h4>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-primary-600 hover:bg-primary-50 p-2 rounded">
                Consulter mes anciens rendez-vous
              </button>
              <button className="w-full text-left text-sm text-primary-600 hover:bg-primary-50 p-2 rounded">
                Télécharger mes comptes-rendus
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}