import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./contexts/AuthContext";
import EnhancedMedicalChatbot from "./components/chatbot/EnhancedMedicalChatbot";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <EnhancedMedicalChatbot />
    </AuthProvider>
  );
}
