import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import { User, Video, Calendar, Clock } from 'lucide-react';
import * as StompJs from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_RDV = "http://localhost:8083/api/rendezvous";

export default function Consultations() {
  const { user: medecin } = useAuth();
  const navigate = useNavigate();
  const stompClient = useRef(null);

  const [consultations, setConsultations] = useState([]);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);

  // =========================
  // Connexion STOMP (Pour notifier le patient)
  // =========================
  useEffect(() => {
    const client = new StompJs.Client({
      webSocketFactory: () => new SockJS("http://localhost:8083/ws-stomp"),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      console.log('✅ STOMP connecté (Consultations)');
      stompClient.current = client;
    };

    client.activate();
    return () => client.deactivate();
  }, []);

  const fetchConsultations = useCallback(async () => {
    if (!medecin?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_RDV}/medecin/${medecin.id}`);
      if (!res.ok) {
        setConsultations([]);
        return;
      }
      const data = await res.json();
      const approved = (Array.isArray(data) ? data : []).filter(
        (r) => r.status === "APPROVED"
      );
      setConsultations(approved);
    } catch (e) {
      console.error("Erreur fetch:", e);
      setConsultations([]);
    } finally {
      setLoading(false);
    }
  }, [medecin?.id]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const parseDateTime = (dateStr, timeStr) => {
    if (!dateStr) return new Date();
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = (timeStr || "00:00").split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

  const upcomingConsultations = useMemo(() => {
    const now = new Date();
    return consultations.filter((c) => {
      const consultationDate = parseDateTime(c.date, c.time);
      return consultationDate >= new Date(now.getTime() - 120 * 60000);
    });
  }, [consultations]);

  const pastConsultations = useMemo(() => {
    const now = new Date();
    return consultations.filter((c) => {
      const consultationDate = parseDateTime(c.date, c.time);
      return consultationDate < new Date(now.getTime() - 120 * 60000);
    });
  }, [consultations]);

  const canStartVideo = useCallback((consultation) => {
    if (!consultation?.date || !consultation?.time) return false;
    const now = new Date();
    const consultationDate = parseDateTime(consultation.date, consultation.time);
    const diffMinutes = (consultationDate - now) / 60000;
    return diffMinutes <= 1440 && diffMinutes >= -300;
  }, []);

  // =========================
  // Lancer la séance + Notifier
  // =========================
  const handleStartVideo = (consultation) => {
    // 1. Envoyer le signal de notification au patient via STOMP
    if (stompClient.current?.connected) {
      const notification = {
        senderId: medecin.id,
        receiverId: consultation.patient.id,
        senderName: `Dr. ${medecin.name}`,
        type: "CALL_STARTED", // Type spécial pour le front patient
        content: consultation.id.toString(), // On envoie l'ID de la salle
        timestamp: new Date().toISOString(),
      };

      stompClient.current.publish({
        destination: "/app/chat/send",
        body: JSON.stringify(notification)
      });
      console.log("🔔 Signal d'appel envoyé au patient:", consultation.patient.id);
    }

    // 2. Naviguer vers la salle vidéo
    navigate(`/medecin/video/${consultation.id}`);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Consultations</h1>
        <p className="text-sm text-slate-500">Gérez vos rendez-vous et notifiez vos patients</p>
      </div>

      <div className="flex gap-6 mb-6 border-b border-slate-200">
        <button
          className={`pb-3 text-sm font-bold transition-all ${
            activeTab === "upcoming" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          À venir ({upcomingConsultations.length})
        </button>
        <button
          className={`pb-3 text-sm font-bold transition-all ${
            activeTab === "past" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500 hover:text-slate-800"
          }`}
          onClick={() => setActiveTab("past")}
        >
          Historique ({pastConsultations.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100 max-h-[calc(100vh-300px)] overflow-y-auto">
            {loading ? (
              <div className="p-10 text-center animate-pulse text-slate-400">Chargement...</div>
            ) : (activeTab === "upcoming" ? upcomingConsultations : pastConsultations).length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-medium">Aucun rendez-vous</div>
            ) : (
              (activeTab === "upcoming" ? upcomingConsultations : pastConsultations).map((c) => (
                <div
                  key={c.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedConsultation?.id === c.id ? "bg-blue-50 border-l-4 border-blue-600" : "hover:bg-slate-50"
                  }`}
                  onClick={() => setSelectedConsultation(c)}
                >
                  <div className="font-bold text-slate-800">{c.patient?.name} {c.patient?.prenom}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Calendar size={12}/> {c.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12}/> {c.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedConsultation ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex justify-between items-start border-b pb-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                    {selectedConsultation.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {selectedConsultation.patient?.name} {selectedConsultation.patient?.prenom}
                    </h2>
                    <p className="text-blue-600 font-bold text-sm tracking-wide">ID PATIENT: #{selectedConsultation.patient?.id}</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-black border border-green-100 uppercase">
                  APPROUVÉ
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Date & Heure</label>
                  <div className="text-slate-700 font-bold">{selectedConsultation.date} à {selectedConsultation.time}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Motif</label>
                  <div className="text-slate-700 font-bold truncate">{selectedConsultation.description || "Consultation médicale"}</div>
                </div>
              </div>

              {activeTab === "upcoming" && (
                <div className="flex flex-col gap-3">
                  {canStartVideo(selectedConsultation) ? (
                    <button
                      onClick={() => handleStartVideo(selectedConsultation)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-200 transition-all hover:-translate-y-1"
                    >
                      <Video size={22} /> DÉMARRER & NOTIFIER LE PATIENT
                    </button>
                  ) : (
                    <div className="w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-slate-200 cursor-not-allowed">
                      <Clock size={20} /> INDISPONIBLE
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 h-96 flex flex-col items-center justify-center text-slate-400">
              <User size={64} strokeWidth={1} className="mb-4 opacity-20" />
              <p className="font-bold">Sélectionnez une consultation</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}