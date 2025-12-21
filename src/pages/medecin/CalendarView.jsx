import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../contexts/AuthContext";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./CalendarView.css";

const API_URL_RDV = "http://localhost:8083/api/rendezvous";

export default function CalendarView() {
  const { user: medecin } = useAuth();
  const [rdvs, setRdvs] = useState([]);

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

  // Get unique dates that have appointments
  const getDatesWithAppointments = () => {
    const datesWithRdvs = new Set();
    rdvs.forEach(rdv => {
      if (rdv.date) {
        datesWithRdvs.add(rdv.date);
      }
    });
    return datesWithRdvs;
  };

  const calendarEvents = rdvs.map((r) => ({
    id: r.id,
    title: `${r.patient?.name} — ${r.description}`,
    start: `${r.date}T${r.time || "09:00"}`,
    end: `${r.date}T${r.time || "09:30"}`,
    color:
      r.status === "APPROVED"
        ? "green"
        : r.status === "PENDING"
        ? "orange"
        : "red",
  }));

  // Add background events for dates with appointments
  const backgroundEvents = Array.from(getDatesWithAppointments()).map(date => ({
    start: date,
    display: 'background',
    color: 'rgba(96, 165, 250, 0.65)',
 // Soft blue background
    classNames: ['date-with-appointment']
  }));

  const allEvents = [...calendarEvents, ...backgroundEvents];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Planning & Rendez-vous</h1>
        <p className="text-sm text-slate-500">
          Vue calendrier de vos rendez-vous
        </p>
      </div>

      <div className="card p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height={600} 
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={allEvents}
          eventClick={(info) => {
            // Don't show alert for background events
            if (info.event.display === 'background') return;
            
            const rdvId = info.event.id;
            const rdv = rdvs.find((r) => r.id.toString() === rdvId.toString());
            if (rdv) {
              alert(
                `Patient: ${rdv.patient?.name}\nDescription: ${rdv.description}\nStatus: ${rdv.status}`
              );
            }
          }}
          selectable={true}
          select={(info) => {
            alert(`Selected date: ${info.startStr}`);
          }}
          dayMaxEventRows={3}
        />
      </div>
    </DashboardLayout>
  );
}