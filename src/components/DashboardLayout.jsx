import React from "react";
import { useAuth } from "../contexts/AuthContext";
import SidebarAdmin from "./SidebarAdmin";
import SidebarMedecin from "./SidebarMedecin";
import SidebarPatient from "./SidebarPatient";

const DashboardLayout = ({ userType, children }) => {
  const { user } = useAuth();
  
  const role = userType || user?.role?.toLowerCase();

  const renderSidebar = () => {
    switch (role) {
      case 'admin':
        return <SidebarAdmin />;
      case 'medecin':
        return <SidebarMedecin />;
      case 'patient':
        return <SidebarPatient />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar */}
        <div className="lg:w-64 w-full lg:sticky lg:top-0 lg:h-screen z-50 transition-all duration-300">
          {renderSidebar()}
        </div>
        
        {/* Main Content */}
        <main className="flex-1 lg:overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 w-[950px]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;