import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";

const API_URL_RDV = "http://localhost:8083/api/rendezvous";

export default function Planning() {
  const { user: medecin } = useAuth();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState("");
  const [rdvs, setRdvs] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editTime, setEditTime] = useState("09:00");

  useEffect(() => {
    if (!medecin?.id) return;
    fetchRDVs();
  }, [medecin]);

  const fetchRDVs = async () => {
    try {
      const res = await fetch(`${API_URL_RDV}/medecin/${medecin.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setRdvs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur fetch RDVs:", error);
    }
  };

  /**
   * ✅ LOGIQUE DE FIX 404 :
   * On simplifie l'URL. Si votre backend attend l'ID du médecin, 
   * il est préférable de le passer en paramètre de requête (?medecinId=...)
   * ou de l'inclure dans le corps JSON.
   */
  const updateStatus = async (id, newStatus) => {
    if (!medecin?.id) return;
    
    try {
      // Tentative avec l'URL standardisée
      const url = `${API_URL_RDV}/${id}/status`; 

      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            status: newStatus,
            medecinId: medecin.id // On envoie l'ID dans le corps pour la sécurité
        }),
      });

      if (res.ok) {
        await fetchRDVs();
        alert(`Statut mis à jour: ${newStatus === "APPROVED" ? "Confirmé" : "Refusé"}`);
      } else {
        // Si 404 persiste, on tente l'URL alternative que certains backends utilisent
        console.warn("URL standard échouée, tentative URL alternative...");
        const altUrl = `${API_URL_RDV}/${id}`;
        const resAlt = await fetch(altUrl, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
        });

        if (resAlt.ok) {
            await fetchRDVs();
        } else {
            const errorText = await resAlt.text();
            alert(`Erreur Backend (404): La route n'existe pas. Vérifiez votre Controller Java.`);
        }
      }
    } catch (e) {
      console.error("Erreur réseau:", e);
      alert("Erreur réseau");
    }
  };

  const updateRDV = async () => {
    if (!editing || !medecin?.id) return;
    try {
      const updatedData = {
        date: editing.date,
        time: editTime,
        description: editing.description,
      };

      // URL simplifiée pour le PUT
      const res = await fetch(`${API_URL_RDV}/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        setEditing(null);
        fetchRDVs();
        alert("Modifié avec succès !");
      }
    } catch (e) {
      alert("Erreur lors de la modification");
    }
  };

  const openEditModal = (rdv) => {
    setEditing(rdv);
    setEditTime(rdv.time || "09:00");
  };

  const closeEditModal = () => setEditing(null);

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 8; h <= 18; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const filtered = selectedDate ? rdvs.filter((r) => r.date === selectedDate) : rdvs;

  const canStartCall = (rdv) => {
    const today = new Date().toISOString().split('T')[0];
    return rdv.status === "APPROVED" && rdv.date === today;
  };

  const StatusBadge = ({ status }) => {
    const config = {
      PENDING: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "⏳", text: "En attente" },
      APPROVED: { color: "bg-green-100 text-green-800 border-green-200", icon: "✅", text: "Confirmé" },
      REFUSED: { color: "bg-red-100 text-red-800 border-red-200", icon: "❌", text: "Refusé" },
    }[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", icon: "❓", text: status };

    return (
      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${config.color}`}>
        <span>{config.icon}</span>{config.text}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Planning Médical</h1>
          <p className="text-gray-600">Gérez vos rendez-vous et téléconsultations</p>
        </div>

        {/* Filtre Date */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 mb-6 flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Filtrer par date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button onClick={() => setSelectedDate("")} className="bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-100 transition-all">
            Voir tout
          </button>
        </div>

        {/* Liste des RDVs */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-300 text-gray-400">
              Aucun rendez-vous pour cette sélection.
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="bg-blue-600 text-white rounded-2xl p-4 min-w-[100px] text-center">
                      <div className="text-2xl font-bold">{r.time || "--:--"}</div>
                      <div className="text-xs opacity-80 uppercase tracking-tighter">{r.date}</div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800">
                        👤 {r.patient?.name} {r.patient?.prenom}
                      </h4>
                      <p className="text-gray-500 text-sm">{r.description || 'Sans motif'}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 justify-end">
                    {canStartCall(r) && (
                      <button 
                        onClick={() => navigate(`/medecin/video/${r.id}`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 animate-pulse shadow-lg shadow-green-200"
                      >
                        🎥 Vidéo
                      </button>
                    )}
                    <StatusBadge status={r.status} />
                    <div className="flex gap-2 border-l pl-3 border-gray-100">
                      {r.status === "PENDING" && (
                        <>
                          <button onClick={() => updateStatus(r.id, "APPROVED")} className="h-10 w-10 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all font-bold">✓</button>
                          <button onClick={() => updateStatus(r.id, "REFUSED")} className="h-10 w-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all font-bold">✗</button>
                        </>
                      )}
                      <button onClick={() => openEditModal(r)} className="bg-gray-50 text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm font-semibold">
                        ✏️ Modifier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal d'édition */}
        {editing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                   <h2 className="text-xl font-bold">Modifier le RDV</h2>
                   <button onClick={closeEditModal} className="text-white hover:scale-125 transition-transform">✕</button>
                </div>
                <div className="p-8 space-y-5">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Date</label>
                        <input type="date" value={editing.date} onChange={(e) => setEditing({...editing, date: e.target.value})} className="w-full border rounded-xl p-3 mt-1" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-400 uppercase">Heure</label>
                        <select value={editTime} onChange={(e) => setEditTime(e.target.value)} className="w-full border rounded-xl p-3 mt-1">
                           {timeSlots.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                   </div>
                   <button onClick={updateRDV} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg transition-all">
                      Sauvegarder
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}