// API Configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// API Client
class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Get auth token from localStorage
    getToken() {
        return localStorage.getItem('accessToken');
    }

    // Set auth headers
    getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Handle API response
    async handleResponse(response) {
        const data = await response.json();

        if (!response.ok) {
            // Handle token expiration
            if (response.status === 401 && data.code === 'TOKEN_EXPIRED') {
                // Try to refresh token
                const refreshed = await this.refreshToken();
                if (!refreshed) {
                    // Redirect to login
                    window.location.href = '/frontend/login.html';
                    throw new Error('Session expired');
                }
                return null; // Retry the request
            }

            throw new Error(data.message || 'Request failed');
        }

        return data;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.auth)
        };

        try {
            const response = await fetch(url, config);
            const result = await this.handleResponse(response);

            // If null, retry the request (token was refreshed)
            if (result === null) {
                config.headers = this.getHeaders(options.auth);
                const retryResponse = await fetch(url, config);
                return await this.handleResponse(retryResponse);
            }

            return result;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Auth endpoints
    async register(email, password, fullName, birthDate, gender) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName, birthDate, gender })
        });
    }

    async verifyEmail(email, code) {
        return this.request('/auth/verify', {
            method: 'POST',
            body: JSON.stringify({ email, code })
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async googleLogin(token) {
        return this.request('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ token })
        });
    }

    async refreshToken() {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return false;

            const result = await this.request('/auth/refresh', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            });

            if (result.success) {
                localStorage.setItem('accessToken', result.data.accessToken);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    async logout() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await this.request('/auth/logout', {
                    method: 'POST',
                    body: JSON.stringify({ refreshToken })
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }

        // Clear local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login
        window.location.href = '/frontend/login.html';
    }

    // Patient endpoints
    async createPatient(patientData) {
        return this.request('/patients', {
            method: 'POST',
            auth: true,
            body: JSON.stringify(patientData)
        });
    }

    async getPatients() {
        return this.request('/patients', {
            method: 'GET',
            auth: true
        });
    }

    async getPatient(id) {
        return this.request(`/patients/${id}`, {
            method: 'GET',
            auth: true
        });
    }

    async updatePatient(id, patientData) {
        return this.request(`/patients/${id}`, {
            method: 'PUT',
            auth: true,
            body: JSON.stringify(patientData)
        });
    }

    async deletePatient(id) {
        return this.request(`/patients/${id}`, {
            method: 'DELETE',
            auth: true
        });
    }

    // Measurement endpoints
    async getMeasurements(patientId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/measurements/${patientId}${queryString ? '?' + queryString : ''}`;

        return this.request(endpoint, {
            method: 'GET',
            auth: true
        });
    }

    async getLatestMeasurement(patientId) {
        return this.request(`/measurements/${patientId}/latest`, {
            method: 'GET',
            auth: true
        });
    }

    async getMeasurementStats(patientId, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/measurements/${patientId}/stats${queryString ? '?' + queryString : ''}`;

        return this.request(endpoint, {
            method: 'GET',
            auth: true
        });
    }

    // Sync endpoints
    async triggerSync() {
        return this.request('/sync/trigger', {
            method: 'POST',
            auth: true
        });
    }

    async getSyncStatus() {
        return this.request('/sync/status', {
            method: 'GET',
            auth: true
        });
    }
}

// Export singleton instance
const api = new APIClient();
