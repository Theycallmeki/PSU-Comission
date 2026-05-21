import React, { useState, useEffect } from 'react';
import { usersApi } from '../api/api';
import { useAuth } from '../protected_routes/ProtectedRoute';
import '../styles/UserManagementPage.css';

const UserManagementPage = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await usersApi.getAll();
            if (data) {
                setUsers(data);
            }
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

    if (loading) return <div className="user-management-loading">Loading users...</div>;
    if (error) return <div className="user-management-error">Error: {error}</div>;

    return (
        <div className="user-management-container fade-in">
            <header className="page-header">
                <div className="header-content">
                    <h1>User Management</h1>
                    <p>Approve or remove registered users.</p>
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
                        {users.map(user => (
                            <tr key={user.id}>
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
                                        <button 
                                            className="btn-approve" 
                                            onClick={() => handleApprove(user.id)}
                                        >
                                            Approve
                                        </button>
                                    )}
                                    {currentUser && user.username !== currentUser.username && (
                                        <button 
                                            className="btn-delete" 
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center' }}>No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementPage;
