import axios from 'axios';
// Tạo instance của axios
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

export const getUserById = async (id) => {
    try {
        const response = await api.get(`/customer/users/${id}`);
        return response.data;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            throw new Error('User not found');
        } else if (error.response && error.response.status === 500) {
            throw error.response.data;
        } else if (error.request) {
            throw new Error('No response from server. Please check if the backend is running.');
        } else {
            throw new Error(error.message || 'Failed to fetch user details');
        }
    }
};

export const getRoomById = async (id) => {
    try {
        const response = await api.get(`/customer/booking/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.Error || error.message || 'Failed to fetch room details');
    }
};

// Fetch all bookings for the authenticated customer
export const getMyBookings = async (params = {}) => {
    try {
        const response = await api.get('/customer/booking', { params });
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to fetch your bookings (Status: ${status})`
        );
    }
};

// Cancel a booking
export const cancelBooking = async (id) => {
    try {
        const response = await api.put(`/customer/booking/${id}/cancel`);
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to cancel booking (Status: ${status})`
        );
    }
};