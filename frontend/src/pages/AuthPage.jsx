import React, { useState } from 'react';
import { useAuth } from '../protected_routes/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';
import gemsLogo from '../assets/GEMS.jpg';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { login, register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            if (isLogin) {
                await login({ username, password });
                navigate('/');
            } else {
                await register({ username, password });
                setMessage('Registration successful! You can now log in.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleToggle = () => {
        setIsLogin(!isLogin);
        setError('');
        setMessage('');
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-header">
                    <div className="auth-logo">
                        <img
                            src={gemsLogo}
                            alt="Galang Elementary Memorial School Logo"
                            className="auth-logo-img"
                        />
                    </div>
                    <h1 className="auth-school-name">Galang Elementary Memorial School</h1>
                    <p className="auth-subtitle">GEMS Dashboard</p>
                </div>

                <hr className="auth-divider" />

                {/* Form title */}
                <h2 className="auth-form-title">
                    {isLogin ? 'Welcome back!' : 'Create account!'}
                </h2>

                {/* Alerts */}
                {error && (
                    <div className="auth-alert error">{error}</div>
                )}
                {message && (
                    <div className="auth-alert success">{message}</div>
                )}

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            className="auth-input"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            autoComplete="username"
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="auth-input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            autoComplete={isLogin ? 'current-password' : 'new-password'}
                        />
                    </div>

                    <button className="auth-submit-btn" type="submit">
                        {isLogin ? 'Sign In' : 'Register'}
                    </button>
                </form>

                {/* Toggle */}
                <div className="auth-toggle">
                    {isLogin ? "Don't have an account?" : 'Already have an account?'}
                    <button className="auth-toggle-btn" onClick={handleToggle}>
                        {isLogin ? 'Register here' : 'Sign in here'}
                    </button>
                </div>

                {/* Footer */}
                <p className="auth-footer">
                    © {new Date().getFullYear()} Galang Elementary Memorial School
                </p>
            </div>
        </div>
    );
};

export default AuthPage;