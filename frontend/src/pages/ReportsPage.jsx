import React, { useState, useRef } from 'react';
import MetricsPage from './MetricsPage';
import ClassroomPage from './ClassroomPage';
import ClassroomAnalytics from './ClassroomAnalytics';
import EnrollmentPage from './EnrollmentPage';
import EnrollmentAnalytics from './EnrollmentAnalytics';
import TeachersSeatsPage from './TeachersSeatsPage';
import TeachersSeatsAnalytics from './TeachersSeatsAnalytics';

const reportPages = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'classrooms', label: 'Classroom Table' },
  { id: 'classrooms_analytics', label: 'Classroom Analytics' },
  { id: 'enrollments', label: 'Enrollment Table' },
  { id: 'enrollments_analytics', label: 'Enrollment Analytics' },
  { id: 'teachers_seats', label: 'Teachers/Seats Table' },
  { id: 'teachers_seats_analytics', label: 'Teachers/Seats Analytics' }
];

const componentMap = {
  'dashboard': MetricsPage,
  'classrooms': ClassroomPage,
  'classrooms_analytics': ClassroomAnalytics,
  'enrollments': EnrollmentPage,
  'enrollments_analytics': EnrollmentAnalytics,
  'teachers_seats': TeachersSeatsPage,
  'teachers_seats_analytics': TeachersSeatsAnalytics
};

const ReportsPage = () => {
  const [selectedPage, setSelectedPage] = useState(reportPages[0].id);
  const printRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-page fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          html, body, #root {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            background-color: white !important;
          }
          .no-print, .sidebar, .ai-chat-container { display: none !important; }
          .reports-page, .reports-layout, .printable-container, .printable-area { 
            padding: 0 !important; 
            margin: 0 !important; 
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            display: block !important;
            box-shadow: none !important; 
            max-width: 100% !important;
          }
          
          /* Convert Grid to Flex for flawless multi-page printing & minimizing */
          .metrics-grid {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 1.5rem !important;
          }
          .chart-card {
            width: calc(50% - 0.75rem) !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-bottom: 0 !important;
          }
          .chart-card[style*="grid-column"] {
            width: 100% !important;
          }
          
          .stats-overview {
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 1rem !important;
          }
          .stat-card {
            flex: 1 1 20% !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          
          /* Minimize Chart Heights to fit neatly and maintain proportions */
          .chart-container {
            height: 250px !important;
          }
          
          /* Add padding so bottom axis text isn't cut off */
          .recharts-responsive-container {
            width: 100% !important;
            padding-bottom: 20px !important;
          }
        }
        
        .radio-card {
          border: 2px solid var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .radio-card:hover {
          border-color: var(--primary-color);
          background-color: rgba(0, 102, 204, 0.05);
        }
        .radio-card.selected {
          border-color: var(--primary-color);
          background-color: rgba(0, 102, 204, 0.1);
        }
      `}</style>
      
      <header className="reports-header no-print" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Reports Generator
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Create and print written or image-based reports for any section of the dashboard.
        </p>
      </header>
      
      <div className="reports-layout" style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
        
        {/* Controls Sidebar */}
        <div 
          className="reports-controls no-print" 
          style={{ 
            width: '350px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            border: '1px solid var(--border-color)',
            overflowY: 'auto'
          }}
        >
          {/* Page Selection */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              1. Select Source Page
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {reportPages.map(page => (
                <label 
                  key={page.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: selectedPage === page.id ? 'var(--bg-primary)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <input 
                    type="radio" 
                    name="pageSelection" 
                    value={page.id} 
                    checked={selectedPage === page.id}
                    onChange={() => setSelectedPage(page.id)}
                    style={{ accentColor: 'var(--primary-color)' }}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>{page.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Removed Report Type Selection & Generate Button */}
        </div>
        
        {/* Preview Area */}
        <div 
          style={{ 
            flex: 1, 
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Preview Header */}
          <div className="no-print" style={{ 
            padding: '1rem 1.5rem', 
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Report Preview</h3>
            <button 
              onClick={handlePrint}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: 'var(--primary-color)',
                border: '1px solid var(--primary-color)',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = 'var(--primary-color)'; e.target.style.color = 'white'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = 'var(--primary-color)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Print Report
            </button>
          </div>
          
          {/* Component Render Area */}
          <div className="printable-container" style={{ flex: 1, overflow: 'auto', backgroundColor: '#e2e8f0', padding: '2rem' }}>
            <div 
              className="printable-area"
              ref={printRef}
              style={{ 
                width: '277mm',
                margin: '0 auto',
                minHeight: '190mm',
                backgroundColor: 'white',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                position: 'relative',
                pointerEvents: 'none'
              }}
            >
              {(() => {
                const SelectedComponent = componentMap[selectedPage];
                return SelectedComponent ? <SelectedComponent /> : null;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
