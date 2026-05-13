import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../protected_routes/ProtectedRoute';
import '../styles/Sidebar.css';

const navItems = [
  {
    name: 'Home',
    path: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    name: 'Classrooms',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
    subItems: [
      { name: 'Classroom Table', path: '/classrooms' },
      { name: 'Classroom Analytics', path: '/classrooms/analytics' },
    ]
  },
  {
    name: 'Enrollments',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    subItems: [
      { name: 'Enrollment Table', path: '/enrollments' },
      { name: 'Enrollment Analytics', path: '/enrollments/analytics' },
    ]
  },
  {
    name: 'Recommendations',
    path: '/recommendations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    name: 'Metrics',
    path: '/metrics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [openMenus, setOpenMenus] = React.useState({});

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  const isMenuOpen = (name) => {
    return openMenus[name];
  };

  const toggleMenu = (name) => {
    setOpenMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  // Auto-open menu if a sub-item is active
  React.useEffect(() => {
    navItems.forEach(item => {
      if (item.subItems) {
        const hasActiveSub = item.subItems.some(sub => location.pathname === sub.path);
        if (hasActiveSub) {
          setOpenMenus(prev => ({ ...prev, [item.name]: true }));
        }
      }
    });
  }, [location.pathname]);

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>

      {/* TOGGLE BUTTON */}
      <button
        className="sidebar__toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        )}
      </button>

      {/* BRAND */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
          </svg>
        </div>

        {!isCollapsed && (
          <span className="sidebar__brand-name">
            GEMS<br />DASHBOARD
          </span>
        )}
      </div>

      {/* NAV */}
      <nav className="sidebar__nav">
        {!isCollapsed && <p className="sidebar__nav-label">Menu</p>}

        <ul className="sidebar__list">
          {navItems.map((item) => (
            <li key={item.name} className="sidebar__item">
              {item.subItems ? (
                <>
                  <button
                    className={`sidebar__link ${isMenuOpen(item.name) ? 'sidebar__link--open' : ''}`}
                    onClick={() => !isCollapsed && toggleMenu(item.name)}
                  >
                    <span className="sidebar__link-icon">{item.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="sidebar__link-text">{item.name}</span>
                        <svg 
                          className={`sidebar__chevron ${isMenuOpen(item.name) ? 'sidebar__chevron--rotated' : ''}`}
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </>
                    )}
                  </button>
                  
                  {!isCollapsed && isMenuOpen(item.name) && (
                    <ul className="sidebar__sub-list">
                      {item.subItems.map(sub => (
                        <li key={sub.path}>
                          <Link
                            to={sub.path}
                            className={`sidebar__sub-link ${isActive(sub.path) ? 'sidebar__sub-link--active' : ''}`}
                          >
                            <span className="sidebar__sub-link-text">{sub.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`sidebar__link ${isActive(item.path) ? 'sidebar__link--active' : ''}`}
                >
                  <span className="sidebar__link-icon">{item.icon}</span>
                  {!isCollapsed && <span className="sidebar__link-text">{item.name}</span>}
                  {isActive(item.path) && !isCollapsed && <span className="sidebar__link-dot" />}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="sidebar__footer">
        <div className="sidebar__user">

          <div className="sidebar__avatar">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>

          {!isCollapsed && (
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{user?.username || 'Admin'}</p>
              <p className="sidebar__user-role">{user?.role || 'Administrator'}</p>
            </div>
          )}

          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
              marginLeft: 'auto'
            }}
            title="Logout"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div className="overlay">
          <div className="modallogout">

            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>

              <button
                className="btn btn-danger"
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  await logout();
                }}
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;