import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Auth/Login'
import Register from '../pages/Auth/Register'
import Features from '../pages/Features'
import Pricing from '../pages/Pricing'
import MedecinDashboard from '../pages/Dashboard/MedecinDashboard'
import PatientDashboard from '../pages/Dashboard/PatientDashboard'

// Admin pages
import UserManagement from '../pages/admin/UserManagement'
import MedicalRecords from '../pages/admin/MedicalRecords'
import Payments from '../pages/admin/Payments'
import Reports from '../pages/admin/Reports'

// Medecin pages
import Planning from '../pages/medecin/Planning'
import CalendarView from '../pages/medecin/CalendarView'
import Patients from '../pages/medecin/Patients'
import Consultations from '../pages/medecin/Consultations'
import Prescriptions from '../pages/medecin/Prescriptions'
import ChatPanelMed from '../pages/medecin/ChatPanelMed'

// Patient pages
import Appointments from '../pages/patient/Appointments'
import MedicalFolder from '../pages/patient/MedicalFolder'
import PatientPrescriptions from '../pages/patient/PatientPrescriptions'
import PatientPayments from '../pages/patient/PatientPayments'
import HealthTracking from '../pages/patient/HealthTracking'
import ChatPanel from '../pages/patient/ChatPanel'

// ✅ Video page (tu as dossier pages/video)
import VideoCall from '../pages/video/VideoCall'

import { useAuth } from '../contexts/AuthContext'

function RequireAuth({ children, role }){
  const { user } = useAuth()
  if(!user) return <Navigate to="/login" replace />
  if(role && user.role !== role) {
    // redirect to the role default landing page if role mismatch
    const roleDefaultRoutes = {
      admin: "/admin/reports",
      medecin: "/medecin/dashboard",
      patient: "/patient/dashboard"
    }
    return <Navigate to={roleDefaultRoutes[user.role] || "/"} replace />
  }
  return children
}

export default function AppRoutes(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/features" element={<Features/>} />
      <Route path="/pricing" element={<Pricing/>} />
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />

      {/* Admin routes */}
      <Route path="/admin/users" element={
        <RequireAuth role="admin">
          <UserManagement />
        </RequireAuth>
      } />
      <Route path="/admin/medical-records" element={
        <RequireAuth role="admin">
          <MedicalRecords />
        </RequireAuth>
      } />

      <Route path="/admin/payments" element={
        <RequireAuth role="admin">
          <Payments />
        </RequireAuth>
      } />
      <Route path="/admin/reports" element={
        <RequireAuth role="admin">
          <Reports />
        </RequireAuth>
      } />

      {/* Medecin routes */}
      <Route path="/medecin/dashboard" element={
        <RequireAuth role="medecin">
          <MedecinDashboard />
        </RequireAuth>
      } />
      <Route path="/medecin/planning" element={
        <RequireAuth role="medecin">
          <Planning />
        </RequireAuth>
      } />
      <Route path="/medecin/chatPanelMed" element={
        <RequireAuth role="medecin">
          <ChatPanelMed />
        </RequireAuth>
      } />
      <Route path="/medecin/CalendarView" element={
        <RequireAuth role="medecin">
          <CalendarView />
        </RequireAuth>
      } />
      <Route path="/medecin/patients" element={
        <RequireAuth role="medecin">
          <Patients />
        </RequireAuth>
      } />
      <Route path="/medecin/consultations" element={
        <RequireAuth role="medecin">
          <Consultations />
        </RequireAuth>
      } />
      <Route path="/medecin/prescriptions" element={
        <RequireAuth role="medecin">
          <Prescriptions />
        </RequireAuth>
      } />

      {/* ✅ Video route Medecin */}
      <Route path="/medecin/video/:rdvId" element={
        <RequireAuth role="medecin">
          <VideoCall />
        </RequireAuth>
      } />

      {/* Patient routes */}
      <Route path="/patient/dashboard" element={
        <RequireAuth role="patient">
          <PatientDashboard />
        </RequireAuth>
      } />
      <Route path="/patient/chat" element={
        <RequireAuth role="patient">
          <ChatPanel />
        </RequireAuth>
      } />
      <Route path="/patient/consultation" element={
        <RequireAuth role="patient">
          <Appointments />
        </RequireAuth>
      } />
      <Route path="/patient/payments" element={
        <RequireAuth role="patient">
          <PatientPayments />
        </RequireAuth>
      } />
      <Route path="/patient/medical-folder" element={
        <RequireAuth role="patient">
          <MedicalFolder />
        </RequireAuth>
      } />
      <Route path="/patient/prescriptions" element={
        <RequireAuth role="patient">
          <PatientPrescriptions />
        </RequireAuth>
      } />
      <Route path="/patient/health-tracking" element={
        <RequireAuth role="patient">
          <HealthTracking />
        </RequireAuth>
      } />

      {/* ✅ Video route Patient */}
      <Route path="/patient/video/:rdvId" element={
        <RequireAuth role="patient">
          <VideoCall />
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
