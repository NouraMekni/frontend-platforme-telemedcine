import React from 'react';
// Correct path: Go up from Dashboard/ to pages/ (../) 
// then up from pages/ to src/ (../)
import DashboardLayout from '../../components/DashboardLayout';
import AdminHeader from '../../components/AdminHeader';
import UserTable from '../../components/UserTable';
import StatsCard from '../../components/StatsCard';

export default function AdminDashboard(){
  return (
    <DashboardLayout>
      <AdminHeader />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <UserTable />
        </div>
        <div className="space-y-6">
          <StatsCard title="Nouveaux patients" />
          <StatsCard title="Rendez-vous" />
        </div>
      </div>
    </DashboardLayout>
  );
}