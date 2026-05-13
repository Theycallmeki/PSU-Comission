import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ClassroomPage from "./pages/ClassroomPage";
import EnrollmentPage from "./pages/EnrollmentPage";
import RecommendationPage from "./pages/RecommendationPage";
import MetricsPage from "./pages/MetricsPage";
import ClassroomAnalytics from "./pages/ClassroomAnalytics";
import EnrollmentAnalytics from "./pages/EnrollmentAnalytics";
import AuthPage from "./pages/AuthPage";
import { ProtectedRouteProvider, useAuth } from "./protected_routes/ProtectedRoute";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  
  return children;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '20px' }}>Checking session...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
      {/* Show Sidebar only if user is logged in (optional, but typical) */}
      {user && <Sidebar />}
      
      <div style={{ flex: 1, padding: user ? "30px" : "0", overflowY: "auto" }}>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage />} />
          
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/classrooms" element={<ProtectedRoute><ClassroomPage /></ProtectedRoute>} />
          <Route path="/enrollments" element={<ProtectedRoute><EnrollmentPage /></ProtectedRoute>} />
          <Route path="/recommendations" element={<ProtectedRoute><RecommendationPage /></ProtectedRoute>} />
          <Route path="/metrics" element={<ProtectedRoute><MetricsPage /></ProtectedRoute>} />
          <Route path="/classrooms/analytics" element={<ProtectedRoute><ClassroomAnalytics /></ProtectedRoute>} />
          <Route path="/enrollments/analytics" element={<ProtectedRoute><EnrollmentAnalytics /></ProtectedRoute>} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to={user ? "/" : "/auth"} />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ProtectedRouteProvider>
        <AppContent />
      </ProtectedRouteProvider>
    </Router>
  );
}

export default App;
