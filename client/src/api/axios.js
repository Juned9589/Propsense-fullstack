import axios from 'axios';

// Base URL from environment variable, fallback to localhost:8000
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Attach JWT token from localStorage on every request via interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// On 401 response → clear token and reset state
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                               error.config?.url?.includes('/auth/register');

        if (error.response && error.response.status === 401 && !isAuthEndpoint) {
            localStorage.removeItem('token');
            // Dynamically import store to avoid circular dependency
            const { store } = await import('../app/store');
            const { logout } = await import('../features/auth/authSlice');
            store.dispatch(logout());
        }
        return Promise.reject(error);
    }
);

export default api;
