import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7067/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Thêm interceptor để gắn token vào header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Hàm register
export const register = async (registerData) => {
    try {
        const response = await api.post('/auth/register', registerData);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            throw error.response.data; 
        } else if (error.request) {
            throw new Error('No response from server. Please check if the backend is running.');
        } else {
            throw new Error(error.message || 'Registration failed');
        }
    }
};

// Hàm login
export const login = async (loginData) => {
    try {
        const response = await api.post('/auth/login', {
            login: loginData.login,
            password: loginData.password
        });
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 400) {
            throw error.response.data; 
        } else if (error.response && error.response.status === 500) {
            throw error.response.data; 
        } else if (error.request) {
            throw new Error('No response from server. Please check if the backend is running.');
        } else {
            throw new Error(error.message || 'Login failed');
        }
    }
};

// Export instance api
export default api;