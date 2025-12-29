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

  // Fetch ordonnances
  useEffect(() => {
    if (!patient?.id) return;

    const fetchOrdonnances = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/ordonances/patient/${patient.id}`);
        setOrdonnances(response.data);
        setError(null);
      } catch (err) {
        setError('Impossible de charger vos ordonnances');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdonnances();
  }, [patient]);

  // Download CSV
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
      console.error('Erreur téléchargement ordonnance:', err);
      alert("Erreur lors du téléchargement de l'ordonnance.");
    }
  };

  // Find nearest pharmacy using Modern Google Maps JS API (2025 Standards)
  const findNearbyPharmacy = async () => {
    if (!window.google || !window.google.maps) {
      alert("Le service Google Maps n'est pas prêt. Vérifiez votre clé API dans main.jsx.");
      return;
    }

    if (!navigator.geolocation) {
      alert("Votre navigateur ne supporte pas la géolocalisation");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;

      try {
        // Import the modern Places library dynamically
        const { Place, SearchNearbyRankPreference } = await window.google.maps.importLibrary("places");
        
        const center = { lat: latitude, lng: longitude };

        // Modern 2025 search syntax using Place class
        const request = {
          fields: ["displayName", "location"],
          locationRestriction: {
            center: center,
            radius: 5000, // 5 km
          },
          includedPrimaryTypes: ["pharmacy"],
          maxResultCount: 1,
          rankPreference: SearchNearbyRankPreference.DISTANCE,
        };

        const { places } = await Place.searchNearby(request);

        if (places && places.length > 0) {
          const closest = places[0];
          const destLat = closest.location.lat();
          const destLng = closest.location.lng();
          
          // Fixed Google Maps Directions Link using Template Literals
          window.open(
            `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destLat},${destLng}&travelmode=driving`,
            '_blank'
          );
        } else {
          alert("Aucune pharmacie trouvée à proximité.");
        }
      } catch (err) {
        console.error("Google Maps Error:", err);
        alert("Erreur lors de la recherche: " + err.message);
      }
    }, (err) => {
      alert("Géolocalisation refusée ou impossible : " + err.message);
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Mes Ordonnances</h1>
            <p className="text-slate-500 mt-1">Historique complet de vos prescriptions médicales</p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
            <span className="text-blue-700 font-medium">{ordonnances.length} Ordonnances au total</span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-slate-500">Chargement de vos documents...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
            <span>⚠️ {error}</span>
          </div>
        ) : ordonnances.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="text-slate-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Aucune ordonnance</h3>
            <p className="text-slate-500">Vous n'avez pas encore de prescriptions enregistrées.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {ordonnances.map((ordonnance) => (
              <div key={ordonnance.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Card Header */}
                <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-100">
                      <FileText className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Dr. {ordonnance.medecin?.name || 'Non spécifié'}</span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center text-slate-500 text-sm">
                          <Calendar size={14} className="mr-1" />
                          {new Date(ordonnance.dateCreation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      ordonnance.valideeParIA
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {ordonnance.valideeParIA ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {ordonnance.valideeParIA ? 'Validée' : 'En attente'}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Note du médecin</h4>
                    <p className="text-slate-700 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                      "{ordonnance.description || 'Aucune instruction particulière.'}"
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Médicaments</h4>
                    <div className="space-y-2">
                      {ordonnance.medicaments?.map((med, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:bg-white hover:border-primary-200 transition-colors"
                        >
                          <span className="font-semibold text-slate-800">{med.name}</span>
                          <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{med.dosage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex flex-wrap gap-3">
                  <button
                    onClick={() => downloadOrdonance(ordonnance.id)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <Download size={16} />
                    Télécharger CSV
                  </button>
                  <button
                    onClick={findNearbyPharmacy}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
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