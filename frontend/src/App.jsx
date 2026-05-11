import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import ClassroomPage from "./pages/ClassroomPage";
import EnrollmentPage from "./pages/EnrollmentPage";

function App() {
  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f5f6fa" }}>
        {/* Navigation Sidebar */}
        <Sidebar />
        
        {/* Main Content Area */}
        <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
          <Routes>
            {/* Root Route - HomePage */}
            <Route path="/" element={<HomePage />} />
            
            {/* Core Pages */}
            <Route path="/classrooms" element={<ClassroomPage />} />
            <Route path="/enrollments" element={<EnrollmentPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
