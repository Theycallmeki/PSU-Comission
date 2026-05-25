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
        let errorBody = await response.text();
        let errorMessage = errorBody || response.statusText;
        try {
            const parsed = JSON.parse(errorBody);
            if (parsed.message) {
                errorMessage = parsed.message;
            }
        } catch (e) {
            // Ignore if not JSON
        }
        throw new Error(errorMessage);
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
    getAll: (schoolYear) => {
        const query = schoolYear ? `?school_year=${encodeURIComponent(schoolYear)}` : '';
        return fetchWithRetry(`/recommendations${query}`);
    },
};

// ==========================================
// AI API
// ==========================================
export const aiApi = {
    chat: (message, history = []) => fetchWithRetry('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, history }),
    }),
};

// ==========================================
// ANALYTICS API
// ==========================================
export const analyticsApi = {
    getQuickStats: () => fetchWithRetry('/analytics/quick-stats'),
};

// ==========================================
// PDF API
// ==========================================
export const pdfApi = {
    /**
     * Download a metrics PDF (tables only).
     * @param {string} year - e.g. "2024-2025"
     * @param {string} type - 'metrics' | 'classrooms' | 'enrollments' | 'teachers-seats'
     */
    downloadMetrics: async (year, type = 'metrics') => {
        const headers = { 'Content-Type': 'application/json' };
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

        const yearParam = year ? `year=${encodeURIComponent(year)}` : '';
        const typeParam = type ? `type=${encodeURIComponent(type)}` : '';
        const query = [yearParam, typeParam].filter(Boolean).join('&');
        const url   = `${API_BASE_URL.replace(/\/$/, '')}/pdf/metrics${query ? `?${query}` : ''}`;

        const response = await fetch(url, { headers, credentials: 'include' });
        if (!response.ok) throw new Error((await response.text()) || 'Failed to generate PDF');

        const blob    = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;

        let filename = `PSU_Metrics_${year || 'report'}.pdf`;
        if (type === 'classrooms') filename = `PSU_Classrooms_${year || 'report'}.pdf`;
        else if (type === 'enrollments') filename = `PSU_Enrollments_${year || 'report'}.pdf`;
        else if (type === 'teachers-seats') filename = `PSU_TeachersSeats_${year || 'report'}.pdf`;

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    },

    /**
     * Capture chart elements via html2canvas, POST them to the backend,
     * and download the resulting PDF with embedded chart images.
     * @param {string} year - e.g. "2024-2025"
     * @param {string[]} chartLabels - ordered labels matching chartSelectors
     * @param {string} type - 'metrics' | 'classrooms' | 'enrollments' | 'teachers-seats'
     */
    downloadMetricsWithCharts: async (year, chartLabels, type = 'metrics') => {
        const html2canvas = (await import('html2canvas')).default;

        // Grab every chart card in DOM order
        const cards = [...document.querySelectorAll('.chart-card')];
        const charts = [];

        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            try {
                const canvas = await html2canvas(card, {
                    backgroundColor: '#ffffff',
                    scale: 1,
                    useCORS: true,
                    logging: false,
                });
                charts.push({
                    label: chartLabels?.[i] || `Chart ${i + 1}`,
                    dataUrl: canvas.toDataURL('image/jpeg', 0.85),
                });
            } catch (e) {
                console.warn(`Could not capture chart ${i}:`, e.message);
            }
        }

        const headers = {
            'Content-Type': 'application/json',
        };
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

        const url = `${API_BASE_URL.replace(/\/$/, '')}/pdf/metrics-charts`;
        const response = await fetch(url, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ year, charts, type }),
        });

        if (!response.ok) throw new Error((await response.text()) || 'Failed to generate PDF');

        const blob    = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;

        let filename = `PSU_Metrics_Charts_${year || 'report'}.pdf`;
        if (type === 'classrooms') filename = `PSU_Classrooms_Charts_${year || 'report'}.pdf`;
        else if (type === 'enrollments') filename = `PSU_Enrollments_Charts_${year || 'report'}.pdf`;
        else if (type === 'teachers-seats') filename = `PSU_TeachersSeats_Charts_${year || 'report'}.pdf`;

        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    },
};

// ==========================================
// USERS API
// ==========================================
export const usersApi = {
    getAll: () => fetchWithRetry('/users'),
    
    approve: (id) => fetchWithRetry(`/users/${id}/approve`, {
        method: 'PUT',
    }),

    // ADD THIS
    updatePrivileges: (id, { role, allowed_pages }) =>
        fetchWithRetry(`/users/${id}/privileges`, {
            method: 'PATCH',
            body: JSON.stringify({
                role,
                allowed_pages,
            }),
        }),
    
    delete: (id) => fetchWithRetry(`/users/${id}`, {
        method: 'DELETE',
    }),
};


