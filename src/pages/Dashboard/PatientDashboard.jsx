// src/pages/PatientRendezVous.jsx
import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL_MED = "http://localhost:8083/api/medecins";
const API_URL_RDV = "http://localhost:8083/api/rendezvous";

// Fenêtre d'accès à la vidéo
const OPEN_BEFORE_MIN = 10;   // le lien s’ouvre 10 min avant
const CLOSE_AFTER_MIN = 60;   // consultation ouverte jusqu’à 60 min après (tu peux changer)

export default function PatientRendezVous() {
  const { user: patient } = useAuth();
  const navigate = useNavigate();

  const [rdvs, setRdvs] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form (ajout uniquement)
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [description, setDescription] = useState("");
  const [medecinId, setMedecinId] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Load medecins
  useEffect(() => {
    fetchMedecins();
  }, []);

  const fetchMedecins = async () => {
    try {
      const res = await fetch(API_URL_MED);
      if (res.ok) {
        const data = await res.json();
        setMedecins((Array.isArray(data) ? data : []).filter((u) => u.role === "MEDECIN"));
      }
    } catch (e) {
      console.error("Erreur load med:", e);
    }
  };

  // Load RDVs for THIS patient
  useEffect(() => {
    if (!patient?.id) return;
    fetchRdv();
  }, [patient]);

  const fetchRdv = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL_RDV}/patient/${patient.id}`);
      if (res.ok) {
        const data = await res.json();
        setRdvs(Array.isArray(data) ? data : []);
      } else if (res.status === 204) {
        setRdvs([]);
      } else {
        setRdvs([]);
      }
    } catch (e) {
      console.error("Erreur load rdv:", e);
      setRdvs([]);
    } finally {
      setLoading(false);
    }
  };

  // ADD RDV (le patient peut demander un RDV, mais pas modifier/supprimer après)
  const handleAdd = async () => {
    if (!date || !time || !description || !medecinId) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const medId = Number(medecinId);
    if (isNaN(medId)) {
      alert("ID du médecin invalide !");
      return;
    }

    const body = { date, time, description };

    try {
      const res = await fetch(`${API_URL_RDV}/add/${patient.id}/${medId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Erreur add:", text);
        alert("Erreur lors de l'ajout du rendez-vous.");
        return;
      }

      const newRdv = await res.json();
      setRdvs((prev) => [...prev, newRdv]);
      closeForm();
    } catch (error) {
      console.error("Erreur add:", error);
      alert("Erreur lors de l'ajout du rendez-vous.");
    }
  };

  const openAddForm = () => {
    setDate("");
    setTime("09:00");
    setDescription("");
    setMedecinId("");
    setShowModal(true);
  };

  const closeForm = () => {
    setShowModal(false);
    setDate("");
    setTime("09:00");
    setDescription("");
    setMedecinId("");
  };

  if (!patient) {
    return (
      <DashboardLayout>
        <p>Chargement du patient...</p>
      </DashboardLayout>
    );
  }

  // Badge statut
  const renderStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { color: "bg-yellow-500", icon: "⏳", text: "En attente" },
      APPROVED: { color: "bg-green-500", icon: "✅", text: "Confirmé" },
      REFUSED: { color: "bg-red-500", icon: "❌", text: "Refusé" },
    };

    const config = statusConfig[status] || { color: "bg-gray-500", icon: "❓", text: status };

    return (
      <span
        className={`px-3 py-1.5 rounded-full text-white text-sm font-medium flex items-center gap-2 ${config.color} shadow-sm`}
      >
        <span>{config.icon}</span>
        {config.text}
      </span>
    );
  };

  // Time slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      slots.push(timeString);
    }
  }
  return slots;
};

  const timeSlots = generateTimeSlots();

  // ----------- VIDEO LOGIC (UI) -----------
  const getRdvDateTime = (r) => {
    const d = r?.date; // "YYYY-MM-DD"
    const t = r?.time || "09:00";
    if (!d) return null;

    const [year, month, day] = d.split("-").map(Number);
    const [hh, mm] = t.split(":").map(Number);

    // Date locale
    return new Date(year, (month || 1) - 1, day || 1, hh || 0, mm || 0, 0, 0);
  };

  const getVideoState = (r) => {
    // Si pas confirmé => pas de vidéo
    if (r.status !== "APPROVED") {
      return { state: "LOCKED", label: "Consultation vidéo", helper: "Disponible après confirmation" };
    }

    const rdvDT = getRdvDateTime(r);
    if (!rdvDT) {
      return { state: "LOCKED", label: "Consultation vidéo", helper: "Date/heure invalide" };
    }

    const now = new Date();
    const openFrom = new Date(rdvDT.getTime() - OPEN_BEFORE_MIN * 60 * 1000);
    const closeAt = new Date(rdvDT.getTime() + CLOSE_AFTER_MIN * 60 * 1000);

    if (now < openFrom) {
      return {
        state: "TOO_EARLY",
        label: `Disponible à ${r.time || "09:00"}`,
        helper: `Ouverture ${OPEN_BEFORE_MIN} min avant`,
      };
    }

    if (now > closeAt) {
      return { state: "ENDED", label: "Consultation terminée", helper: "Vous pouvez consulter l’historique" };
    }

    return { state: "OPEN", label: "🎥 Rejoindre la consultation vidéo", helper: "Vous pouvez entrer maintenant" };
  };

  const goToVideo = (rdvId) => {
    // IMPORTANT: même room pour patient et médecin => rdvId
    navigate(`/patient/video/${rdvId}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Rendez-vous</h1>
            <p className="text-gray-600">Gérez vos rendez-vous médicaux</p>
          </div>
          <button
            onClick={openAddForm}
            className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-700 hover:to-blue-400 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Demande de Rendez-vous
          </button>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-2">Chargement des rendez-vous...</p>
            </div>
          ) : rdvs.length === 0 ? (
            <div className="text-center p-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun rendez-vous</h3>
              <p className="text-gray-500 mb-6">Planifiez votre première consultation vidéo avec un médecin</p>
              <button
                onClick={openAddForm}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Prendre un rendez-vous
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid gap-4">
                {rdvs.map((r) => {
                  const video = getVideoState(r);

                  const isOpen = video.state === "OPEN";
                  const isEnded = video.state === "ENDED";
                  const isTooEarly = video.state === "TOO_EARLY";
                  const isLocked = video.state === "LOCKED";

                  return (
                    <div
                      key={r.id}
                      className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex justify-between items-start gap-6">
                        {/* Left */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <span className="text-2xl">👨‍⚕️</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{r.description}</h3>
                              <p className="text-gray-600">
                                avec <span className="font-medium">Dr. {r.medecin?.name}</span> •{" "}
                                {r.medecin?.specialte}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">📅</span>
                              <span>{r.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">⏰</span>
                              <span>{r.time || "09:00"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600">🎥</span>
                              <span>Consultation vidéo</span>
                            </div>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex flex-col items-end gap-3 min-w-[220px]">
                          {renderStatusBadge(r.status)}

                          {/* Video action */}
                          {isEnded ? (
                            <span className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold">
                              ✅ Consultation terminée
                            </span>
                          ) : (
                            <button
                              disabled={!isOpen}
                              onClick={() => goToVideo(r.id)}
                              className={[
                                "px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2",
                                isOpen
                                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                                  : "bg-gray-200 text-gray-600 cursor-not-allowed",
                              ].join(" ")}
                              title={video.helper}
                            >
                              {isLocked ? "🔒" : isTooEarly ? "⏳" : "🎥"}
                              {video.label}
                            </button>
                          )}

                          <p className="text-xs text-gray-500 text-right">{video.helper}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal (ajout seulement) */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Nouveau rendez-vous</h2>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">⏰ Heure</label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    >
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Description</label>
                  <input
                    type="text"
                    placeholder="Ex: Consultation générale, Suivi traitement..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">👨‍⚕️ Médecin</label>
                  <select
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    value={medecinId}
                    onChange={(e) => setMedecinId(e.target.value)}
                  >
                    <option value="">-- Choisir un médecin --</option>
                    {medecins.map((m) => (
                      <option key={m.id} value={m.id}>
                        Dr. {m.name} — {m.specialte || "Généraliste"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 text-sm text-gray-700">
                  🎥 <span className="font-semibold">Toutes les consultations sont en vidéo</span> — vous pourrez rejoindre
                  la session quand le rendez-vous est confirmé.
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={closeForm}
                >
                  Annuler
                </button>
                <button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
                  onClick={handleAdd}
                >
                  ➕ Ajouter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
