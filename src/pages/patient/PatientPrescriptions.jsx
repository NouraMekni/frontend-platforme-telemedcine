import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const activePrescriptions = [
  {
    id: 1,
    medecin: 'Dr. Ahmed Trabelsi',
    date: '2024-10-20',
    medicaments: [
      { nom: 'Amlodipine', dosage: '5mg', posologie: '1 fois par jour le matin', duree: 'Traitement au long cours' },
      { nom: 'Metformine', dosage: '850mg', posologie: '2 fois par jour aux repas', duree: 'Traitement au long cours' }
    ],
    status: 'Active'
  },
  {
    id: 2,
    medecin: 'Dr. Fatma Zouari',
    date: '2024-09-15',
    medicaments: [
      { nom: 'Crème hydratante', dosage: '50ml', posologie: '2 applications par jour', duree: '1 mois' }
    ],
    status: 'Terminée'
  }
]

const pharmacies = [
  { nom: 'Pharmacie Centrale', adresse: '12 Rue de la République', telephone: '01.23.45.67.89', distance: '0.8 km' },
  { nom: 'Pharmacie du Marché', adresse: '5 Place du Marché', telephone: '01.23.45.67.90', distance: '1.2 km' },
  { nom: 'Pharmacie Saint-Jean', adresse: '28 Avenue Saint-Jean', telephone: '01.23.45.67.91', distance: '1.5 km' }
]

export default function PatientPrescriptions(){
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Mes Ordonnances</h1>
        <p className="text-sm text-slate-500">Consultez et gérez vos prescriptions médicales</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Ordonnances actives</h3>
            
            {activePrescriptions.filter(p => p.status === 'Active').map(prescription => (
              <div key={prescription.id} className="border rounded p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">Prescrite par {prescription.medecin}</div>
                    <div className="text-sm text-slate-500">Le {prescription.date}</div>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    {prescription.status}
                  </span>
                </div>

                <div className="space-y-3">
                  {prescription.medicaments.map((med, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded">
                      <div className="font-medium">{med.nom} {med.dosage}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        <div>Posologie: {med.posologie}</div>
                        <div>Durée: {med.duree}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t">
                  <button className="bg-primary-500 text-white px-3 py-2 rounded text-sm">
                    Télécharger l'ordonnance
                  </button>
                  <button className="border px-3 py-2 rounded text-sm">
                    Localiser une pharmacie
                  </button>
                  <button className="border px-3 py-2 rounded text-sm">
                    Rappel médicament
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Historique des ordonnances</h3>
            
            {activePrescriptions.filter(p => p.status === 'Terminée').map(prescription => (
              <div key={prescription.id} className="border rounded p-4 mb-4 opacity-75">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">Prescrite par {prescription.medecin}</div>
                    <div className="text-sm text-slate-500">Le {prescription.date}</div>
                  </div>
                  <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs">
                    {prescription.status}
                  </span>
                </div>

                <div className="space-y-2">
                  {prescription.medicaments.map((med, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{med.nom} {med.dosage}</span>
                      <span className="text-slate-500 ml-2">- {med.posologie}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t">
                  <button className="text-primary-600 text-sm">Voir détails</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold mb-4">Rappels médicaments</h3>
            
            <div className="space-y-3">
              <div className="border-l-4 border-primary-500 pl-3">
                <div className="font-medium text-sm">Amlodipine 5mg</div>
                <div className="text-xs text-slate-500">Prochain: Demain 8h00</div>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <div className="font-medium text-sm">Metformine 850mg</div>
                <div className="text-xs text-slate-500">Prochain: Aujourd'hui 19h00</div>
              </div>
            </div>

            <button className="w-full mt-4 text-primary-600 text-sm border border-primary-200 rounded py-2">
              Configurer les rappels
            </button>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Pharmacies à proximité</h3>
            
            <div className="space-y-3">
              {pharmacies.map((pharmacie, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="font-medium text-sm">{pharmacie.nom}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    <div>{pharmacie.adresse}</div>
                    <div>{pharmacie.telephone}</div>
                    <div className="text-primary-600 font-medium">{pharmacie.distance}</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                      Itinéraire
                    </button>
                    <button className="text-xs border px-2 py-1 rounded">
                      Appeler
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold mb-4">Actions rapides</h3>
            
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-primary-600 hover:bg-primary-50 p-2 rounded">
                Scanner une nouvelle ordonnance
              </button>
              <button className="w-full text-left text-sm text-primary-600 hover:bg-primary-50 p-2 rounded">
                Demander un renouvellement
              </button>
              <button className="w-full text-left text-sm text-primary-600 hover:bg-primary-50 p-2 rounded">
                Signaler un effet indésirable
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}