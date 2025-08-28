import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
});

// Yeh function har request ke saath token ko automatically header mein bhejega
apiClient.interceptors.request.use((config) => {
    const userString = localStorage.getItem('pinger-user');
    if (userString) {
        const user = JSON.parse(userString);
        const token = user?.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const getTargets = async () => {
    const response = await apiClient.get('/targets');
    return response.data;
};

export const createTarget = async (targetData) => {
    const response = await apiClient.post('/targets', targetData);
    return response.data;
};

// Target ko delete karne ke liye function (ADD THIS)
export const deleteTarget = async (id) => {
    const response = await apiClient.delete(`/targets/${id}`);
    return response.data;
};

// Target ko update karne ke liye function (ADD THIS)
export const updateTarget = async (id, targetData) => {
    const response = await apiClient.put(`/targets/${id}`, targetData);
    return response.data;
};

// Target ki ping history fetch karne ke liye function (ADD THIS)
export const getTargetHistory = async (id, days = 7) => { // Default to 7 days
    const response = await apiClient.get(`/targets/${id}/history?days=${days}`);
    return response.data;
};