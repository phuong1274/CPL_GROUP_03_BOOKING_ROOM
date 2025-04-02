import axios from 'axios';

const API_URL = 'https://localhost:7067/api/auth';

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
        const response = await api.post('/auth/change-password', {
            oldPassword: data.oldPassword,
            newPassword: data.newPassword,
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data || 'Failed to change password');
    }
};