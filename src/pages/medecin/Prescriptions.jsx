import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const MEDICAMENTS_CATALOG = [
  { name: 'Paracétamol', dosage: '500mg' },
  { name: 'Ibuprofène', dosage: '200mg' },
  { name: 'Amoxicilline', dosage: '1g' },
  { name: 'Metformine', dosage: '850mg' }
];

export default function Prescriptions() {
  // State
  const [patients, setPatients] = useState([]);
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [searchMed, setSearchMed] = useState('');
  const [loading, setLoading] = useState(false);

  // --- API Calls ---

  const fetchData = async () => {
    try {
      const [pRes, oRes] = await Promise.all([
        fetch('http://localhost:8080/api/patients'),
        fetch('http://localhost:8080/api/ordonances/all')
      ]);
      if (pRes.ok) setPatients(await pRes.json());
      if (oRes.ok) setPrescriptionsList(await oRes.json());
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Optional: WebSocket connection for real-time updates
    const socket = new WebSocket('ws://localhost:8080/ws/signaling');
    socket.onmessage = (msg) => { if(msg.data === "REFRESH") fetchData(); };
    return () => socket.close();
  }, []);

  const handleAddMed = (med) => {
    if (!selectedMeds.find(m => m.name === med.name)) {
      setSelectedMeds([...selectedMeds, { ...med, posologie: '', duree: '' }]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatientId || selectedMeds.length === 0) {
      alert("Veuillez sélectionner un patient et au moins un médicament");
      return;
    }

    setLoading(true);
    const ordonnanceData = {
      // Map complex objects to the List<String> expected by your Java Model
      medicaments: selectedMeds.map(m => `${m.name} ${m.dosage} - ${m.posologie} pendant ${m.duree}`),
      dateCreation: new Date(),
      valideeParIA: false
    };

    try {
      const response = await fetch('http://localhost:8080/api/ordonances/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordonnanceData)
      });

      if (response.ok) {
        alert("Ordonnance générée avec succès !");
        setSelectedMeds([]);
        setSelectedPatientId('');
        fetchData(); // Refresh history
      }
    } catch (err) {
      alert("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestion des Ordonnances</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Patient & Med Selection */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">1. Sélection Patient</h2>
              <select 
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">-- Choisir un patient --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.prenom} {p.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">2. Catalogue Médicaments</h2>
              <input 
                type="text"
                placeholder="Rechercher..."
                className="w-full p-2 mb-4 border rounded-md"
                onChange={(e) => setSearchMed(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto space-y-2">
                {MEDICAMENTS_CATALOG.filter(m => m.name.toLowerCase().includes(searchMed.toLowerCase())).map(m => (
                  <div key={m.name} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm">{m.name} ({m.dosage})</span>
                    <button onClick={() => handleAddMed(m)} className="text-blue-600 text-sm font-bold">+ Ajouter</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Editor */}
          <div className="bg-white p-6 rounded-xl shadow-sm border min-h-[400px]">
            <h2 className="text-lg font-semibold mb-4 text-blue-700">3. Composition de l'ordonnance</h2>
            {selectedMeds.length === 0 ? (
              <p className="text-gray-400 text-center mt-20">L'ordonnance est vide</p>
            ) : (
              <div className="space-y-4">
                {selectedMeds.map((med, i) => (
                  <div key={i} className="p-4 border rounded-lg bg-blue-50/30">
                    <div className="flex justify-between font-bold text-gray-700">
                      <span>{med.name}</span>
                      <button onClick={() => setSelectedMeds(selectedMeds.filter((_, idx) => idx !== i))} className="text-red-500">×</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input 
                        placeholder="Posologie" 
                        className="text-xs p-2 border rounded"
                        onChange={(e) => {
                          const updated = [...selectedMeds];
                          updated[i].posologie = e.target.value;
                          setSelectedMeds(updated);
                        }}
                      />
                      <input 
                        placeholder="Durée" 
                        className="text-xs p-2 border rounded"
                        onChange={(e) => {
                          const updated = [...selectedMeds];
                          updated[i].duree = e.target.value;
                          setSelectedMeds(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                >
                  {loading ? "Envoi en cours..." : "Générer & Sauvegarder"}
                </button>
              </div>
            )}
          </div>

          {/* Column 3: History */}
          <div className="bg-white p-6 rounded-xl shadow-sm border overflow-y-auto max-h-[600px]">
            <h2 className="text-lg font-semibold mb-4">Historique Récent</h2>
            <div className="space-y-4">
              {prescriptionsList.slice().reverse().map(ord => (
                <div key={ord.id} className="p-3 border-b hover:bg-gray-50">
                  <p className="text-xs text-blue-500 font-mono">Ord #{ord.id}</p>
                  <p className="text-xs text-gray-400">{new Date(ord.dateCreation).toLocaleDateString()}</p>
                  <ul className="mt-1">
                    {ord.medicaments.map((m, idx) => (
                      <li key={idx} className="text-xs text-gray-700">• {m}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}