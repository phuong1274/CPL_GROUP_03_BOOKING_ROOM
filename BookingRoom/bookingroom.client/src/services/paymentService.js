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

// Process a payment for a booking
export const processPayment = async (bookingId, amount) => {
    try {
        const response = await api.post(`/Payment/process/${bookingId}`, { amount });
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to process payment (Status: ${status})`
        );
    }
};

// Process a refund for a booking
export const refundPayment = async (bookingId, amount) => {
    try {
        const response = await api.post(`/Payment/refund/${bookingId}`, { amount });
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to process refund (Status: ${status})`
        );
    }
};

// Add a payment record for a booking
export const addPaymentRecord = async (bookingId, amount) => {
    try {
        const response = await api.post(`/Payment/${bookingId}`, { amount });
        return response.data;
    } catch (error) {
        const status = error.response?.status || 'unknown';
        throw new Error(
            error.response?.data?.Error || error.message || `Failed to add payment record (Status: ${status})`
        );
    }
};