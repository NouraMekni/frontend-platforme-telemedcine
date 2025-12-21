import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function SidebarAdmin() {
  const location = useLocation();

  const links = [
    { name: "Tableau de bord", to: "/admin/reports" },
    { name: "Utilisateurs", to: "/admin/users" },
    { name: "Dossiers médicaux", to: "/admin/medical-records" },
    { name: "Paiements", to: "/admin/payments" },
  ];

  const activeColor = "#1a7bea";

  return (
    <aside className="w-64 min-h-screen p-6 hidden md:flex flex-col bg-white border-r shadow-md">
      {/* Sidebar Title */}
      <div
        className="text-2xl font-bold mb-8 text-center"
        style={{ color: activeColor }}
      >
        Admin
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 text-sm">
        {links.map((link) => {
          const isActive = location.pathname === link.to;

          return (
            <Link
              key={link.to}
              to={link.to}
              className="px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
              style={{
                color: isActive ? activeColor : "#374151",
                backgroundColor: isActive ? "#dbeafe" : "transparent",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#dbeafe")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = isActive
                  ? "#dbeafe"
                  : "transparent")
              }
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
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
