import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header  from './components/Header'
import { ROUTES } from './constants/routes'

import Dashboard       from './pages/Dashboard'
import Recommendations from './pages/Recommendations'

// Enrollment sub-pages
import EnrollmentAnalytics from './pages/enrollment/EnrollmentAnalytics'
import EnrollmentTablePage from './pages/enrollment/EnrollmentTablePage'

// Performance sub-pages
import PerformanceAnalytics from './pages/performance/PerformanceAnalytics'
import PerformanceTablePage from './pages/performance/PerformanceTablePage'

// Resources sub-pages
import ResourcesAnalytics from './pages/resources/ResourcesAnalytics'
import ResourcesTablePage from './pages/resources/ResourcesTablePage'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar onToggle={(collapsed) => setSidebarCollapsed(collapsed)} />
        <div className={`main-area${sidebarCollapsed ? ' collapsed' : ''}`}>
          <Header />
          <main className="page-content">
            <Routes>
              <Route path={ROUTES.DASHBOARD}       element={<Dashboard />} />
              <Route path={ROUTES.RECOMMENDATIONS} element={<Recommendations />} />

              {/* Enrollment */}
              <Route path={ROUTES.ENROLLMENT}            element={<Navigate to={ROUTES.ENROLLMENT_ANALYTICS} replace />} />
              <Route path={ROUTES.ENROLLMENT_ANALYTICS}  element={<EnrollmentAnalytics />} />
              <Route path={ROUTES.ENROLLMENT_TABLE}      element={<EnrollmentTablePage />} />

              {/* Performance */}
              <Route path={ROUTES.PERFORMANCE}           element={<Navigate to={ROUTES.PERFORMANCE_ANALYTICS} replace />} />
              <Route path={ROUTES.PERFORMANCE_ANALYTICS} element={<PerformanceAnalytics />} />
              <Route path={ROUTES.PERFORMANCE_TABLE}     element={<PerformanceTablePage />} />

              {/* Resources */}
              <Route path={ROUTES.RESOURCES}             element={<Navigate to={ROUTES.RESOURCES_ANALYTICS} replace />} />
              <Route path={ROUTES.RESOURCES_ANALYTICS}   element={<ResourcesAnalytics />} />
              <Route path={ROUTES.RESOURCES_TABLE}       element={<ResourcesTablePage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}