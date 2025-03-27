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