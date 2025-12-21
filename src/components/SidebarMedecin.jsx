import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function SidebarMedecin() {
  const location = useLocation();

  const links = [
    { name: "Tableau de bord", to: "/medecin/dashboard" },
    { name: "Messagerie", to: "/medecin/ChatPanelMed" },
    { name: "Planning", to: "/medecin/planning" },
    { name: "Calendar View", to: "/medecin/CalendarView" },
    { name: "Mes patients", to: "/medecin/patients" },
    { name: "Consultations", to: "/medecin/consultations" },
    { name: "Prescriptions", to: "/medecin/prescriptions" },
  ];

  const activeColor = "#1a7bea";

  return (
    <aside className="w-64 min-h-screen p-6 hidden md:flex flex-col shadow-md bg-white border-r" >
      {/* Sidebar Title */}
      <div className="text-2xl font-bold mb-8 text-center" style={{ color: activeColor }}>
        Médecin
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 text-sm">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1`}
            style={{
              color: location.pathname === link.to ? activeColor : "#374151", // gray-700 for normal
              backgroundColor: location.pathname === link.to ? "#dbeafe" : "transparent" // light blue bg
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#dbeafe"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = location.pathname === link.to ? "#dbeafe" : "transparent"}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Optional Logout */}
      <div className="mt-auto pt-6 border-t border-gray-200">
        <Link
          to="/logout"
          className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
        >
          Déconnexion
        </Link>
      </div>
    </aside>
  );
}
