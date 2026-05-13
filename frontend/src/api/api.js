const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

let accessToken = null;

export const setAccessToken = (token) => {
    accessToken = token;
};

// --- Base fetch helper ---
const fetchAPI = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Crucial for cookie-based refresh tokens
    });

    if (response.status === 204) return null;

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error (${response.status}): ${errorBody || response.statusText}`);
    }

    try {
        return await response.json();
    } catch (err) {
        return null;
    }
};

// --- Fetch with automatic retry on 401 (token expired) ---
const fetchWithRetry = async (endpoint, options = {}) => {
    try {
        return await fetchAPI(endpoint, options);
    } catch (err) {
        // If 401 and not a login/refresh request, try to refresh
        if (err.message.includes('401') && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
            try {
                const data = await authApi.refresh();
                setAccessToken(data.accessToken);
                // Retry the original request
                return await fetchAPI(endpoint, options);
            } catch (refreshErr) {
                setAccessToken(null);
                // Dispatch event or handle logout in UI
                window.dispatchEvent(new Event('auth-failed'));
                throw refreshErr;
            }
        }
        throw err;
    }
};

// ==========================================
// CLASSROOMS API
// ==========================================
export const classroomsApi = {
    getAll: () => fetchWithRetry('/classrooms'),

    getById: (id) => fetchWithRetry(`/classrooms/${id}`),

    create: (data) => fetchWithRetry('/classrooms', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    update: (id, data) => fetchWithRetry(`/classrooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (id) => fetchWithRetry(`/classrooms/${id}`, {
        method: 'DELETE',
    }),
};

// ==========================================
// ENROLLMENTS API
// ==========================================
export const enrollmentsApi = {
    getAll: () => fetchWithRetry('/enrollments'),

    getById: (id) => fetchWithRetry(`/enrollments/${id}`),

    create: (data) => fetchWithRetry('/enrollments', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    update: (id, data) => fetchWithRetry(`/enrollments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (id) => fetchWithRetry(`/enrollments/${id}`, {
        method: 'DELETE',
    }),
};

// ==========================================
// AUTH API
// ==========================================
export const authApi = {
    login: async (credentials) => {
        const data = await fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (data?.accessToken) setAccessToken(data.accessToken);
        return data;
    },
    
    register: (userData) => fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    }),

    refresh: () => fetchAPI('/auth/refresh'),

    logout: async () => {
        await fetchAPI('/auth/logout', { method: 'POST' });
        setAccessToken(null);
    },
};

// ==========================================
// RECOMMENDATIONS API
// ==========================================
export const recommendationsApi = {
    getAll: () => fetchWithRetry('/recommendations'),
};

// ==========================================
// AI API
// ==========================================
export const aiApi = {
    chat: (message) => fetchWithRetry('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
    }),
};
