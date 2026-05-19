import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ClassroomPage from "./pages/ClassroomPage";
import EnrollmentPage from "./pages/EnrollmentPage";
import RecommendationPage from "./pages/RecommendationPage";
import MetricsPage from "./pages/MetricsPage";
import ClassroomAnalytics from "./pages/ClassroomAnalytics";
import EnrollmentAnalytics from "./pages/EnrollmentAnalytics";
import TeachersSeatsPage from "./pages/TeachersSeatsPage";
import TeachersSeatsAnalytics from "./pages/TeachersSeatsAnalytics";
import AuthPage from "./pages/AuthPage";
import AiChat from "./components/AiChat";
import AboutPage from "./pages/AboutPage";
import { ProtectedRouteProvider, useAuth } from "./protected_routes/ProtectedRoute";

// ─── Dark Mode Context ────────────────────────────────────────────────────────
export const DarkModeContext = createContext();
export const useDarkMode = () => useContext(DarkModeContext);

function DarkModeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    document.body.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Apply saved theme immediately on first render
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", saved);
  }, []);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDark }}>
      {children}
    </DarkModeContext.Provider>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;
  if (!user) return <Navigate to="/auth" />;

  return children;
};

function AppContent() {
  const { user, loading } = useAuth();
  const { isDark } = useDarkMode();

  if (loading) return <div style={{ padding: "20px" }}>Checking session...</div>;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: isDark ? "var(--bg-primary)" : "#f5f6fa",
      }}
    >
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
          <Route path="/teachers-seats" element={<ProtectedRoute><TeachersSeatsPage /></ProtectedRoute>} />
          <Route path="/teachers-seats/analytics" element={<ProtectedRoute><TeachersSeatsAnalytics /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><AboutPage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={user ? "/" : "/auth"} />} />
        </Routes>
      </div>

      <AiChat />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ProtectedRouteProvider>
        <DarkModeProvider>
          <AppContent />
        </DarkModeProvider>
      </ProtectedRouteProvider>
    </Router>
  );
}

export default App;