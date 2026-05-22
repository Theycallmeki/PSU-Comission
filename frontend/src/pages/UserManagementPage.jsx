import React, { useState, useEffect } from 'react';
import { usersApi } from '../api/api';
import { useAuth } from '../protected_routes/ProtectedRoute';
import '../styles/UserManagementPage.css';

// Must match the keys used in Sidebar.jsx navItems + homeItem
const ALL_PAGES = [
  { key: 'dashboard',         label: 'Dashboard' },
  { key: 'classrooms',        label: 'Classrooms' },
  { key: 'classrooms_analytics', label: 'Classroom Analytics' },
  { key: 'enrollments',       label: 'Enrollments' },
  { key: 'enrollments_analytics', label: 'Enrollment Analytics' },
  { key: 'teachers_seats',    label: 'Teachers / Seats' },
  { key: 'teachers_seats_analytics', label: 'Teachers/Seats Analytics' },
  { key: 'recommendations',   label: 'Recommendations' },
  { key: 'about',             label: 'About' },
];

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [expandedId, setExpandedId]     = useState(null); // which row has privilege panel open
  const [savingId, setSavingId]         = useState(null); // which user is currently being saved

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
      if (approvedUser) {
        setUsers(users.map(u => u.id === id ? { ...u, is_approved: true } : u));
      }
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

  // Toggle admin role for a user (optimistic UI, saved on "Save")
  const handleRoleToggle = (id) => {
    setUsers(users.map(u => {
      if (u.id !== id) return u;
      return { ...u, role: u.role === 'admin' ? 'user' : 'admin' };
    }));
  };

  // Toggle a single page access on/off
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

  // Grant or revoke all pages at once
  const handleAllPages = (id, grantAll) => {
    setUsers(users.map(u => {
      if (u.id !== id) return u;
      return { ...u, allowed_pages: grantAll ? ALL_PAGES.map(p => p.key) : [] };
    }));
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
      if (updated) {
        setUsers(users.map(u => u.id === id ? { ...u, ...updated } : u));
      }
      setExpandedId(null);
    } catch (err) {
      alert('Failed to save privileges: ' + err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="user-management-loading">Loading users...</div>;
  if (error)   return <div className="user-management-error">Error: {error}</div>;

  return (
    <div className="user-management-container fade-in">
      <header className="page-header">
        <div className="header-content">
          <h1>User Management</h1>
          <p>Approve, manage privileges, or remove registered users.</p>
        </div>
      </header>

      <div className="table-container glass-panel">
        <table className="user-table">
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
                <td colSpan="6" style={{ textAlign: 'center' }}>No users found.</td>
              </tr>
            )}

            {users.map(user => {
              const isSelf      = currentUser && user.username === currentUser.username;
              const isExpanded  = expandedId === user.id;
              const allowedPages = Array.isArray(user.allowed_pages) ? user.allowed_pages : [];
              const allGranted  = ALL_PAGES.every(p => allowedPages.includes(p.key));

              return (
                <React.Fragment key={user.id}>
                  {/* ── Main row ── */}
                  <tr className={isExpanded ? 'row--expanded' : ''}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.is_approved ? 'approved' : 'pending'}`}>
                        {user.is_approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      {!user.is_approved && (
                        <button className="btn-approve" onClick={() => handleApprove(user.id)}>
                          Approve
                        </button>
                      )}
                      {/* Privileges button — available for everyone except self */}
                      {!isSelf && (
                        <button
                          className={`btn-privileges ${isExpanded ? 'btn-privileges--active' : ''}`}
                          onClick={() => setExpandedId(isExpanded ? null : user.id)}
                        >
                          {isExpanded ? 'Close' : 'Privileges'}
                        </button>
                      )}
                      {!isSelf && (
                        <button className="btn-delete" onClick={() => handleDelete(user.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* ── Privilege panel row ── */}
                  {isExpanded && (
                    <tr className="privilege-row">
                      <td colSpan="6">
                        <div className="privilege-panel">

                          {/* Admin toggle */}
                          <div className="privilege-section">
                            <h4 className="privilege-section-title">Role</h4>
                            <div className="privilege-toggle-row">
                              <span className="privilege-toggle-label">Admin Access</span>
                              <label className="toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={user.role === 'admin'}
                                  onChange={() => handleRoleToggle(user.id)}
                                />
                                <span className="toggle-slider" />
                              </label>
                              <span className="privilege-toggle-value">
                                {user.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                            </div>
                          </div>

                          {/* Page access toggles */}
                          <div className="privilege-section">
                            <div className="privilege-section-header">
                              <h4 className="privilege-section-title">Page Access</h4>
                              <div className="privilege-bulk-actions">
                                <button
                                  className="btn-bulk btn-bulk--grant"
                                  onClick={() => handleAllPages(user.id, true)}
                                >
                                  Grant All
                                </button>
                                <button
                                  className="btn-bulk btn-bulk--revoke"
                                  onClick={() => handleAllPages(user.id, false)}
                                >
                                  Revoke All
                                </button>
                              </div>
                            </div>

                            <div className="privilege-pages-grid">
                              {ALL_PAGES.map(page => (
                                <div key={page.key} className="privilege-toggle-row">
                                  <span className="privilege-toggle-label">{page.label}</span>
                                  <label className="toggle-switch">
                                    <input
                                      type="checkbox"
                                      checked={allowedPages.includes(page.key)}
                                      onChange={() => handlePageToggle(user.id, page.key)}
                                    />
                                    <span className="toggle-slider" />
                                  </label>
                                  <span className={`privilege-toggle-value ${allowedPages.includes(page.key) ? 'value--on' : 'value--off'}`}>
                                    {allowedPages.includes(page.key) ? 'On' : 'Off'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Save */}
                          <div className="privilege-footer">
                            <button
                              className="btn-cancel"
                              onClick={() => { setExpandedId(null); fetchUsers(); }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-save"
                              onClick={() => handleSavePrivileges(user.id)}
                              disabled={savingId === user.id}
                            >
                              {savingId === user.id ? 'Saving...' : 'Save Privileges'}
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
  );
};

export default UserManagementPage;