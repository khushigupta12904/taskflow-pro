// Central API Wrapper for handling fetch requests & auth tokens
const API = {
    baseUrl: '/api',

    getToken() {
        return localStorage.getItem('token');
    },

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                headers
            });

            // Redirect to login if token is expired or invalid
            if (response.status === 401 && !endpoint.includes('/auth/')) {
                localStorage.clear();
                window.location.href = '/login';
                return null;
            }

            const data = await response.json();
            return { ok: response.ok, status: response.status, data };
        } catch (error) {
            console.error('API Error:', error);
            return { ok: false, data: { error: 'Server connection error' } };
        }
    }
};