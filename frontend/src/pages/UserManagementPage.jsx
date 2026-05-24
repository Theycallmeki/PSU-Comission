import React, { useState, useEffect } from 'react';
import { usersApi } from '../api/api';
import { useAuth } from '../protected_routes/ProtectedRoute';
import '../styles/UserManagementPage.css';

// Must match the keys used in Sidebar.jsx navItems + homeItem
const ALL_PAGES = [
  { key: 'dashboard',                label: 'Dashboard' },
  { key: 'classrooms',               label: 'Classrooms' },
  { key: 'classrooms_analytics',     label: 'Classroom Analytics' },
  { key: 'enrollments',              label: 'Enrollments' },
  { key: 'enrollments_analytics',    label: 'Enrollment Analytics' },
  { key: 'teachers_seats',           label: 'Teachers / Seats' },
  { key: 'teachers_seats_analytics', label: 'Teachers/Seats Analytics' },
  { key: 'recommendations',          label: 'Recommendations' },
  { key: 'reports',                  label: 'Reports' },
  { key: 'about',                    label: 'About' },
];

/* ── Icons ─────────────────────────────────────────────────────── */
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ── Component ─────────────────────────────────────────────────── */
const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [savingId, setSavingId]     = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      if (data) setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const approvedUser = await usersApi.approve(id);
      if (approvedUser)
        setUsers(users.map(u => u.id === id ? { ...u, is_approved: true } : u));
    } catch (err) {
      alert('Failed to approve user: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await usersApi.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const handleRoleToggle = (id) => {
    setUsers(users.map(u =>
      u.id !== id ? u : { ...u, role: u.role === 'admin' ? 'user' : 'admin' }
    ));
  };

  const handlePageToggle = (id, pageKey) => {
    setUsers(users.map(u => {
      if (u.id !== id) return u;
      const current = Array.isArray(u.allowed_pages) ? u.allowed_pages : [];
      const updated = current.includes(pageKey)
        ? current.filter(p => p !== pageKey)
        : [...current, pageKey];
      return { ...u, allowed_pages: updated };
    }));
  };

  const handleAllPages = (id, grantAll) => {
    setUsers(users.map(u =>
      u.id !== id ? u : { ...u, allowed_pages: grantAll ? ALL_PAGES.map(p => p.key) : [] }
    ));
  };

  const handleSavePrivileges = async (id) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    setSavingId(id);
    try {
      const updated = await usersApi.updatePrivileges(id, {
        role: target.role,
        allowed_pages: target.allowed_pages,
      });
      if (updated)
        setUsers(users.map(u => u.id === id ? { ...u, ...updated } : u));
      setExpandedId(null);
    } catch (err) {
      alert('Failed to save privileges: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return (
    <div className="um-state-wrap">
      <div className="um-spinner" />
      <p>Loading users…</p>
    </div>
  );

  if (error) return (
    <div className="um-state-wrap um-state-wrap--error">
      <p>Error: {error}</p>
    </div>
  );

  return (
    <div className="um-page fade-in">

      {/* ── Page Header ── */}
      <header className="um-page-header">
        <div className="um-page-header__left">
          <div className="um-page-icon-wrap">
            <UsersIcon />
          </div>
          <div>
            <h1 className="um-title">User Management</h1>
            <p className="um-sub">Approve, manage privileges, or remove registered users.</p>
          </div>
        </div>
      </header>

      {/* ── Table Card ── */}
      <div className="um-card">
        <div className="um-section-label">
          <span className="um-section-icon"><UsersIcon /></span>
          Registered Users
        </div>

        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
                <th>Date Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="um-empty">No users found.</td>
                </tr>
              )}

              {users.map((user, i) => {
                const isSelf       = currentUser && user.username === currentUser.username;
                const isExpanded   = expandedId === user.id;
                const allowedPages = Array.isArray(user.allowed_pages) ? user.allowed_pages : [];

                return (
                  <React.Fragment key={user.id}>
                    {/* ── Main row ── */}
                    <tr
                      className={`um-row ${isExpanded ? 'um-row--expanded' : ''}`}
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="um-td um-td--id">{user.id}</td>
                      <td className="um-td um-td--username">{user.username}</td>
                      <td className="um-td">
                        <span className={`um-badge um-badge--role um-badge--${user.role}`}>
                          {user.role === 'admin' ? <ShieldIcon /> : <UserIcon />}
                          {user.role}
                        </span>
                      </td>
                      <td className="um-td">
                        <span className={`um-badge um-badge--status ${user.is_approved ? 'um-badge--approved' : 'um-badge--pending'}`}>
                          {user.is_approved ? <CheckIcon /> : <ClockIcon />}
                          {user.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="um-td um-td--date">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </td>
                      <td className="um-td um-td--actions">
                        {!user.is_approved && (
                          <button className="um-btn um-btn--approve" onClick={() => handleApprove(user.id)}>
                            <CheckIcon /> Approve
                          </button>
                        )}
                        {!isSelf && (
                          <button
                            className={`um-btn um-btn--privileges ${isExpanded ? 'um-btn--privileges-active' : ''}`}
                            onClick={() => setExpandedId(isExpanded ? null : user.id)}
                          >
                            <KeyIcon />
                            {isExpanded ? 'Close' : 'Privileges'}
                            <ChevronIcon open={isExpanded} />
                          </button>
                        )}
                        {!isSelf && (
                          <button className="um-btn um-btn--delete" onClick={() => handleDelete(user.id)}>
                            <TrashIcon /> Delete
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* ── Privilege panel ── */}
                    {isExpanded && (
                      <tr className="um-priv-row">
                        <td colSpan="6">
                          <div className="um-priv-panel">

                            {/* Role */}
                            <div className="um-priv-section">
                              <p className="um-priv-section-title">Role</p>
                              <div className="um-priv-toggle-row">
                                <span className="um-priv-toggle-label">Admin Access</span>
                                <label className="um-toggle">
                                  <input
                                    type="checkbox"
                                    checked={user.role === 'admin'}
                                    onChange={() => handleRoleToggle(user.id)}
                                  />
                                  <span className="um-toggle__slider" />
                                </label>
                                <span className={`um-priv-val ${user.role === 'admin' ? 'um-priv-val--on' : 'um-priv-val--off'}`}>
                                  {user.role === 'admin' ? 'Admin' : 'User'}
                                </span>
                              </div>
                            </div>

                            {/* Page Access */}
                            <div className="um-priv-section">
                              <div className="um-priv-section-header">
                                <p className="um-priv-section-title">Page Access</p>
                                <div className="um-priv-bulk">
                                  <button className="um-bulk um-bulk--grant" onClick={() => handleAllPages(user.id, true)}>
                                    Grant All
                                  </button>
                                  <button className="um-bulk um-bulk--revoke" onClick={() => handleAllPages(user.id, false)}>
                                    Revoke All
                                  </button>
                                </div>
                              </div>

                              <div className="um-priv-pages-grid">
                                {ALL_PAGES.map(page => (
                                  <div key={page.key} className="um-priv-toggle-row">
                                    <span className="um-priv-toggle-label">{page.label}</span>
                                    <label className="um-toggle">
                                      <input
                                        type="checkbox"
                                        checked={allowedPages.includes(page.key)}
                                        onChange={() => handlePageToggle(user.id, page.key)}
                                      />
                                      <span className="um-toggle__slider" />
                                    </label>
                                    <span className={`um-priv-val ${allowedPages.includes(page.key) ? 'um-priv-val--on' : 'um-priv-val--off'}`}>
                                      {allowedPages.includes(page.key) ? 'On' : 'Off'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="um-priv-footer">
                              <button
                                className="um-btn um-btn--cancel"
                                onClick={() => { setExpandedId(null); fetchUsers(); }}
                              >
                                Cancel
                              </button>
                              <button
                                className="um-btn um-btn--save"
                                onClick={() => handleSavePrivileges(user.id)}
                                disabled={savingId === user.id}
                              >
                                {savingId === user.id ? 'Saving…' : 'Save Privileges'}
                              </button>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default UserManagementPage;