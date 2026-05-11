const API_BASE_URL = 'http://localhost:5000/api';

// --- Helper for fetch ---
const fetchAPI = async (endpoint, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API Error (${response.status}): ${errorBody || response.statusText}`);
    }

    // Not all responses have a JSON body (e.g., 204 No Content)
    try {
        return await response.json();
    } catch (err) {
        return null;
    }
};

// ==========================================
// CLASSROOMS API
// ==========================================
export const classroomsApi = {
    getAll: () => fetchAPI('/classrooms'),

    getById: (id) => fetchAPI(`/classrooms/${id}`),

    create: (data) => fetchAPI('/classrooms', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    update: (id, data) => fetchAPI(`/classrooms/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (id) => fetchAPI(`/classrooms/${id}`, {
        method: 'DELETE',
    }),
};

// ==========================================
// ENROLLMENTS API
// ==========================================
export const enrollmentsApi = {
    getAll: () => fetchAPI('/enrollments'),

    getById: (id) => fetchAPI(`/enrollments/${id}`),

    create: (data) => fetchAPI('/enrollments', {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    update: (id, data) => fetchAPI(`/enrollments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),

    delete: (id) => fetchAPI(`/enrollments/${id}`, {
        method: 'DELETE',
    }),
};

// ==========================================
// AUTH API (Optional/Placeholder if needed)
// ==========================================
export const authApi = {
    getMe: () => fetchAPI('/auth/me'),
    login: (credentials) => fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    register: (data) => fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    logout: () => fetchAPI('/auth/logout', { method: 'POST' }),
};
