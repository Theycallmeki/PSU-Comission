import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAccessToken } from '../api/api';

const AuthContext = createContext();

export const ProtectedRouteProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (credentials) => {
        const data = await authApi.login(credentials);
        setUser({ username: data.username, role: data.role });
        return data;
    };

    const register = async (userData) => {
        const data = await authApi.register(userData);
        return data;
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } finally {
            setUser(null);
            setAccessToken(null);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await authApi.refresh();
                if (data?.accessToken) {
                    setAccessToken(data.accessToken);
                    setUser({ username: data.username, role: data.role });
                }
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const handleAuthFailed = () => {
            setUser(null);
            setAccessToken(null);
        };
        window.addEventListener('auth-failed', handleAuthFailed);
        return () => window.removeEventListener('auth-failed', handleAuthFailed);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
