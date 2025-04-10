//import axios from 'axios';

//const API_URL = 'https://localhost:7067/api/auth';

//export const login = async (loginData) => {
//    try {
//        const response = await axios.post(`${API_URL}/login`, {
//            login: loginData.login,
//            password: loginData.password
//        });
//        return response.data;
//    } catch (error) {
//        throw new Error(error.response?.data || 'Login failed');
//    }
//};

//export const register = async (registerData) => {
//    try {
//        const response = await axios.post(`${API_URL}/register`, {
//            username: registerData.username,
//            email: registerData.email,
//            password: registerData.password,
//            fullName: registerData.fullName,
//            phoneNumber: registerData.phoneNumber
//        });
//        return response.data;
//    } catch (error) {
//        throw new Error(error.response?.data || 'Registration failed');
//    }
//};


import axios from 'axios';

const API_URL = 'https://localhost:7067/api/auth';

// Create an axios instance with default config if needed
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (loginData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            login: loginData.login,
            password: loginData.password
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Login failed');
    }
};

export const register = async (registerData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, {
            username: registerData.username,
            email: registerData.email,
            password: registerData.password,
            fullName: registerData.fullName,
            phoneNumber: registerData.phoneNumber
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Registration failed');
    }
};

export const forgotPassword = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/forgot-password`, {
            login: data.login,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Failed to send reset link');
    }
};

export const resetPassword = async (data) => {
    try {
        const response = await axios.post(`${API_URL}/reset-password`, {
            token: data.token,
            password: data.password,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Failed to reset password');
    }
};

export const changePassword = async (data) => {
    try {
        const response = await api.post('/change-password', {
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Failed to change password');
    }
};

export const updateUserInfo = async (userData) => {
    try {
        const response = await api.put('/update', userData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Failed to update user information');
    }
};