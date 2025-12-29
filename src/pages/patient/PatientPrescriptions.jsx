import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { FileText, MapPin, Download, Calendar, ClipboardList, CheckCircle, Clock } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8083/api';

export default function PatientPrescriptions() {
  const { user: patient } = useAuth();
  const [ordonnances, setOrdonnances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!patient?.id) return;
    const fetchOrdonnances = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/ordonances/patient/${patient.id}`);
        setOrdonnances(response.data);
      } catch (err) {
        setError('Impossible de charger vos ordonnances');
      } finally {
        setLoading(false);
      }
    };
    fetchOrdonnances();
  }, [patient]);

  const downloadOrdonance = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ordonances/export/${id}.csv`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ordonnance_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Erreur lors du téléchargement.");
    }
  };

  // FREE ALTERNATIVE: Direct Search Link
  const findNearbyPharmacy = () => {
    if (!navigator.geolocation) {
      alert("Votre navigateur ne supporte pas la géolocalisation");
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      // This creates a search for 'Pharmacie' around the user's current coordinates
      // It opens the Google Maps app (mobile) or website (desktop) instantly
      const googleSearchUrl = `https://www.google.com/maps/search/Pharmacie/@${latitude},${longitude},15z`;
      window.open(googleSearchUrl, '_blank');
    }, (err) => {
      alert("Erreur de géolocalisation : " + err.message);
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mes Ordonnances</h1>
            <p className="text-slate-500 mt-1">Historique complet de vos prescriptions médicales</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span className="text-blue-700 font-medium">{ordonnances.length} Ordonnances</span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl">⚠️ {error}</div>
        ) : ordonnances.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <ClipboardList className="text-slate-400 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-medium">Aucune ordonnance</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {ordonnances.map((ordonnance) => (
              <div key={ordonnance.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex flex-wrap items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FileText className="text-primary-600" size={24} />
                    <div>
                      <span className="font-bold">Dr. {ordonnance.medecin?.name || 'Inconnu'}</span>
                      <span className="mx-2 text-slate-300">•</span>
                      <span className="text-slate-500 text-sm">{new Date(ordonnance.dateCreation).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${ordonnance.valideeParIA ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {ordonnance.valideeParIA ? 'Validée' : 'En attente'}
                  </div>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Note du médecin</h4>
                    <p className="text-slate-700 italic border-l-4 border-slate-100 pl-4">{ordonnance.description || 'Aucune instruction.'}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase mb-3">Médicaments</h4>
                    <div className="space-y-2">
                      {ordonnance.medicaments?.map((med, i) => (
                        <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-lg">
                          <span className="font-semibold">{med.name}</span>
                          <span className="text-primary-600">{med.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-wrap gap-3">
  
  {/* Download CSV */}
  <button
    onClick={() => downloadOrdonance(ordonnance.id)}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
  >
    <Download size={16} />
    Télécharger CSV
  </button>

  {/* Nearby pharmacies */}
  <button
    onClick={findNearbyPharmacy}
    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
  >
    <MapPin size={16} />
    Pharmacies à proximité
  </button>

</div>

              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}