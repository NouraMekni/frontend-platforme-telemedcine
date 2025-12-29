import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083/api';

export default function Prescriptions() {
  const { user: medecin } = useAuth();

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [error, setError] = useState(null);

  // Ordonnance form data
  const [ordonanceData, setOrdonanceData] = useState({
    description: '',
    medicaments: [{ name: '', dosage: '' }],
  });

  const axiosConfig = {
    headers: {
      Authorization: medecin?.token ? `Bearer ${medecin.token}` : '',
    },
  };

  // Fetch patients
  useEffect(() => {
    if (!medecin?.id) return;

    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/patients`, axiosConfig);
        setPatients(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Erreur lors du chargement des patients');
      } finally {
        setLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [medecin]);

  // Add a new empty medicament row
  const addMedicament = () => {
    setOrdonanceData({
      ...ordonanceData,
      medicaments: [...ordonanceData.medicaments, { name: '', dosage: '' }],
    });
  };

  // Remove a medicament row
  const removeMedicament = (index) => {
    const newMedicaments = [...ordonanceData.medicaments];
    newMedicaments.splice(index, 1);
    setOrdonanceData({ ...ordonanceData, medicaments: newMedicaments });
  };

  // Update a medicament field
  const handleMedicamentChange = (index, field, value) => {
    const newMedicaments = [...ordonanceData.medicaments];
    newMedicaments[index][field] = value;
    setOrdonanceData({ ...ordonanceData, medicaments: newMedicaments });
  };

  // Handle form submit
  const handleAddOrdonance = async () => {
    if (!selectedPatient) {
      alert('Veuillez sélectionner un patient.');
      return;
    }

    if (
      !ordonanceData.description ||
      ordonanceData.medicaments.length === 0 ||
      ordonanceData.medicaments.some((m) => !m.name || !m.dosage)
    ) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/ordonances/add/${selectedPatient.id}/${medecin.id}`,
        ordonanceData,
        axiosConfig
      );
      console.log('✅ Ordonnance créée:', response.data);
      alert('Ordonnance créée avec succès !');
      setOrdonanceData({ description: '', medicaments: [{ name: '', dosage: '' }] });
    } catch (err) {
      console.error('Erreur création ordonnance:', err);
      alert(
        'Erreur lors de la création de l\'ordonnance : ' +
          (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Créer une Ordonnance</h1>

        {/* Patients list */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          {loadingPatients ? (
            <p>Chargement des patients...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-2">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-3 border rounded-lg cursor-pointer ${
                    selectedPatient?.id === patient.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-blue-50'
                  }`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  {patient.name} {patient.prenom} — {patient.email}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ordonnance form */}
        {selectedPatient && (
          <div className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
            <h2 className="text-xl font-semibold mb-4">
              Nouvelle Ordonnance pour {selectedPatient.name} {selectedPatient.prenom}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  rows="3"
                  value={ordonanceData.description}
                  onChange={(e) =>
                    setOrdonanceData({ ...ordonanceData, description: e.target.value })
                  }
                  placeholder="Description de l'ordonnance..."
                />
              </div>

              {/* Medicaments dynamic fields */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Médicaments</label>
                {ordonanceData.medicaments.map((med, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nom"
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={med.name}
                      onChange={(e) => handleMedicamentChange(index, 'name', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Dosage"
                      className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={med.dosage}
                      onChange={(e) => handleMedicamentChange(index, 'dosage', e.target.value)}
                    />
                    {ordonanceData.medicaments.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicament(index)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMedicament}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg mt-2"
                >
                  ➕ Ajouter Médicament
                </button>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleAddOrdonance}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
              >
                Créer Ordonnance
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
