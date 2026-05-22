import React, { useState } from 'react';
import { useAuth } from '../protected_routes/ProtectedRoute';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';
import gemsLogo from '../assets/GEMS.jpg';

const EyeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
                setMessage('Registration successful! Please wait for an administrator to approve your account before logging in.');
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
        setShowPassword(false);
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
                        <div className="auth-input-wrapper">
                            <input
                                id="password"
                                className="auth-input auth-input--with-icon"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                            />
                            <button
                                type="button"
                                className="auth-eye-btn"
                                onClick={() => setShowPassword((prev) => !prev)}
                                tabIndex={-1}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
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